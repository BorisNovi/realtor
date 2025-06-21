export interface GeocodeFeatureCollection {
  type: string;
  licence: string;
  features: GeocodeFeature[];
}

export interface GeocodeFeature {
  type: string;
  properties: GeocodeProperties;
  bbox: [number, number, number, number];
  geometry: GeocodeGeometry;
}

export interface GeocodeProperties {
  place_id: number;
  osm_type: string;
  osm_id: number;
  place_rank: number;
  category: string;
  type: string;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  address: GeocodeAddress;
}

export interface GeocodeAddress {
  road?: string;
  quarter?: string;
  suburb?: string;
  city?: string;
  state?: string;
  county?: string;
  postcode?: string;
  country: string;
  country_code: string;
  [key: string]: string | undefined;
}

export interface GeocodeGeometry {
  type: string;
  coordinates: [number, number];
}
