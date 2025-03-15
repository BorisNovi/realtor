export interface ICatalogData {
  id: number;
  photos: string[];
  propertyType: string;
  address: string;
  mapLink: string;
  price: { value: number; currency: string };
  area: number;
  rooms: number;
  floor: { current: number; full: number };
  dateAdded: string;
  status: string;
}
