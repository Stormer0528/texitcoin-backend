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

router.post('/payment', async (req: Request, res: Response, next: NextFunction) => {
  upload.array('payment')(req, res, (err?: any) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      res.json({
        urls: (req.files as Express.Multer.File[]).map(
          (file: Express.Multer.File) =>
            `${req.protocol}://${req.get('host')}/public/payment/${file.filename}`
        ),
      });
    }
  });
});

export default router;
