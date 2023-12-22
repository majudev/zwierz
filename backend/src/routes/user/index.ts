import { Router, Request, Response } from 'express';
import logger from '../../utils/logger.js';
import { PrismaClient } from '@prisma/client';
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found } from '../../utils/http_code_helper.js';
import { user_is_commitee_member, user_is_commitee_scribe, user_is_ho_commitee_scribe, user_is_hr_commitee_scribe, user_is_uberadmin } from '../../utils/permissionsHelper.js';
import bcrypt from 'bcrypt';

const router = Router();
const prisma = new PrismaClient();

/*router.post('/new', async (req: Request, res: Response) => {
    if(!check_login(res)) return;
    if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to register new users");
        return;
    }

    if(req.body.email === undefined || !validateEmail(req.body.email)){
        fail_missing_params(res, ["email"], null);
    }

    if((req.body.sso === undefined || req.body.sso === 'LOCAL') && req.body.password === undefined){
        fail_missing_params(res, ["password"], null);
    }

    const exists = await prisma.user.count({
        where: {
            email: req.body.email,
        }
    }) > 0;

    if(exists){
        fail_entity_not_found(res, "user with email " + req.body.email + " already exists");
        return;
    }

    const {
        id: _,
        roleMappings: ___,
        pwdresetkey: _______,
        phoneVerifyKey: ________,
        created: _________,
        password: password,
        ...createQuery
    } = req.body;
    if(createQuery.sso === undefined || createQuery.sso === 'LOCAL'){
        createQuery.password = await bcrypt.hash(password, 14);
    }

    const user = await prisma.user.create({
        data: createQuery,
        select: {
            id: true,
            name: true,
            email: true,
            uberadmin: true,
            phone: true,

            roleMappings: {
                select: {
                    role: true,
                    organization: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            },

            enableEmailNotifications: true,
            enableSMSNotifications: true,

            sso: true,
            disabled: true,
        },
    });

    res.status(200).json({
        status: "success",
        data: user
    }).end();
});*/

router.get('/:userId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(req.params.id === 'all'){
        if(!(await user_is_uberadmin(res.locals.auth_user.userId))){
            fail_no_permissions(res, "you don't have permissions to obtain userlist");
            return;
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                rank: true,
                role_HO: true,
                role_HR: true,
                uberadmin: true,
                phone: true,
                team: {
                    select: {
                        id: true,
                        name: true,
                        archived: true,
                    }
                },
                interests: {
                    select: {
                        text: true,
                    }
                },
                function: true,

                enableEmailNotifications: true,
                enableSMSNotifications: true,
                
                sso: true,
                disabled: true,
                shadow: true,

                trials: {
                    select: {
                        type: true,
                        open_date: true,
                        close_date: true,
                        predicted_closing_date: true,
                    }
                }
            },
        });

        res.status(200).json({
            status: "success",
            data: users
        }).end();
        return;
    }

    var userId: number = parseInt(req.params.userId === 'me' ? res.locals.auth_user.userId : req.params.userId);

    if(Number.isNaN(userId)) {
        fail_missing_params(res, ["userId"], null);
        return;
    }

    const uberadmin = await user_is_uberadmin(res.locals.auth_user.userId);
    const commitee_scribe = await user_is_commitee_scribe(res.locals.auth_user.userId);
    const commitee_member = await user_is_commitee_member(res.locals.auth_user.userId);

    // User can only view himself, admin can view everything
    if(userId !== res.locals.auth_user.userId && !uberadmin && !commitee_scribe && !commitee_member){
        fail_no_permissions(res, "you don't have permissions to view this user");
        return;
    }

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            rank: true,
            role_HO: true,
            role_HR: true,
            uberadmin: true,
            phone: true,
            team: {
                select: {
                    id: true,
                    name: true,
                    archived: true,
                }
            },
            interests: {
                select: {
                    text: true,
                }
            },
            function: true,

            enableEmailNotifications: true,
            enableSMSNotifications: true,
            
            sso: true,
            disabled: true,
            shadow: true,

            trials: {
                select: {
                    type: true,
                    open_date: true,
                    close_date: true,
                    predicted_closing_date: true,
                }
            }
        },
    });

    if(user === null){
        fail_entity_not_found(res, "user with id " + userId + " not found");
        return;
    }

    res.status(200).json({
        status: "success",
        data: user
    }).end();
});

router.patch('/:userId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId: number = parseInt(req.params.userId);

    if(Number.isNaN(userId)) {
        fail_missing_params(res, ["userId"], null);
        return;
    }

    // User can only edit himself, uberadmin can edit everything
    if(userId != res.locals.auth_user.userId && !(await user_is_uberadmin(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to edit this userId");
        return;
    }

    const exists = await prisma.user.count({
        where: {
            id: userId,
        }
    }) > 0;

    if(!exists){
        fail_entity_not_found(res, "user with id " + userId + " not found");
        return;
    }

    const {
        id: _,
        uberadmin: __,
        activationkey: ___,
        role_HO: ____,
        email: _____,
        sso: ______,
        pwdresetkey: _______,
        phoneVerifyKey: ________,
        created: _________,
        role_HR: __________,
        disabled: ___________,
        shadow: ____________,
        interests: interests,
        password: password,
        ...updateQuery
    } = req.body;
    if((await user_is_uberadmin(res.locals.auth_user.userId)) && 'uberadmin' in req.body){
        updateQuery.uberadmin = req.body.uberadmin;
    }
    if((await user_is_uberadmin(res.locals.auth_user.userId)) && 'shadow' in req.body){
        updateQuery.shadow = req.body.shadow;
    }
    if((await user_is_uberadmin(res.locals.auth_user.userId)) && 'disabled' in req.body){
        updateQuery.disabled = req.body.disabled;
    }
    if((await user_is_uberadmin(res.locals.auth_user.userId) || await user_is_ho_commitee_scribe(res.locals.auth_user.userId)) && 'role_HO' in req.body){
        updateQuery.role_HO = req.body.role_HO;
    }
    if((await user_is_uberadmin(res.locals.auth_user.userId) || await user_is_hr_commitee_scribe(res.locals.auth_user.userId)) && 'role_HR' in req.body){
        updateQuery.role_HR = req.body.role_HR;
    }
    if(password !== undefined && password !== null){
        updateQuery.password = await bcrypt.hash(password, 14);
    }

    if(updateQuery === undefined || Object.keys(updateQuery).length == 0){
        fail_missing_params(res, [], "no body provided");
        return;
    }

    if(interests.length > 0){
        await prisma.userInterest.deleteMany({
            where: {
                userId: userId,
            }
        });
        await Array.from(interests).forEach(async (value) => {
            await prisma.userInterest.create({
                data: {
                    userId: userId,
                    text: (value as {text: string}).text,
                }
            });
        });
    }

    const updatedObject = await prisma.user.update({
        where: {
            id: userId,
        },
        data: updateQuery,
        select: {
            id: true,
            name: true,
            email: true,
            rank: true,
            role_HO: true,
            role_HR: true,
            uberadmin: true,
            phone: true,
            team: {
                select: {
                    id: true,
                    name: true,
                    archived: true,
                }
            },
            interests: {
                select: {
                    text: true,
                }
            },
            function: true,

            enableEmailNotifications: true,
            enableSMSNotifications: true,
            
            sso: true,
            disabled: true,
            shadow: true,

            trials: {
                select: {
                    type: true,
                    open_date: true,
                    close_date: true,
                    predicted_closing_date: true,
                }
            }
        },
    });

    res.status(200).json({
        status: "success",
        data: updatedObject
    }).end();
});

const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

export default router;
