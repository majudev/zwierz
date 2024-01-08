import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

const prisma = new PrismaClient();

async function sendNotificationEmail(to: string, reply_to: string, subject: string, plain_body: string, html_body: string){
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
        logger.error('Cannot send e-mail: status ' + response.status + (response.status !== 502 ? (', details: ' + await response.text()) : ' - server probably dead'));
    }
    return response.ok;
}

export default sendNotificationEmail;