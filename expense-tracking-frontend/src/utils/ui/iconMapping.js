/**
 * Icon Mapping Utility for Categories and Payment Methods
 * Maps icon keys to MUI icon components with color support
 * Comprehensive mapping for all CategoryEmojis.js emoji categories
 */

import React from "react";
import {
  // Money & Finance
  AttachMoney,
  Money,
  CreditCard,
  AccountBalance,
  LocalAtm,
  TrendingUp,
  TrendingDown,
  CurrencyExchange,
  Savings,
  Receipt,
  BarChart,
  Calculate,
  MonetizationOn,
  Paid,
  AccountBalanceWallet,
  BusinessCenter,
  Gavel,
  CheckCircle,
  Bookmark,
  ConfirmationNumber,
  EmojiEvents,
  MilitaryTech,
  TrackChanges,
  Balance,

  // Food & Dining
  Restaurant,
  LocalPizza,
  Fastfood,
  LunchDining,
  DinnerDining,
  BrunchDining,
  RamenDining,
  SetMeal,
  RiceBowl,
  SoupKitchen,
  EggAlt,
  BakeryDining,
  Icecream,
  Cake,
  Cookie,
  LocalCafe,
  EmojiFoodBeverage,
  LocalBar,
  SportsBar,
  Liquor,
  LocalDrink,

  // Shopping & Retail
  ShoppingCart,
  ShoppingBag,
  Checkroom,
  Diamond,
  Watch,
  Redeem,
  Backpack,
  Inventory2,
  LocalOffer,
  Bathtub,
  Soap,
  CleaningServices,
  Chair,
  Bed,

  // Transport & Travel
  DirectionsCar,
  LocalTaxi,
  DirectionsBus,
  Train,
  Tram,
  DirectionsSubway,
  TwoWheeler,
  PedalBike,
  ElectricScooter,
  Flight,
  AirplanemodeActive,
  Rocket,
  DirectionsBoat,
  Sailing,
  Anchor,
  LocalGasStation,
  LocalParking,
  Commute,
  Luggage,
  BeachAccess,
  Terrain,
  Explore,
  Map,

  // Home & Utilities
  Home,
  House,
  Apartment,
  Business,
  Factory,
  Construction,
  Key,
  DoorFront,
  Window,
  Weekend,
  Shower,
  Lightbulb,
  Power,
  BatteryChargingFull,
  Tv,
  Print,
  Thermostat,
  Air,
  Water,
  Fireplace,
  Bolt,
  Recycling,
  Delete,
  Build,
  Handyman,
  Plumbing,
  Settings,

  // Health & Medical
  LocalHospital,
  Medication,
  Vaccines,
  HealthAndSafety,
  Healing,
  Accessible,
  Elderly,
  Biotech,
  Science,
  MedicalServices,
  Favorite,
  MonitorHeart,
  Psychology,
  Visibility,
  DirectionsRun,
  SelfImprovement,
  Spa,
  FaceRetouchingNatural,
  Bloodtype,
  Emergency,

  // Entertainment
  Movie,
  TheaterComedy,
  Attractions,
  Mic,
  Headphones,
  MusicNote,
  LibraryMusic,
  Piano,
  SportsEsports,
  Gamepad,
  Casino,
  Extension,
  Videocam,
  Palette,
  Image,
  MenuBook,
  AutoStories,

  // Sports & Fitness
  SportsSoccer,
  SportsBasketball,
  SportsFootball,
  SportsBaseball,
  SportsTennis,
  SportsVolleyball,
  SportsRugby,
  Pool as PoolBilliards,
  SportsCricket,
  SportsGolf,
  FitnessCenter,
  DirectionsBike,
  Pool,
  Surfing,
  Kayaking,
  Hiking,
  DownhillSkiing,
  Snowboarding,
  IceSkating,

  // Education & Work
  School,
  EditNote,
  Draw,
  Straighten,
  Biotech as BiotechLab,
  Work,
  Assignment,
  Folder,
  FolderOpen,
  Topic,
  PushPin,
  LocationOn,
  AttachFile,
  ContentCut,
  Edit,

  // Communication
  Smartphone,
  PhoneAndroid,
  Phone,
  Fax,
  Computer,
  DesktopWindows,
  Email,
  MarkEmailRead,
  Markunread,
  Send,
  Inbox,
  MailOutline,
  Campaign,
  NotificationsActive,
  Chat,
  Forum,
  Announcement,

  // Gifts & Celebrations
  CardGiftcard,
  Celebration,
  Cake as BirthdayIcon,
  LocalFlorist,
  NightlightRound,
  Park,
  AcUnit,
  Flare,
  LocalActivity,
  Nightlife,

  // Kids & Family
  ChildCare,
  ChildFriendly,
  FamilyRestroom,
  BabyChangingStation,
  Toys,
  SmartToy,
  Brush,

  // Pets & Animals
  Pets,

  // Insurance & Legal
  Description,
  Article,
  InsertDriveFile,
  Event,
  CalendarMonth,
  AdminPanelSettings,
  Lock,
  LockOpen,
  Shield,
  Security,
  VerifiedUser,
  Warning,
  Block,

  // Charity & Donations
  VolunteerActivism,
  Handshake,
  Diversity3,
  Public,
  Nature,
  Park as TreeIcon,

  // Subscriptions
  Subscriptions,
  CloudQueue,
  VpnKey,

  // Taxes & Government
  HowToVote,

  // Miscellaneous
  Star,
  AutoAwesome,
  Whatshot,
  WbSunny,
  NightsStay,
  VolumeUp,
  VolumeOff,
  Category,
  MoreHoriz,

  // Functional / action icons
  Add,
  Remove,
  Close,
  Search,
  ArrowUpward,
  ArrowDownward,
  ArrowForward,
  Schedule,
  Sync,
  Logout,
  Login,
  Download,
  Upload,
  IosShare,
  Notifications,
  HelpOutline,
  Info,
  Mail,
  DirectionsWalk,
  WorkspacePremium,
  LocalFireDepartment,
  TipsAndUpdates,
  Groups,
  Person,
  Groups2,
  MenuBook as MenuBookAlt,
  PictureAsPdf,
  TableChart,
  ContentCopy,
  Refresh,
  FilterList,
  Sort,
  Visibility as VisibilityAlt,
  Dashboard as DashboardIcon,
  Save,
} from "@mui/icons-material";

