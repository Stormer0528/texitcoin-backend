import { GET_BLOCK_COUNT } from '@/consts';
import { rpcCommand } from '@/utils/rpcCommand';
import { Request, Response, Router, NextFunction } from 'express';

const router = Router();

router.get('/getblockcount', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const block = await rpcCommand({ method: GET_BLOCK_COUNT });

    res.json(block);
  } catch (err) {
    next(err);
  }
});

export default router;
