import * as React from 'react';
import * as R from 'ramda';
import * as Favorites from '../Favorites/Favorites'
import cx from 'classnames'

import { City as ICity, Flight as IFlight } from '../App/types';

import * as s from './Flight.css'

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

interface Props {
  className?: string;
  flight: IFlight;
  city: ICity;
  title: string;
  favorites: Favorites.FavoriteFlights;
  addToFavorites: (favoriteFlights: Favorites.FavoriteFlights, city: ICity, flight: IFlight) => void,
  removeFromFavorites: (favoriteFlights: Favorites.FavoriteFlights, flightId: number) => void
}

export const Flight: React.FunctionComponent<Props> = ({
  className,
  flight,
  city,
  title,
  favorites,
  removeFromFavorites,
  addToFavorites
}) => (
  <div className={cx(className, 'card')}>
    <header className="card-header">
      <p className="card-header-title">{title}</p>
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
            onClick={() => removeFromFavorites(favorites, flight.id)}
          >Remove from favorites</button>
        ) : (
          <button
            type='button'
            className={cx(s.favoriteButton, "card-footer-item has-text-link")}
            onClick={() => addToFavorites(favorites, city, flight)}
          >Add to favorites</button>
        )
      }
    </footer>
  </div>
);