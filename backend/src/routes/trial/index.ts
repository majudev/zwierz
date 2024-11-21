import { Router, Request, Response } from 'express';
import logger from '../../utils/logger.js';
import { PrismaClient, TrialType } from '@prisma/client';
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found, fail_duplicate_entry, fail_internal_error } from '../../utils/http_code_helper.js';
import { user_is_commitee_member, user_is_commitee_scribe, user_is_ho_commitee_member, user_is_ho_commitee_scribe, user_is_hr_commitee_member, user_is_hr_commitee_scribe, user_is_mentor, user_is_uberadmin } from '../../utils/permissionsHelper.js';
import { verifyPhone } from '../../utils/validationtools.js';
import questsRouter from './quests.js';
import attachmentsRouter from './attachments.js';
import logbookRouter from './logbook.js';
import { getSetting } from '../../utils/settings.js';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import mime from 'mime-types';

const router = Router();
const prisma = new PrismaClient();

router.use('/quests', questsRouter);
router.use('/attachments', attachmentsRouter);
router.use('/logbook', logbookRouter);

router.post('/new/:type(ho|hr)', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId = res.locals.auth_user.userId;
    const type = req.params.type.toUpperCase() as TrialType;

    if(req.body.mentor_email === undefined || req.body.mentor_name === undefined || req.body.mentor_phone === undefined || req.body.predicted_closing_date === undefined){
        fail_missing_params(res, ["mentor_email", "mentor_name", "mentor_phone", "predicted_closing_date"], null);
        return;
    }

    const exists = await prisma.trial.count({
        where: {
            userId: userId,
            type: type
        }
    }) > 0;

    if(exists){
        fail_entity_not_found(res, "trial on your account with type " + type + " already exists");
        return;
    }

    const {
        id: _,
        userId: __,
        quests: ___,
        attachments: ____,
        archived: _____,
        appointments: ______,
        logbook: _______,
        open_date: ________,
        close_date: _________,
        ...createQuery
    } = req.body;
    createQuery.mentor_phone = createQuery.mentor_phone.replaceAll(' ', '').replaceAll('-', '');
    if(!verifyPhone(createQuery.mentor_phone)){
        res.status(400).json({
            status: "error",
            message: "invalid phone",
        });
        return;
    }

    const trial = await prisma.trial.create({
        data: {
            userId: userId,
            type: type,
            archived: false,
            ...createQuery
        },
        select: {
            id: true,
            userId: true,
            type: true,
            open_date: true,
            close_date: true,
            mentor_email: true,
            mentor_name: true,
            mentor_phone: true,
            predicted_closing_date: true,

            archived: true,
        },
    });

    await prisma.trialLogbook.create({
        data: {
            author: 'OWNER',
            type: 'CREATE_TRIAL',

            trialId: trial.id,
        }
    });

    res.status(200).json({
        status: "success",
        data: trial
    }).end();
});

