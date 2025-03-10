export interface Destination {
  name: string;
  description: string;
  imageUrl: string;
  highlights: string[];
}

export interface TravelPackage {
  title: string;
  location: string;
  price: number;
  imageUrl: string;
}

export interface Article {
  title: string;
  imageUrl: string;
  tags: string[];
}
