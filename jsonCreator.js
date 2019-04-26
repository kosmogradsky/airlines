const fs = require('fs');

const flightsByCity = [
  'Moscow',
  'Minsk',
  'Saint Petersburg',
  'Tbilisi',
  'Yerevan',
  'Instanbul',
  'Baku',
  'Warsaw'
].map((name, index) => ({
  id: index,
  name,
  flights: Array(6).fill(undefined).map((_, flightIndex) => ({
    id: (index + 1) + '' + flightIndex,
    costInEuro: Math.floor(Math.random() * 101 + 50),
    departure: Math.floor(Math.random() * 12),
    arrival: Math.floor(Math.random() * 12 + 12),
    interchangesCount: Math.floor(Math.random() * 3)
  }))
}))

flightsByCity.forEach(({ id, name, flights }) => {
  fs.writeFileSync(`./assets/cities/${id}.json`, JSON.stringify({ id, name, flights }))
})