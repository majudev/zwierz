import { Router, Request, Response } from 'express';
import logger from '../../utils/logger.js';
import { PrismaClient } from '@prisma/client';
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found } from '../../utils/http_code_helper.js';
import { user_is_commitee_member, user_is_commitee_scribe, user_is_uberadmin } from '../../utils/permissionsHelper.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/new', async (req: Request, res: Response) => {
    if(!check_login(res)) return;
    if(!(await user_is_uberadmin(res.locals.auth_user.userId)) && !(await user_is_commitee_scribe(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to add new teams");
        return;
    }

    if(req.body.name === undefined){
        fail_missing_params(res, ["name"], null);
    }

    const exists = await prisma.team.count({
        where: {
            name: req.body.name,
        }
    }) > 0;

    if(exists){
        fail_entity_not_found(res, "team with name " + req.body.name + " already exists");
        return;
    }

    const team = await prisma.team.create({
        data: {
            name: req.body.name,
        },
        select: {
            id: true,
            name: true,
            archived: true,
        },
    });

    res.status(200).json({
        status: "success",
        data: team
    }).end();
});

router.get('/:teamId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(req.params.teamId === 'all'){
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
    }

    var teamId: number = parseInt(req.params.teamId);

    if(Number.isNaN(teamId)) {
        fail_missing_params(res, ["teamId"], null);
        return;
    }

    const team = await prisma.team.findFirst({
        where: {
            id: teamId,
        },
        select: {
            id: true,
            name: true,
            archived: true,
        },
    });

    if(team === null){
        fail_entity_not_found(res, "team with id " + teamId + " not found");
        return;
    }

    res.status(200).json({
        status: "success",
        data: team
    }).end();
});

router.patch('/:teamId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;
    if(!(await user_is_uberadmin(res.locals.auth_user.userId)) && !(await user_is_commitee_scribe(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to edit teams");
        return;
    }

    const teamId: number = parseInt(req.params.teamId);

    if(Number.isNaN(teamId)) {
        fail_missing_params(res, ["teamId"], null);
        return;
    }

    const exists = await prisma.team.count({
        where: {
            id: teamId,
        }
    }) > 0;

    if(!exists){
        fail_entity_not_found(res, "team with id " + teamId + " not found");
        return;
    }

    const {
        id: _,
        ...updateQuery
    } = req.body;

    if(updateQuery === undefined || Object.keys(updateQuery).length == 0){
        fail_missing_params(res, [], "no body provided");
        return;
    }

    const updatedObject = await prisma.team.update({
        where: {
            id: teamId,
        },
        data: updateQuery,
        select: {
            id: true,
            name: true,
            archived: true,
        },
    });

    res.status(200).json({
        status: "success",
        data: updatedObject
    }).end();
});

router.delete('/:teamId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;
    if(!(await user_is_uberadmin(res.locals.auth_user.userId)) && !(await user_is_commitee_scribe(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to delete teams");
        return;
    }

    const teamId: number = parseInt(req.params.teamId);

    if(Number.isNaN(teamId)) {
        fail_missing_params(res, ["teamId"], null);
        return;
    }

    const exists = await prisma.team.count({
        where: {
            id: teamId,
        }
    }) > 0;

    if(!exists){
        fail_entity_not_found(res, "team with id " + teamId + " not found");
        return;
    }

    const updatedObject = await prisma.team.delete({
        where: {
            id: teamId,
        }
    });

    res.status(204).json({
        status: "success",
        data: null
    }).end();
});

export default router;
