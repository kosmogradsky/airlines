import * as React from 'react'
import { Reducer, Dispatch, AnyAction } from 'redux';
import { Epic, ofType } from 'redux-observable';
import { switchMap, map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { RemoteData, NotAsked, Loading, Success, Failure } from '../utils/RemoteData';

import { City as ICity, Flight as IFlight } from '../App/types'
import * as Favorites from '../Favorites/Favorites'

import * as s from './City.css'
import { Flight } from '../Flight/Flight';

interface CityAndFlights {
  city: ICity;
  flights: IFlight[]
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
  favorites: Favorites.FavoriteFlights;
  dispatch: Dispatch<Action>,
  addToFavorites: (favoriteFlights: Favorites.FavoriteFlights, city: ICity, flight: IFlight) => void,
  removeFromFavorites: (favoriteFlights: Favorites.FavoriteFlights, flightId: number) => void
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
              {flights.map(flight => <Flight
                key={flight.id}
                title={'Flight ' + flight.id}
                flight={flight}
                city={city}
                favorites={favorites}
                addToFavorites={this.props.addToFavorites}
                removeFromFavorites={this.props.removeFromFavorites}
              />)}
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
  