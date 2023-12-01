import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getSetting(key: string){
    const setting = await prisma.settings.findFirst({
        where: {
            key: {
                equals: key
            }
        }
    });
    return setting !== null ? setting.value : null;
}