import { Router, Request, Response } from 'express';
import logger from '../../utils/logger.js';
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken';
import {v4 as uuidv4} from 'uuid';
import { JWT_EXPIRATION_MINS, JWT_SECRET } from './jwt_secret.js';
import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import { check_login, fail_missing_params, fail_no_permissions, fail_entity_not_found, fail_duplicate_entry, fail_internal_error } from '../../utils/http_code_helper.js';
import { generateCaptchaChallenge } from '../../utils/captcha.js';
import { getSetting } from '../../utils/settings.js';
import { createClient } from 'redis';

import { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } from 'simple-oauth2';
import sendNotificationEmail from '../../notifier/notify-email.js';

const router = Router();
const prisma = new PrismaClient();

/*const google = new AuthorizationCode({
    client: {
        id: process.env.OAUTH_GOOGLE_ID as string,
        secret: process.env.OAUTH_GOOGLE_SECRET as string,
    },
    auth: {
        tokenHost: 'https://oauth2.googleapis.com',
        tokenPath: '/token',
        authorizeHost: 'https://accounts.google.com',
        authorizePath: '/o/oauth2/v2/auth',
    },
});

router.get('/google', async (req: Request, res: Response) => {
    const google_zhr_sso_enabled = await prisma.settings.findFirst({
        select: {
            value: true,
        },
        where: {
            key: "sso.google_zhr.enable",
        }
    });
    if(google_zhr_sso_enabled === null || google_zhr_sso_enabled.value !== "true"){
        res.redirect((process.env.BASEURL as string) + '/login?status=error&code=400&message=Google+ZHR+SSO+disabled');
        logger.debug("Google ZHR SSO is disabled");
        return;
    }


    const authorizationUri = google.authorizeURL({
        redirect_uri: (process.env.BASEURL as string) + '/api/auth/google/callback',
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        state: randomBytes(16).toString('hex'),
    });

    res.redirect(authorizationUri);
});

router.get('/google/callback', async (req: Request, res: Response) => {
    const google_zhr_sso_enabled = await prisma.settings.findFirst({
        select: {
            value: true,
        },
        where: {
            key: "sso.google_zhr.enable",
        }
    });
    if(google_zhr_sso_enabled === null || google_zhr_sso_enabled.value !== "true"){
        res.redirect((process.env.BASEURL as string) + '/login?status=error&code=400&message=Google+ZHR+SSO+disabled');
        logger.debug("Google ZHR SSO is disabled");
        return;
    }


    const { code } = req.query;
    const options = {
        redirect_uri: (process.env.BASEURL as string) + '/api/auth/google/callback',
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        code: code as string,
    };

    try {
        const accessToken = await google.getToken(options);

        //console.log('The resulting token: ', accessToken.token);

        const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + encodeURIComponent(accessToken.token.access_token as string),{
            method: "GET",
        });
        const status = response.status;
        if(status !== 200){
            res.redirect((process.env.BASEURL as string) + '/login?status=error&code=401&message=invalid+OAuth2+code+provided');
            return;
        }
        const body = await response.json();
        const email = body.email;
        const name = body.name;

        if(email === undefined || email === null || name === undefined || name === null){
            //fail_internal_error(res, "google returned unsupported reply");
            res.redirect((process.env.BASEURL as string) + '/login?status=error&code=500&message=google+provided+unsupported+reply');
        }


        var userObject = await prisma.user.findFirst({
            select: {
                id: true,
                email: true,
            },
            where: {
                email: email,
                sso: 'GOOGLE_ZHR',
                disabled: false,
            }
        });

        if(userObject === null) {
            res.redirect((process.env.BASEURL as string) + '/login?status=error&code=401&message=user+not+allowed');
            return;
        }

        userObject = await prisma.user.update({
            data: {
                name: name,
            },
            where: {
                id: userObject.id,
            },
            select: {
                id: true,
                email: true,
            }
        });

        await loginUser(req, res, userObject.id, userObject.email);
        //res.redirect((process.env.LOGIN_SUCCESSFUL_CALLBACK as string) + '?status=success');
        
        res.set('Content-Type', 'text/html');
        res.send(Buffer.from('<html><head><META http-equiv="refresh" content="0;' + (process.env.BASEURL as string) + '/login?status=success"></head></html>'));
    } catch (error: any) {
      //fail_internal_error(res, "authentication failed");
      res.redirect((process.env.BASEURL as string) + '/login?status=error&code=401&message=authentication+failed');
      return;
    }
});*/

