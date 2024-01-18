// authUtils.ts
import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, 'password', { expiresIn: '1h' });
};