/**
 * Category icon mapping
 * Maps icon keys/names/emojis to MUI icon components
 * Organized by CategoryEmojis.js categories
 */
export const categoryIconMap = {
  // ==========================================
  // MONEY & FINANCE
  // ==========================================
  "💰": MonetizationOn,
  "💵": AttachMoney,
  "💴": Money,
  "💶": Money,
  "💷": Money,
  "💳": CreditCard,
  "🏦": AccountBalance,
  "🏧": LocalAtm,
  "💹": TrendingUp,
  "📈": TrendingUp,
  "📉": TrendingDown,
  "💱": CurrencyExchange,
  "💲": AttachMoney,
  "🪙": Savings,
  "💎": Diamond,
  "🧾": Receipt,
  "📊": BarChart,
  "🧮": Calculate,
  "💸": Paid,
  "🤑": MonetizationOn,
  "💼": BusinessCenter,
  "🏛️": AccountBalance,
  "📋": Assignment,
  "✅": CheckCircle,
  "🔖": Bookmark,
  "🎫": ConfirmationNumber,
  "🏆": EmojiEvents,
  "🥇": MilitaryTech,
  "🎯": TrackChanges,
  "⚖️": Balance,

  // Money & Finance text keys
  money: MonetizationOn,
  finance: AccountBalance,
  cash: AttachMoney,
  bank: AccountBalance,
  atm: LocalAtm,
  stocks: TrendingUp,
  investment: TrendingUp,
  investments: TrendingUp,
  exchange: CurrencyExchange,
  coin: Savings,
  receipt: Receipt,
  chart: BarChart,
  calculator: Calculate,
  salary: Work,
  income: AttachMoney,
  wallet: AccountBalanceWallet,
  savings: Savings,

  // ==========================================
  // FOOD & DINING
  // ==========================================
  "🍽️": Restaurant,
  "🍕": LocalPizza,
  "🍔": Fastfood,
  "🌭": Fastfood,
  "🥪": LunchDining,
  "🌮": LunchDining,
  "🌯": LunchDining,
  "🥙": LunchDining,
  "🍜": RamenDining,
  "🍝": DinnerDining,
  "🍛": SetMeal,
  "🍲": SoupKitchen,
  "🥘": SoupKitchen,
  "🍳": EggAlt,
  "🥗": Restaurant,
  "🍿": Movie,
  "🥞": BrunchDining,
  "🧇": BrunchDining,
  "🥓": BrunchDining,
  "🍖": DinnerDining,
  "🍗": DinnerDining,
  "🥩": DinnerDining,
  "🍱": SetMeal,
  "🍣": SetMeal,
  "🍤": SetMeal,
  "🥡": SetMeal,
  "☕": LocalCafe,
  "🧋": LocalCafe,
  "🍵": EmojiFoodBeverage,
  "🍺": SportsBar,
  "🍷": Liquor,
  "🍸": LocalBar,
  "🧃": LocalDrink,
  "🥤": LocalDrink,
  "🍦": Icecream,
  "🍩": BakeryDining,
  "🍰": Cake,
  "🧁": Cake,
  "🍪": Cookie,
  "🍫": Cookie,

  // Food text keys
  food: Fastfood,
  restaurant: Restaurant,
  dining: Restaurant,
  pizza: LocalPizza,
  burger: Fastfood,
  fastfood: Fastfood,
  lunch: LunchDining,
  dinner: DinnerDining,
  breakfast: BrunchDining,
  brunch: BrunchDining,
  ramen: RamenDining,
  noodles: RamenDining,
  soup: SoupKitchen,
  coffee: LocalCafe,
  cafe: LocalCafe,
  tea: EmojiFoodBeverage,
  drinks: LocalBar,
  bar: LocalBar,
  beer: SportsBar,
  wine: Liquor,
  icecream: Icecream,
  dessert: Cake,
  bakery: BakeryDining,
  canteen: Restaurant,
  "canteen recovery": Restaurant,

  // ==========================================
  // SHOPPING & RETAIL
  // ==========================================
  "🛒": ShoppingCart,
  "🛍️": ShoppingBag,
  "👕": Checkroom,
  "👔": Checkroom,
  "👗": Checkroom,
  "👠": Checkroom,
  "👟": Checkroom,
  "👜": ShoppingBag,
  "🎒": Backpack,
  "👝": ShoppingBag,
  "💄": FaceRetouchingNatural,
  "💍": Diamond,
  "👓": Visibility,
  "🕶️": Visibility,
  "🧢": Checkroom,
  "👒": Checkroom,
  "🎩": Checkroom,
  "📦": Inventory2,
  "🏷️": LocalOffer,
  "🛁": Bathtub,
  "🧴": Soap,
  "🧼": Soap,
  "🪥": CleaningServices,
  "🧹": CleaningServices,
  "🧺": CleaningServices,
  "🛋️": Weekend,
  "🪑": Chair,
  "🛏️": Bed,
  "🪞": Visibility,

  // Shopping text keys
  shopping: ShoppingCart,
  retail: ShoppingBag,
  clothing: Checkroom,
  clothes: Checkroom,
  fashion: Checkroom,
  shoes: Checkroom,
  bag: ShoppingBag,
  backpack: Backpack,
  cosmetics: FaceRetouchingNatural,
  makeup: FaceRetouchingNatural,
  jewelry: Diamond,
  accessories: Watch,
  glasses: Visibility,
  package: Inventory2,
  delivery: Inventory2,
  furniture: Weekend,

  // ==========================================
  // TRANSPORT & TRAVEL
  // ==========================================
  "🚗": DirectionsCar,
  "🚕": LocalTaxi,
  "🚌": DirectionsBus,
  "🚎": DirectionsBus,
  "🏎️": DirectionsCar,
  "🚓": DirectionsCar,
  "🚑": Emergency,
  "🚒": Emergency,
  "🚐": DirectionsCar,
  "🛻": DirectionsCar,
  "🚚": DirectionsCar,
  "🚛": DirectionsCar,
  "🚜": DirectionsCar,
  "🏍️": TwoWheeler,
  "🛵": TwoWheeler,
  "🚲": PedalBike,
  "🛴": ElectricScooter,
  "✈️": Flight,
  "🚁": Flight,
  "🚀": Rocket,
  "🛩️": AirplanemodeActive,
  "🛥️": DirectionsBoat,
  "🚤": DirectionsBoat,
  "⛵": Sailing,
  "🚢": DirectionsBoat,
  "⚓": Anchor,
  "🚆": Train,
  "🚇": DirectionsSubway,
  "🚈": Tram,
  "🚉": Train,
  "🛤️": Train,
  "⛽": LocalGasStation,
  "🅿️": LocalParking,
  "🚏": Commute,
  "🛫": Flight,
  "🛬": Flight,
  "🏖️": BeachAccess,
  "🏝️": BeachAccess,
  "🏕️": Terrain,
  "🗺️": Map,

  // Transport text keys
  transport: DirectionsCar,
  transportation: DirectionsCar,
  car: DirectionsCar,
  taxi: LocalTaxi,
  uber: LocalTaxi,
  bus: DirectionsBus,
  train: Train,
  metro: DirectionsSubway,
  subway: DirectionsSubway,
  bike: PedalBike,
  bicycle: PedalBike,
  motorcycle: TwoWheeler,
  scooter: ElectricScooter,
  flight: Flight,
  airplane: Flight,
  travel: Flight,
  boat: DirectionsBoat,
  ship: DirectionsBoat,
  ferry: DirectionsBoat,
  fuel: LocalGasStation,
  gas: LocalGasStation,
  petrol: LocalGasStation,
  parking: LocalParking,
  vacation: BeachAccess,
  beach: BeachAccess,
  camping: Terrain,

  // ==========================================
  // HOME & UTILITIES
  // ==========================================
  "🏠": Home,
  "🏡": House,
  "🏢": Apartment,
  "🏬": Business,
  "🏭": Factory,
  "🏗️": Construction,
  "🔑": Key,
  "🚪": DoorFront,
  "🪟": Window,
  "🚿": Shower,
  "🚽": Plumbing,
  "💡": Lightbulb,
  "🔌": Power,
  "🔋": BatteryChargingFull,
  "🖥️": DesktopWindows,
  "🖨️": Print,
  "📺": Tv,
  "🌡️": Thermostat,
  "💨": Air,
  "🌊": Water,
  "🔥": Fireplace,
  "⚡": Bolt,
  "☢️": Warning,
  "♻️": Recycling,
  "🗑️": Delete,
  "🪠": Plumbing,
  "🔧": Build,
  "🔨": Handyman,
  "🪛": Build,
  "🪚": Handyman,
  "🧰": Handyman,
  "⚙️": Settings,
  "🔩": Build,
  "🪤": Pets,
  "🧲": Science,

  // Home & Utilities text keys
  home: Home,
  house: House,
  apartment: Apartment,
  rent: Home,
  housing: Home,
  building: Apartment,
  office: Business,
  factory: Factory,
  construction: Construction,
  key: Key,
  door: DoorFront,
  bathroom: Shower,
  light: Lightbulb,
  electricity: Bolt,
  electric: Bolt,
  power: Power,
  battery: BatteryChargingFull,
  computer: DesktopWindows,
  printer: Print,
  television: Tv,
  tv: Tv,
  temperature: Thermostat,
  aircon: Air,
  "air conditioning": Air,
  water: Water,
  fire: Fireplace,
  heating: Fireplace,
  trash: Delete,
  garbage: Delete,
  recycling: Recycling,
  plumbing: Plumbing,
  tools: Build,
  repairs: Handyman,
  maintenance: Handyman,
  utilities: Bolt,

  // ==========================================
  // HEALTH & MEDICAL
  // ==========================================
  "🏥": LocalHospital,
  "💊": Medication,
  "💉": Vaccines,
  "🩺": MedicalServices,
  "🩹": Healing,
  "🩼": Accessible,
  "🦽": Accessible,
  "🦯": Accessible,
  "🧬": Biotech,
  "🔬": Science,
  "🩻": MedicalServices,
  "❤️‍🩹": Healing,
  "🫀": MonitorHeart,
  "🫁": MedicalServices,
  "🧠": Psychology,
  "🦷": MedicalServices,
  "👁️": Visibility,
  "🏃": DirectionsRun,
  "🧘": SelfImprovement,
  "🧖": Spa,
  "💆": Spa,
  "💇": FaceRetouchingNatural,
  "🛀": Bathtub,
  "🩸": Bloodtype,
  "🧪": Science,
  "⚕️": HealthAndSafety,
  "🆘": Emergency,

  // Health text keys
  health: LocalHospital,
  healthcare: LocalHospital,
  medical: MedicalServices,
  hospital: LocalHospital,
  doctor: MedicalServices,
  medicine: Medication,
  pharmacy: Medication,
  drugs: Medication,
  vaccine: Vaccines,
  injection: Vaccines,
  therapy: Healing,
  wheelchair: Accessible,
  disability: Accessible,
  dna: Biotech,
  laboratory: Science,
  lab: Science,
  heart: MonitorHeart,
  dental: MedicalServices,
  dentist: MedicalServices,
  eye: Visibility,
  vision: Visibility,
  running: DirectionsRun,
  exercise: DirectionsRun,
  yoga: SelfImprovement,
  meditation: SelfImprovement,
  spa: Spa,
  massage: Spa,
  wellness: Spa,
  haircut: FaceRetouchingNatural,
  salon: FaceRetouchingNatural,
  beauty: FaceRetouchingNatural,

  // ==========================================
  // ENTERTAINMENT
  // ==========================================
  "🎬": Movie,
  "🎭": TheaterComedy,
  "🎪": Attractions,
  "🎤": Mic,
  "🎧": Headphones,
  "🎵": MusicNote,
  "🎶": LibraryMusic,
  "🎹": Piano,
  "🎸": MusicNote,
  "🥁": MusicNote,
  "🎷": MusicNote,
  "🎺": MusicNote,
  "🎻": MusicNote,
  "🪕": MusicNote,
  "🎮": SportsEsports,
  "🕹️": Gamepad,
  "🎲": Casino,
  "🃏": Casino,
  "🎰": Casino,
  "🎳": SportsEsports,
  "🎥": Videocam,
  "📽️": Videocam,
  "🎨": Palette,
  "🖼️": Image,
  "📚": MenuBook,
  "📖": AutoStories,
  "📻": Headphones,

  // Entertainment text keys
  entertainment: TheaterComedy,
  movie: Movie,
  movies: Movie,
  cinema: Movie,
  theater: TheaterComedy,
  theatre: TheaterComedy,
  circus: Attractions,
  karaoke: Mic,
  microphone: Mic,
  headphones: Headphones,
  music: MusicNote,
  concert: LibraryMusic,
  piano: Piano,
  guitar: MusicNote,
  drums: MusicNote,
  gaming: SportsEsports,
  games: SportsEsports,
  videogames: SportsEsports,
  gambling: Casino,
  cards: Casino,
  bowling: SportsEsports,
  art: Palette,
  painting: Palette,
  gallery: Image,
  books: MenuBook,
  reading: AutoStories,
  library: MenuBook,
  radio: Headphones,

  // ==========================================
  // SPORTS & FITNESS
  // ==========================================
  "⚽": SportsSoccer,
  "🏀": SportsBasketball,
  "🏈": SportsFootball,
  "⚾": SportsBaseball,
  "🎾": SportsTennis,
  "🏐": SportsVolleyball,
  "🏉": SportsRugby,
  "🎱": PoolBilliards,
  "🏓": SportsTennis,
  "🏸": SportsTennis,
  "🏑": SportsCricket,
  "🏒": SportsCricket,
  "🥍": SportsCricket,
  "🏏": SportsCricket,
  "⛳": SportsGolf,
  "🏹": TrackChanges,
  "🎣": Terrain,
  "🥊": FitnessCenter,
  "🥋": FitnessCenter,
  "🎽": DirectionsRun,
  "🛹": ElectricScooter,
  "🛷": DownhillSkiing,
  "⛸️": IceSkating,
  "🥌": IceSkating,
  "🎿": DownhillSkiing,
  "⛷️": DownhillSkiing,
  "🏂": Snowboarding,
  "🏋️": FitnessCenter,
  "🤸": FitnessCenter,
  "💪": FitnessCenter,
  "🚴": DirectionsBike,
  "🏊": Pool,
  "🤽": Pool,
  "🧗": Hiking,
  "🏄": Surfing,
  "🚣": Kayaking,
  "🏇": DirectionsRun,
  "🥏": SportsSoccer,

  // Sports text keys
  sports: SportsSoccer,
  soccer: SportsSoccer,
  football: SportsFootball,
  basketball: SportsBasketball,
  baseball: SportsBaseball,
  tennis: SportsTennis,
  volleyball: SportsVolleyball,
  rugby: SportsRugby,
  billiards: PoolBilliards,
  cricket: SportsCricket,
  golf: SportsGolf,
  archery: TrackChanges,
  fishing: Terrain,
  boxing: FitnessCenter,
  martialarts: FitnessCenter,
  skating: IceSkating,
  skiing: DownhillSkiing,
  snowboarding: Snowboarding,
  fitness: FitnessCenter,
  gym: FitnessCenter,
  workout: FitnessCenter,
  cycling: DirectionsBike,
  swimming: Pool,
  climbing: Hiking,
  hiking: Hiking,
  surfing: Surfing,
  kayaking: Kayaking,

  // ==========================================
  // EDUCATION & WORK
  // ==========================================
  "🎓": School,
  "📝": EditNote,
  "✏️": Draw,
  "📏": Straighten,
  "📐": Straighten,
  "🔭": Science,
  "🏫": School,
  "🗂️": Topic,
  "📁": Folder,
  "📂": FolderOpen,
  "🗃️": Topic,
  "🗄️": Topic,
  "📌": PushPin,
  "📍": LocationOn,
  "📎": AttachFile,
  "🖇️": AttachFile,
  "✂️": ContentCut,
  "🖊️": Edit,
  "🖋️": Edit,
  "✒️": Edit,

  // Education & Work text keys
  education: School,
  school: School,
  university: School,
  college: School,
  study: School,
  learning: School,
  course: School,
  training: School,
  work: Work,
  job: Work,
  career: Work,
  meeting: Forum,
  presentation: BarChart,
  document: Description,
  file: Folder,
  folder: Folder,
  pin: PushPin,
  location: LocationOn,
  attachment: AttachFile,
  scissors: ContentCut,
  pen: Edit,
  writing: Edit,

  // ==========================================
  // COMMUNICATION
  // ==========================================
  "📱": Smartphone,
  "📲": PhoneAndroid,
  "☎️": Phone,
  "📞": Phone,
  "📟": Phone,
  "📠": Fax,
  "💻": Computer,
  "⌨️": Computer,
  "🖱️": Computer,
  "📧": Email,
  "📨": MarkEmailRead,
  "📩": Markunread,
  "📤": Send,
  "📥": Inbox,
  "📫": MailOutline,
  "📬": MailOutline,
  "📭": MailOutline,
  "📮": MailOutline,
  "📪": MailOutline,
  "📯": Campaign,
  "🔔": NotificationsActive,
  "💬": Chat,
  "💭": Chat,
  "🗨️": Chat,
  "🗯️": Forum,
  "📢": Campaign,
  "📣": Announcement,
  "📡": Announcement,

  // Communication text keys
  phone: Phone,
  mobile: Smartphone,
  smartphone: Smartphone,
  telephone: Phone,
  fax: Fax,
  laptop: Computer,
  keyboard: Computer,
  mouse: Computer,
  email: Email,
  mail: MailOutline,
  inbox: Inbox,
  send: Send,
  notification: NotificationsActive,
  bell: NotificationsActive,
  chat: Chat,
  message: Chat,
  sms: Chat,
  text: Chat,
  internet: Public,
  wifi: Public,

  // ==========================================
  // GIFTS & CELEBRATIONS
  // ==========================================
  "🎁": CardGiftcard,
  "🎀": CardGiftcard,
  "🎈": Celebration,
  "🎉": Celebration,
  "🎊": Celebration,
  "🎂": Cake,
  "🕯️": NightlightRound,
  "🪅": Celebration,
  "🎃": Celebration,
  "🎄": Park,
  "🎆": Celebration,
  "🎇": Celebration,
  "🧨": Celebration,
  "🎍": Park,
  "🎎": Celebration,
  "🎏": Celebration,
  "🎐": Celebration,
  "🎑": NightsStay,
  "🧧": CardGiftcard,
  "🥂": Nightlife,
  "🍾": Nightlife,
  "💐": LocalFlorist,
  "🌹": LocalFlorist,
  "💒": Favorite,
  "👰": Celebration,
  "🤵": Celebration,
  "💝": Favorite,

  // Gifts text keys
  gift: CardGiftcard,
  gifts: CardGiftcard,
  present: CardGiftcard,
  party: Celebration,
  celebration: Celebration,
  birthday: Cake,
  anniversary: Celebration,
  wedding: Favorite,
  christmas: Park,
  holiday: Celebration,
  newyear: Celebration,
  champagne: Nightlife,
  flowers: LocalFlorist,

  // ==========================================
  // KIDS & FAMILY
  // ==========================================
  "👶": ChildCare,
  "🧒": ChildCare,
  "👦": ChildCare,
  "👧": ChildCare,
  "👨‍👩‍👧‍👦": FamilyRestroom,
  "👪": FamilyRestroom,
  "🍼": BabyChangingStation,
  "🧸": Toys,
  "🎠": Attractions,
  "🎡": Attractions,
  "🎢": Attractions,
  "🖍️": Brush,
  "🧩": Extension,
  "🪀": Toys,
  "🪁": Toys,
  "🚼": BabyChangingStation,
  "🛝": Attractions,
  "👼": ChildCare,
  "🍭": Cookie,

  // Kids text keys
  kids: ChildCare,
  children: ChildCare,
  child: ChildCare,
  baby: BabyChangingStation,
  infant: BabyChangingStation,
  family: FamilyRestroom,
  toys: Toys,
  playground: Attractions,
  amusement: Attractions,

  // ==========================================
  // PETS & ANIMALS
  // ==========================================
  "🐶": Pets,
  "🐱": Pets,
  "🐭": Pets,
  "🐹": Pets,
  "🐰": Pets,
  "🦊": Pets,
  "🐻": Pets,
  "🐼": Pets,
  "🐨": Pets,
  "🐯": Pets,
  "🦁": Pets,
  "🐮": Pets,
  "🐷": Pets,
  "🐸": Pets,
  "🐵": Pets,
  "🐔": Pets,
  "🐧": Pets,
  "🐦": Pets,
  "🐤": Pets,
  "🦆": Pets,
  "🦅": Pets,
  "🦉": Pets,
  "🐴": Pets,
  "🦄": Pets,
  "🐝": Pets,
  "🦋": Pets,
  "🐌": Pets,
  "🐞": Pets,
  "🐟": Pets,
  "🐠": Pets,
  "🐡": Pets,
  "🦈": Pets,
  "🐙": Pets,
  "🐚": Pets,
  "🐢": Pets,
  "🦎": Pets,
  "🐍": Pets,
  "🦖": Pets,
  "🦕": Pets,
  "🐾": Pets,

  // Pets text keys
  pets: Pets,
  pet: Pets,
  dog: Pets,
  cat: Pets,
  animal: Pets,
  animals: Pets,
  veterinary: Pets,
  vet: Pets,

  // ==========================================
  // INSURANCE & LEGAL
  // ==========================================
  "📜": Description,
  "📃": Article,
  "📄": InsertDriveFile,
  "📑": Description,
  "🗒️": Description,
  "🗓️": CalendarMonth,
  "📆": Event,
  "📅": CalendarMonth,
  "👨‍⚖️": Gavel,
  "👩‍⚖️": Gavel,
  "🔏": Lock,
  "🔐": Lock,
  "🔒": Lock,
  "🔓": LockOpen,
  "🛡️": Shield,
  "⚔️": Security,
  "🗡️": Security,
  "❌": Block,
  "⭕": Warning,
  "❗": Warning,
  "❓": Warning,
  "⚠️": Warning,
  "🚫": Block,
  "🔞": Block,
  "📵": Block,
  "🚷": Block,

  // Insurance & Legal text keys
  insurance: Shield,
  legal: Gavel,
  law: Gavel,
  lawyer: Gavel,
  attorney: Gavel,
  court: Gavel,
  contract: Description,
  agreement: Description,
  policy: Shield,
  calendar: CalendarMonth,
  schedule: Event,
  security: Security,
  protection: Shield,
  lock: Lock,

  // ==========================================
  // CHARITY & DONATIONS
  // ==========================================
  "❤️": Favorite,
  "🧡": Favorite,
  "💛": Favorite,
  "💚": Favorite,
  "💙": Favorite,
  "💜": Favorite,
  "🖤": Favorite,
  "🤍": Favorite,
  "🤎": Favorite,
  "💕": Favorite,
  "💖": Favorite,
  "💗": Favorite,
  "💘": Favorite,
  "🤲": VolunteerActivism,
  "🙏": VolunteerActivism,
  "🤝": Handshake,
  "👐": VolunteerActivism,
  "🫶": VolunteerActivism,
  "✋": VolunteerActivism,
  "🎗️": Favorite,
  "🏳️‍🌈": Diversity3,
  "🕊️": VolunteerActivism,
  "☮️": VolunteerActivism,
  "♾️": VolunteerActivism,
  "🌍": Public,
  "🌎": Public,
  "🌏": Public,
  "🌱": Nature,
  "🌳": Park,

  // Charity text keys
  charity: VolunteerActivism,
  donation: VolunteerActivism,
  donations: VolunteerActivism,
  donate: VolunteerActivism,
  giving: VolunteerActivism,
  nonprofit: VolunteerActivism,
  volunteer: VolunteerActivism,
  help: Handshake,
  support: Handshake,
  cause: Favorite,

  // ==========================================
  // SUBSCRIPTIONS
  // ==========================================
  "📰": Article,
  "☁️": CloudQueue,
  "🎙️": Mic,
  "🔄": AutoAwesome,
  "✉️": Email,
  "vpn_key": VpnKey,
  "🎟️": ConfirmationNumber,

  // Subscription text keys
  subscription: Subscriptions,
  subscriptions: Subscriptions,
  streaming: Subscriptions,
  netflix: Tv,
  spotify: MusicNote,
  youtube: Videocam,
  membership: ConfirmationNumber,
  premium: Star,
  cloud: CloudQueue,

  // ==========================================
  // TAXES & GOVERNMENT
  // ==========================================
  "🗳️": HowToVote,
  "👨‍💼": Work,
  "👩‍💼": Work,
  "⏰": Event,
  "🚨": Emergency,

  // Tax text keys
  tax: AccountBalance,
  taxes: AccountBalance,
  government: AccountBalance,
  irs: AccountBalance,
  filing: Description,
  deductions: TrendingDown,
  deduction: TrendingDown,
  "provident fund": AccountBalance,
  providentfund: AccountBalance,
  pf: AccountBalance,

  // ==========================================
  // MISCELLANEOUS
  // ==========================================
  "⭐": Star,
  "🌟": Star,
  "✨": AutoAwesome,
  "💫": AutoAwesome,
  "💥": Whatshot,
  "💢": Warning,
  "💤": NightsStay,
  "💦": Water,
  "🌈": AutoAwesome,
  "☀️": WbSunny,
  "🌙": NightsStay,
  "❄️": AcUnit,
  "🔕": VolumeOff,
  "🔊": VolumeUp,
  "🔇": VolumeOff,
  "🔦": Lightbulb,
  "🔮": AutoAwesome,
  "🪬": AutoAwesome,

  // Miscellaneous text keys
  star: Star,
  favorite: Favorite,
  other: MoreHoriz,
  others: MoreHoriz,
  misc: MoreHoriz,
  miscellaneous: MoreHoriz,
  general: Category,
  test: Science,
  testing: Science,

  // Default fallback
  default: Category,
  "": Category,
};

