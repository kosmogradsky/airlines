import { AnyAction, Middleware } from 'redux';

const isObjectLike = (val: {}): val is {} => val !== undefined && typeof val === 'object';

export const actionToPlainObject: Middleware = () => next => action => {
  if (isObjectLike(action)) {
    return next(<AnyAction>{ ...action });
  }

  return next(action);
};
