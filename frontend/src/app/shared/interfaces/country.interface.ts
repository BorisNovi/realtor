import { LngLatLike } from 'maplibre-gl';
import { IEntity } from './entity.interface';

export interface ICountry extends IEntity {
  position: LngLatLike;
}
