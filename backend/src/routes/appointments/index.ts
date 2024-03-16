import { Router, Request, Response } from 'express';
import logger from '../../utils/logger.js';
import { PrismaClient, TrialType } from '@prisma/client';
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found, fail_internal_error, fail_duplicate_entry } from '../../utils/http_code_helper.js';
import { user_is_commitee_member, user_is_commitee_scribe, user_is_ho_commitee_member, user_is_ho_commitee_scribe, user_is_hr_commitee_member, user_is_hr_commitee_scribe, user_is_uberadmin } from '../../utils/permissionsHelper.js';
import { SystemMode, getSetting, getSystemMode } from '../../utils/settings.js';
import app from '../../server.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/new', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const mode = await getSystemMode();
    if(mode === null){
        fail_internal_error(res, 'couldn\'t determine instance mode');
        return;
    }
    const HOenabled = (mode === SystemMode.HO || mode === SystemMode.HO_HR);
    const HRenabled = (mode === SystemMode.HR || mode === SystemMode.HO_HR);

    if(req.body.date === undefined || req.body.description === undefined || (HOenabled && req.body.slots_HO === undefined) || (HRenabled && req.body.slots_HR === undefined)){
        fail_missing_params(res, ["date", "description", "slots_HO", "slots_HR"], null);
    }

    if(!(await user_is_uberadmin(res.locals.auth_user.userId)) && (HOenabled && req.body.slots_HO !== 0 && !(await user_is_ho_commitee_scribe(res.locals.auth_user.userId))) && (HRenabled && req.body.slots_HR !== 0 && !(await user_is_hr_commitee_scribe(res.locals.auth_user.userId)))){
        fail_no_permissions(res, "you don't have permissions to create appointments");
        return;
    }

    const appointment = await prisma.appointment.create({
        data: {
            date: new Date(req.body.date),
            description: req.body.description,
            slots_HO: HOenabled ? req.body.slots_HO : undefined,
            slots_HR: HRenabled ? req.body.slots_HR : undefined,
        },
        select: {
            id: true,
            date: true,
            description: true,
            slots_HO: HOenabled,
            slots_HR: HRenabled,
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
                            user: {
                                select: {
                                    name: true,
                                    rank: true,
                                }
                            }
                        }
                    }
                }
            }
        },
    });

    res.status(200).json({
        status: "success",
        data: appointment
    }).end();
});

router.get('/:type(all|me|public)/:archived(archived)?', async (req: Request, res: Response) => {
    if(req.params.type !== 'public' && !check_login(res)) return;

    const mode = await getSystemMode();
    if(mode === null){
        fail_internal_error(res, 'couldn\'t determine instance mode');
        return;
    }
    const HOenabled = (mode === SystemMode.HO || mode === SystemMode.HO_HR);
    const HRenabled = (mode === SystemMode.HR || mode === SystemMode.HO_HR);

    const uberadmin = req.params.type !== 'public' && await user_is_uberadmin(res.locals.auth_user.userId);
    const commitee_scribe_ho = HOenabled && req.params.type !== 'public' && await user_is_ho_commitee_scribe(res.locals.auth_user.userId);
    const commitee_scribe_hr = HRenabled && req.params.type !== 'public' && await user_is_hr_commitee_scribe(res.locals.auth_user.userId);
    const commitee_member_ho = HOenabled && req.params.type !== 'public' && await user_is_ho_commitee_member(res.locals.auth_user.userId);
    const commitee_member_hr = HRenabled && req.params.type !== 'public' && await user_is_hr_commitee_member(res.locals.auth_user.userId);
    if(req.params.type === 'all' && !uberadmin && !commitee_scribe_ho && !commitee_scribe_hr && !commitee_member_ho && !commitee_member_hr){
        fail_no_permissions(res, "you don't have permissions to list trials");
        return;
    }

    const archived = (req.params.archived !== undefined);

    const appointments = await prisma.appointment.findMany({
        where: {
            date: !archived ? {
                gte: new Date(),
            } : {
                lt: new Date(),
            }
        },
        select: {
            id: true,
            date: true,
            description: true,
            slots_HO: HOenabled,
            slots_HR: HRenabled,
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
        },
        orderBy: {
            date: 'asc'
        }
    });

    if(req.params.type === 'all'){
        res.status(200).json({
            status: "success",
            data: appointments,
        }).end();
        return;
    }

    if(req.params.type === 'public'){    
        const filtered = appointments.map((entry) => {
            return {
                ...entry,
                registrationsHO: HOenabled ? entry.registrations.filter((reg) => {return reg.trial.type === TrialType.HO}).length : undefined,
                registrationsHR: HRenabled ? entry.registrations.filter((reg) => {return reg.trial.type === TrialType.HR}).length : undefined,
                registrations: undefined,
            };
        });
    
        res.status(200).json({
            status: "success",
            data: filtered,
        }).end();
    }

    const filtered = appointments.map((entry) => {
        return {
            ...entry,
            registrationsHO: HOenabled ? entry.registrations.filter((reg) => {return reg.trial.type === TrialType.HO}).length : undefined,
            registrationsHR: HRenabled ? entry.registrations.filter((reg) => {return reg.trial.type === TrialType.HR}).length : undefined,
            registrations: entry.registrations.filter((reg) => {return reg.trial.userId == res.locals.auth_user.userId}).map((reg) => {return {...reg, type: reg.trial.type, trial: undefined};}),
        };
    });

    res.status(200).json({
        status: "success",
        data: filtered,
    }).end();
    return;
});

