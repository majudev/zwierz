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

router.get('/', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to update instance mode");
        return;
    }

    const mode = await getSetting('instance.mode');

    if(mode === null){
        fail_internal_error(res, "instance uninitialized");
        return;
    }

    res.status(200).json({
        status: "success",
        data: mode,
    }).end();
});

router.patch('/', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to update instance mode");
        return;
    }
    
    const mode = req.body.mode;

    if(mode != SystemMode.HO && mode != SystemMode.HO_HR && mode != SystemMode.HR){
        fail_missing_params(res, [], 'supported modes: HO HO+HR HR');
        return;
    }

    const updated = await prisma.settings.update({
        where: {
            key: 'instance.mode',
        },
        data: {
            value: mode,
        },
        select: {
            value: true,
        }
    })

    res.status(200).json({
        status: "success",
        data: updated.value,
    }).end();
});

export default router;
