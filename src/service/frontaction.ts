import { FrontActionExtraTypes } from '@/graphql/common.type';
import { FrontActionEnum } from '@/graphql/enum';
import { AsyncLocalStorage } from 'async_hooks';
import { Service } from 'typedi';

export interface FrontActionInterface {
  action?: FrontActionEnum;
  message?: string;
  extra?: typeof FrontActionExtraTypes;
}

@Service()
export class FrontActionService {
  asyncLocalStorage = new AsyncLocalStorage<FrontActionInterface>();

  setAction(action: FrontActionInterface & { action: FrontActionEnum; message: string }) {
    const store = this.asyncLocalStorage.getStore();
    if (!store) return;

    store.action = action.action;
    store.message = action.message;
    store.extra = action.extra;
  }
}
