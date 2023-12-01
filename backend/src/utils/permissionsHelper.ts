import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function user_is_uberadmin(userId: number){
    const userObject = await prisma.user.findFirst({
        select: {
            id: true,
            commitee: true,
        },
        where: {
            id: userId,
        }
    });
    if(userObject === null) return false;
    return userObject.commitee === 'UBERADMIN';
}

export async function user_is_commitee_member(userId: number){
    const userObject = await prisma.user.findFirst({
        select: {
            id: true,
            commitee: true,
        },
        where: {
            id: userId,
        }
    });
    if(userObject === null) return false;
    return userObject.commitee === 'MEMBER';
}

export async function user_is_commitee_scribe(userId: number){
    const userObject = await prisma.user.findFirst({
        select: {
            id: true,
            commitee: true,
        },
        where: {
            id: userId,
        }
    });
    if(userObject === null) return false;
    return userObject.commitee === 'SCRIBE';
}