router.get('/:userId/:type(ho|hr)/:archived(archived)?', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const type = req.params.type.toUpperCase() as TrialType;

    const uberadmin = await user_is_uberadmin(res.locals.auth_user.userId);
    const commitee_scribe = (type === 'HO') ? await user_is_ho_commitee_scribe(res.locals.auth_user.userId) : await user_is_hr_commitee_scribe(res.locals.auth_user.userId);
    const commitee_member = (type === 'HO') ? await user_is_ho_commitee_member(res.locals.auth_user.userId) : await user_is_hr_commitee_member(res.locals.auth_user.userId);

    if(req.params.userId === 'all'){
        if(!uberadmin && !commitee_member && !commitee_scribe){
            fail_no_permissions(res, "you don't have permissions to list all trials");
            return;
        }

        const trials = await prisma.trial.findMany({
            where: {
                type: type,
                archived: req.params.archived !== undefined,
                user: {
                    shadow: false,
                }
            },
            select: {
                id: true,
                userId: true,
                type: true,
                open_date: true,
                close_date: true,
                mentor_email: true,
                mentor_name: true,
                mentor_phone: true,
                predicted_closing_date: true,

                user: {
                    select: {
                        id: true,
                        name: true,
                        rank: true,
                    },
                },
    
                archived: true,
            },
        });

        /*const teams = await prisma.team.findMany({
            select: {
                id: true,
                name: true,
                archived: true,
            },
        });*/

        res.status(200).json({
            status: "success",
            data: trials
        }).end();
        //res.status(200).json({a: "sdfsdf", archival: req.params.archived}).end();
        return;
    }

    const userId: number = parseInt(req.params.userId === 'me' ? res.locals.auth_user.userId : req.params.userId);

    if(Number.isNaN(userId)) {
        fail_missing_params(res, ["userId"], null);
        return;
    }

    // User can only view himself, admin can view everything, mentor can view his mentees
    if(userId !== res.locals.auth_user.userId && !uberadmin && !commitee_scribe && !commitee_member){
        if(!await user_is_mentor(res.locals.auth_user.userId, userId)){
            fail_no_permissions(res, "you don't have permissions to view this trial");
            return;
        }
    }

    const trial = await prisma.trial.findFirst({
        where: {
            userId: userId,
            type: type,
        },
        select: {
            id: true,
            userId: true,
            type: true,
            open_date: true,
            close_date: true,
            mentor_email: true,
            mentor_name: true,
            mentor_phone: true,
            predicted_closing_date: true,

            archived: true,
        },
    });

    if(trial === null){
        fail_entity_not_found(res, "trial of type " + type + " with of userId " + userId + " not found");
        return;
    }

    const mentor = await prisma.user.findFirst({
        where: {
            email: trial.mentor_email,
        },
        select: {
            name: true,
            email: true,
            phone: true,
        },
    });

    if(mentor !== null && mentor.phone !== trial.mentor_phone && mentor.name !== trial.mentor_name){
        const trial_updates = await prisma.trial.update({
            where: {
                trial_unique_contraint: {
                    userId: userId,
                    type: type,
                }
            },
            data: {
                mentor_name: mentor.name !== null ? mentor.name : trial.mentor_name,
                mentor_phone: mentor.phone !== null ? mentor.phone : trial.mentor_phone,
            },
            select: {
                id: true,
                userId: true,
                type: true,
                open_date: true,
                close_date: true,
                mentor_email: true,
                mentor_name: true,
                mentor_phone: true,
                predicted_closing_date: true,
    
                archived: true,
            },
        });

        res.status(200).json({
            status: "success",
            data: trial
        }).end();
        return;
    }

    res.status(200).json({
        status: "success",
        data: trial
    }).end();
});

router.patch('/:type(ho|hr)', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId = res.locals.auth_user.userId;
    const type = req.params.type.toUpperCase() as TrialType;

    const exists = await prisma.trial.count({
        where: {
            userId: userId,
            type: type
        }
    }) > 0;

    if(!exists){
        fail_entity_not_found(res, "trial on your account with type " + type + " not found");
        return;
    }

    const {
        id: _,
        userId: __,
        quests: ___,
        attachments: ____,
        archived: _____,
        appointments: ______,
        logbook: _______,
        open_date: ________,
        close_date: _________,
        type: __________,
        ...updateQuery
    } = req.body;
    if(updateQuery.mentor_phone !== undefined){
        updateQuery.mentor_phone = updateQuery.mentor_phone.replaceAll(' ', '').replaceAll('-', '');
        if(!verifyPhone(updateQuery.mentor_phone)){
            res.status(400).json({
                status: "error",
                message: "invalid phone",
            });
            return;
        }
    }

    if(updateQuery === undefined || Object.keys(updateQuery).length == 0){
        fail_missing_params(res, [], "no body provided");
        return;
    }

    const updatedObject = await prisma.trial.update({
        where: {
            trial_unique_contraint: {
                userId: userId,
                type: type,
            }
        },
        data: updateQuery,
        select: {
            id: true,
            userId: true,
            type: true,
            open_date: true,
            close_date: true,
            mentor_email: true,
            mentor_name: true,
            mentor_phone: true,
            predicted_closing_date: true,

            archived: true,
        },
    });

    await prisma.trialLogbook.create({
        data: {
            author: 'OWNER',
            type: 'UPDATE_OWNER_DETAILS',

            trialId: updatedObject.id,
        }
    });

    res.status(200).json({
        status: "success",
        data: updatedObject
    }).end();
});