async function loginUser(req: Request, res: Response, id: number, email: string){
    var authToken = await jwt.sign({
        id: uuidv4(),
        userId: id,
        email: email,
    }, await JWT_SECRET(), {
        expiresIn: (await JWT_EXPIRATION_MINS()) + "m",
    });

    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + Number.parseInt(await JWT_EXPIRATION_MINS()));
    res.cookie("ZWIERZ_COOKIE", authToken, {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        //sameSite: "lax",
        //sameSite: "none",
        expires: expirationDate,
    });
    res.cookie("ZWIERZ_COOKIE_EXP", expirationDate, {
        secure: true,
        httpOnly: false,
        sameSite: "strict",
        //sameSite: "lax",
        //sameSite: "none",
        expires: expirationDate,
    });
}

router.get('/captcha', async (req: Request, res: Response) => {
    const redis = createClient({
        url: process.env.REDIS_URL,
    });

    await redis.connect();

    const expires = 600;
    const captchaId = randomBytes(16).toString('hex');
    const challenge = generateCaptchaChallenge();

    await redis.set('captcha.' + captchaId + '.question', challenge.question);
    await redis.set('captcha.' + captchaId + '.answer', challenge.answer);
    await redis.expire('captcha.' + captchaId + '.question', expires);
    await redis.expire('captcha.' + captchaId + '.answer', expires);

	res.status(200).json({
		status: "success",
        data: {
            id: captchaId,
            challenge: challenge.question,
            expires: expires,
        },
	});
});

router.post('/register', async (req: Request, res: Response) => {
    if(req.body.email === undefined) {
        fail_missing_params(res, ["email"], null);
        return;
    }

    if(req.body.password === undefined) {
        fail_missing_params(res, ["password"], null);
        return;
    }

    if(req.body.captchaId === undefined) {
        fail_missing_params(res, ["captchaId"], null);
        return;
    }

    if(req.body.captchaAnswer === undefined) {
        fail_missing_params(res, ["captchaAnswer"], null);
        return;
    }

    const redis = createClient({
        url: process.env.REDIS_URL,
    });
    await redis.connect();

    /*const ip = req.header('CF-Connecting-IP') ?? req.ip;
    const ratelimit = await redis.get('ratelimit.' + ip + '.auth');
    if(ratelimit !== null){
        await redis.expire('ratelimit.' + ip + '.auth', 2);
        res.status(429).end();
        return;
    }
    await redis.set('ratelimit.' + ip + '.auth', 1);
    await redis.expire('ratelimit.' + ip + '.auth', 2);*/

    const captcha = await redis.get('captcha.' + req.body.captchaId + '.answer');
    if(captcha === null || captcha !== req.body.captchaAnswer){
        res.status(409).json({
            status: "error",
            message: "wrong or expired captcha",
        }).end();
        return;
    }

    const exists = await prisma.user.count({
        where: {
            email: req.body.email,
        }
    }) > 0;

    if(exists) {
        res.status(409).json({
            status: "error",
            message: "user with this email already exists",
        });
        return;
    }

    const main_scribe_email = await getSetting("main.scribe.email");
    if(main_scribe_email === null){
        fail_internal_error(res, 'cannot find main scribe email');
        return
    }
    const activation_email_subject = await getSetting("email.activation.subject");
    const activation_email_plaintext = await getSetting("email.activation.plaintext");
    const activation_email_html = await getSetting("email.activation.html");
    if(activation_email_subject === null || activation_email_plaintext === null || activation_email_html === null){
        fail_internal_error(res, 'cannot find email.activation.* setting');
        return;
    }

    /*await redis.set('ratelimit.' + ip + '.auth', 1);
    await redis.expire('ratelimit.' + ip + '.auth', 30);*/

    const activationkey = randomBytes(30).toString('hex');
    const emailOk = await sendNotificationEmail(
        req.body.email,
        main_scribe_email,
        activation_email_subject,
        activation_email_plaintext + process.env.BASEURL + '/api/auth/activate/' + activationkey,
        activation_email_html + '<a href="' + process.env.BASEURL + '/api/auth/activate/' + activationkey + '">' + process.env.BASEURL + '/api/auth/activate/' + activationkey + '</a>',
    );

    if(!emailOk){
        fail_internal_error(res, 'cannot send activation e-mail');
        return;
    }

    await prisma.user.create({
        data: {
            email: req.body.email,
            password: await hashPassword(req.body.password),
            activationkey: activationkey,
        },
    });

	res.status(204).json({
		status: "success",
        data: null,
	});
});

