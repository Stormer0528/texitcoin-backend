import { mkdirSync, existsSync } from 'fs';
import { Request, Response, Router, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import Container from 'typedi';
import { PAYMENT_UPLOAD_DIR } from '@/consts';
import { PrismaService } from '@/service/prisma';

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
  upload.array('payment')(req, res, async (err?: any) => {
    if (err) {
      res.json({ message: err.message });
    } else {
      const prisma = Container.get(PrismaService);
      const [fileIds] = await prisma.$transaction([
        prisma.file.createManyAndReturn({
          data: (req.files as Express.Multer.File[]).map((file) => ({
            localPath: path.join(PAYMENT_UPLOAD_DIR, file.filename),
            mimeType: file.mimetype,
            originalName: file.originalname,
            size: file.size,
            url: `${req.protocol}://${req.get('host')}/public/payment/${file.filename}`,
          })),
          select: {
            id: true,
          },
        }),
      ]);
      res.json({
        fileIds: fileIds.map(({ id }) => id),
      });
    }
  });
});

export default router;
