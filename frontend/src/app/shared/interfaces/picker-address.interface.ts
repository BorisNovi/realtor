import { LngLatLike } from 'maplibre-gl';
import { GeocodeAddress } from './geocoder.interface';

export interface IPickerAddress {
  coordinates: LngLatLike;
  address: GeocodeAddress;
  name: string | null;
}