router.delete('/:userId/:type(ho|hr)', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId = Number.parseInt(req.params.userId);
    const type = req.params.type.toUpperCase() as TrialType;

    const uberadmin = await user_is_uberadmin(res.locals.auth_user.userId);
    const commitee_scribe = (type === 'HO') ? await user_is_ho_commitee_scribe(res.locals.auth_user.userId) : await user_is_hr_commitee_scribe(res.locals.auth_user.userId);
    if(!uberadmin && !commitee_scribe){
        fail_no_permissions(res, "you don't have permissions to delete trials");
        return;
    }

    if(Number.isNaN(userId)) {
        fail_missing_params(res, ["userId"], null);
        return;
    }

    const exists = await prisma.trial.count({
        where: {
            userId: userId,
            type: type,
        }
    }) > 0;

    if(!exists){
        fail_entity_not_found(res, "trial with id " + userId + " and type " + type + " not found");
        return;
    }

    const updatedObject = await prisma.trial.delete({
        where: {
            trial_unique_contraint: {
                userId: userId,
                type: type,
            }
        }
    });

    res.status(204).json({
        status: "success",
        data: null
    }).end();
});

router.patch('/archived/:userId/:type(ho|hr)/:newArchivalState(yes|no)?', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId: number = parseInt(req.params.userId);
    const type = req.params.type.toUpperCase() as TrialType;
    const archived = (req.params.newArchivalState === 'yes');

    if(Number.isNaN(userId)) {
        fail_missing_params(res, ["userId"], null);
        return;
    }

    const uberadmin = await user_is_uberadmin(res.locals.auth_user.userId);
    const commitee_scribe = (type === 'HO') ? await user_is_ho_commitee_scribe(res.locals.auth_user.userId) : await user_is_hr_commitee_scribe(res.locals.auth_user.userId);
    const commitee_member = (type === 'HO') ? await user_is_ho_commitee_member(res.locals.auth_user.userId) : await user_is_hr_commitee_member(res.locals.auth_user.userId);

    // User can only view himself, admin can view everything
    if(!uberadmin && !commitee_scribe && !commitee_member){
        fail_no_permissions(res, "you don't have permissions to edit this trial");
        return;
    }

    const exists = await prisma.trial.count({
        where: {
            userId: userId,
            type: type
        }
    }) > 0;

    if(!exists){
        fail_entity_not_found(res, "trial on account " + userId + " with type " + type + " not found");
        return;
    }

    const updatedObject = await prisma.trial.update({
        where: {
            trial_unique_contraint: {
                userId: userId,
                type: type,
            }
        },
        data: {
            archived: archived,
        },
        select: {
            id: true,
            userId: true,
            type: true,
            open_date: true,
            close_date: true,
            mentor_email: true,
            mentor_name: true,
            mentor_phone: true,
            predicted_closing_date: true,

            archived: true,
        },
    });

    res.status(200).json({
        status: "success",
        data: updatedObject
    }).end();
});

router.patch('/:action(open|close)/:userId/:type(ho|hr)/:date?', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId: number = parseInt(req.params.userId);
    const type = req.params.type.toUpperCase() as TrialType;
    const action = (req.params.action) as 'open' | 'close';
    const date = (req.params.date !== "null" && req.params.date !== undefined) ? new Date(req.params.date[0] === '"' ? req.params.date.substring(1, req.params.date.length - 1) : req.params.date) : null;
    
    if(date !== null && !(date instanceof Date && !isNaN(date as any))){
        fail_missing_params(res, ["date"], "Invalid format of date: " + req.params.date);
        return;
    }

    if(Number.isNaN(userId)) {
        fail_missing_params(res, ["userId"], null);
        return;
    }

    const uberadmin = await user_is_uberadmin(res.locals.auth_user.userId);
    const commitee_scribe = (type === 'HO') ? await user_is_ho_commitee_scribe(res.locals.auth_user.userId) : await user_is_hr_commitee_scribe(res.locals.auth_user.userId);
    const commitee_member = (type === 'HO') ? await user_is_ho_commitee_member(res.locals.auth_user.userId) : await user_is_hr_commitee_member(res.locals.auth_user.userId);

    // User can only view himself, admin can view everything
    if(!uberadmin && !commitee_scribe && !commitee_member){
        fail_no_permissions(res, "you don't have permissions to edit this trial");
        return;
    }

    const exists = await prisma.trial.findFirst({
        where: {
            userId: userId,
            type: type
        }
    });

    if(exists === null){
        fail_entity_not_found(res, "trial on account " + userId + " with type " + type + " not found");
        return;
    }

    if(action === 'close' && exists.open_date === null){
        fail_duplicate_entry(res, "", "You cannot close trial when it hasn't been opened.");
        return;
    }

    const updatedObject = await prisma.trial.update({
        where: {
            trial_unique_contraint: {
                userId: userId,
                type: type,
            }
        },
        data: {
            open_date: (action === 'open') ? date : undefined,
            close_date: (action === 'close') ? date : undefined,
        },
        select: {
            id: true,
            userId: true,
            type: true,
            open_date: true,
            close_date: true,
            mentor_email: true,
            mentor_name: true,
            mentor_phone: true,
            predicted_closing_date: true,

            archived: true,
        },
    });

    res.status(200).json({
        status: "success",
        data: updatedObject
    }).end();
});

