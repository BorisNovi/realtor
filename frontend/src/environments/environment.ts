import { version } from '../../package.json';

export const environment = {
  version,
  production: true,
  apiUrl: '/api/v1',
  tilesLightUrl: 'https://api.maptiler.com/maps/basic-v2/style.json?key=__MAPTILER_KEY__',
  tilesDarkUrl: 'https://api.maptiler.com/maps/basic-v2-dark/style.json?key=__MAPTILER_KEY__',
  staticMapUrl: 'https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&apiKey=__GEOAPIFY_KEY__',
};
