export type PreviewCar = {
  id: string;
  name: string;
  category: string;
  transmission: 'automatic' | 'manual';
  seats: number;
  dailyRateInGrosze: number;
  image: string;
  imageAlt: string;
};

export const previewCars: PreviewCar[] = [
  {
    id: 'porsche',
    name: 'Porsche Panamera',
    category: 'Gran turismo',
    transmission: 'automatic',
    seats: 4,
    dailyRateInGrosze: 64900,
    image: '/design/porsche.jpg',
    imageAlt: 'Czarne Porsche Panamera na drodze, widok z tyłu'
  },
  {
    id: 'camaro',
    name: 'Chevrolet Camaro',
    category: 'Sport',
    transmission: 'automatic',
    seats: 4,
    dailyRateInGrosze: 74900,
    image: '/design/camaro.jpg',
    imageAlt: 'Niebieski Chevrolet Camaro na pustynnej drodze'
  },
  {
    id: 'mustang',
    name: 'Ford Mustang',
    category: 'Klasyka emocji',
    transmission: 'manual',
    seats: 4,
    dailyRateInGrosze: 44900,
    image: '/design/mustang.jpg',
    imageAlt: 'Ford Mustang na drodze, widok z przodu'
  }
];

export function formatDailyRate(priceInGrosze: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    maximumFractionDigits: 0
  }).format(priceInGrosze / 100);
}

export const transmissionLabel = { automatic: 'Automat', manual: 'Manualna' };
