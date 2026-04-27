import { Clock, MapPin, Star, Tag } from 'lucide-react';
import ScrollReveal from '../ui/ScrollReveal';

const mockMeals = [
  {
    id: '1',
    title: 'Mystery Box Sushi',
    storeName: 'Sakura Sushi Bar',
    originalPrice: 85000,
    discountedPrice: 35000,
    category: 'Restoran',
    pickupTime: '19:00 - 21:00',
    distance: '1.2 km',
    rating: 4.8,
    quantityLeft: 3,
    badge: 'Hampir Habis!',
    badgeColor: 'bg-danger',
    emoji: '🍣',
  },
  {
    id: '2',
    title: 'Paket Roti & Pastry',
    storeName: 'Boulangerie Paris',
    originalPrice: 60000,
    discountedPrice: 20000,
    category: 'Bakery',
    pickupTime: '17:00 - 19:00',
    distance: '0.8 km',
    rating: 4.9,
    quantityLeft: 5,
    badge: 'Diskon 67%',
    badgeColor: 'bg-primary',
    emoji: '🥐',
  },
  {
    id: '3',
    title: 'Nasi Box Spesial',
    storeName: 'Dapur Bu Haji',
    originalPrice: 35000,
    discountedPrice: 15000,
    category: 'Restoran',
    pickupTime: '13:00 - 15:00',
    distance: '2.1 km',
    rating: 4.7,
    quantityLeft: 8,
    badge: 'Terlaris',
    badgeColor: 'bg-accent',
    emoji: '🍱',
  },
  {
    id: '4',
    title: 'Smoothie Bowl Mix',
    storeName: 'Green Vibes Café',
    originalPrice: 45000,
    discountedPrice: 0,
    category: 'Kafe',
    pickupTime: '15:00 - 17:00',
    distance: '0.5 km',
    rating: 4.6,
    quantityLeft: 2,
    badge: 'Gratis!',
    badgeColor: 'bg-secondary',
    emoji: '🥤',
  },
  {
    id: '5',
    title: 'Pizza Margherita',
    storeName: 'Pizzeria Roma',
    originalPrice: 75000,
    discountedPrice: 25000,
    category: 'Restoran',
    pickupTime: '20:00 - 22:00',
    distance: '3.0 km',
    rating: 4.5,
    quantityLeft: 4,
    badge: 'Diskon 67%',
    badgeColor: 'bg-primary',
    emoji: '🍕',
  },
  {
    id: '6',
    title: 'Kue Ulang Tahun',
    storeName: 'Sweet Corner',
    originalPrice: 120000,
    discountedPrice: 40000,
    category: 'Bakery',
    pickupTime: '16:00 - 18:00',
    distance: '1.5 km',
    rating: 4.9,
    quantityLeft: 1,
    badge: 'Hampir Habis!',
    badgeColor: 'bg-danger',
    emoji: '🎂',
  },
];

function formatPrice(price: number): string {
  if (price === 0) return 'Gratis';
  return `Rp ${price.toLocaleString('id-ID')}`;
}

export default function FeaturedMeals() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary uppercase tracking-wider">
              Tersedia Sekarang
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4 text-balance">
              Makanan <span className="gradient-text-primary">Terbaik</span> Hari Ini
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Temukan makanan berkualitas dari mitra terpercaya di sekitarmu.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMeals.map((meal, index) => (
            <ScrollReveal key={meal.id} delay={index * 100}>
              <div className="rounded-2xl glass card-hover overflow-hidden group cursor-pointer">
                {/* Image placeholder with emoji */}
                <div className="relative h-48 bg-gradient-to-br from-surface-light to-surface flex items-center justify-center overflow-hidden">
                  <span className="text-6xl group-hover:scale-125 transition-transform duration-500">
                    {meal.emoji}
                  </span>

                  {/* Badge */}
                  <div
                    className={`absolute top-3 left-3 ${meal.badgeColor} px-3 py-1 rounded-full text-xs font-bold text-white`}
                  >
                    {meal.badge}
                  </div>

                  {/* Quantity */}
                  <div className="absolute top-3 right-3 glass px-2 py-1 rounded-full text-xs text-muted">
                    Sisa {meal.quantityLeft}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-light text-muted">
                      {meal.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-accent">
                      <Star className="w-3 h-3 fill-accent" />
                      {meal.rating}
                    </div>
                  </div>

                  <h3 className="text-base font-bold mb-1 group-hover:text-primary transition-colors">
                    {meal.title}
                  </h3>
                  <p className="text-sm text-muted mb-3">{meal.storeName}</p>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(meal.discountedPrice)}
                    </span>
                    {meal.discountedPrice > 0 && (
                      <span className="text-sm text-muted line-through">
                        {formatPrice(meal.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {meal.pickupTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {meal.distance}
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
