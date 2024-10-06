import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function user_is_uberadmin(userId: number){
    const userObject = await prisma.user.findFirst({
        select: {
            id: true,
            uberadmin: true,
        },
        where: {
            id: userId,
        }
    });
    if(userObject === null) return false;
    return userObject.uberadmin;
}

export async function user_is_commitee_member(userId: number){
    const userObject = await prisma.user.findFirst({
        select: {
            id: true,
            role_HO: true,
            role_HR: true,
        },
        where: {
            id: userId,
        }
    });
    if(userObject === null) return false;
    return userObject.role_HO === 'MEMBER' || userObject.role_HR === 'MEMBER';
}

export async function user_is_ho_commitee_member(userId: number){
    const userObject = await prisma.user.findFirst({
        select: {
            id: true,
            role_HO: true,
        },
        where: {
            id: userId,
        }
    });
    if(userObject === null) return false;
    return userObject.role_HO === 'MEMBER';
}

export async function user_is_hr_commitee_member(userId: number){
    const userObject = await prisma.user.findFirst({
        select: {
            id: true,
            role_HR: true,
        },
        where: {
            id: userId,
        }
    });
    if(userObject === null) return false;
    return userObject.role_HR === 'MEMBER';
}

export async function user_is_commitee_scribe(userId: number){
    const userObject = await prisma.user.findFirst({
        select: {
            id: true,
            role_HO: true,
            role_HR: true,
        },
        where: {
            id: userId,
        }
    });
    if(userObject === null) return false;
    return userObject.role_HO === 'SCRIBE' || userObject.role_HR === 'SCRIBE';
}

export async function user_is_ho_commitee_scribe(userId: number){
    const userObject = await prisma.user.findFirst({
        select: {
            id: true,
            role_HO: true,
        },
        where: {
            id: userId,
        }
    });
    if(userObject === null) return false;
    return userObject.role_HO === 'SCRIBE';
}

export async function user_is_hr_commitee_scribe(userId: number){
    const userObject = await prisma.user.findFirst({
        select: {
            id: true,
            role_HR: true,
        },
        where: {
            id: userId,
        }
    });
    if(userObject === null) return false;
    return userObject.role_HR === 'SCRIBE';
}

export async function user_is_mentor(userId: number, menteeId: number){
    const userObject = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            email: true,
        }
    });
    if(userObject === null) return false;

    const isMentor = await prisma.trial.count({
        where: {
            userId: menteeId,
            mentor_email: userObject.email,
        }
    }) > 0;
    return isMentor;
}