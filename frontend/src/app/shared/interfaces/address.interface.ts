import { LngLatLike } from 'maplibre-gl';

export interface IAddress {
  country: string;
  state: string;
  city: string;
  road: string;
  house: string;
  apartment?: string;
  position?: LngLatLike;
}
