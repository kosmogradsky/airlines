import * as React from 'react'
import { Reducer, Dispatch, AnyAction } from 'redux';
import { Epic, ofType } from 'redux-observable';
import { switchMap, map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { RemoteData, NotAsked, Loading, Success, Failure } from '../utils/RemoteData';

interface CityWithFlights {
  id: number;
  name: string
  flights: {
    costInEuro: number,
    departure: number,
    arrival: number,
    interchangesCount: number
  }[]
}

export type State = RemoteData<CityWithFlights, never>;

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
    readonly cities: CityWithFlights
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
  dispatch: Dispatch<Action>
}

export class City extends React.PureComponent<Props> {
  render() {
    const { state } = this.props;

    switch (state.type) {
      case 'Success':
        const { name, flights } = state.payload;

        return (
          <>
            <h2>Flights to {name}</h2>
            {flights.map((flight, index) => (
              <div key={index}>
                <div>{flight.costInEuro}</div>
                <div>{flight.arrival}</div>
                <div>{flight.departure}</div>
                <div>{flight.interchangesCount}</div>
              </div>
            ))}
          </>
        )
      case 'Failure':
        return <>An error occured</>;
      default :
        return null
    }
  }
}
  