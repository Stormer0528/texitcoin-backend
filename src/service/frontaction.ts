import { FrontActionEnum } from '@/graphql/enum';
import { AsyncLocalStorage } from 'async_hooks';
import { Service } from 'typedi';

export interface FrontActionInterface {
  action: FrontActionEnum;
  message: string;
  extra?: any;
}

@Service()
export class FrontActionService {
  asyncLocalStorage = new AsyncLocalStorage<FrontActionInterface[]>();

  addAction(action: FrontActionInterface) {
    const actions = this.asyncLocalStorage.getStore();
    if (!actions) {
      return;
    }
    actions.push(action);
  }
}
