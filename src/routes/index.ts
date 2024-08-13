import Container from 'typedi';
import { Request, Response, Router, NextFunction } from 'express';
import { ExportController } from '../controllers';

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

export default router;