/**
 * Payment method icon mapping
 * Comprehensive mapping for payment methods
 */
export const paymentMethodIconMap = {
  // Cash
  cash: AttachMoney,
  "💵": AttachMoney,
  "💴": Money,
  "💶": Money,
  "💷": Money,
  "💰": MonetizationOn,
  "💲": AttachMoney,

  // Credit Card
  credit: CreditCard,
  creditcard: CreditCard,
  "credit card": CreditCard,
  creditpaid: CreditCard,
  "credit paid": CreditCard,
  creditneedtopaid: CreditCard,
  "credit need to paid": CreditCard,
  "💳": CreditCard,

  // Debit Card
  debit: CreditCard,
  debitcard: CreditCard,
  "debit card": CreditCard,
  card: CreditCard,

  // Wallet
  wallet: AccountBalanceWallet,
  "👛": AccountBalanceWallet,

  // UPI/Digital
  upi: Smartphone,
  digital: Smartphone,
  online: Smartphone,
  "📱": Smartphone,
  gpay: Smartphone,
  paytm: Smartphone,
  phonepe: Smartphone,

  // ATM
  atm: LocalAtm,
  "🏧": LocalAtm,

  // Bank Transfer
  bank: AccountBalance,
  "bank transfer": AccountBalance,
  banktransfer: AccountBalance,
  neft: AccountBalance,
  imps: AccountBalance,
  rtgs: AccountBalance,
  "🏦": AccountBalance,

  // Deductions
  deductions: TrendingDown,
  deduction: TrendingDown,
  "📉": TrendingDown,

  // Canteen Recovery
  canteen: Restaurant,
  "canteen recovery": Restaurant,
  "🍽️": Restaurant,

  // Provident Fund
  "provident fund": AccountBalance,
  providentfund: AccountBalance,
  pf: AccountBalance,
  epf: AccountBalance,

  // Money Transfer
  transfer: Send,
  "💸": Send,

  // Savings
  savings: Savings,
  "🪙": Savings,

  // Check/Cheque
  check: Receipt,
  cheque: Receipt,
  "🧾": Receipt,

  // Test
  test: Science,
  testing: Science,
  "🧪": Science,

  // Receipt/Bill
  receipt: Receipt,
  bill: Receipt,

  // Net Banking
  netbanking: Computer,
  "net banking": Computer,
  internetbanking: Computer,
  "internet banking": Computer,

  // EMI
  emi: CreditCard,
  installment: CreditCard,

  // Gift Card
  giftcard: CardGiftcard,
  "gift card": CardGiftcard,
  voucher: CardGiftcard,
  "🎁": CardGiftcard,

  // Cryptocurrency
  crypto: CurrencyExchange,
  bitcoin: CurrencyExchange,
  cryptocurrency: CurrencyExchange,

  // Default
  default: AccountBalanceWallet,
  "": AccountBalanceWallet,
  payment: Paid,
  other: MoreHoriz,
  others: MoreHoriz,
};

