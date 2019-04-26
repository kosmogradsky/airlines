export interface Flight {
  id: number,
  costInEuro: number,
  departure: number,
  arrival: number,
  interchangesCount: number
}

export interface City {
  id: number,
  name: string
}