router.patch('/:appointmentId/:lock(lock|unlock)?', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const mode = await getSystemMode();
    if(mode === null){
        fail_internal_error(res, 'couldn\'t determine instance mode');
        return;
    }
    const HOenabled = (mode === SystemMode.HO || mode === SystemMode.HO_HR);
    const HRenabled = (mode === SystemMode.HR || mode === SystemMode.HO_HR);
    const action: 'LOCK'|'UNLOCK'|'MODIFY' = (req.params.lock === undefined ? 'MODIFY' : (req.params.lock === 'lock' ? 'LOCK' : 'UNLOCK'));

    if(!(await user_is_uberadmin(res.locals.auth_user.userId)) && (HOenabled && req.body.slots_HO !== undefined && !(await user_is_ho_commitee_scribe(res.locals.auth_user.userId))) && (HRenabled && req.body.slots_HR !== undefined && !(await user_is_hr_commitee_scribe(res.locals.auth_user.userId))) && (req.body.description !== undefined && !(await user_is_ho_commitee_scribe(res.locals.auth_user.userId)) && !(await user_is_hr_commitee_scribe(res.locals.auth_user.userId)))){
        fail_no_permissions(res, "you don't have permissions to edit this appointment");
        return;
    }

    const appointmentId: number = parseInt(req.params.appointmentId);

    if(Number.isNaN(appointmentId)) {
        fail_missing_params(res, ["appointmentId"], null);
        return;
    }

    if(action === 'MODIFY'){
        if(req.body.description === undefined && ((HOenabled && HRenabled && req.body.slots_HO === undefined && req.body.slots_HR === undefined) || (HOenabled && !HRenabled && req.body.slots_HO === undefined) || (!HOenabled && HRenabled && req.body.slots_HR === undefined))){
            fail_missing_params(res, ["description", "slots_HO", "slots_HR"], null);
            return;
        }
    
        /*if(req.body.description === undefined && (HOenabled && req.body.slots_HO === undefined) && (HRenabled && req.body.slots_HR === undefined)){
            fail_missing_params(res, [], "no body provided");
            return;
        }*/
    
        const current_appointment = await prisma.appointment.findUnique({
            where: {
                id: appointmentId,
            },
            select: {
                registrations: {
                    select: {
                        id: true,
                        trial: {
                            select: {
                                type: true,
                            }
                        }
                    }
                }
            }
        });
    
        if(current_appointment === null){
            fail_entity_not_found(res, "appointment with id " + appointmentId + " not found");
            return;
        }
    
        const HOregs = current_appointment.registrations.filter((value) => {return value.trial.type === TrialType.HO});
        const HRregs = current_appointment.registrations.filter((value) => {return value.trial.type === TrialType.HR});
    
        if((HOenabled && HOregs.length > req.body.slots_HO) || (HRenabled && HRregs.length > req.body.slots_HR)){
            fail_duplicate_entry(res, ((HOenabled && HOregs.length > req.body.slots_HO) ? 'slots_HO' : '') + ' ' + ((HRenabled && HRregs.length > req.body.slots_HR) ? 'slots_HR' : ''), 'you cannot shrink available slots more than number of currently registered people');
            return;
        }
    }

    const appointment = await prisma.appointment.update({
        where: {
            id: appointmentId,
        },
        data: {
            description: action !== 'MODIFY' ? undefined : req.body.description,
            slots_HO: action !== 'MODIFY' ? undefined : (req.body.slots_HO !== undefined && HOenabled) ? req.body.slots_HO : undefined,
            slots_HR: action !== 'MODIFY' ? undefined : (req.body.slots_HR !== undefined && HRenabled) ? req.body.slots_HR : undefined,

            locked: (action === 'MODIFY' ? undefined : (action === 'LOCK' ? true : false)),
        },
        select: {
            id: true,
            date: true,
            description: true,
            slots_HO: HOenabled,
            slots_HR: HRenabled,
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
                            user: {
                                select: {
                                    name: true,
                                    rank: true,
                                }
                            }
                        }
                    }
                }
            }
        },
    });

    res.status(200).json({
        status: "success",
        data: appointment
    }).end();
});

