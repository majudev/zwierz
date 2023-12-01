import { randomInt } from 'crypto';

interface CaptchaChallenge {
    question: string;
    answer: number;
};

const numbers = [
    "zero", "jeden", "dwa",
    "trzy", "cztery", "pięć",
    "sześć", "siedem", "osiem",
    "dziewięć", "dziesięć",
    "jedenaście", "dwanaście"
];

const operations = [
    "plus", "minus", "razy"
];

export function generateCaptchaChallenge(): CaptchaChallenge {
    const r1 = randomInt(6, 7);
    const r2 = randomInt(3);
    const r3 = randomInt(6);

    const question = numbers[r1] + ' ' + operations[r2] + ' ' + numbers[r3] + ' = ?';
    const answer = (r2 === 0 ? (r1 + r3) : (r2 === 1 ? (r1 - r3) : (r1 * r3)));

    return {
        question: question,
        answer: answer,
    };
}