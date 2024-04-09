import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

async function sendNotificationEmailViaPostal(to: string, reply_to: string, subject: string, plain_body: string, html_body: string){
    const baseurlPromise = prisma.settings.findFirst({
        select: {
            key: true,
            value: true,
        },
        where: {
            key: {
                equals: "postal.baseurl"
            }
        }
    });

    const apitokenPromise = prisma.settings.findFirst({
        select: {
            key: true,
            value: true,
        },
        where: {
            key: {
                equals: "postal.apitoken"
            }
        }
    });

    const fromPromise = prisma.settings.findFirst({
        select: {
            key: true,
            value: true,
        },
        where: {
            key: {
                equals: "postal.from"
            }
        }
    });

    const baseurl = await baseurlPromise;
    const apiToken = await apitokenPromise;
    const from = await fromPromise;

    if(baseurl === null || apiToken === null || from === null){
        logger.error('Cannot find' + (baseurl === null ? ' postal.baseurl' : '') + (apiToken === null ? ' postal.apitoken' : '') + (from === null ? ' postal.from' : '') + ' in the database');
        return false;
    }

    const response = await fetch(baseurl.value + '/api/v1/send/message', {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "X-Server-API-Key": apiToken.value,
        },
        body: JSON.stringify({
            to: [to],
            from: from.value,
            reply_to: reply_to,
            subject: subject,
            plain_body: plain_body,
            html_body: html_body,
            bounce: false,
        }),
    });
    if(!response.ok){
        logger.error('Cannot send e-mail via postal: status ' + response.status + (response.status !== 502 ? (', details: ' + await response.text()) : ' - server probably dead'));
    }
    return response.ok;
}

async function sendNotificationEmailViaMailjet(to: string, reply_to: string, subject: string, plain_body: string, html_body: string){
    const apitokenPublicPromise = prisma.settings.findFirst({
        select: {
            key: true,
            value: true,
        },
        where: {
            key: {
                equals: "mailjet.apitoken.public"
            }
        }
    });

    const apitokenSecretPromise = prisma.settings.findFirst({
        select: {
            key: true,
            value: true,
        },
        where: {
            key: {
                equals: "mailjet.apitoken.secret"
            }
        }
    });

    const fromNamePromise = prisma.settings.findFirst({
        select: {
            key: true,
            value: true,
        },
        where: {
            key: {
                equals: "mailjet.from.name"
            }
        }
    });

    const fromEmailPromise = prisma.settings.findFirst({
        select: {
            key: true,
            value: true,
        },
        where: {
            key: {
                equals: "mailjet.from.email"
            }
        }
    });

    const apiTokenPublic = await apitokenPublicPromise;
    const apiTokenSecret = await apitokenSecretPromise;
    const fromName = await fromNamePromise;
    const fromEmail = await fromEmailPromise;

    if(apiTokenPublic === null || apiTokenSecret === null || fromName === null || fromEmail === null){
        logger.error('Cannot find' + (apiTokenPublic === null ? ' mailjet.apitoken.public' : '') + (apiTokenSecret === null ? ' mailjet.apitoken.secret' : '') + (fromName === null ? ' mailjet.from.name' : '') + (fromEmail === null ? ' mailjet.from.email' : '') + ' in the database');
        return false;
    }

    const response = await fetch('https://api.mailjet.com/v3.1/send', {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            'Authorization': 'Basic ' + btoa(apiTokenPublic.value + ":" + apiTokenSecret.value),
        },
        body: JSON.stringify({
            Messages: [
                {
                    From: {
                        Email: fromEmail.value,
                        Name: fromName.value,
                    },
                    To: [
                        {
                            Email: to,
                        }
                    ],
                    Subject: subject,
                    TextPart: plain_body,
                    HTMLPart: html_body,
                }
            ]
        }),
    });
    if(!response.ok){
        logger.error('Cannot send e-mail via mailjet: status ' + response.status + ', details: ' + await response.text());
    }
    logger.debug('Sent e-mail via mailjet: status ' + response.status + ', details: ' + await response.text());
    return response.ok;
}

async function sendNotificationEmail(to: string, reply_to: string, subject: string, plain_body: string, html_body: string){
    const mailerProvider = await prisma.settings.findFirst({
        select: {
            key: true,
            value: true,
        },
        where: {
            key: {
                equals: "mailer.provider"
            }
        }
    });

    logger.debug('E-mail provider: ' + mailerProvider?.value);

    if(mailerProvider === null){
        logger.error("Inconsistent database: couldn't find mailer.provider!");
        return false;
    }else if(mailerProvider.value === "postal"){
        return await sendNotificationEmailViaPostal(to, reply_to, subject, plain_body, html_body);
    }else if(mailerProvider.value === "mailjet"){
        return await sendNotificationEmailViaMailjet(to, reply_to, subject, plain_body, html_body);
    }

    logger.error("Inconsistent database: mailer.provider has invalid value of \"" + mailerProvider.value + "\"");
    return false;
}

export default sendNotificationEmail;