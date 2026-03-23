import {
  Baby,
  Banknote,
  Book,
  Briefcase,
  Building2,
  Bus,
  Car,
  CircleDollarSign,
  Coffee,
  CreditCard,
  Dog,
  Droplets,
  Dumbbell,
  Film,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Landmark,
  Music,
  Package,
  Phone,
  PiggyBank,
  Plane,
  ReceiptText,
  Send,
  Shield,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Stethoscope,
  Train,
  TrendingDown,
  TrendingUp,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
  Zap,
} from "lucide-react";

export function normalizeIconKey(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    .replace(/[_\-\s]+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

const LUCIDE_ICON_COMPONENTS = {
  Baby,
  Banknote,
  Book,
  Briefcase,
  Building2,
  Bus,
  Car,
  CircleDollarSign,
  Coffee,
  CreditCard,
  Dog,
  Droplets,
  Dumbbell,
  Film,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Landmark,
  Music,
  Package,
  Phone,
  PiggyBank,
  Plane,
  ReceiptText,
  Send,
  Shield,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Stethoscope,
  Train,
  TrendingDown,
  TrendingUp,
  Utensils,
  Wallet,
  Wifi,
  Wrench,
  Zap,
};

const LUCIDE_ICON_BY_KEY = Object.entries(LUCIDE_ICON_COMPONENTS).reduce(
  (acc, [name, Icon]) => {
    acc[normalizeIconKey(name)] = Icon;
    return acc;
  },
  {},
);

const CATEGORY_LEGACY_ALIASES = {
  shopping: ShoppingBag,
  retail: ShoppingBag,
  bag: ShoppingBag,
  clothes: Shirt,
  clothing: Shirt,
  food: Utensils,
  dining: Utensils,
  restaurant: Utensils,
  coffee: Coffee,
  transport: Car,
  transportation: Car,
  travel: Plane,
  bus: Bus,
  train: Train,
  fuel: Fuel,
  home: Home,
  housing: Home,
  rent: Home,
  utilities: Zap,
  electricity: Zap,
  health: Heart,
  healthcare: Stethoscope,
  medical: Stethoscope,
  fitness: Dumbbell,
  pet: Dog,
  pets: Dog,
  work: Briefcase,
  education: GraduationCap,
  entertainment: Gamepad2,
  movies: Film,
  movie: Film,
  music: Music,
  books: Book,
  gifts: Gift,
  gift: Gift,
  savings: PiggyBank,
  investment: TrendingUp,
  investments: TrendingUp,
  taxes: Landmark,
  insurance: Shield,
  legal: Shield,
  maintenance: Wrench,
  repair: Wrench,
  phone: Phone,
  internet: Wifi,
  wifi: Wifi,
  water: Droplets,
  charity: Heart,
  donation: Heart,
  donations: Heart,
  subscriptions: Sparkles,
  other: Package,
  misc: Package,
  miscellaneous: Package,
  default: Package,
  expense: ReceiptText,
  income: TrendingUp,
  transfer: Send,
  building: Building2,
  "💰": CircleDollarSign,
  "💵": Banknote,
  "💳": CreditCard,
  "🏦": Landmark,
  "📈": TrendingUp,
  "📉": TrendingDown,
  "🍽️": Utensils,
  "🍕": Utensils,
  "🛒": ShoppingBag,
  "🚗": Car,
  "🏠": Home,
  "⚡": Zap,
  "❤️": Heart,
  "🏥": Stethoscope,
  "🎬": Film,
  "🎮": Gamepad2,
  "🎓": GraduationCap,
  "📱": Smartphone,
  "🎁": Gift,
  "🐶": Dog,
  "🔧": Wrench,
  "⛽": Fuel,
  "📚": Book,
  "📁": Package,
  "✨": Sparkles,
};

const PAYMENT_METHOD_LEGACY_ALIASES = {
  cash: Banknote,
  card: CreditCard,
  credit: CreditCard,
  creditcard: CreditCard,
  debit: CreditCard,
  debitcard: CreditCard,
  wallet: Wallet,
  upi: Smartphone,
  digital: Smartphone,
  phonepe: Smartphone,
  gpay: Smartphone,
  paytm: Smartphone,
  bank: Landmark,
  banktransfer: Landmark,
  netbanking: Landmark,
  internetbanking: Landmark,
  neft: Landmark,
  rtgs: Landmark,
  imps: Landmark,
  receipt: ReceiptText,
  cheque: ReceiptText,
  check: ReceiptText,
  deductions: TrendingDown,
  deduction: TrendingDown,
  transfer: Send,
  savings: PiggyBank,
  investment: TrendingUp,
  providentfund: Landmark,
  pf: Landmark,
  creditneedtopaid: CreditCard,
  creditneedtopay: CreditCard,
  creditdue: CreditCard,
  creditpaid: CreditCard,
  payment: CircleDollarSign,
  other: CircleDollarSign,
  default: CircleDollarSign,
  "💵": Banknote,
  "💰": CircleDollarSign,
  "💳": CreditCard,
  "👛": Wallet,
  "🏦": Landmark,
  "📱": Smartphone,
  "🏧": Banknote,
  "🧾": ReceiptText,
  "💸": Send,
  "🪙": PiggyBank,
};

function resolveAlias(map, iconKey) {
  if (!iconKey) return null;
  const normalized = normalizeIconKey(iconKey);
  return map[iconKey] || map[normalized] || null;
}

function resolveLucideByName(iconKey) {
  if (!iconKey) return null;
  const normalized = normalizeIconKey(iconKey);
  return LUCIDE_ICON_BY_KEY[normalized] || null;
}

export function getCategoryIconComponent(iconKey) {
  return (
    resolveLucideByName(iconKey) ||
    resolveAlias(CATEGORY_LEGACY_ALIASES, iconKey) ||
    Package
  );
}

export function getPaymentMethodIconComponent(iconKey) {
  return (
    resolveLucideByName(iconKey) ||
    resolveAlias(PAYMENT_METHOD_LEGACY_ALIASES, iconKey) ||
    CircleDollarSign
  );
}

export function getEntityIconComponent(entityType, iconKey) {
  if (String(entityType || "").toLowerCase() === "paymentmethod") {
    return getPaymentMethodIconComponent(iconKey);
  }
  return getCategoryIconComponent(iconKey);
}

export const CATEGORY_ICON_MAP = CATEGORY_LEGACY_ALIASES;
export const PAYMENT_METHOD_ICON_MAP = PAYMENT_METHOD_LEGACY_ALIASES;
export const ENTITY_ICON_NAME_MAP = LUCIDE_ICON_BY_KEY;
export const DEFAULT_CATEGORY_ICON = Package;
export const DEFAULT_PAYMENT_METHOD_ICON = CircleDollarSign;
