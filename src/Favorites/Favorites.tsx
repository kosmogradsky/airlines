import { Epic, ofType, combineEpics } from "redux-observable";
import { AnyAction, Reducer } from "redux";
import { switchMap, tap, ignoreElements } from "rxjs/operators";
import { EMPTY, of } from "rxjs";
import { Flight, City } from "../App/types";
import * as R from 'ramda';

interface FavoriteFlight {
  city: {
    id: number;
    name: number;
  }
  id: number,
  costInEuro: number,
  departure: number,
  arrival: number,
  interchangesCount: number
}

export type State = Record<string, FavoriteFlight>

const initialState: State = {}; 

class Load {
  readonly type = 'Favorites/Load'

  constructor(
    readonly flights: Record<string, FavoriteFlight>
  ) {}
}

export class Update {
  readonly type = 'Favorites/Update'

  constructor(
    readonly flights: Record<string, FavoriteFlight>
  ) {}
}

export type Action = Update | Load;

export const reducer: Reducer<State, Action> = (prevState = initialState, action) => {
  switch(action.type) {
    case 'Favorites/Load':
    case 'Favorites/Update':
      return action.flights;
    default:
      return prevState;
  }
}

const initEpic: Epic<AnyAction, Action> = () => of('init').pipe(
  switchMap(() => {
    const flights = localStorage.getItem('favoriteFlights');

    return flights === null ? EMPTY : [new Load(JSON.parse(flights))]
  })
)

const saveEpic: Epic<AnyAction, Action> = action$ => action$.pipe(
  ofType<AnyAction, Update>('Favorites/Update'),
  tap(({ flights }) => {
    localStorage.setItem('favoriteFlights', JSON.stringify(flights))
  }),
  ignoreElements()
)

export const epic = combineEpics(initEpic, saveEpic)

export const add = (state: State, flight: Flight, city: City) => {
  const favoriteFlight = {
    ...flight,
    city
  }

  return {
    ...state,
    [favoriteFlight.id]: favoriteFlight
  }
}

export const remove = (state: State, flightId: number) => R.omit([flightId.toString()], state)