router.get('/activate/:activationkey', async (req: Request, res: Response) => {
    const activationkey = req.params.activationkey;

    /*const redis = createClient({
        url: process.env.REDIS_URL,
    });
    await redis.connect();

    const ip = req.header('CF-Connecting-IP') ?? req.ip;
    const ratelimit = await redis.get('ratelimit.' + ip + '.auth');
    if(ratelimit !== null){
        await redis.expire('ratelimit.' + ip + '.auth', 2);
        res.status(429).end();
        return;
    }
    await redis.set('ratelimit.' + ip + '.auth', 1);
    await redis.expire('ratelimit.' + ip + '.auth', 2);*/

    const exists = await prisma.user.count({
        where: {
            activationkey: activationkey,
        }
    }) > 0;

    if(!exists) {
        res.redirect(process.env.BASEURL + '/login?activate=error&message=wrong+activation+key');
        return;
    }

    await prisma.user.update({
        where: {
            activationkey: activationkey,
        },
        data: {
            activationkey: null,
        },
    });

	/*res.status(204).json({
		status: "success",
        data: null,
	});*/
    res.redirect(process.env.BASEURL + '/login?activate=success');
});

router.post('/passwordreset', async (req: Request, res: Response) => {
    if(req.body.email === undefined) {
        fail_missing_params(res, ["email"], null);
        return;
    }

    if(req.body.captchaId === undefined) {
        fail_missing_params(res, ["captchaId"], null);
        return;
    }

    if(req.body.captchaAnswer === undefined) {
        fail_missing_params(res, ["captchaAnswer"], null);
        return;
    }

    const redis = createClient({
        url: process.env.REDIS_URL,
    });
    await redis.connect();

    /*const ip = req.header('CF-Connecting-IP') ?? req.ip;
    const ratelimit = await redis.get('ratelimit.' + ip + '.auth');
    if(ratelimit !== null){
        await redis.expire('ratelimit.' + ip + '.auth', 2);
        res.status(429).end();
        return;
    }
    await redis.set('ratelimit.' + ip + '.auth', 1);
    await redis.expire('ratelimit.' + ip + '.auth', 2);*/

    const captcha = await redis.get('captcha.' + req.body.captchaId + '.answer');
    if(captcha === null || captcha !== req.body.captchaAnswer){
        res.status(409).json({
            status: "error",
            message: "wrong or expired captcha",
        }).end();
        return;
    }

    const exists = await prisma.user.count({
        where: {
            email: req.body.email,
        }
    }) > 0;

    if(!exists) {
        res.status(404).json({
            status: "error",
            message: "user with this email not found",
        });
        return;
    }

    const main_scribe_email = await getSetting("main.scribe.email");
    if(main_scribe_email === null){
        fail_internal_error(res, 'cannot find main scribe email');
        return
    }
    const pwdreset_email_subject = await getSetting("email.pwdreset.subject");
    const pwdreset_email_plaintext = await getSetting("email.pwdreset.plaintext");
    const pwdreset_email_html = await getSetting("email.pwdreset.html");
    if(pwdreset_email_subject === null || pwdreset_email_plaintext === null || pwdreset_email_html === null){
        fail_internal_error(res, 'cannot find email.pwdreset.* setting');
        return;
    }

    /*await redis.set('ratelimit.' + ip + '.auth', 1);
    await redis.expire('ratelimit.' + ip + '.auth', 30);*/

    const pwdresetkey = randomBytes(30).toString('hex');
    const emailOk = await sendNotificationEmail(
        req.body.email,
        main_scribe_email,
        pwdreset_email_subject,
        pwdreset_email_plaintext + process.env.BASEURL + '/passwordreset/' + pwdresetkey,
        pwdreset_email_html + '<a href="' + process.env.BASEURL + '/passwordreset/' + pwdresetkey + '">' + process.env.BASEURL + '/passwordreset/' + pwdresetkey + '</a>',
    );

    if(!emailOk){
        fail_internal_error(res, 'cannot send password reset e-mail');
        return;
    }

    await prisma.user.update({
        where: {
            email: req.body.email,
        },
        data: {
            pwdresetkey: pwdresetkey,
        },
    });

	res.status(204).json({
		status: "success",
        data: null,
	});
});

