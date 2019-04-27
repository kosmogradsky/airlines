import { Epic, ofType, combineEpics } from "redux-observable";
import { AnyAction, Reducer, Dispatch } from "redux";
import { switchMap, tap, ignoreElements } from "rxjs/operators";
import { EMPTY, of } from "rxjs";
import { Flight as IFlight, City } from "../App/types";
import * as R from 'ramda';
import * as React from 'react';
import cx from 'classnames';

import * as s from './Favorites.css'
import { Flight } from "../Flight/Flight";

export interface FavoriteFlight {
  city: {
    id: number;
    name: string;
  }
  id: number,
  costInEuro: number,
  departure: number,
  arrival: number,
  interchangesCount: number
}

export type FavoriteFlights = Record<string, FavoriteFlight>
type Visibility = 'hidden' | 'visible'

export interface State {
  visibility: Visibility,
  favoriteFlights: FavoriteFlights
}

const initialState: State = {
  visibility: 'hidden',
  favoriteFlights: {}
}; 

class Load {
  readonly type = 'Favorites/Load'

  constructor(
    readonly flights: FavoriteFlights
  ) {}
}

export class Update {
  readonly type = 'Favorites/Update'

  constructor(
    readonly flights: FavoriteFlights
  ) {}
}

export class ChangeVisibility {
  readonly type = 'Favorites/ChangeVisibility'

  constructor(
    readonly visibility: Visibility
  ) {}
}

export type Action = Update | Load | ChangeVisibility;

export const reducer: Reducer<State, Action> = (prevState = initialState, action) => {
  switch(action.type) {
    case 'Favorites/ChangeVisibility':
      return {
        ...prevState,
        visibility: action.visibility
      }
    case 'Favorites/Load':
    case 'Favorites/Update':
      return {
        ...prevState,
        favoriteFlights: action.flights
      };
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

export const add = (favoriteFlights: FavoriteFlights, flight: IFlight, city: City): FavoriteFlights => {
  const favoriteFlight = {
    ...flight,
    city
  }

  return {
    ...favoriteFlights,
    [favoriteFlight.id]: favoriteFlight
  }
}

export const remove = (favoriteFlights: FavoriteFlights, flightId: number): FavoriteFlights => R.omit(
  [flightId.toString()],
  favoriteFlights
)

interface Props {
  state: State;
  dispatch: Dispatch<Action>,
  addToFavorites: (favoriteFlights: FavoriteFlights, city: City, flight: IFlight) => void,
  removeFromFavorites: (favoriteFlights: FavoriteFlights, flightId: number) => void
}

export class Favorites extends React.PureComponent<Props> {
  render() {
    const {
      state: { favoriteFlights, visibility },
      dispatch,
      addToFavorites,
      removeFromFavorites
    } = this.props;

    return visibility === 'visible' ? (
      <section className={s.root}>
        <button
          type='button'
          className={cx(s.closeButton, "delete is-large")}
          onClick={() => dispatch(new ChangeVisibility('hidden'))}
        >Close</button>
        <h2 className='title is-2'>❤ Favorites</h2>
        <div className={s.flights}>
          {Object.values(favoriteFlights).map(flight => <Flight
            className={s.card}
            key={flight.id}
            title={'Flight ' + flight.id + ' to ' + flight.city.name}
            flight={flight}
            city={flight.city}
            favorites={favoriteFlights}
            addToFavorites={addToFavorites}
            removeFromFavorites={removeFromFavorites}
          />)}
        </div>
      </section>
    ) : null
  }
}