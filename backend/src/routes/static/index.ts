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

router.get('/show-tutorials', async (req: Request, res: Response) => {
    const showtrialtutorial = await getSetting('trial.showtrialtutorial');
    const showreporttutorial = await getSetting('trial.showreporttutorial');

    res.status(200).json({
        status: "success",
        data: {
            showTrialTutorial: showtrialtutorial === 'true',
            showReportTutorial: showreporttutorial === 'true',
        }
    }).end();
});

router.get('/show-category-hints', async (req: Request, res: Response) => {
    const show = await getSetting('trial.showquesthints');

    if(show === null){
        fail_internal_error(res, "instance uninitialized");
        return;
    }

    res.status(200).json({
        status: "success",
        data: show === 'true',
    }).end();
});

router.get('/trial-tutorial-image', async (req: Request, res: Response) => {
    const showtrialtutorial = await getSetting('trial.showtrialtutorial');
    if(showtrialtutorial !== 'true'){
        fail_entity_not_found(res, 'show trial tutorial is disabled');
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
        fail_internal_error(res, "cannot find trial tutorial image in the database");
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

router.get('/report-tutorial-image', async (req: Request, res: Response) => {
    const showreporttutorial = await getSetting('trial.showreporttutorial');
    if(showreporttutorial !== 'true'){
        fail_entity_not_found(res, 'show report tutorial is disabled');
        return;
    }

    const img = await prisma.attachment.findFirst({
        select: {
            content: true,
            extension: true,
        },
        where: {
            name: "report-tutorial-image",
            trialId: {
                equals: null,
            }
        }
    });

    if(img === null || img.extension === null){
        fail_internal_error(res, "cannot find report tutorial image in the database");
        return;
    }

    const mimetype = mime.lookup(img.extension);
    if(mimetype === false){
        fail_internal_error(res, "malformed report tutorial image in the database");
        return;
    }

    res.contentType(mimetype);
    res.status(200);
    res.send(img.content);
    res.end();
});

export default router;
