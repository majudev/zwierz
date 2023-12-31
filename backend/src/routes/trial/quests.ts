import { Router, Request, Response } from 'express';
import logger from '../../utils/logger.js';
import { PrismaClient, TrialType } from '@prisma/client';
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found } from '../../utils/http_code_helper.js';
import { user_is_commitee_member, user_is_commitee_scribe, user_is_ho_commitee_member, user_is_ho_commitee_scribe, user_is_hr_commitee_member, user_is_hr_commitee_scribe, user_is_uberadmin } from '../../utils/permissionsHelper.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/new/:type(ho|hr)', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId = res.locals.auth_user.userId;
    const type = req.params.type.toUpperCase() as TrialType;

    if(req.body.content === undefined || req.body.finish_date === undefined){
        fail_missing_params(res, ["content", "finish_date"], null);
        return;
    }

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

    const quest = await prisma.quest.create({
        data: {
            trialId: trial.id,
            content: req.body.content,
            finish_date: req.body.finish_date,
        },
        select: {
            id: true,
            content: true,
            finish_date: true,
        }
    });

    res.status(200).json({
        status: "success",
        data: quest
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
            quests: {
                select: {
                    id: true,
                    content: true,
                    finish_date: true,
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
        data: trial.quests,
    }).end();
});

router.patch('/:questId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId = res.locals.auth_user.userId;
    const questId = Number.parseInt(req.params.questId);

    if(Number.isNaN(questId)) {
        fail_missing_params(res, ["questId"], null);
        return;
    }

    const exists = await prisma.trial.count({
        where: {
            userId: userId,
            quests: {
                some: {
                    id: questId,
                }
            }
        }
    }) > 0;

    if(!exists){
        fail_entity_not_found(res, "you cannot modify quest " + questId);
        return;
    }

    const {
        id: _,
        trialId: __,
        trial: ___,
        ...updateQuery
    } = req.body;

    if(updateQuery === undefined || Object.keys(updateQuery).length == 0){
        fail_missing_params(res, [], "no body provided");
        return;
    }

    const updatedObject = await prisma.quest.update({
        where: {
            id: questId,
        },
        data: updateQuery,
        select: {
            id: true,
            content: true,
            finish_date: true,
        },
    });

    res.status(200).json({
        status: "success",
        data: updatedObject
    }).end();
});

router.delete('/:questId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const userId = res.locals.auth_user.userId;
    const questId = Number.parseInt(req.params.questId);

    if(Number.isNaN(questId)) {
        fail_missing_params(res, ["questId"], null);
        return;
    }

    const exists = await prisma.trial.count({
        where: {
            userId: userId,
            quests: {
                some: {
                    id: questId,
                }
            }
        }
    }) > 0;

    if(!exists){
        fail_entity_not_found(res, "you cannot delete quest " + questId);
        return;
    }

    await prisma.quest.delete({
        where: {
            id: questId,
        }
    });

    res.status(204).json({
        status: "success",
        data: null
    }).end();
});

export default router;
