import { Request, Response, NextFunction } from 'express';

import { JWT_TOKENEXPIRED } from '@/consts/errors';
import { verifyToken } from '@/utils/auth';

export const adminAuthorized = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const { isAdmin } = verifyToken(token) as any;
      if (isAdmin) {
        return next();
      } else {
        return res.status(401).send('You are not an admin');
      }
    } catch (err) {
      if (err.name === JWT_TOKENEXPIRED) {
        throw new Error('Token is expired');
      } else {
        throw err;
      }
    }
  }
  return res.status(401).send('Invalid access token');
};
