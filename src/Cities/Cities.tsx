import * as React from 'react'
import { RemoteData, NotAsked, Loading, Success, Failure } from '../utils/RemoteData';
import { Reducer, Dispatch, AnyAction } from 'redux';
import { Epic, ofType } from 'redux-observable';
import { switchMap, map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { Link } from '../utils/Link';
import { City } from '../App/types';

import './Cities.css'

export type State = RemoteData<City[], never>;

const initialState = new NotAsked();

export class FetchRequest {
  readonly type = 'Cities/FetchRequest'
}

class FetchSuccess {
  readonly type = 'Cities/FetchSuccess'

  constructor(readonly cities: City[]) {}
}

class FetchFailure {
  readonly type = 'Cities/FetchFailure'
}

export type Action = FetchRequest | FetchSuccess | FetchFailure;

export const reducer: Reducer<State, Action> = (prevState = initialState, action) => {
  switch (action.type) {
    case 'Cities/FetchRequest':
      return new Loading();
    case 'Cities/FetchSuccess':
      return new Success(action.cities);
    case 'Cities/FetchFailure':
      return new Failure();
    default:
      return prevState;
  }
}

export const epic: Epic<AnyAction, Action> = action$ => action$.pipe(
  ofType<AnyAction, FetchRequest>('Cities/FetchRequest'),
  switchMap(() => ajax.get('./cities.json')),
  map(({ response }) => new FetchSuccess(response))
)

interface Props {
  state: State;
  dispatch: Dispatch<Action>
}

export class Cities extends React.PureComponent<Props> {
  render() {
    const { state } = this.props;

    switch (state.type) {
      case 'Success':
        return (
          <>
            <h2 className='title is-2'>Select a city</h2>
            <div className="buttons">
              {state.payload.map(city => (
                <Link className='button is-large' key={city.id} to={'/city/' + city.id}>{city.name}</Link>
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
  