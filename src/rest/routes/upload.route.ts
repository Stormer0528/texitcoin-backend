import { mkdirSync, existsSync } from 'fs';
import { Request, Response, Router, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { PAYMENT_UPLOAD_DIR } from '@/consts';

const router = Router();

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;
type FileFilterCallback = (error: Error | null, filter: boolean) => void;

const storage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, callback: DestinationCallback) {
    if (!existsSync(PAYMENT_UPLOAD_DIR)) {
      mkdirSync(PAYMENT_UPLOAD_DIR, { recursive: true });
    }
    callback(null, PAYMENT_UPLOAD_DIR);
  },
  filename: function (req: Request, file: Express.Multer.File, callback: FileNameCallback) {
    const uuid = randomUUID();
    callback(null, `${file.fieldname}-${uuid}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (
  request: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'application/pdf'
  ) {
    callback(null, true);
  } else {
    callback(new Error('Unsupported File Format(PNG, JPG, PDF only)!'), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post(
  '/payment',
  upload.single('payment'),
  async (error: Error, req: Request, res: Response, next: NextFunction) => {
    if (error) {
      res.status(400).json({
        message: error.message,
      });
    } else {
      res.json({
        url: `${req.protocol}://${req.get('host')}/public/payment/${req.file.filename}`,
      });
    }
  }
);

export default router;
