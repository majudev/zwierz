import { Router, Request, Response } from 'express';
import logger from '../../utils/logger.js';
import { PrismaClient, TrialType } from '@prisma/client';
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found } from '../../utils/http_code_helper.js';
import { user_is_commitee_member, user_is_commitee_scribe, user_is_ho_commitee_member, user_is_ho_commitee_scribe, user_is_hr_commitee_member, user_is_hr_commitee_scribe, user_is_uberadmin } from '../../utils/permissionsHelper.js';
import { verifyPhone } from '../../utils/validationtools.js';
import questsRouter from './quests.js';
import attachmentsRouter from './attachments.js';

const router = Router();
const prisma = new PrismaClient();

router.use('/quests', questsRouter);
router.use('/attachments', attachmentsRouter);

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

    res.status(200).json({
        status: "success",
        data: trial
    }).end();
});

router.get('/:userId/:type(ho|hr)', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    /*if(req.params.id === 'all'){
        const teams = await prisma.team.findMany({
            select: {
                id: true,
                name: true,
                archived: true,
            },
        });

        res.status(200).json({
            status: "success",
            data: teams
        }).end();
        return;
    }*/

    const userId: number = parseInt(req.params.userId === 'me' ? res.locals.auth_user.userId : req.params.userId);
    const type = req.params.type.toUpperCase() as TrialType;

    if(Number.isNaN(userId)) {
        fail_missing_params(res, ["userId"], null);
        return;
    }

    const uberadmin = await user_is_uberadmin(res.locals.auth_user.userId);
    const commitee_scribe = (type === 'HO') ? await user_is_ho_commitee_scribe(res.locals.auth_user.userId) : await user_is_hr_commitee_scribe(res.locals.auth_user.userId);
    const commitee_member = (type === 'HO') ? await user_is_ho_commitee_member(res.locals.auth_user.userId) : await user_is_hr_commitee_member(res.locals.auth_user.userId);

    // User can only view himself, admin can view everything
    if(userId !== res.locals.auth_user.userId && !uberadmin && !commitee_scribe && !commitee_member){
        fail_no_permissions(res, "you don't have permissions to view this trial");
        return;
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

export default router;
