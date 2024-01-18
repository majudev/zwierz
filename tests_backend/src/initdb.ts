import logger from './utils/logger.js';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import fs from 'fs';

const prisma = new PrismaClient();

export async function initDB(){
    logger.info('Initializing DB');

    const mode_found = await prisma.settings.count({
        where: {
            key: {
                equals: 'instance.mode',
            }
        }
    }) > 0;
    if(!mode_found){
        logger.info('Setting instance mode to HO only (default)');
        await prisma.settings.create({
            data: {
                key: 'instance.mode',
                value: 'HO',
            }
        });
    }

    const login_image_found = await prisma.attachment.count({
        where: {
            name: "login-image",
            trialId: {
                equals: null,
            }
        }
    });
    if(login_image_found === 0){
        logger.info('Inserting default login image into the database...');
        await prisma.attachment.create({
            data: {
                name: "login-image",
                trialId: null,
                extension: "png",
                content: fs.readFileSync('defaults/logo-default.png'),
                size: fs.readFileSync('defaults/logo-default.png').length,
            }
        });
    }

    const main_scribe_email = await prisma.settings.count({
        where: {
            key: {
                equals: "main.scribe.email"
            }
        }
    }) > 0;
    if(!main_scribe_email){
        logger.error('Missing main.scribe.email entry in the database');
        process.exit(-1);
    }

    const activation_email_subject = await prisma.settings.count({
        where: {
            key: {
                equals: "email.activation.subject"
            }
        }
    }) > 0;
    if(!activation_email_subject){
        await prisma.settings.create({
            data: {
                key: "email.activation.subject",
                value: 'Aktywacja konta w systemie Zwierz',
            }
        });
    }

    const activation_email_plaintext = await prisma.settings.count({
        where: {
            key: {
                equals: "email.activation.plaintext"
            }
        }
    }) > 0;
    if(!activation_email_plaintext){
        await prisma.settings.create({
            data: {
                key: "email.activation.plaintext",
                value: 'Dzięki za rejestrację w systemie Zwierz!\nAby aktywować swoje konto, musisz skopiować poniższy link i wkleić go do swojej przeglądarki:\n\n',
            }
        });
    }

    const activation_email_html = await prisma.settings.count({
        where: {
            key: {
                equals: "email.activation.html"
            }
        }
    }) > 0;
    if(!activation_email_html){
        await prisma.settings.create({
            data: {
                key: "email.activation.html",
                value: '<center><h1>Dzięki za rejestrację w systemie Zwierz!</h1></center><p>Aby aktywować swoje konto, kliknij w poniższy link:</p>',
            }
        });
    }

    const pwdreset_email_subject = await prisma.settings.count({
        where: {
            key: {
                equals: "email.pwdreset.subject"
            }
        }
    }) > 0;
    if(!pwdreset_email_subject){
        await prisma.settings.create({
            data: {
                key: "email.pwdreset.subject",
                value: 'Reset hasła w systemie Zwierz',
            }
        });
    }

    const pwdreset_email_plaintext = await prisma.settings.count({
        where: {
            key: {
                equals: "email.pwdreset.plaintext"
            }
        }
    }) > 0;
    if(!pwdreset_email_plaintext){
        await prisma.settings.create({
            data: {
                key: "email.pwdreset.plaintext",
                value: 'Każdemu zdarza się zapomnieć...\nAby zresetować swoje hasło, musisz skopiować poniższy link i wkleić go do swojej przeglądarki:\n\n',
            }
        });
    }

    const pwdreset_email_html = await prisma.settings.count({
        where: {
            key: {
                equals: "email.pwdreset.html"
            }
        }
    }) > 0;
    if(!pwdreset_email_html){
        await prisma.settings.create({
            data: {
                key: "email.pwdreset.html",
                value: '<center><h1>Każdemu się zdarza zapomnieć...</h1></center><p>Aby zresetować swoje hasło, kliknij w poniższy link:</p>',
            }
        });
    }

    const local_sso_found = await prisma.settings.count({
        where: {
            key: {
                equals: "sso.local.enable"
            }
        }
    }) > 0;
    if(!local_sso_found){
        logger.info('Enabling local SSO by default');
        await prisma.settings.create({
            data: {
                key: "sso.local.enable",
                value: "true",
            }
        });
    }

    const microsoft_mlp_sso_found = await prisma.settings.count({
        where: {
            key: {
                equals: "sso.microsoft_mlp.enable"
            }
        }
    }) > 0;
    if(!microsoft_mlp_sso_found){
        logger.info('Disabling Microsoft Małopolska SSO by default');
        await prisma.settings.create({
            data: {
                key: "sso.microsoft_mlp.enable",
                value: "false",
            }
        });
    }

    const google_zhr_sso_found = await prisma.settings.count({
        where: {
            key: {
                equals: "sso.google_zhr.enable"
            }
        }
    }) > 0;
    if(!google_zhr_sso_found){
        logger.info('Disabling Google ZHR SSO by default');
        await prisma.settings.create({
            data: {
                key: "sso.google_zhr.enable",
                value: "false",
            }
        });
    }

    const sms_account_found = await prisma.settings.count({
        where: {
            key: {
                equals: "ovhSMS.account"
            }
        }
    }) > 0;
    if(!sms_account_found){
        logger.error('Missing ovhSMS.account entry in the database');
        process.exit(-1);
    }

    const sms_login_found = await prisma.settings.count({
        where: {
            key: {
                equals: "ovhSMS.login"
            }
        }
    }) > 0;
    if(!sms_login_found){
        logger.error('Missing ovhSMS.login entry in the database');
        process.exit(-1);
    }

    const sms_password_found = await prisma.settings.count({
        where: {
            key: {
                equals: "ovhSMS.password"
            }
        }
    }) > 0;
    if(!sms_password_found){
        logger.error('Missing ovhSMS.password entry in the database');
        process.exit(-1);
    }

    const sms_from_found = await prisma.settings.count({
        where: {
            key: {
                equals: "ovhSMS.from"
            }
        }
    }) > 0;
    if(!sms_from_found){
        logger.error('Missing ovhSMS.from entry in the database');
        process.exit(-1);
    }
    
    const postal_baseurl_found = await prisma.settings.count({
        where: {
            key: {
                equals: "postal.baseurl"
            }
        }
    }) > 0;
    if(!postal_baseurl_found){
        logger.error('Missing postal.baseurl entry in the database');
        process.exit(-1);
    }

    const postal_apitoken_found = await prisma.settings.count({
        where: {
            key: {
                equals: "postal.apitoken"
            }
        }
    }) > 0;
    if(!postal_apitoken_found){
        logger.error('Missing postal.apitoken entry in the database');
        process.exit(-1);
    }

    const postal_from_found = await prisma.settings.count({
        where: {
            key: {
                equals: "postal.from"
            }
        }
    }) > 0;
    if(!postal_from_found){
        logger.error('Missing postal.from entry in the database');
        process.exit(-1);
    }

    var jwt_secret_found = await prisma.settings.count({
        where: {
            key: 'JWT_SECRET',
        }
    }) > 0;
    if(!jwt_secret_found){
        logger.info('No JWT secret in the database. Generating random one...');
        var random_jwt_secret = randomBytes(64).toString('hex');
        await prisma.settings.create({
            data: {
                key: 'JWT_SECRET',
                value: random_jwt_secret,
            }
        });
        logger.debug('New JWT secret is ' + random_jwt_secret);
    }

    var jwt_expdays_found = await prisma.settings.count({
        where: {
            key: 'JWT_EXPIRATION_MINS',
        }
    }) > 0;
    if(!jwt_expdays_found){
        logger.info('No JWT expiration time in the database. Inserting default one');
        const value = "3600";
        await prisma.settings.create({
            data: {
                key: 'JWT_EXPIRATION_MINS',
                value: value,
            }
        });
        logger.debug('New JWT expiration time is ' + value + 'min');
    }

    const users_count = await prisma.user.count();
    if(users_count === 0){
        logger.info('Adding default user');
        const password = await bcrypt.hash('admin', 14);
        const user = await prisma.user.create({
            data: {
                email: 'admin@dummy.local',
                password: password,
                name: 'Admin',
                uberadmin: true,
            }
        });
    }else logger.debug('' + users_count + ' users exist in the database, not adding default one');

    const teams_count = await prisma.team.count();
    if(teams_count === 0){
        logger.info('Adding default team');
        const team = await prisma.team.create({
            data: {
                name: "Inna",
                archived: false,
            }
        });
    }else logger.debug('' + teams_count + ' teams exist in database, not adding default one');
}

export default initDB;