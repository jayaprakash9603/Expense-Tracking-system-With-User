import {
  ShoppingBag, Utensils, Car, Home, Zap, Heart, GraduationCap,
  Plane, Gamepad2, Gift, Briefcase, Phone, Wifi, Droplets,
  Shirt, Coffee, Film, Music, Book, Dumbbell, Stethoscope,
  Baby, Dog, Wrench, Fuel, Bus, Train, CreditCard, Banknote,
  PiggyBank, TrendingUp, Shield, Landmark, Package,
} from "lucide-react";

export const CATEGORY_ICON_MAP = {
  shopping: ShoppingBag,
  food: Utensils,
  dining: Utensils,
  transport: Car,
  transportation: Car,
  housing: Home,
  rent: Home,
  utilities: Zap,
  health: Heart,
  healthcare: Stethoscope,
  education: GraduationCap,
  travel: Plane,
  entertainment: Gamepad2,
  gifts: Gift,
  work: Briefcase,
  phone: Phone,
  internet: Wifi,
  water: Droplets,
  clothing: Shirt,
  coffee: Coffee,
  movies: Film,
  music: Music,
  books: Book,
  fitness: Dumbbell,
  medical: Stethoscope,
  childcare: Baby,
  pets: Dog,
  maintenance: Wrench,
  fuel: Fuel,
  bus: Bus,
  train: Train,
  credit: CreditCard,
  cash: Banknote,
  savings: PiggyBank,
  investment: TrendingUp,
  insurance: Shield,
  taxes: Landmark,
  other: Package,
  default: Package,
};

export function getCategoryIcon(categoryName) {
  if (!categoryName) return CATEGORY_ICON_MAP.default;
  const key = categoryName.toLowerCase().replace(/[^a-z]/g, "");
  return CATEGORY_ICON_MAP[key] || CATEGORY_ICON_MAP.default;
}
