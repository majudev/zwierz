import { Router, Request, Response } from 'express';
import logger from '../../utils/logger.js';
import { PrismaClient } from '@prisma/client';
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found, fail_internal_error } from '../../utils/http_code_helper.js';
import mime from 'mime-types';
import { SystemMode, getSetting } from '../../utils/settings.js';
import { user_is_uberadmin } from '../../utils/permissionsHelper.js';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

router.get('/image', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to update trialtutorial image");
        return;
    }

    const img = await prisma.attachment.findFirst({
        select: {
            content: true,
            extension: true,
        },
        where: {
            name: "trial-tutorial-image",
            trialId: {
                equals: null,
            }
        }
    });

    if(img === null || img.extension === null){
        fail_entity_not_found(res, "cannot find trial tutorial image in the database");
        return;
    }

    const mimetype = mime.lookup(img.extension);
    if(mimetype === false){
        fail_internal_error(res, "malformed trial tutorial image in the database");
        return;
    }

    res.contentType(mimetype);
    res.status(200);
    res.send(img.content);
    res.end();
});

router.patch('/image', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(req.body.content === undefined || req.body.extension === undefined){
        fail_missing_params(res, ["content", "extension"], null);
        return;
    }

    if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to update trial tutorial image");
        return;
    }

    const decoded_content = Buffer.from(req.body.content, 'base64');

    await prisma.$transaction(async (tx) => {
        await tx.attachment.deleteMany({
            where: {
                name: "trial-tutorial-image",
                trialId: {
                    equals: null,
                }
            },
        });
        const img = await prisma.attachment.create({
            data: {
                name: "trial-tutorial-image",
                trialId: null,
                extension: req.body.extension,
                content: decoded_content,
                size: decoded_content.length,
            },
        });
    }).catch((error) => {
        fail_internal_error(res, "error when updating trial tutorial image");
        return;
    });

    res.status(204);
    res.end();
});

router.get('/showtrialtutorial', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to update");
        return;
    }

    const name = await getSetting('trial.showtrialtutorial');

    if(name === null){
        fail_internal_error(res, "instance uninitialized");
        return;
    }

    res.status(200).json({
        status: "success",
        data: name === 'true',
    }).end();
});

router.patch('/showtrialtutorial/:state(true|false)', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to update");
        return;
    }

    await prisma.settings.update({
        where: {
            key: 'trial.showtrialtutorial',
        },
        data: {
            value: req.params.state,
        }
    })

    res.status(204).end();
});

router.get('/showquesthints', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to update");
        return;
    }

    const name = await getSetting('trial.showquesthints');

    if(name === null){
        fail_internal_error(res, "instance uninitialized");
        return;
    }

    res.status(200).json({
        status: "success",
        data: name === 'true',
    }).end();
});

router.patch('/showquesthints/:state(true|false)', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to update");
        return;
    }

    await prisma.settings.update({
        where: {
            key: 'trial.showquesthints',
        },
        data: {
            value: req.params.state,
        }
    })

    res.status(204).end();
});

export default router;
