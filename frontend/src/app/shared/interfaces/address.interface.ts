import { LngLatLike } from 'maplibre-gl';

export interface IAddress {
  city: string;
  road: string;
  house: string;
  apartment?: string;
  position?: LngLatLike;
}
