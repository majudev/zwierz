import { Router, Request, Response } from 'express';
import logger from '../../utils/logger.js';
import { PrismaClient, TrialType } from '@prisma/client';
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found } from '../../utils/http_code_helper.js';
import { user_is_commitee_member, user_is_commitee_scribe, user_is_ho_commitee_member, user_is_ho_commitee_scribe, user_is_hr_commitee_member, user_is_hr_commitee_scribe, user_is_uberadmin } from '../../utils/permissionsHelper.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/new', async (req: Request, res: Response) => {
    /*if(!check_login(res)) return;
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
    }).end();*/
});

router.post('/register/:type(ho|hr)', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    if(req.body.appointmentId === undefined || req.body.intent === undefined || req.body.customIntent === undefined || req.body.message === undefined){
        fail_missing_params(res, ["appointmentId", "intent", "customIntent", "message"], null);
    }

    const type = req.params.type === 'ho' ? TrialType.HO : TrialType.HR;

    const appointmentExists = await prisma.appointment.count({
        where: {
            id: req.body.appointmentId,
            locked: false,
        }
    }) > 0;

    if(!appointmentExists){
        fail_entity_not_found(res, "unlocked appointment with id " + req.body.appointmentId + " does not exist");
        return;
    }

    const trial = await prisma.trial.findUnique({
        where: {
            trial_unique_contraint: {
                type: type,
                userId: res.locals.auth_user.userId,
            }
        },
        select: {
            id: true,
        }
    });

    if(trial === null){
        fail_entity_not_found(res, "your trial of type " + type + " does not exist");
        return;
    }

    const registration = await prisma.appointmentRegistrations.create({
        data: {
            appointmentId: req.body.appointmentId,
            trialId: trial.id,
            intent: req.body.intent,
            customIntent: req.body.customIntent,
            message: req.body.message,
        },
        select: {
            id: true,
        }
    });

    res.status(200).json({
        status: "success",
        data: registration,
    }).end();
});

router.get('/:type(all|me)', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const uberadmin = await user_is_uberadmin(res.locals.auth_user.userId);
    const commitee_scribe_ho = await user_is_ho_commitee_scribe(res.locals.auth_user.userId);
    const commitee_scribe_hr = await user_is_hr_commitee_scribe(res.locals.auth_user.userId);
    const commitee_member_ho = await user_is_ho_commitee_member(res.locals.auth_user.userId);
    const commitee_member_hr = await user_is_hr_commitee_member(res.locals.auth_user.userId);
    if(req.params.type === 'all' && !uberadmin && !commitee_scribe_ho && !commitee_scribe_hr && !commitee_member_ho && !commitee_member_hr){
        fail_no_permissions(res, "you don't have permissions to delete trials");
        return;
    }

    const appointments = await prisma.appointment.findMany({
        where: {
            date: {
                gte: new Date(),
            }
        },
        select: {
            id: true,
            date: true,
            description: true,
            slots_HO: true,
            slots_HR: true,
            locked: true,
            registrations: {
                select: {
                    id: true,
                    intent: true,
                    customIntent: true,
                    message: true,
                    trial: {
                        select: {
                            userId: true,
                            type: true,
                            user: req.params.type === 'all' && {
                                select: {
                                    name: true,
                                    rank: true,
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if(req.params.type === 'all'){
        res.status(200).json({
            status: "success",
            data: appointments,
        }).end();
        return;
    }

    const filtered = appointments.map((entry) => {
        return {
            ...entry,
            registrationsHO: entry.registrations.filter((reg) => {return reg.trial.type === TrialType.HO}).length,
            registrationsHR: entry.registrations.filter((reg) => {return reg.trial.type === TrialType.HR}).length,
            registrations: entry.registrations.filter((reg) => {return reg.trial.userId == res.locals.auth_user.userId}).map((reg) => {return {...reg, type: reg.trial.type, trial: undefined};}),
        };
    });

    res.status(200).json({
        status: "success",
        data: filtered,
    }).end();
    return;
});

router.delete('/:teamId', async (req: Request, res: Response) => {
    /*if(!check_login(res)) return;
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
    }).end();*/
});

router.delete('/unregister/:type(ho|hr)/:appointmentId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;
    
    const type = req.params.type === 'ho' ? TrialType.HO : TrialType.HR;
    const appointmentId: number = parseInt(req.params.appointmentId);

    if(Number.isNaN(appointmentId)) {
        fail_missing_params(res, ["appointmentId"], null);
        return;
    }

    const appointmentExists = await prisma.appointment.count({
        where: {
            id: appointmentId,
        }
    }) > 0;

    if(!appointmentExists){
        fail_entity_not_found(res, "appointment with id " + appointmentId + " not found");
        return;
    }

    const trial = await prisma.trial.findUnique({
        where: {
            trial_unique_contraint: {
                type: type,
                userId: res.locals.auth_user.userId,
            }
        },
        select: {
            id: true,
        }
    });

    if(trial === null){
        fail_entity_not_found(res, "your trial of type " + type + " does not exist");
        return;
    }

    await prisma.appointmentRegistrations.delete({
        where: {
            appointment_reg_unique_constraint: {
                trialId: trial.id,
                appointmentId: appointmentId,
            }
        }
    });

    res.status(204).json({
        status: "success",
        data: null
    }).end();
});

export default router;
