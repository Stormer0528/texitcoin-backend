import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@/utils/auth';

export const adminAuthorized = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    const { isAdmin } = verifyToken(token) as any;
    if (isAdmin) {
      return next();
    }
  }
  return res.status(401).send('You are not an admin');
};