/**
 * Functional / action icon mapping
 * Maps emoji glyphs and semantic keys used in navigation, quick actions,
 * empty states, tabs and status badges to MUI icon components.
 *
 * These mappings intentionally shadow ambiguous glyphs from the category map
 * with more action-appropriate icons (for example 🔄 -> Sync instead of
 * AutoAwesome, 🚪 -> Logout instead of DoorFront).
 */
export const actionIconMap = {
  // Structural / navigation
  "🏠": Home,
  "🏡": House,
  "🏢": Apartment,
  "📊": BarChart,
  "📈": TrendingUp,
  "📉": TrendingDown,
  "📋": Assignment,
  "📄": InsertDriveFile,
  "📃": Article,
  "📑": Description,
  "📝": EditNote,
  "🧾": Receipt,
  "📚": MenuBook,
  "📖": AutoStories,
  "🗂️": Topic,
  "📁": Folder,
  "📂": FolderOpen,
  "🗄️": Topic,
  "🗃️": Topic,
  "📌": PushPin,
  "📍": LocationOn,
  "🏷️": LocalOffer,
  "💳": CreditCard,
  "💰": MonetizationOn,
  "💵": AttachMoney,
  "💸": Paid,
  "🏦": AccountBalance,
  "🏛️": AccountBalance,
  "🧮": Calculate,
  "⚖️": Balance,
  "🎯": TrackChanges,
  "💼": BusinessCenter,
  "🛒": ShoppingCart,
  "🛍️": ShoppingBag,

  // Actions
  "➕": Add,
  "➖": Remove,
  "✏️": Edit,
  "🖊️": Edit,
  "🗑️": Delete,
  "🔍": Search,
  "🔎": Search,
  "🔄": Sync,
  "🔁": Sync,
  "📤": IosShare,
  "📥": Download,
  "📎": AttachFile,
  "✂️": ContentCut,
  "🖨️": Print,
  "🚪": Logout,
  "📨": Mail,
  "📧": Email,
  "📫": MailOutline,
  "📬": MailOutline,
  "📭": MailOutline,
  "📮": MailOutline,
  "📪": MailOutline,
  "📢": Campaign,
  "📣": Announcement,
  "🚶": DirectionsWalk,

  // People
  "👥": Groups,
  "👤": Person,
  "🧑‍🤝‍🧑": Diversity3,
  "👪": FamilyRestroom,

  // Status & feedback
  "⚡": Bolt,
  "🔔": Notifications,
  "🔕": VolumeOff,
  "❓": HelpOutline,
  "❗": Warning,
  "⚠️": Warning,
  "✅": CheckCircle,
  "❌": Close,
  "🚫": Block,
  "⛔": Block,
  "🔒": Lock,
  "🔐": Lock,
  "🔓": LockOpen,
  "🛡️": Shield,
  "🗳️": HowToVote,
  "⚙️": Settings,
  "🔧": Build,
  "🔨": Handyman,

  // Time / dates
  "🕒": Schedule,
  "🕐": Schedule,
  "🕘": Schedule,
  "⏰": Schedule,
  "⏱️": Schedule,
  "⏲️": Schedule,
  "📅": CalendarMonth,
  "📆": Event,

  // Direction / trend
  "⬆️": ArrowUpward,
  "⬇️": ArrowDownward,
  "⬆": ArrowUpward,
  "⬇": ArrowDownward,
  "➡️": ArrowForward,

  // Highlights / rewards
  "⭐": Star,
  "🌟": Star,
  "💡": Lightbulb,
  "🏆": EmojiEvents,
  "🥇": MilitaryTech,
  "🔥": LocalFireDepartment,
  "👑": WorkspacePremium,
  "🚀": Rocket,
  "✨": AutoAwesome,

  // Export formats
  "📕": PictureAsPdf,
  "📊📄": TableChart,

  // Semantic keys used directly in configs
  add: Add,
  remove: Remove,
  edit: Edit,
  delete: Delete,
  search: Search,
  sync: Sync,
  refresh: Refresh,
  share: IosShare,
  upload: Upload,
  download: Download,
  export: IosShare,
  filter: FilterList,
  sort: Sort,
  logout: Logout,
  login: Login,
  home: Home,
  dashboard: DashboardIcon,
  expense: MonetizationOn,
  expenses: MonetizationOn,
  budget: BarChart,
  budgets: BarChart,
  category: LocalOffer,
  categories: LocalOffer,
  bill: InsertDriveFile,
  bills: InsertDriveFile,
  "payment-method": CreditCard,
  paymentmethod: CreditCard,
  payment: CreditCard,
  friend: Groups,
  friends: Groups,
  group: Groups,
  groups: Groups,
  user: Person,
  users: Groups,
  admin: Shield,
  report: BarChart,
  reports: BarChart,
  analytics: TrendingUp,
  cashflow: TrendingUp,
  trend: TrendingUp,
  settings: Settings,
  preferences: Settings,
  notifications: Notifications,
  notification: Notifications,
  help: HelpOutline,
  info: Info,
  action: Bolt,
  schedule: Schedule,
  time: Schedule,
  clock: Schedule,
  calendar: CalendarMonth,
  event: Event,
  target: TrackChanges,
  goal: TrackChanges,
  income: TrendingUp,
  spending: TrendingDown,
  savings: Savings,
  balance: Balance,
  tour: DirectionsWalk,
  restart: Sync,
  tip: Lightbulb,
  tips: TipsAndUpdates,
  premium: WorkspacePremium,
  streak: LocalFireDepartment,
  achievement: EmojiEvents,
  trophy: EmojiEvents,
  rocket: Rocket,
  star: Star,
  favorite: Star,
  success: CheckCircle,
  error: Warning,
  warning: Warning,
  close: Close,
  copy: ContentCopy,
  pdf: PictureAsPdf,
  csv: TableChart,
  table: TableChart,
  chart: BarChart,
  campaign: Campaign,
  dark: NightsStay,
  save: Save,
  mute: VolumeOff,
  lock: Lock,
  email: Email,
  chat: Chat,
  family: FamilyRestroom,
  public: Public,
  cloud: CloudQueue,
  visibility: VisibilityAlt,
  link: AttachFile,
};

