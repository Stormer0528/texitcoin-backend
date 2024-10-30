import { Request, Response, Router, NextFunction } from 'express';
import Container from 'typedi';

import { ExportController } from '../controllers';
import uploadRoute from './upload.route';

const router = Router();
const exportController = Container.get(ExportController);

router.get('/export-members', async (req: Request, res: Response, next: NextFunction) => {
  exportController.exportMembers(req, res, next);
});

router.get('/export-sales', async (req: Request, res: Response, next: NextFunction) => {
  exportController.exportSales(req, res, next);
});

router.get('/export-rewards', async (req: Request, res: Response, next: NextFunction) => {
  exportController.exportRewards(req, res, next);
});

router.use('/upload', uploadRoute);

export default router;
