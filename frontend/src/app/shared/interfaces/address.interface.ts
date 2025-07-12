import { LngLatLike } from 'maplibre-gl';

export interface IAddress {
  city: string;
  road: string;
  houseNumber: string;
  apartment?: string;
  position?: LngLatLike;
}
