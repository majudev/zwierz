import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export enum SystemMode {
    HO = "HO",
    HO_HR = "HO+HR",
    HR = "HR",
  }

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

export async function getSystemMode(){
    const setting = await prisma.settings.findFirst({
        where: {
            key: {
                equals: 'instance.mode'
            }
        }
    });
    const value = setting !== null ? (setting.value as SystemMode) : null;
    if(value !== SystemMode.HO && value !== SystemMode.HO_HR && value !== SystemMode.HR) return null;
    return value;
}