/**
 * Resolve a functional/UI icon by key or emoji glyph, falling back through
 * the action, category and payment maps before landing on a neutral default.
 *
 * @param {string} iconKey - Emoji glyph or semantic key
 * @returns {React.ComponentType|null} MUI icon component (not element)
 */
export const resolveFunctionalIconComponent = (iconKey) => {
  if (!iconKey) return null;
  const raw = String(iconKey).trim();
  const lower = raw.toLowerCase();
  return (
    actionIconMap[raw] ||
    actionIconMap[lower] ||
    categoryIconMap[raw] ||
    categoryIconMap[lower] ||
    paymentMethodIconMap[raw] ||
    paymentMethodIconMap[lower] ||
    null
  );
};

/**
 * Render a functional icon (navigation/action/status) as a MUI element.
 * When the key/glyph is unknown, falls back to a neutral Category icon.
 *
 * @param {string} iconKey - Emoji glyph or semantic key
 * @param {object} props - Additional props (sx, fontSize, color, ...)
 * @returns {React.Element}
 */
export const getFunctionalIcon = (iconKey, props = {}) => {
  const Icon = resolveFunctionalIconComponent(iconKey) || Category;
  return <Icon {...props} />;
};

/**
 * Functional/UI icon tinted with the active theme accent (primary_accent).
 * Prefer this for section titles, empty states, and chrome — not entity icons.
 *
 * @param {string} iconKey
 * @param {string} accentColor - typically colors.primary_accent from useTheme()
 * @param {object} props - Additional MUI icon props; sx.color overrides accent if set
 */
