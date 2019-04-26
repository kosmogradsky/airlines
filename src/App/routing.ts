import { createHashHistory, Location } from 'history';
import RouteNode from 'route-node'
import { tap, ignoreElements } from 'rxjs/operators'
import { Epic, ofType, combineEpics } from 'redux-observable';
import { AnyAction, Reducer } from 'redux';

export const routes = new RouteNode('', '', [
  { name: 'cities', path: '/' },
  { name: 'city', path: '/city/:id' }
]);

export const history = createHashHistory();

export type State = 'cities' | 'city';
const initialState: State = 'cities';

export class UrlChange {
  readonly type = 'App/UrlChange'

  constructor(
    readonly location: Location
  ) {}
}

export class UrlChangeRequest {
  readonly type = 'App/UrlChangeRequest'

  constructor(
    readonly location: Location
  ) {}
}

export class SetRoute {
  readonly type = 'App/SetRoute'

  constructor(
    readonly route: State
  ) {}
}


export type Action = UrlChange | UrlChangeRequest | SetRoute;

export const reducer: Reducer<State, Action> = (prevState = initialState, action): State => {
  switch (action.type) {
    case 'App/SetRoute':
      return action.route;
    default:
      return prevState;
  }
}

const urlChangeRequestEpic: Epic<AnyAction, Action> = action$ => action$.pipe(
  ofType<AnyAction, UrlChangeRequest>('App/UrlChangeRequest'),
  tap(({ location }) => history.push(location)),
  ignoreElements()
);

export const epic = combineEpics(
  urlChangeRequestEpic
)