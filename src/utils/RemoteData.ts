export class NotAsked {
  readonly type = 'NotAsked';
}

export class Loading {
  readonly type = 'Loading';
}

export class Success<T> {
  readonly type = 'Success';

  constructor(readonly payload: T) {}
}

export class Failure<M> {
  readonly type = 'Failure';

  constructor(readonly message?: M) {}
}

export type RemoteData<T, M> = NotAsked |
  Loading |
  Success<T> |
  Failure<M>