export const getAccentFunctionalIcon = (iconKey, accentColor, props = {}) => {
  const { sx = {}, ...rest } = props;
  return getFunctionalIcon(iconKey, {
    ...rest,
    sx: { color: accentColor, ...sx },
  });
};

/**
 * Apply theme accent color to an existing MUI icon element (e.g. titleIcon prop).
 * Existing sx.color wins when already set.
 */
export const applyAccentToIcon = (iconElement, accentColor) => {
  if (!React.isValidElement(iconElement)) return iconElement;
  const existingSx = iconElement.props?.sx || {};
  return React.cloneElement(iconElement, {
    sx: { color: accentColor, ...existingSx },
  });
};

/**
 * Check whether a value is a single emoji glyph (rather than plain text).
 * Used by legacy components that accept either an emoji string or a node.
 */
export const isEmojiGlyph = (value) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 6) return false;
  return /\p{Extended_Pictographic}/u.test(trimmed);
};

/**
 * Get MUI icon component for a category
 * @param {string} iconKey - Icon key/name/emoji
 * @param {object} props - Additional props for the icon (color, fontSize, etc.)
 * @returns {React.Element} MUI icon component
 */
export const getCategoryIcon = (iconKey, props = {}) => {
  const key = (iconKey || "").toLowerCase().trim();
  const IconComponent = categoryIconMap[key] || categoryIconMap.default;
  return <IconComponent {...props} />;
};

