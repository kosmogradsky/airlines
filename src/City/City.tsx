import * as React from 'react'
import { Reducer, Dispatch, AnyAction } from 'redux';
import { Epic, ofType } from 'redux-observable';
import { switchMap, map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { RemoteData, NotAsked, Loading, Success, Failure } from '../utils/RemoteData';
import cx from 'classnames'
import * as R from 'ramda';

import { City as ICity, Flight } from '../App/types'
import * as Favorites from '../Favorites/Favorites'

import * as s from './City.css'

interface CityAndFlights {
  city: ICity;
  flights: Flight[]
}

export type State = RemoteData<CityAndFlights, never>;

const initialState = new NotAsked();

export class FetchRequest {
  readonly type = 'City/FetchRequest'

  constructor(
    readonly id: number
  ) {}
}

class FetchSuccess {
  readonly type = 'City/FetchSuccess'

  constructor(
    readonly cities: CityAndFlights
  ) {}
}

class FetchFailure {
  readonly type = 'City/FetchFailure'
}

export type Action = FetchRequest | FetchSuccess | FetchFailure;

export const reducer: Reducer<State, Action> = (prevState = initialState, action) => {
  switch (action.type) {
    case 'City/FetchRequest':
      return new Loading();
    case 'City/FetchSuccess':
      return new Success(action.cities);
    case 'City/FetchFailure':
      return new Failure();
    default:
      return prevState;
  }
}

export const epic: Epic<AnyAction, Action> = action$ => action$.pipe(
  ofType<AnyAction, FetchRequest>('City/FetchRequest'),
  switchMap(action => ajax.get(`./cities/${action.id}.json`)),
  map(({ response }) => new FetchSuccess(response))
)

interface Props {
  state: State;
  favorites: Favorites.State;
  dispatch: Dispatch<Action>,
  addToFavorites: (favorites: Favorites.State, city: ICity, flight: Flight) => void,
  removeFromFavorites: (favorites: Favorites.State, flightId: number) => void
}

const getInterchangesString = (count: number) => {
  switch (count) {
    case 0:
      return 'Direct'
    case 1:
      return '1 interchange'
    default:
      return count + ' interchanges'
  }
}

export class City extends React.PureComponent<Props> {
  render() {
    const { state, favorites } = this.props;

    switch (state.type) {
      case 'Success':
        const { city, flights } = state.payload;

        return (
          <>
            <h2 className='title is-2'>Flights to {city.name}</h2>
            <div className={s.cards}>
              {flights.map(flight => (
                <div key={flight.id} className={cx(s.card, "card")}>
                  <header className="card-header">
                    <p className="card-header-title">
                      Flight {flight.id}
                    </p>
                  </header>
                  <div className="card-content">
                    <div className="content">
                      <div>€{flight.costInEuro}</div>
                      <div>{flight.arrival}:00 — {flight.departure}:00</div>
                      <div>{getInterchangesString(flight.interchangesCount)}</div>
                    </div>
                  </div>
                  <footer className="card-footer">
                    {R.has(flight.id.toString(), favorites)
                      ? (
                        <button
                          type='button'
                          className={cx(s.favoriteButton, "card-footer-item has-text-link")}
                          onClick={() => this.props.removeFromFavorites(favorites, flight.id)}
                        >Remove from favorites</button>
                      ) : (
                        <button
                          type='button'
                          className={cx(s.favoriteButton, "card-footer-item has-text-link")}
                          onClick={() => this.props.addToFavorites(favorites, city, flight)}
                        >Add to favorites</button>
                      )
                    }
                  </footer>
                </div>
              ))}
            </div>
          </>
        )
      case 'Failure':
        return <>An error occured</>;
      default :
        return null
    }
  }
}
  