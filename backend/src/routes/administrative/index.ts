import { Router, Request, Response } from 'express';
import logger from '../../utils/logger.js';
import { PrismaClient } from '@prisma/client';
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found, fail_internal_error } from '../../utils/http_code_helper.js';
import mime from 'mime-types';
import { SystemMode, getSetting } from '../../utils/settings.js';
import { user_is_uberadmin } from '../../utils/permissionsHelper.js';
import fs from 'fs';
import pdfRouter from './pdf.js';
import trialTutorialRouter from './trialtutorial.js';
import reportTutorialRouter from './reporttutorial.js';
import modeRouter from './mode.js';

const router = Router();
const prisma = new PrismaClient();

router.use('/pdf', pdfRouter);
router.use('/trialtutorial', trialTutorialRouter);
router.use('/reporttutorial', reportTutorialRouter);
router.use('/mode', modeRouter)

router.patch('/login-image', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(req.body.content === undefined || req.body.extension === undefined){
        fail_missing_params(res, ["content", "extension"], null);
        return;
    }

    if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to update login image");
        return;
    }

    const decoded_content = Buffer.from(req.body.content, 'base64');

    await prisma.$transaction(async (tx) => {
        await tx.attachment.deleteMany({
            where: {
                name: "login-image",
                trialId: {
                    equals: null,
                }
            },
        });
        const img = await prisma.attachment.create({
            data: {
                name: "login-image",
                trialId: null,
                extension: req.body.extension,
                content: decoded_content,
                size: decoded_content.length,
            },
        });
    }).catch((error) => {
        fail_internal_error(res, "error when updating login-image");
        return;
    });

    res.status(204);
    res.end();
});

router.delete('/login-image', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to update login image");
        return;
    }

    await prisma.$transaction(async (tx) => {
        await tx.attachment.deleteMany({
            where: {
                name: "login-image",
                trialId: {
                    equals: null,
                }
            },
        });
        const img = await prisma.attachment.create({
            data: {
                name: "login-image",
                trialId: null,
                extension: "png",
                content: fs.readFileSync('defaults/logo-default.png'),
                size: fs.readFileSync('defaults/logo-default.png').length,
            }
        });
    }).catch((error) => {
        fail_internal_error(res, "error when resetting login-image");
        return;
    });

    res.status(204);
    res.end();
});

/*router.patch('/max-upload-size', async (req: Request, res: Response) => {
    res.status(200).json({
        status: "success",
        data: 32 * 1024 * 1024
    }).end();
});

router.patch('/mode', async (req: Request, res: Response) => {
    const mode = await getSetting('instance.mode') as SystemMode;

    if(mode === null){
        fail_internal_error(res, "instance uninitialized");
        return;
    }

    res.status(200).json({
        status: "success",
        data: mode,
    }).end();
});*/

export default router;
