import { LngLatLike } from 'maplibre-gl';

export interface IAddress {
  city: string;
  road: string;
  house_number: string;
  apartment?: string;
  position?: LngLatLike;
}