router.post('/login', async (req: Request, res: Response) => {
    const local_sso_enabled = await prisma.settings.findFirst({
        select: {
            value: true,
        },
        where: {
            key: "sso.local.enable",
        }
    });
    if(local_sso_enabled === null || local_sso_enabled.value !== "true"){
        res.status(403).json({
            status: "error",
            message: "local SSO disabled",
        });
        logger.debug("Local SSO is disabled");
        return;
    }

    /*const redis = createClient({
        url: process.env.REDIS_URL,
    });
    await redis.connect();

    const ip = req.header('CF-Connecting-IP') ?? req.ip;
    const ratelimit = await redis.get('ratelimit.' + ip + '.auth');
    if(ratelimit !== null){
        if(parseInt(ratelimit) > 10){
            await redis.expire('ratelimit.' + ip + '.auth', 3600);
            res.status(429).header("Retry-After: 3600").end();
            return;
        }else{
            await redis.set('ratelimit.' + ip + '.auth', parseInt(ratelimit) + 1);
            await redis.expire('ratelimit.' + ip + '.auth', 2*parseInt(ratelimit));
        }
    }else{
        await redis.set('ratelimit.' + ip + '.auth', 1);
        await redis.expire('ratelimit.' + ip + '.auth', 2);
    }*/

    const email = req.body.email;
    const password = req.body.password;

    if(req.body.email === undefined || req.body.password === undefined) {
        fail_missing_params(res, ["email", "password"], "please provide email and password");
        return;
    }

    logger.debug("User " + email + " is trying to log in using SSO LOCAL...")

    var userObject = await prisma.user.findFirst({
        select: {
            id: true,
            email: true,
            password: true,
        },
        where: {
            email: email,
            sso: 'LOCAL',
            disabled: false,
        }
    });

    if(userObject === null) {
        res.status(401).json({
            status: "error",
            message: "user does not exist or wrong password",
        });
        logger.debug("User " + email + " does not exist");
        return;
    }

    if(userObject.password === null || !(await bcrypt.compare(password, userObject.password))) {
        res.status(401).json({
            status: "error",
            message: "user does not exist or wrong password",
        });
        logger.debug("User " + email + " has provided bad password");
        return;
    }

    await loginUser(req, res, userObject.id, userObject.email);

    res.status(200).json({
		status: "success"
	});
    logger.debug("User " + email + " logged in");
    //res.set('Content-Type', 'text/html');
    //res.send(Buffer.from('<html><head><META http-equiv="refresh" content="0;' + (process.env.BASEURL as string) + '/login?status=success"></head></html>'));
});

router.get('/logout', async (req: Request, res: Response) => {
    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + 5);
    res.cookie("ZWIERZ_COOKIE", 'none', {
        secure: true,
        httpOnly: true,
        sameSite: "strict",
        //sameSite: "lax",
        //sameSite: "none",
        expires: expirationDate,
    });
    res.cookie("ZWIERZ_COOKIE_EXP", expirationDate, {
        secure: true,
        httpOnly: false,
        sameSite: "strict",
        //sameSite: "lax",
        //sameSite: "none",
        expires: expirationDate,
    });
    res.status(200);
    res.set('Content-Type', 'text/html');
    res.send(Buffer.from('<html><head><META http-equiv="refresh" content="0;' + (process.env.BASEURL as string) + '/login"></head></html>'));
});

export async function hashPassword(plaintextPassword: string){
    return await bcrypt.hash(plaintextPassword, 14);
}

export default router;
