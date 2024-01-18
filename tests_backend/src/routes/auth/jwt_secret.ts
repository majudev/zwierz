import logger from '../../utils/logger';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function JWT_SECRET() {
    try{
        var jwt_secret_mysql = await prisma.settings.findFirstOrThrow({
            select: {
                value: true,
            },
            where: {
                key: 'JWT_SECRET',
            }
        });

        return jwt_secret_mysql.value as string;
    }catch(error){
        logger.error('Cannot obtain JWT from database: ' + error);
        throw error;
    }
}

export async function JWT_EXPIRATION_MINS() {
    try{    
        var jwt_secret_mysql = await prisma.settings.findFirstOrThrow({
            select: {
                value: true,
            },
            where: {
                key: 'JWT_EXPIRATION_MINS',
            }
        });

        return jwt_secret_mysql.value as string;
    }catch(error){
        logger.error('Cannot obtain JWT expiration time from database: ' + error);
        throw error;
    }
}