/**
 * Get MUI icon component for a payment method
 * @param {string} iconKey - Icon key/name/emoji
 * @param {object} props - Additional props for the icon (color, fontSize, etc.)
 * @returns {React.Element} MUI icon component
 */
export const getPaymentMethodIcon = (iconKey, props = {}) => {
  const key = (iconKey || "").toLowerCase().trim();
  const IconComponent =
    paymentMethodIconMap[key] || paymentMethodIconMap.default;
  return <IconComponent {...props} />;
};

/**
 * Get icon component based on entity type
 * @param {string} type - 'category' or 'paymentMethod'
 * @param {string} iconKey - Icon key/name/emoji
 * @param {object} props - Additional props for the icon
 * @returns {React.Element} MUI icon component
 */
export const getEntityIcon = (type, iconKey, props = {}) => {
  if (type === "paymentMethod" || type === "payment") {
    return getPaymentMethodIcon(iconKey, props);
  }
  return getCategoryIcon(iconKey, props);
};

/**
 * Render icon with color from entity data
 * @param {object} entity - Entity with icon and color properties
 * @param {string} type - 'category' or 'paymentMethod'
 * @param {object} additionalProps - Additional icon props
 * @returns {React.Element} Colored MUI icon
 */
export const renderEntityIcon = (
  entity,
  type = "category",
  additionalProps = {},
) => {
  const iconKey = entity?.icon || entity?.name || "";
  const color = entity?.color || "#14b8a6";

  return getEntityIcon(type, iconKey, {
    sx: { color, fontSize: "inherit", ...additionalProps.sx },
    ...additionalProps,
  });
};

export default {
  getCategoryIcon,
  getPaymentMethodIcon,
  getEntityIcon,
  renderEntityIcon,
  categoryIconMap,
  paymentMethodIconMap,
};