router.delete('/:appointmentId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;
    if(!(await user_is_uberadmin(res.locals.auth_user.userId)) && !(await user_is_commitee_scribe(res.locals.auth_user.userId))){
        fail_no_permissions(res, "you don't have permissions to delete teams");
        return;
    }

    const appointmentId: number = parseInt(req.params.appointmentId);

    if(Number.isNaN(appointmentId)) {
        fail_missing_params(res, ["appointmentId"], null);
        return;
    }

    const exists = await prisma.appointmentRegistrations.count({
        where: {
            appointmentId: appointmentId,
        }
    }) > 0;

    if(exists){
        fail_entity_not_found(res, "appointment with id " + appointmentId + " still has people registererd");
        return;
    }

    await prisma.appointment.delete({
        where: {
            id: appointmentId,
        }
    });

    res.status(204).json({
        status: "success",
        data: null
    }).end();
});

router.post('/register/:type(ho|hr)', async (req: Request, res: Response) => {
    if(!check_login(res)) return;

    const mode = await getSystemMode();
    if(mode === null){
        fail_internal_error(res, 'couldn\'t determine instance mode');
        return;
    }
    const HOenabled = (mode === SystemMode.HO || mode === SystemMode.HO_HR);
    const HRenabled = (mode === SystemMode.HR || mode === SystemMode.HO_HR);

    const type = req.params.type === 'ho' ? TrialType.HO : TrialType.HR;

    if((type === TrialType.HO && !HOenabled) || (type === TrialType.HR && !HRenabled)){
        fail_missing_params(res, [], 'mode ' + type + ' is disabled in this instance');
        return;
    }

    if(req.body.appointmentId === undefined || req.body.intent === undefined || req.body.customIntent === undefined || req.body.message === undefined){
        fail_missing_params(res, ["appointmentId", "intent", "customIntent", "message"], null);
    }

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

router.delete('/unregister/:type(ho|hr)/:appointmentId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;
    
    const type = req.params.type === 'ho' ? TrialType.HO : TrialType.HR;
    const appointmentId: number = parseInt(req.params.appointmentId);

    const mode = await getSystemMode();
    if(mode === null){
        fail_internal_error(res, 'couldn\'t determine instance mode');
        return;
    }
    const HOenabled = (mode === SystemMode.HO || mode === SystemMode.HO_HR);
    const HRenabled = (mode === SystemMode.HR || mode === SystemMode.HO_HR);

    if((type === TrialType.HO && !HOenabled) || (type === TrialType.HR && !HRenabled)){
        fail_missing_params(res, [], 'mode ' + type + ' is disabled in this instance');
        return;
    }

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

router.delete('/kick/:registrationId', async (req: Request, res: Response) => {
    if(!check_login(res)) return;
    
    const registrationId: number = parseInt(req.params.registrationId);

    if(Number.isNaN(registrationId)) {
        fail_missing_params(res, ["registrationId"], null);
        return;
    }

    const mode = await getSystemMode();
    if(mode === null){
        fail_internal_error(res, 'couldn\'t determine instance mode');
        return;
    }
    const HOenabled = (mode === SystemMode.HO || mode === SystemMode.HO_HR);
    const HRenabled = (mode === SystemMode.HR || mode === SystemMode.HO_HR);

    const HOscribe = await user_is_ho_commitee_scribe(res.locals.auth_user.userId);
    const HRscribe = await user_is_hr_commitee_scribe(res.locals.auth_user.userId);

    const registration = await prisma.appointmentRegistrations.findUnique({
        where: {
            id: registrationId,
        },
        select: {
            trial: {
                select: {
                    id: true,
                    type: true,
                    user: {
                        select: {
                            email: true,
                            phone: true,
                            enableEmailNotifications: true,
                            enableSMSNotifications: true,
                        }
                    }
                }
            }
        }
    });

    if(registration === null){
        fail_entity_not_found(res, "appointment registration with id " + registrationId + " not found");
        return;
    }

    if((mode === SystemMode.HO && registration.trial.type !== TrialType.HO) || (mode === SystemMode.HR && registration.trial.type !== TrialType.HR)){
        fail_internal_error(res, "trial in unsupported type");
        return;
    }

    if(!(await user_is_uberadmin(res.locals.auth_user.userId)) && ((registration.trial.type === TrialType.HO && !HOscribe) || (registration.trial.type === TrialType.HR && !HRscribe))){
        fail_no_permissions(res, "you don't have permissions to kick from this appointment");
        return;
    }

    ///TODO: Send email
    /// message: req.body.message (can be null)

    await prisma.appointmentRegistrations.delete({
        where: {
            id: registrationId,
        }
    });

    res.status(204).json({
        status: "success",
        data: null
    }).end();
});

export default router;
