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

    const pdf_image_found = await prisma.attachment.count({
        where: {
            name: "pdf-image",
            trialId: {
                equals: null,
            }
        }
    });
    if(pdf_image_found === 0){
        logger.info('Inserting default PDF header image into the database...');
        await prisma.attachment.create({
            data: {
                name: "pdf-image",
                trialId: null,
                extension: "png",
                content: fs.readFileSync('defaults/pdf-default.png'),
                size: fs.readFileSync('defaults/pdf-default.png').length,
            }
        });
    }

    const pdf_ho_name_found = await prisma.settings.count({
        where: {
            key: {
                equals: "pdf.ho.name"
            }
        }
    }) > 0;
    if(!pdf_ho_name_found){
        logger.info('Inserting default HO trial PDF header text into the database...');
        await prisma.settings.create({
            data: {
                key: "pdf.ho.name",
                value: 'Kapituła Stopnia Harcerza Orlego\nHufca [Nazwa Hufca]',
            }
        });
    }

    const pdf_hr_name_found = await prisma.settings.count({
        where: {
            key: {
                equals: "pdf.hr.name"
            }
        }
    }) > 0;
    if(!pdf_hr_name_found){
        logger.info('Inserting default HR trial PDF header text into the database...');
        await prisma.settings.create({
            data: {
                key: "pdf.hr.name",
                value: 'Kapituła Stopnia Harcerza Rzeczypospolitej\nHufca [Nazwa Hufca]',
            }
        });
    }

    const trial_showquesthints_found = await prisma.settings.count({
        where: {
            key: {
                equals: 'trial.showquesthints'
            }
        }
    }) > 0;
    if(!trial_showquesthints_found){
        logger.info('Enabling Quest Hints by default...');
        await prisma.settings.create({
            data: {
                key: 'trial.showquesthints',
                value: 'true',
            }
        });
    }

    const trial_showtrialtutorial_found = await prisma.settings.count({
        where: {
            key: {
                equals: 'trial.showtrialtutorial'
            }
        }
    }) > 0;
    if(!trial_showtrialtutorial_found){
        logger.info('Disabling trial tutorial by default...');
        await prisma.settings.create({
            data: {
                key: 'trial.showtrialtutorial',
                value: 'false',
            }
        });
    }

    const trial_showreporttutorial_found = await prisma.settings.count({
        where: {
            key: {
                equals: 'trial.showreporttutorial'
            }
        }
    }) > 0;
    if(!trial_showreporttutorial_found){
        logger.info('Disabling report tutorial by default...');
        await prisma.settings.create({
            data: {
                key: 'trial.showreporttutorial',
                value: 'false',
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
                value: 'Dzięki za rejestrację w systemie Zwierz!\nAby aktywować swoje konto, musisz skopiować poniższy link i wkleić go do swojej przeglądarki:\n\n[ACTIVATE_LINK]',
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
                value: "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional //EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\">\n<head>\n<!--[if gte mso 9]>\n<xml>\n  <o:OfficeDocumentSettings>\n    <o:AllowPNG/>\n    <o:PixelsPerInch>96</o:PixelsPerInch>\n  </o:OfficeDocumentSettings>\n</xml>\n<![endif]-->\n  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <meta name=\"x-apple-disable-message-reformatting\">\n  <!--[if !mso]><!--><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><!--<![endif]-->\n  <title></title>\n  \n    <style type=\"text/css\">\n      @media only screen and (min-width: 620px) {\n  .u-row {\n    width: 600px !important;\n  }\n  .u-row .u-col {\n    vertical-align: top;\n  }\n\n  .u-row .u-col-100 {\n    width: 600px !important;\n  }\n\n}\n\n@media (max-width: 620px) {\n  .u-row-container {\n    max-width: 100% !important;\n    padding-left: 0px !important;\n    padding-right: 0px !important;\n  }\n  .u-row .u-col {\n    min-width: 320px !important;\n    max-width: 100% !important;\n    display: block !important;\n  }\n  .u-row {\n    width: 100% !important;\n  }\n  .u-col {\n    width: 100% !important;\n  }\n  .u-col > div {\n    margin: 0 auto;\n  }\n}\nbody {\n  margin: 0;\n  padding: 0;\n}\n\ntable,\ntr,\ntd {\n  vertical-align: top;\n  border-collapse: collapse;\n}\n\np {\n  margin: 0;\n}\n\n.ie-container table,\n.mso-container table {\n  table-layout: fixed;\n}\n\n* {\n  line-height: inherit;\n}\n\na[x-apple-data-detectors='true'] {\n  color: inherit !important;\n  text-decoration: none !important;\n}\n\ntable, td { color: #000000; } #u_body a { color: #161a39; text-decoration: underline; }\n    </style>\n  \n  \n\n<!--[if !mso]><!--><link href=\"https://fonts.googleapis.com/css?family=Lato:400,700&display=swap\" rel=\"stylesheet\" type=\"text/css\"><link href=\"https://fonts.googleapis.com/css?family=Lato:400,700&display=swap\" rel=\"stylesheet\" type=\"text/css\"><!--<![endif]-->\n\n</head>\n\n<body class=\"clean-body u_body\" style=\"margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000\">\n  <!--[if IE]><div class=\"ie-container\"><![endif]-->\n  <!--[if mso]><div class=\"mso-container\"><![endif]-->\n  <table id=\"u_body\" style=\"border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #f9f9f9;width:100%\" cellpadding=\"0\" cellspacing=\"0\">\n  <tbody>\n  <tr style=\"vertical-align: top\">\n    <td style=\"word-break: break-word;border-collapse: collapse !important;vertical-align: top\">\n    <!--[if (mso)|(IE)]><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td align=\"center\" style=\"background-color: #f9f9f9;\"><![endif]-->\n    \n  \n  \n<div class=\"u-row-container\" style=\"padding: 0px;background-color: #f9f9f9\">\n  <div class=\"u-row\" style=\"margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f9f9f9;\">\n    <div style=\"border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;\">\n      <!--[if (mso)|(IE)]><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td style=\"padding: 0px;background-color: #f9f9f9;\" align=\"center\"><table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:600px;\"><tr style=\"background-color: #f9f9f9;\"><![endif]-->\n      \n<!--[if (mso)|(IE)]><td align=\"center\" width=\"600\" style=\"width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\" valign=\"top\"><![endif]-->\n<div class=\"u-col u-col-100\" style=\"max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;\">\n  <div style=\"height: 100%;width: 100% !important;\">\n  <!--[if (!mso)&(!IE)]><!--><div style=\"box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\"><!--<![endif]-->\n  \n<table style=\"font-family:'Lato',sans-serif;\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" border=\"0\">\n  <tbody>\n    <tr>\n      <td style=\"overflow-wrap:break-word;word-break:break-word;padding:15px;font-family:'Lato',sans-serif;\" align=\"left\">\n        \n  <table height=\"0px\" align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #f9f9f9;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%\">\n    <tbody>\n      <tr style=\"vertical-align: top\">\n        <td style=\"word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%\">\n          <span>&#160;</span>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->\n  </div>\n</div>\n<!--[if (mso)|(IE)]></td><![endif]-->\n      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->\n    </div>\n  </div>\n  </div>\n  \n\n\n  \n  \n<div class=\"u-row-container\" style=\"padding: 0px;background-color: transparent\">\n  <div class=\"u-row\" style=\"margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #161a39;\">\n    <div style=\"border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;\">\n      <!--[if (mso)|(IE)]><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td style=\"padding: 0px;background-color: transparent;\" align=\"center\"><table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:600px;\"><tr style=\"background-color: #161a39;\"><![endif]-->\n      \n<!--[if (mso)|(IE)]><td align=\"center\" width=\"600\" style=\"width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\" valign=\"top\"><![endif]-->\n<div class=\"u-col u-col-100\" style=\"max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;\">\n  <div style=\"height: 100%;width: 100% !important;\">\n  <!--[if (!mso)&(!IE)]><!--><div style=\"box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\"><!--<![endif]-->\n  \n<table style=\"font-family:'Lato',sans-serif;\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" border=\"0\">\n  <tbody>\n    <tr>\n      <td style=\"overflow-wrap:break-word;word-break:break-word;padding:35px 10px 10px;font-family:'Lato',sans-serif;\" align=\"left\">\n        \n<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n  <tr>\n    <td style=\"padding-right: 0px;padding-left: 0px;\" align=\"center\">\n      \n      <img align=\"center\" border=\"0\" src=\"\" alt=\"Image\" title=\"Image\" style=\"outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 10%;max-width: 58px;\" width=\"58\"/>\n      \n    </td>\n  </tr>\n</table>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n<table style=\"font-family:'Lato',sans-serif;\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" border=\"0\">\n  <tbody>\n    <tr>\n      <td style=\"overflow-wrap:break-word;word-break:break-word;padding:0px 10px 30px;font-family:'Lato',sans-serif;\" align=\"left\">\n        \n  <div style=\"font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;\">\n    <p style=\"font-size: 14px; line-height: 140%; text-align: center;\"><span style=\"font-size: 28px; line-height: 39.2px; color: #ffffff; font-family: Lato, sans-serif;\">Potwierdź konto<br /></span></p>\n  </div>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->\n  </div>\n</div>\n<!--[if (mso)|(IE)]></td><![endif]-->\n      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->\n    </div>\n  </div>\n  </div>\n  \n\n\n  \n  \n<div class=\"u-row-container\" style=\"padding: 0px;background-color: transparent\">\n  <div class=\"u-row\" style=\"margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;\">\n    <div style=\"border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;\">\n      <!--[if (mso)|(IE)]><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td style=\"padding: 0px;background-color: transparent;\" align=\"center\"><table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:600px;\"><tr style=\"background-color: #ffffff;\"><![endif]-->\n      \n<!--[if (mso)|(IE)]><td align=\"center\" width=\"600\" style=\"width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\" valign=\"top\"><![endif]-->\n<div class=\"u-col u-col-100\" style=\"max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;\">\n  <div style=\"height: 100%;width: 100% !important;\">\n  <!--[if (!mso)&(!IE)]><!--><div style=\"box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\"><!--<![endif]-->\n  \n<table style=\"font-family:'Lato',sans-serif;\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" border=\"0\">\n  <tbody>\n    <tr>\n      <td style=\"overflow-wrap:break-word;word-break:break-word;padding:40px 40px 30px;font-family:'Lato',sans-serif;\" align=\"left\">\n        \n  <div style=\"font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;\">\n    <p style=\"font-size: 14px; line-height: 140%;\"><span style=\"font-size: 18px; line-height: 25.2px; color: #666666;\">Czuwaj!</span></p>\n<p style=\"font-size: 14px; line-height: 140%;\"> </p>\n<p style=\"font-size: 14px; line-height: 140%;\"><span style=\"font-size: 18px; line-height: 25.2px; color: #666666;\">Właśnie stworzyłeś konto w systemie Zwierz. Kliknij poniższy link aby aktywować swoje konto:</span><span style=\"font-size: 18px; line-height: 25.2px; color: #666666;\"></span></p>\n  </div>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n<table style=\"font-family:'Lato',sans-serif;\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" border=\"0\">\n  <tbody>\n    <tr>\n      <td style=\"overflow-wrap:break-word;word-break:break-word;padding:0px 40px;font-family:'Lato',sans-serif;\" align=\"left\">\n        \n  <!--[if mso]><style>.v-button {background: transparent !important;}</style><![endif]-->\n<div align=\"left\">\n  <!--[if mso]><v:roundrect xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:w=\"urn:schemas-microsoft-com:office:word\" href=\"[ACTIVATE_LINK]\" style=\"height:52px; v-text-anchor:middle; width:210px;\" arcsize=\"2%\"  stroke=\"f\" fillcolor=\"#18163a\"><w:anchorlock/><center style=\"color:#FFFFFF;\"><![endif]-->\n    <a href=\"[ACTIVATE_LINK]\" target=\"_blank\" class=\"v-button\" style=\"box-sizing: border-box;display: inline-block;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #18163a; border-radius: 1px;-webkit-border-radius: 1px; -moz-border-radius: 1px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;font-size: 14px;\">\n      <span style=\"display:block;padding:15px 40px;line-height:120%;\"><span style=\"font-size: 18px; line-height: 21.6px;\">Potwierdź konto<br /></span></span>\n    </a>\n    <!--[if mso]></center></v:roundrect><![endif]-->\n</div>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n<table style=\"font-family:'Lato',sans-serif;\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" border=\"0\">\n  <tbody>\n    <tr>\n      <td style=\"overflow-wrap:break-word;word-break:break-word;padding:40px 40px 30px;font-family:'Lato',sans-serif;\" align=\"left\">\n        \n  <div style=\"font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;\">\n    <p style=\"font-size: 14px; line-height: 140%;\"><span style=\"color: #888888; font-size: 14px; line-height: 19.6px;\"><em><span style=\"font-size: 16px; line-height: 22.4px;\">Jeśli nie chciałeś resetować swojego hasła, skontaktuj się z administratorem.</span></em></span><span style=\"color: #888888; font-size: 14px; line-height: 19.6px;\"><em><span style=\"font-size: 16px; line-height: 22.4px;\"> <br /></span></em></span></p>\n  </div>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->\n  </div>\n</div>\n<!--[if (mso)|(IE)]></td><![endif]-->\n      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->\n    </div>\n  </div>\n  </div>\n  \n\n\n  \n  \n<div class=\"u-row-container\" style=\"padding: 0px;background-color: #f9f9f9\">\n  <div class=\"u-row\" style=\"margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #1c103b;\">\n    <div style=\"border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;\">\n      <!--[if (mso)|(IE)]><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td style=\"padding: 0px;background-color: #f9f9f9;\" align=\"center\"><table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:600px;\"><tr style=\"background-color: #1c103b;\"><![endif]-->\n      \n<!--[if (mso)|(IE)]><td align=\"center\" width=\"600\" style=\"width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\" valign=\"top\"><![endif]-->\n<div class=\"u-col u-col-100\" style=\"max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;\">\n  <div style=\"height: 100%;width: 100% !important;\">\n  <!--[if (!mso)&(!IE)]><!--><div style=\"box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\"><!--<![endif]-->\n  \n<table style=\"font-family:'Lato',sans-serif;\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" border=\"0\">\n  <tbody>\n    <tr>\n      <td style=\"overflow-wrap:break-word;word-break:break-word;padding:15px;font-family:'Lato',sans-serif;\" align=\"left\">\n        \n  <table height=\"0px\" align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #1c103b;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%\">\n    <tbody>\n      <tr style=\"vertical-align: top\">\n        <td style=\"word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%\">\n          <span>&#160;</span>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->\n  </div>\n</div>\n<!--[if (mso)|(IE)]></td><![endif]-->\n      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->\n    </div>\n  </div>\n  </div>\n  \n\n\n    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->\n    </td>\n  </tr>\n  </tbody>\n  </table>\n  <!--[if mso]></div><![endif]-->\n  <!--[if IE]></div><![endif]-->\n</body>\n\n</html>",
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
                value: 'Każdemu zdarza się zapomnieć...\nAby zresetować swoje hasło, musisz skopiować poniższy link i wkleić go do swojej przeglądarki:\n\n[RESETPWD_LINK]',
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
                value: "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional //EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\n<html xmlns=\"http://www.w3.org/1999/xhtml\" xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:o=\"urn:schemas-microsoft-com:office:office\">\n<head>\n<!--[if gte mso 9]>\n<xml>\n  <o:OfficeDocumentSettings>\n    <o:AllowPNG/>\n    <o:PixelsPerInch>96</o:PixelsPerInch>\n  </o:OfficeDocumentSettings>\n</xml>\n<![endif]-->\n  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <meta name=\"x-apple-disable-message-reformatting\">\n  <!--[if !mso]><!--><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><!--<![endif]-->\n  <title></title>\n  \n    <style type=\"text/css\">\n      @media only screen and (min-width: 620px) {\n  .u-row {\n    width: 600px !important;\n  }\n  .u-row .u-col {\n    vertical-align: top;\n  }\n\n  .u-row .u-col-100 {\n    width: 600px !important;\n  }\n\n}\n\n@media (max-width: 620px) {\n  .u-row-container {\n    max-width: 100% !important;\n    padding-left: 0px !important;\n    padding-right: 0px !important;\n  }\n  .u-row .u-col {\n    min-width: 320px !important;\n    max-width: 100% !important;\n    display: block !important;\n  }\n  .u-row {\n    width: 100% !important;\n  }\n  .u-col {\n    width: 100% !important;\n  }\n  .u-col > div {\n    margin: 0 auto;\n  }\n}\nbody {\n  margin: 0;\n  padding: 0;\n}\n\ntable,\ntr,\ntd {\n  vertical-align: top;\n  border-collapse: collapse;\n}\n\np {\n  margin: 0;\n}\n\n.ie-container table,\n.mso-container table {\n  table-layout: fixed;\n}\n\n* {\n  line-height: inherit;\n}\n\na[x-apple-data-detectors='true'] {\n  color: inherit !important;\n  text-decoration: none !important;\n}\n\ntable, td { color: #000000; } #u_body a { color: #161a39; text-decoration: underline; }\n    </style>\n  \n  \n\n<!--[if !mso]><!--><link href=\"https://fonts.googleapis.com/css?family=Lato:400,700&display=swap\" rel=\"stylesheet\" type=\"text/css\"><link href=\"https://fonts.googleapis.com/css?family=Lato:400,700&display=swap\" rel=\"stylesheet\" type=\"text/css\"><!--<![endif]-->\n\n</head>\n\n<body class=\"clean-body u_body\" style=\"margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #f9f9f9;color: #000000\">\n  <!--[if IE]><div class=\"ie-container\"><![endif]-->\n  <!--[if mso]><div class=\"mso-container\"><![endif]-->\n  <table id=\"u_body\" style=\"border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #f9f9f9;width:100%\" cellpadding=\"0\" cellspacing=\"0\">\n  <tbody>\n  <tr style=\"vertical-align: top\">\n    <td style=\"word-break: break-word;border-collapse: collapse !important;vertical-align: top\">\n    <!--[if (mso)|(IE)]><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td align=\"center\" style=\"background-color: #f9f9f9;\"><![endif]-->\n    \n  \n  \n<div class=\"u-row-container\" style=\"padding: 0px;background-color: #f9f9f9\">\n  <div class=\"u-row\" style=\"margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f9f9f9;\">\n    <div style=\"border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;\">\n      <!--[if (mso)|(IE)]><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td style=\"padding: 0px;background-color: #f9f9f9;\" align=\"center\"><table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:600px;\"><tr style=\"background-color: #f9f9f9;\"><![endif]-->\n      \n<!--[if (mso)|(IE)]><td align=\"center\" width=\"600\" style=\"width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\" valign=\"top\"><![endif]-->\n<div class=\"u-col u-col-100\" style=\"max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;\">\n  <div style=\"height: 100%;width: 100% !important;\">\n  <!--[if (!mso)&(!IE)]><!--><div style=\"box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\"><!--<![endif]-->\n  \n<table style=\"font-family:'Lato',sans-serif;\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" border=\"0\">\n  <tbody>\n    <tr>\n      <td style=\"overflow-wrap:break-word;word-break:break-word;padding:15px;font-family:'Lato',sans-serif;\" align=\"left\">\n        \n  <table height=\"0px\" align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #f9f9f9;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%\">\n    <tbody>\n      <tr style=\"vertical-align: top\">\n        <td style=\"word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%\">\n          <span>&#160;</span>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->\n  </div>\n</div>\n<!--[if (mso)|(IE)]></td><![endif]-->\n      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->\n    </div>\n  </div>\n  </div>\n  \n\n\n  \n  \n<div class=\"u-row-container\" style=\"padding: 0px;background-color: transparent\">\n  <div class=\"u-row\" style=\"margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #161a39;\">\n    <div style=\"border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;\">\n      <!--[if (mso)|(IE)]><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td style=\"padding: 0px;background-color: transparent;\" align=\"center\"><table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:600px;\"><tr style=\"background-color: #161a39;\"><![endif]-->\n      \n<!--[if (mso)|(IE)]><td align=\"center\" width=\"600\" style=\"width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\" valign=\"top\"><![endif]-->\n<div class=\"u-col u-col-100\" style=\"max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;\">\n  <div style=\"height: 100%;width: 100% !important;\">\n  <!--[if (!mso)&(!IE)]><!--><div style=\"box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\"><!--<![endif]-->\n  \n<table style=\"font-family:'Lato',sans-serif;\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" border=\"0\">\n  <tbody>\n    <tr>\n      <td style=\"overflow-wrap:break-word;word-break:break-word;padding:35px 10px 10px;font-family:'Lato',sans-serif;\" align=\"left\">\n        \n<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n  <tr>\n    <td style=\"padding-right: 0px;padding-left: 0px;\" align=\"center\">\n      \n      <img align=\"center\" border=\"0\" src=\"data:image/png;base64,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\" alt=\"Image\" title=\"Image\" style=\"outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 10%;max-width: 58px;\" width=\"58\"/>\n      \n    </td>\n  </tr>\n</table>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n<table style=\"font-family:'Lato',sans-serif;\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" border=\"0\">\n  <tbody>\n    <tr>\n      <td style=\"overflow-wrap:break-word;word-break:break-word;padding:0px 10px 30px;font-family:'Lato',sans-serif;\" align=\"left\">\n        \n  <div style=\"font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;\">\n    <p style=\"font-size: 14px; line-height: 140%; text-align: center;\"><span style=\"font-size: 28px; line-height: 39.2px; color: #ffffff; font-family: Lato, sans-serif;\">Zmiana hasła<br /></span></p>\n  </div>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->\n  </div>\n</div>\n<!--[if (mso)|(IE)]></td><![endif]-->\n      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->\n    </div>\n  </div>\n  </div>\n  \n\n\n  \n  \n<div class=\"u-row-container\" style=\"padding: 0px;background-color: transparent\">\n  <div class=\"u-row\" style=\"margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;\">\n    <div style=\"border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;\">\n      <!--[if (mso)|(IE)]><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td style=\"padding: 0px;background-color: transparent;\" align=\"center\"><table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:600px;\"><tr style=\"background-color: #ffffff;\"><![endif]-->\n      \n<!--[if (mso)|(IE)]><td align=\"center\" width=\"600\" style=\"width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\" valign=\"top\"><![endif]-->\n<div class=\"u-col u-col-100\" style=\"max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;\">\n  <div style=\"height: 100%;width: 100% !important;\">\n  <!--[if (!mso)&(!IE)]><!--><div style=\"box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\"><!--<![endif]-->\n  \n<table style=\"font-family:'Lato',sans-serif;\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" border=\"0\">\n  <tbody>\n    <tr>\n      <td style=\"overflow-wrap:break-word;word-break:break-word;padding:40px 40px 30px;font-family:'Lato',sans-serif;\" align=\"left\">\n        \n  <div style=\"font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;\">\n    <p style=\"font-size: 14px; line-height: 140%;\"><span style=\"font-size: 18px; line-height: 25.2px; color: #666666;\">Czuwaj!</span></p>\n<p style=\"font-size: 14px; line-height: 140%;\"> </p>\n<p style=\"font-size: 14px; line-height: 140%;\"><span style=\"font-size: 18px; line-height: 25.2px; color: #666666;\">Chyba zapomniałeś swojego hasła w Zwierzu... Nie ma problemu. Wystarczy, że klikniesz w link poniżej, aby je zresetować:</span><span style=\"font-size: 18px; line-height: 25.2px; color: #666666;\"></span></p>\n  </div>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n<table style=\"font-family:'Lato',sans-serif;\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" border=\"0\">\n  <tbody>\n    <tr>\n      <td style=\"overflow-wrap:break-word;word-break:break-word;padding:0px 40px;font-family:'Lato',sans-serif;\" align=\"left\">\n        \n  <!--[if mso]><style>.v-button {background: transparent !important;}</style><![endif]-->\n<div align=\"left\">\n  <!--[if mso]><v:roundrect xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:w=\"urn:schemas-microsoft-com:office:word\" href=\"[RESETPWD_LINK]\" style=\"height:52px; v-text-anchor:middle; width:186px;\" arcsize=\"2%\"  stroke=\"f\" fillcolor=\"#18163a\"><w:anchorlock/><center style=\"color:#FFFFFF;\"><![endif]-->\n    <a href=\"[RESETPWD_LINK]\" target=\"_blank\" class=\"v-button\" style=\"box-sizing: border-box;display: inline-block;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #18163a; border-radius: 1px;-webkit-border-radius: 1px; -moz-border-radius: 1px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;font-size: 14px;\">\n      <span style=\"display:block;padding:15px 40px;line-height:120%;\"><span style=\"font-size: 18px; line-height: 21.6px;\">Resetuj hasło<br /></span></span>\n    </a>\n    <!--[if mso]></center></v:roundrect><![endif]-->\n</div>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n<table style=\"font-family:'Lato',sans-serif;\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" border=\"0\">\n  <tbody>\n    <tr>\n      <td style=\"overflow-wrap:break-word;word-break:break-word;padding:40px 40px 30px;font-family:'Lato',sans-serif;\" align=\"left\">\n        \n  <div style=\"font-size: 14px; line-height: 140%; text-align: left; word-wrap: break-word;\">\n    <p style=\"font-size: 14px; line-height: 140%;\"><span style=\"color: #888888; font-size: 14px; line-height: 19.6px;\"><em><span style=\"font-size: 16px; line-height: 22.4px;\">Jeśli nie chciałeś resetować swojego hasła, skontaktuj się z administratorem.</span></em></span><span style=\"color: #888888; font-size: 14px; line-height: 19.6px;\"><em><span style=\"font-size: 16px; line-height: 22.4px;\"> <br /></span></em></span></p>\n  </div>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->\n  </div>\n</div>\n<!--[if (mso)|(IE)]></td><![endif]-->\n      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->\n    </div>\n  </div>\n  </div>\n  \n\n\n  \n  \n<div class=\"u-row-container\" style=\"padding: 0px;background-color: #f9f9f9\">\n  <div class=\"u-row\" style=\"margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #1c103b;\">\n    <div style=\"border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;\">\n      <!--[if (mso)|(IE)]><table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\"><tr><td style=\"padding: 0px;background-color: #f9f9f9;\" align=\"center\"><table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:600px;\"><tr style=\"background-color: #1c103b;\"><![endif]-->\n      \n<!--[if (mso)|(IE)]><td align=\"center\" width=\"600\" style=\"width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\" valign=\"top\"><![endif]-->\n<div class=\"u-col u-col-100\" style=\"max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;\">\n  <div style=\"height: 100%;width: 100% !important;\">\n  <!--[if (!mso)&(!IE)]><!--><div style=\"box-sizing: border-box; height: 100%; padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;\"><!--<![endif]-->\n  \n<table style=\"font-family:'Lato',sans-serif;\" role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" border=\"0\">\n  <tbody>\n    <tr>\n      <td style=\"overflow-wrap:break-word;word-break:break-word;padding:15px;font-family:'Lato',sans-serif;\" align=\"left\">\n        \n  <table height=\"0px\" align=\"center\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;border-top: 1px solid #1c103b;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%\">\n    <tbody>\n      <tr style=\"vertical-align: top\">\n        <td style=\"word-break: break-word;border-collapse: collapse !important;vertical-align: top;font-size: 0px;line-height: 0px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%\">\n          <span>&#160;</span>\n        </td>\n      </tr>\n    </tbody>\n  </table>\n\n      </td>\n    </tr>\n  </tbody>\n</table>\n\n  <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->\n  </div>\n</div>\n<!--[if (mso)|(IE)]></td><![endif]-->\n      <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->\n    </div>\n  </div>\n  </div>\n  \n\n\n    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->\n    </td>\n  </tr>\n  </tbody>\n  </table>\n  <!--[if mso]></div><![endif]-->\n  <!--[if IE]></div><![endif]-->\n</body>\n\n</html>",
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