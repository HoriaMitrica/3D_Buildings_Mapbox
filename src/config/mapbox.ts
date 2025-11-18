export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibWl0cmkyMiIsImEiOiJjbTVubGQ4OXkwYm5vMmpzODFuaHQzeG05In0.Eo4oFInnAE9TI0HuM87Tog';

export const DEFAULT_MAP_CONFIG = {
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [26.1025, 44.4268] as [number, number], // Bucharest, Romania (University area)
  zoom: 15.5,
  pitch: 45,
  bearing: -17.6,
  antialias: true
};

export const MAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  satelliteStreets: 'mapbox://styles/mapbox/satellite-streets-v12'
};