router.get('/:userId/:type(ho|hr)/pdf', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const type = req.params.type.toUpperCase() as TrialType;

    const uberadmin = await user_is_uberadmin(res.locals.auth_user.userId);
    const commitee_scribe = (type === 'HO') ? await user_is_ho_commitee_scribe(res.locals.auth_user.userId) : await user_is_hr_commitee_scribe(res.locals.auth_user.userId);
    const commitee_member = (type === 'HO') ? await user_is_ho_commitee_member(res.locals.auth_user.userId) : await user_is_hr_commitee_member(res.locals.auth_user.userId);

    const userId: number = parseInt(req.params.userId === 'me' ? res.locals.auth_user.userId : req.params.userId);

    if(Number.isNaN(userId)) {
        fail_missing_params(res, ["userId"], null);
        return;
    }

    // User can only view himself, admin can view everything, mentor can view his mentees
    if(userId !== res.locals.auth_user.userId && !uberadmin && !commitee_scribe && !commitee_member){
        if(!await user_is_mentor(res.locals.auth_user.userId, userId)){
            fail_no_permissions(res, "you don't have permissions to view this trial");
            return;
        }
    }

    const trial = await prisma.trial.findFirst({
        where: {
            userId: userId,
            type: type,
        },
        select: {
            id: true,
            user: {
                select: {
                    name: true,
                    email: true,
                    rank: true,
                    phone: true,
                    team: true,
                    function: true,
                    interests: {
                        select: {
                            text: true,
                        }
                    }
                }
            },
            type: true,
            open_date: true,
            close_date: true,
            mentor_email: true,
            mentor_name: true,
            mentor_phone: true,
            predicted_closing_date: true,

            archived: true,

            quests: {
                select: {
                    content: true,
                    finish_date: true,
                },
                orderBy: {
                    id: 'asc',
                }
            }
        },
    });

    if(trial === null){
        fail_entity_not_found(res, "trial of type " + type + " with of userId " + userId + " not found");
        return;
    }

    const mentor = await prisma.user.findFirst({
        where: {
            email: trial.mentor_email,
        },
        select: {
            name: true,
            email: true,
            phone: true,
        },
    });

    if(mentor !== null && (mentor.phone !== trial.mentor_phone || mentor.name !== trial.mentor_name)){
        if(mentor.phone !== null) trial.mentor_phone = mentor.phone;
        if(mentor.name !== null) trial.mentor_name = mentor.name;
    }

    const commiteeDisplayImage = await prisma.attachment.findFirst({
        select: {
            content: true,
            extension: true,
        },
        where: {
            name: "pdf-image",
            trialId: {
                equals: null,
            }
        }
    });
    const commiteeDisplayName = await getSetting('pdf.' + type.toLowerCase() + '.name');
    if(commiteeDisplayImage === null || commiteeDisplayName === null || commiteeDisplayImage.extension === null){
        fail_internal_error(res, 'missing configuration entries');
        return;
    }

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "A4"
    });
    pdf.addFileToVFS("Cantarell-Bold.ttf", fs.readFileSync("fonts/Cantarell-Bold.ttf", {encoding: 'base64'}));
    pdf.addFileToVFS("Cantarell-Italic.ttf", fs.readFileSync("fonts/Cantarell-Italic.ttf", {encoding: 'base64'}));
    //pdf.addFileToVFS("Cantarell-BoldItalic.ttf", fs.readFileSync("fonts/Cantarell-BoldItalic.ttf", {encoding: 'base64'}));
    pdf.addFileToVFS("Cantarell-Regular.ttf", fs.readFileSync("fonts/Cantarell-Regular.ttf", {encoding: 'base64'}));
    pdf.addFileToVFS("dejavu-serif.book.ttf", fs.readFileSync("fonts/dejavu-serif.book.ttf", {encoding: 'base64'}));
    //pdf.addFileToVFS("dejavu-serif.bold.ttf", fs.readFileSync("fonts/dejavu-serif.bold.ttf", {encoding: 'base64'}));
    //pdf.addFileToVFS("dejavu-serif.italic.ttf", fs.readFileSync("fonts/dejavu-serif.italic.ttf", {encoding: 'base64'}));
    //pdf.addFileToVFS("dejavu-serif.bold-italic.ttf", fs.readFileSync("fonts/dejavu-serif.bold-italic.ttf", {encoding: 'base64'}));
    pdf.addFont("Cantarell-Regular.ttf", "Cantarell", "normal");
    pdf.addFont("Cantarell-Bold.ttf", "Cantarell", "bold");
    pdf.addFont("Cantarell-Italic.ttf", "Cantarell", "italic");
    //pdf.addFont("Cantarell-BoldItalic.ttf", "Cantarell", "bolditalic");
    pdf.addFont("dejavu-serif.book.ttf", "DejaVu Serif", "normal");
    //pdf.addFont("dejavu-serif.bold.ttf", "DejaVu Serif", "bold");
    //pdf.addFont("dejavu-serif.italic.ttf", "DejaVu Serif", "italic");
    //pdf.addFont("dejavu-serif.bold-italic.ttf", "DejaVu Serif", "bold-italic");
    pdf.setFont("Cantarell", "normal");
    //pdf.setFont("DejaVu Serif", "normal");
    pdf.setFontSize(10);

    // Logo
    const logoSize = 130;
    pdf.setFont("DejaVu Serif", "normal");
    pdf.setFontSize(24);
    const titleHeight = pdf.getTextDimensions("TEST").h;
    pdf.text(commiteeDisplayName, pdf.internal.pageSize.getWidth() / 2, (pdf.internal.pageSize.getHeight() + logoSize - titleHeight*2.5)/2 + 10, {align: 'center', lineHeightFactor: 1.5});
    pdf.addImage(commiteeDisplayImage.content.toString('base64'), commiteeDisplayImage.extension.toLocaleUpperCase(), (pdf.internal.pageSize.getWidth() - logoSize) / 2, (pdf.internal.pageSize.getHeight() - logoSize - titleHeight * 2.5) / 2, logoSize, logoSize, undefined, 'SLOW');

    // Footer
    pdf.setFont("Cantarell", "normal");
    pdf.setFontSize(10);
    pdf.text("Związek Harcerstwa Rzeczypospolitej", pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, {align: 'center'});
    pdf.addPage("A4", "portrait");

    // Header
    var rectR = 2;
    var margin = 20
    var offset = margin;
    pdf.setFont("Cantarell", "bold");
    pdf.setFontSize(20);
    const userInfoHeader1Height = pdf.getTextDimensions("Informacje o próbie", {fontSize: 20}).h;
    pdf.setLineWidth(0.95);
    pdf.roundedRect(margin, offset, pdf.internal.pageSize.getWidth() - 2*margin, 1.5*userInfoHeader1Height, rectR, rectR);
    pdf.text("Informacje o próbie", pdf.internal.pageSize.getWidth()/2, offset + userInfoHeader1Height, {align: 'center'});

    // User details
    //margin = 40;
    const userInfoSpacing = 5;
    //offset += userInfoHeader1Height*1.5 + userInfoSpacing;
    offset += userInfoHeader1Height*1.5 + 2*userInfoSpacing;
    pdf.setFontSize(14);
    const userInfoTextHeight = pdf.getTextDimensions("SampleText", {fontSize: 14}).h;

    pdf.roundedRect(margin, offset, pdf.internal.pageSize.getWidth() - 2*margin, 1.5*(7 + trial.user.interests.length)*userInfoTextHeight, rectR, rectR);
    pdf.text("Kandydat", pdf.internal.pageSize.getWidth()/2, offset + userInfoTextHeight, {align: 'center'});
    pdf.line(margin, offset + 1.5*userInfoTextHeight - 1, pdf.internal.pageSize.getWidth() - margin, offset + 1.5*userInfoTextHeight - 1);
    offset += 1.5*userInfoTextHeight;
    pdf.text("Imię i nazwisko: ", margin + 0.25*userInfoTextHeight, offset + userInfoTextHeight);
    var lastTextWidth = pdf.getTextWidth("Imię i nazwisko: ");
    pdf.setFont("Cantarell", "normal");
    pdf.text(trial.user.name !== null ? trial.user.name : "nie ustawiono", margin + 0.25*userInfoTextHeight + lastTextWidth, offset + userInfoTextHeight);
    offset += 1.5*userInfoTextHeight;
    pdf.setFont("Cantarell", "bold");
    pdf.text("E-mail: ", margin + 0.25*userInfoTextHeight, offset + userInfoTextHeight);
    lastTextWidth = pdf.getTextWidth("E-mail: ");
    pdf.setFont("Cantarell", "normal");
    pdf.text(trial.user.email, margin + 0.25*userInfoTextHeight + lastTextWidth, offset + userInfoTextHeight);
    offset += 1.5*userInfoTextHeight;
    pdf.setFont("Cantarell", "bold");
    pdf.text("Numer telefonu: ", margin + 0.25*userInfoTextHeight, offset + userInfoTextHeight);
    lastTextWidth = pdf.getTextWidth("Numer telefonu: ");
    pdf.setFont("Cantarell", "normal");
    pdf.text(trial.user.phone !== null ? trial.user.phone.replace(/(.{3})/g,"$1 ") : "nie ustawiono", margin + 0.25*userInfoTextHeight + lastTextWidth, offset + userInfoTextHeight);
    offset += 1.5*userInfoTextHeight;
    pdf.setFont("Cantarell", "bold");
    pdf.text("Drużyna: ", margin + 0.25*userInfoTextHeight, offset + userInfoTextHeight);
    lastTextWidth = pdf.getTextWidth("Drużyna: ");
    pdf.setFont("Cantarell", "normal");
    pdf.text(trial.user.team !== null ? trial.user.team.name : "nie podano", margin + 0.25*userInfoTextHeight + lastTextWidth, offset + userInfoTextHeight);
    offset += 1.5*userInfoTextHeight;
    pdf.setFont("Cantarell", "bold");
    pdf.text("Funkcja: ", margin + 0.25*userInfoTextHeight, offset + userInfoTextHeight);
    lastTextWidth = pdf.getTextWidth("Funkcja: ");
    pdf.setFont("Cantarell", "normal");
    pdf.text(trial.user.function !== null ? trial.user.function : "nie podano", margin + 0.25*userInfoTextHeight + lastTextWidth, offset + userInfoTextHeight);
    offset += 1.5*userInfoTextHeight;
    pdf.setFont("Cantarell", "bold");
    pdf.text("Zainteresowania: ", margin + 0.25*userInfoTextHeight, offset + userInfoTextHeight);
    if(trial.user.interests.length == 0){
        lastTextWidth = pdf.getTextWidth("Zainteresowania: ");
        pdf.setFont("Cantarell", "normal");
        pdf.text(trial.user.function !== null ? trial.user.function : "nie podano", margin + 0.25*userInfoTextHeight + lastTextWidth, offset + userInfoTextHeight);
    }else{
        pdf.setFont("Cantarell", "normal");
        trial.user.interests.forEach(interest => {
            offset += 1.5*userInfoTextHeight;
            pdf.text(" - " + interest.text, margin + 0.25*userInfoTextHeight, offset + userInfoTextHeight);
        });
    }
    offset += 1.5*userInfoTextHeight;

    // Mentor info. Check if we won't jump out of bounds...
    offset += userInfoSpacing;
    if(offset + 1.5*4*userInfoTextHeight > pdf.internal.pageSize.getHeight() - margin){
        // Footer
        pdf.setFont("Cantarell", "normal");
        pdf.setFontSize(10);
        pdf.text("Związek Harcerstwa Rzeczypospolitej", pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, {align: 'center'});

        pdf.addPage("A4", "portrait");
        offset = margin;
    }
    pdf.setFontSize(14);
    pdf.roundedRect(margin, offset, pdf.internal.pageSize.getWidth() - 2*margin, 1.5*4*userInfoTextHeight, rectR, rectR);
    pdf.setFont("Cantarell", "bold");
    pdf.text("Opiekun", pdf.internal.pageSize.getWidth()/2, offset + userInfoTextHeight, {align: 'center'});
    pdf.line(margin, offset + 1.5*userInfoTextHeight - 1, pdf.internal.pageSize.getWidth() - margin, offset + 1.5*userInfoTextHeight - 1);
    offset += 1.5*userInfoTextHeight;
    pdf.text("Imię i nazwisko: ", margin + 0.25*userInfoTextHeight, offset + userInfoTextHeight);
    var lastTextWidth = pdf.getTextWidth("Imię i nazwisko: ");
    pdf.setFont("Cantarell", "normal");
    pdf.text(trial.mentor_name, margin + 0.25*userInfoTextHeight + lastTextWidth, offset + userInfoTextHeight);
    offset += 1.5*userInfoTextHeight;
    pdf.setFont("Cantarell", "bold");
    pdf.text("E-mail: ", margin + 0.25*userInfoTextHeight, offset + userInfoTextHeight);
    lastTextWidth = pdf.getTextWidth("E-mail: ");
    pdf.setFont("Cantarell", "normal");
    pdf.text(trial.mentor_email, margin + 0.25*userInfoTextHeight + lastTextWidth, offset + userInfoTextHeight);
    offset += 1.5*userInfoTextHeight;
    pdf.setFont("Cantarell", "bold");
    pdf.text("Numer telefonu: ", margin + 0.25*userInfoTextHeight, offset + userInfoTextHeight);
    lastTextWidth = pdf.getTextWidth("Numer telefonu: ");
    pdf.setFont("Cantarell", "normal");
    pdf.text(trial.mentor_phone.replace(/(.{3})/g,"$1 "), margin + 0.25*userInfoTextHeight + lastTextWidth, offset + userInfoTextHeight);
    offset += 1.5*userInfoTextHeight;

    // Trial info. Check if we won't jump out of bounds...
    margin = 20;
    offset += 20;
    pdf.setFont("Cantarell", "bold");
    pdf.setFontSize(20);
    const questsHeaderHeight = pdf.getTextDimensions("Zadania", {fontSize: 20}).h;
    pdf.setLineWidth(0.95);
    pdf.text("Zadania", pdf.internal.pageSize.getWidth()/2, offset + questsHeaderHeight, {align: 'center'});
    pdf.setFontSize(14);

    const months = [
        "styczeń",
        "luty",
        "marzec",
        "kwiecień",
        "maj",
        "czerwiec",
        "lipiec",
        "sierpień",
        "wrzesień",
        "październik",
        "listopad",
        "grudzień",
    ];
    
    const questInnerMargin = 1;
    const questContentMargin = pdf.getTextWidth("99.") + 1;
    let questsTotalHeight = 0;
    const questTextLineHeight = pdf.getTextDimensions("SampleText", {fontSize: 14}).h;
    pdf.setLineWidth(0.1);
    for(let i = 0; i < trial.quests.length; i++){
        pdf.setFont("Cantarell", "normal");
        const textWidth = pdf.internal.pageSize.getWidth() - 2*margin - 0.5 * questTextLineHeight - questContentMargin - 2*questInnerMargin;
        const questTextHeight = pdf.getTextDimensions(trial.quests[i].content, {fontSize: 14, maxWidth: textWidth}).h;

        if(offset + 1.5*questsHeaderHeight + questsTotalHeight + questTextHeight + 0.5*questTextLineHeight + 2*questInnerMargin + 2*questTextLineHeight >= pdf.internal.pageSize.getHeight() - margin){
            pdf.setLineWidth(0.95);
            pdf.roundedRect(margin, offset, pdf.internal.pageSize.getWidth() - 2*margin, 1.5*questsHeaderHeight + questsTotalHeight, rectR, rectR);
            pdf.line(margin, offset + 1.5*questsHeaderHeight - 1, pdf.internal.pageSize.getWidth() - margin, offset + 1.5*questsHeaderHeight - 1);

            // Footer
            pdf.setFont("Cantarell", "normal");
            pdf.setFontSize(10);
            pdf.text("Związek Harcerstwa Rzeczypospolitej", pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, {align: 'center'});

            pdf.addPage("A4", "portrait");
            offset = margin;
            margin = 20;
            pdf.setFont("Cantarell", "bold");
            pdf.setFontSize(20);
            pdf.text("Zadania - c.d.", pdf.internal.pageSize.getWidth()/2, offset + questsHeaderHeight, {align: 'center'});
            pdf.setFontSize(14);
            questsTotalHeight = 0;
            pdf.setLineWidth(0.1);
        }

        pdf.setFont("Cantarell", "normal");
        if(i+1 < trial.quests.length) pdf.line(margin, offset + 1.5*questsHeaderHeight + questsTotalHeight + questTextHeight + 0.5*questTextLineHeight + 2*questInnerMargin + 2*questTextLineHeight, pdf.internal.pageSize.getWidth() - margin, offset + 1.5*questsHeaderHeight + questsTotalHeight + questTextHeight + 0.5*questTextLineHeight + 2*questInnerMargin + 2*questTextLineHeight);
        pdf.text(trial.quests[i].content, margin + questInnerMargin + questContentMargin + 0.25*questTextLineHeight, offset + 1.5*questsHeaderHeight + questsTotalHeight + questInnerMargin + 1.0*questTextLineHeight, {maxWidth: textWidth, align: 'justify'});
        pdf.setFont("Cantarell", "bold");
        pdf.text((i+1).toString() + ".", margin + questInnerMargin + 0.25*questTextLineHeight, offset + 1.5*questsHeaderHeight + questsTotalHeight + questInnerMargin + 1.0*questTextLineHeight);
        pdf.text("Data realizacji: ", margin + questInnerMargin + questContentMargin + 0.25*questTextLineHeight, offset + 1.5*questsHeaderHeight + questsTotalHeight + questTextHeight + 0.5*questTextLineHeight + questInnerMargin + 1.5*questTextLineHeight);
        const dateWidthHint = pdf.getTextWidth("Data realizacji: ");
        pdf.setFont("Cantarell", "normal");
        pdf.text(months[trial.quests[i].finish_date.getMonth()] + " " + trial.quests[i].finish_date.getFullYear(), margin + questInnerMargin + questContentMargin + 0.25*questTextLineHeight + dateWidthHint, offset + 1.5*questsHeaderHeight + questsTotalHeight + questTextHeight + 0.5*questTextLineHeight + questInnerMargin + 1.5*questTextLineHeight);

        questsTotalHeight += 2*questInnerMargin + questTextHeight + 0.5*questTextLineHeight + 2*questTextLineHeight;
    }
    pdf.setLineWidth(0.95);
    pdf.roundedRect(margin, offset, pdf.internal.pageSize.getWidth() - 2*margin, 1.5*questsHeaderHeight + questsTotalHeight, rectR, rectR);
    pdf.line(margin, offset + 1.5*questsHeaderHeight - 1, pdf.internal.pageSize.getWidth() - margin, offset + 1.5*questsHeaderHeight - 1);
    offset += 1.5*questsHeaderHeight + questsTotalHeight;

    // Timestamp
    offset += 10;
    if(offset >= pdf.internal.pageSize.getHeight() - margin){
        // Footer
        pdf.setFont("Cantarell", "normal");
        pdf.setFontSize(10);
        pdf.text("Związek Harcerstwa Rzeczypospolitej", pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, {align: 'center'});

        pdf.addPage("A4", "portrait");
        offset = margin;
    }
    pdf.setFont("Cantarell", "italic");
    pdf.setFontSize(10);
    const formattedDate = new Intl.DateTimeFormat('pl-PL', {
        timeZone: 'Europe/Warsaw',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'longOffset',
    }).format(new Date());
    pdf.text("Wygenerowano " + formattedDate, pdf.internal.pageSize.getWidth() / 2, offset, {align: 'center'});

    // Footer
    pdf.setFont("Cantarell", "normal");
    pdf.setFontSize(10);
    pdf.text("Związek Harcerstwa Rzeczypospolitej", pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, {align: 'center'});
    
    const output = pdf.output('arraybuffer');
    res.status(200).set({
        'Content-Type': 'application/pdf; charset=utf-8',
    }).send(Buffer.from(output)).end();
});

export default router;
