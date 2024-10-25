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
        fail_no_permissions(res, "you don't have permissions to update PDF image");
        return;
    }

    const img = await prisma.attachment.findFirst({
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

    if(img === null || img.extension === null){
        fail_internal_error(res, "cannot find PDF image in the database");
        return;
    }

    const mimetype = mime.lookup(img.extension);
    if(mimetype === false){
        fail_internal_error(res, "malformed PDF image in the database");
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
        fail_no_permissions(res, "you don't have permissions to update login image");
        return;
    }

    const decoded_content = Buffer.from(req.body.content, 'base64');

    await prisma.$transaction(async (tx) => {
        await tx.attachment.deleteMany({
            where: {
                name: "pdf-image",
                trialId: {
                    equals: null,
                }
            },
        });
        const img = await prisma.attachment.create({
            data: {
                name: "pdf-image",
                trialId: null,
                extension: req.body.extension,
                content: decoded_content,
                size: decoded_content.length,
            },
        });
    }).catch((error) => {
        fail_internal_error(res, "error when updating pdf-image");
        return;
    });

    res.status(204);
    res.end();
});

router.delete('/image', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to update login image");
        return;
    }

    await prisma.$transaction(async (tx) => {
        await tx.attachment.deleteMany({
            where: {
                name: "pdf-image",
                trialId: {
                    equals: null,
                }
            },
        });
        const img = await prisma.attachment.create({
            data: {
                name: "pdf-image",
                trialId: null,
                extension: "png",
                content: fs.readFileSync('defaults/pdf-default.png'),
                size: fs.readFileSync('defaults/pdf-default.png').length,
            }
        });
    }).catch((error) => {
        fail_internal_error(res, "error when resetting pdf-image");
        return;
    });

    res.status(204);
    res.end();
});

router.get('/name/:type(ho|hr)', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to update login image");
        return;
    }

    const type = req.params.type;
    const name = await getSetting('pdf.' + type + '.name');

    if(name === null){
        fail_internal_error(res, "instance uninitialized");
        return;
    }

    res.status(200).json({
        status: "success",
        data: name,
    }).end();
});

router.patch('/name/:type(ho|hr)', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to update login image");
        return;
    }
    
    const type = req.params.type;

    if(req.body.name === undefined){
        fail_missing_params(res, ["name"], null);
        return;
    }

    await prisma.settings.update({
        where: {
            key: 'pdf.' + type + '.name',
        },
        data: {
            value: req.body.name,
        }
    })

    res.status(204).end();
});

export default router;
