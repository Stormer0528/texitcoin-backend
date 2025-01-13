import { mkdirSync, existsSync } from 'fs';
import { Request, Response, Router, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import Container from 'typedi';
import { EMAIL_ATTACHMENT_UPLOAD_DIR, PAYMENT_UPLOAD_DIR } from '@/consts';
import { PrismaService } from '@/service/prisma';
import { adminAuthorized } from '../middlewares/adminAuthorized.middleware';
import { authorized } from '../middlewares/authorized.middleware';
import { emailAccess } from '@/graphql/middlewares';

const router = Router();

type DestinationCallback = (error: Error | null, destination: string) => void;
type FileNameCallback = (error: Error | null, filename: string) => void;
type FileFilterCallback = (error: Error | null, filter: boolean) => void;

const storagePayment = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, callback: DestinationCallback) {
    if (!existsSync(PAYMENT_UPLOAD_DIR)) {
      mkdirSync(PAYMENT_UPLOAD_DIR, { recursive: true });
    }
    callback(null, PAYMENT_UPLOAD_DIR);
  },
  filename: function (req: Request, file: Express.Multer.File, callback: FileNameCallback) {
    const uuid = randomUUID();
    callback(null, `payment-${uuid}${path.extname(file.originalname)}`);
  },
});

const storageEmailAttachments = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, callback: DestinationCallback) {
    if (!existsSync(path.join(EMAIL_ATTACHMENT_UPLOAD_DIR, req.params.id))) {
      mkdirSync(path.join(EMAIL_ATTACHMENT_UPLOAD_DIR, req.params.id), { recursive: true });
    }
    callback(null, EMAIL_ATTACHMENT_UPLOAD_DIR);
  },
  filename: function (req: Request, file: Express.Multer.File, callback: FileNameCallback) {
    const uuid = randomUUID();
    callback(null, `attachment-${uuid}${path.extname(file.originalname)}`);
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

const uploadPayment = multer({ storage: storagePayment, fileFilter });
const uploadEmailAttachments = multer({ storage: storageEmailAttachments });

router.post(
  '/payment',
  adminAuthorized,
  async (req: Request, res: Response, next: NextFunction) => {
    uploadPayment.array('payment')(req, res, async (err?: any) => {
      if (err) {
        res.json({ message: err.message });
      } else {
        const prisma = Container.get(PrismaService);
        const [files] = await prisma.$transaction([
          prisma.file.createManyAndReturn({
            data: (req.files as Express.Multer.File[]).map((file) => ({
              localPath: file.path,
              mimeType: file.mimetype,
              originalName: file.originalname,
              size: file.size,
              url: `${process.env.PUBLIC_DOMAIN}/public/payment/${file.filename}`,
            })),
          }),
        ]);
        res.json({
          files: files.map((file) => ({
            id: file.id,
            url: file.url,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
          })),
        });
      }
    });
  }
);

router.post(
  '/email/:id/attachments',
  authorized,
  emailAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    uploadEmailAttachments.array('attachments')(req, res, async (err?: any) => {
      if (err) {
        res.json({ message: err.message });
      } else {
        const prisma = Container.get(PrismaService);
        const [files] = await prisma.$transaction([
          prisma.file.createManyAndReturn({
            data: (req.files as Express.Multer.File[]).map((file) => ({
              localPath: file.path,
              mimeType: file.mimetype,
              originalName: file.originalname,
              size: file.size,
              url: `${process.env.PUBLIC_DOMAIN}/public/email/${req.params.id}/attachments/${file.filename}`,
            })),
          }),
        ]);
        res.json({
          files: files.map((file) => ({
            id: file.id,
            url: file.url,
            originalName: file.originalName,
            mimeType: file.mimeType,
            size: file.size,
          })),
        });
      }
    });
  }
);

export default router;
