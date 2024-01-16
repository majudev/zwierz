import { Router, Request, Response } from 'express';
import logger from '../../utils/logger.js';
import { PrismaClient } from '@prisma/client';
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found, fail_internal_error } from '../../utils/http_code_helper.js';
import mime from 'mime-types';
import { SystemMode, getSetting } from '../../utils/settings.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/login-image', async (req: Request, res: Response) => {
    const img = await prisma.attachment.findFirst({
        select: {
            content: true,
            extension: true,
        },
        where: {
            name: "login-image",
            trialId: {
                equals: null,
            }
        }
    });

    if(img === null || img.extension === null){
        fail_internal_error(res, "cannot find login image in the database");
        return;
    }

    const mimetype = mime.lookup(img.extension);
    if(mimetype === false){
        fail_internal_error(res, "malformed login image in the database");
        return;
    }

    res.contentType(mimetype);
    res.status(200);
    res.send(img.content);
    res.end();
});

router.get('/max-upload-size', async (req: Request, res: Response) => {
    res.status(200).json({
        status: "success",
        data: 32 * 1024 * 1024
    }).end();
});

router.get('/mode', async (req: Request, res: Response) => {
    const mode = await getSetting('instance.mode') as SystemMode;

    if(mode === null){
        fail_internal_error(res, "instance uninitialized");
        return;
    }

    res.status(200).json({
        status: "success",
        data: mode,
    }).end();
});

export default router;
