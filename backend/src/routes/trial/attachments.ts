import { Router, Request, Response } from 'express';
import logger from '../../utils/logger.js';
import { PrismaClient, TrialType } from '@prisma/client';
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found, fail_duplicate_entry } from '../../utils/http_code_helper.js';
import { user_is_commitee_member, user_is_commitee_scribe, user_is_ho_commitee_member, user_is_ho_commitee_scribe, user_is_hr_commitee_member, user_is_hr_commitee_scribe, user_is_mentor, user_is_uberadmin } from '../../utils/permissionsHelper.js';
import mime from 'mime-types';
import sharp from 'sharp';

const router = Router();
const prisma = new PrismaClient();

router.post('/new/:type(ho|hr)', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId = res.locals.auth_user.userId;
    const type = req.params.type.toUpperCase() as TrialType;

    if(req.body.name === undefined || req.body.content === undefined || req.body.extension === undefined){
        fail_missing_params(res, ["name", "content", "extension"], null);
        return;
    }

    if(req.body.name.length > 100){
        fail_missing_params(res, ["name"], "Attachment name is too long");
        return;
    }

    const decoded_content = Buffer.from(req.body.content, 'base64');

    const trial = await prisma.trial.findUnique({
        where: {
            trial_unique_contraint: {
                userId: userId,
                type: type,
            }
        },
        select: {
            id: true,
        }
    });

    if(trial === null){
        fail_entity_not_found(res, "trial on your account with type " + type + " does not exist");
        return;
    }

    const duplicate = await prisma.attachment.count({
        where: {
            trialId: trial.id,
            name: req.body.name,
        }
    }) > 0;

    if(duplicate){
        fail_duplicate_entry(res, "name", null);
        return;
    }

    var thumbnail = null;
    try{
        const resizedBuffer = await sharp(decoded_content)
        .resize({
        width: 300,
        height: 300,
        fit: 'inside', // Maintain aspect ratio, fit within the specified dimensions
        }).toBuffer();
        thumbnail = resizedBuffer;
    }catch(e){

    }

    const attachment = await prisma.attachment.create({
        data: {
            trialId: trial.id,
            name: req.body.name,
            content: decoded_content,
            extension: req.body.extension,
            size: decoded_content.length,
            thumbnail: thumbnail,
        },
        select: {
            id: true,
            name: true,
            extension: true,
            size: true,
        }
    });

    res.status(200).json({
        status: "success",
        data: attachment
    }).end();
});

router.get('/:userId/:type(ho|hr)', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId: number = parseInt(req.params.userId === 'me' ? res.locals.auth_user.userId : req.params.userId);
    const type = req.params.type.toUpperCase() as TrialType;

    if(Number.isNaN(userId)) {
        fail_missing_params(res, ["userId"], null);
        return;
    }

    const uberadmin = await user_is_uberadmin(res.locals.auth_user.userId);
    const commitee_scribe = (type === 'HO') ? await user_is_ho_commitee_scribe(res.locals.auth_user.userId) : await user_is_hr_commitee_scribe(res.locals.auth_user.userId);
    const commitee_member = (type === 'HO') ? await user_is_ho_commitee_member(res.locals.auth_user.userId) : await user_is_hr_commitee_member(res.locals.auth_user.userId);

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
            attachments: {
                select: {
                    id: true,
                    name: true,
                    extension: true,
                    created_at: true,
                    size: true,
                }
            }
        },
    });

    if(trial === null){
        fail_entity_not_found(res, "trial of type " + type + " with of userId " + userId + " not found");
        return;
    }

    res.status(200).json({
        status: "success",
        data: trial.attachments,
    }).end();
});

router.get('/:action(download|thumbnail)/:attachmentId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId = res.locals.auth_user.userId;
    const attachmentId = Number.parseInt(req.params.attachmentId);

    if(Number.isNaN(attachmentId)) {
        fail_missing_params(res, ["attachmentId"], null);
        return;
    }

    const owner = await prisma.trial.count({
        where: {
            userId: userId,
            attachments: {
                some: {
                    id: attachmentId,
                }
            }
        }
    }) > 0;

    const type = await prisma.attachment.findUnique({
        where: {
            id: attachmentId,
        },
        select: {
            trial: {
                select: {
                    type: true,
                    userId: true,
                }
            }
        }
    });

    if(type === null){
        fail_entity_not_found(res, "attachment " + attachmentId + " not found");
        return;
    }

    const uberadmin = await user_is_uberadmin(res.locals.auth_user.userId);
    const commitee_scribe = (type.trial !== null) && (type.trial.type === 'HO') ? await user_is_ho_commitee_scribe(res.locals.auth_user.userId) : await user_is_hr_commitee_scribe(res.locals.auth_user.userId);
    const commitee_member = (type.trial !== null) &&  (type.trial.type === 'HO') ? await user_is_ho_commitee_member(res.locals.auth_user.userId) : await user_is_hr_commitee_member(res.locals.auth_user.userId);

    if(!owner && !uberadmin && !commitee_scribe && !commitee_member){
        if((type.trial !== null) && !await user_is_mentor(res.locals.auth_user.userId, type.trial.userId)){
            fail_no_permissions(res, "you cannot download attachment " + attachmentId);
            return;
        }
    }

    const fullcontent = (req.params.action === "download");

    const attachment = await prisma.attachment.findUnique({
        where: {
            id: attachmentId,
        },
        select: {
            name: true,
            content: fullcontent,
            extension: true,
            thumbnail: !fullcontent,
        }
    });

    if(attachment === null){
        fail_entity_not_found(res, "attachment " + attachmentId + " not found");
        return;
    }

    if(fullcontent){
        const mimetype = (attachment.extension !== null) ? mime.lookup(attachment.extension) : false;

        res.set("Content-Disposition", "attachment; filename=\"" + attachment.name + (attachment.extension !== null ? "." + attachment.extension : "") + "\"");
        if(mimetype !== false) res.contentType(mimetype);
        res.status(200);
        res.send(attachment.content);
        res.end();
    }else{
        if(attachment.thumbnail === null){
            fail_entity_not_found(res, "no thumbnail");
            return;
        }

        const mimetype = (attachment.extension !== null) ? mime.lookup(attachment.extension) : false;

        if(mimetype !== false) res.contentType(mimetype);
        res.status(200);
        res.send(attachment.thumbnail);
        res.end();
    }
});

router.delete('/:attachmentId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId = res.locals.auth_user.userId;
    const attachmentId = Number.parseInt(req.params.attachmentId);

    if(Number.isNaN(attachmentId)) {
        fail_missing_params(res, ["attachmentId"], null);
        return;
    }

    const exists = await prisma.trial.count({
        where: {
            userId: userId,
            attachments: {
                some: {
                    id: attachmentId,
                }
            }
        }
    }) > 0;

    if(!exists){
        fail_entity_not_found(res, "you cannot delete attachment " + attachmentId);
        return;
    }

    await prisma.attachment.delete({
        where: {
            id: attachmentId,
        }
    });

    res.status(204).json({
        status: "success",
        data: null
    }).end();
});

export default router;
