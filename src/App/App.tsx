import * as React from 'react'
import { Unsubscribe, applyMiddleware, compose, createStore, combineReducers, AnyAction } from 'redux';
import { switchMap } from 'rxjs/operators';
import { EMPTY, merge, of } from 'rxjs';
import { createEpicMiddleware, combineEpics, Epic, ofType } from 'redux-observable';
import cx from 'classnames';

import * as routing from './routing'
import * as Cities from '../Cities/Cities'
import * as City from '../City/City'
import * as Favorites from '../Favorites/Favorites'
import { City as ICity, Flight } from './types'

import { LinkContext, Link } from '../utils/Link';
import { actionToPlainObject } from '../utils/actionToPlainObject';

import * as s from './App.css'

interface State {
  route: routing.State,
  cities: Cities.State
  city: City.State
  favorites: Favorites.State
}

type Action = routing.Action |
  Cities.Action |
  City.Action |
  Favorites.Action;

const reducer = combineReducers<State>({
  route: routing.reducer,
  cities: Cities.reducer,
  city: City.reducer,
  favorites: Favorites.reducer
})


const initEpic: Epic<AnyAction, Action> = action$ => merge(
  of(new routing.UrlChange(routing.history.location)),
  action$,
).pipe(
  ofType<AnyAction, routing.UrlChange>('App/UrlChange'),
  switchMap(({ location }) => {
    const routeNodeState = routing.routes.matchPath(location.pathname + location.search);
    
    if (routeNodeState === null) {
      return [
        new routing.SetRoute('cities'),
        new Cities.FetchRequest()
      ]
    }

    const params = routeNodeState.params as Record<string, string>;

    switch(routeNodeState.name) {
      case 'cities':
        return [
          new routing.SetRoute('cities'),
          new Cities.FetchRequest()
        ]
      case 'city':
        return [
          new routing.SetRoute('city'),
          new City.FetchRequest(+params.id)
        ]
      default:
        return EMPTY;
    }
    
  })
);

const epic = combineEpics<Action, Action, State>(
  initEpic,
  routing.epic,
  Cities.epic,
  City.epic,
  Favorites.epic
)

// STORE

type WindowWithCompose = Window & { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose }
const composeEnhancers = (window as WindowWithCompose).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const epicMiddleware = createEpicMiddleware<Action, Action, State>();

const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(
    epicMiddleware,
    actionToPlainObject
  )),
);

epicMiddleware.run(epic);

routing.history.listen(location => {
  store.dispatch(new routing.UrlChange(location))
})

// VIEW

export class App extends React.PureComponent {
  unsubscribe: Unsubscribe | undefined;
  state: { app: State } = {
    app: reducer(undefined, { type: 'INIT' })
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      this.setState({ app: store.getState() })
    })
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  addToFavorites = (favorites: Favorites.State, city: ICity, flight: Flight) => {
    const updatedFavorites = Favorites.add(favorites, flight, city)

    console.log(favorites, city, flight)

    store.dispatch(new Favorites.Update(updatedFavorites))
  }

  removeFromFavorites = (favorites: Favorites.State, flightId: number) => {
    const updatedFavorites = Favorites.remove(favorites, flightId)

    store.dispatch(new Favorites.Update(updatedFavorites))
  }

  render() {
    const { cities, city, route, favorites } = this.state.app

    const getContentFromRoute = () => {
      switch(route) {
        case 'cities':
          return (
            <Cities.Cities
              state={cities}
              dispatch={store.dispatch}
            />
          );
        case 'city':
          return (
            <City.City
              state={city}
              favorites={favorites}
              dispatch={store.dispatch}
              addToFavorites={this.addToFavorites}
              removeFromFavorites={this.removeFromFavorites}
            />
          )
      }
    }

    return (
      <LinkContext.Provider value={{
        history: routing.history,
        requestUrlChange: location => store.dispatch(new routing.UrlChangeRequest(location))
      }}>
        <Link to='/' className={cx(s.hero, "hero is-medium is-info is-bold")}>
          <div className="hero-body">
            <div className="container">
              <h1 className="title">Kosmogradsky Airlines</h1>
              <div className="subtitle">My airlines fly only to the cities where I have been. I really liked them, and I hope you will too! Enjoy your flight!</div>
            </div>
          </div>
        </Link>
        <section className='section'>
          <div className='container'>
            {getContentFromRoute()}
          </div>
        </section>
      </LinkContext.Provider>
    )
  }
}