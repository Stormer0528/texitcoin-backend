import { Request, Response, Router, NextFunction } from 'express';
import Container from 'typedi';
import { ExplorerController } from '../controllers/explorer.controller';

const router = Router();
const explorerController = Container.get(ExplorerController);

router.get('/getcurrentprice', async (req: Request, res: Response, next: NextFunction) => {
  explorerController.getLatestPrice(req, res, next);
});

export default router;
