import { Request, Response, Router, NextFunction } from 'express';
import Container from 'typedi';

import { ExportController } from '../controllers';
import uploadRoute from './upload.route';
import { adminAuthorized } from '../middlewares/adminAuthorized.middleware';
import { authorized } from '../middlewares/authorized.middleware';

const router = Router();
const exportController = Container.get(ExportController);

router.get(
  '/export-members',
  adminAuthorized,
  async (req: Request, res: Response, next: NextFunction) => {
    exportController.exportMembers(req, res, next);
  }
);

router.get(
  '/export-sales',
  adminAuthorized,
  async (req: Request, res: Response, next: NextFunction) => {
    exportController.exportSales(req, res, next);
  }
);

router.get(
  '/export-rewards',
  adminAuthorized,
  async (req: Request, res: Response, next: NextFunction) => {
    exportController.exportRewards(req, res, next);
  }
);

router.get(
  '/export-onepoint-away-members',
  adminAuthorized,
  async (req: Request, res: Response, next: NextFunction) => {
    exportController.exportOnepointAwayMembers(req, res, next);
  }
);

router.get(
  '/export-commissions',
  adminAuthorized,
  async (req: Request, res: Response, next: NextFunction) => {
    exportController.exportCommissions(req, res, next);
  }
);

router.get(
  '/export-member-in-out-revenues',
  adminAuthorized,
  async (req: Request, res: Response, next: NextFunction) => {
    exportController.exportMemberInOutRevenue(req, res, next);
  }
);

router.get(
  '/export-rewards/bymember',
  authorized,
  async (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user.isAdmin) {
      res.status(403).json({
        message: 'This can not be done in Admin role',
      });
      return;
    }
    exportController.exportRewardsByMember(req, res, next);
  }
);

router.use('/upload', uploadRoute);

export default router;
