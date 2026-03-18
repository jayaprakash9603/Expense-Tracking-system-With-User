export const FRIEND_SECTIONS = {
  MY_FRIENDS: "myFriends",
  REQUESTS: "requests",
  DISCOVER: "discover",
  SHARING: "sharing",
  BLOCKED: "blocked",
  REPORT: "report",
};

export const REQUEST_TABS = {
  INCOMING: "incoming",
  OUTGOING: "outgoing",
  ALL: "all",
};

export const ACCESS_LEVELS = {
  NONE: "NONE",
  READ: "READ",
  WRITE: "WRITE",
  FULL: "FULL",
};

export const ACCESS_LEVEL_OPTIONS = [
  { value: ACCESS_LEVELS.NONE, labelKey: "friends.accessLevels.none", descKey: "friends.accessLevels.noneDesc", color: "default" },
  { value: ACCESS_LEVELS.READ, labelKey: "friends.accessLevels.read", descKey: "friends.accessLevels.readDesc", color: "info" },
  { value: ACCESS_LEVELS.WRITE, labelKey: "friends.accessLevels.write", descKey: "friends.accessLevels.writeDesc", color: "warning" },
  { value: ACCESS_LEVELS.FULL, labelKey: "friends.accessLevels.full", descKey: "friends.accessLevels.fullDesc", color: "success" },
];

export const FRIENDSHIP_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  BLOCKED: "BLOCKED",
};

export const FILTER_OPTIONS = {
  ALL: "all",
  HAS_ACCESS: "hasAccess",
  NO_ACCESS: "noAccess",
  RECENT: "recent",
};

export const SORT_OPTIONS = {
  NAME_ASC: "nameAsc",
  NAME_DESC: "nameDesc",
  RECENT: "recent",
  ACCESS_LEVEL: "accessLevel",
};

export const REPORT_SORT_FIELDS = [
  { value: "createdAt", labelKey: "friends.report.columns.since" },
  { value: "status", labelKey: "friends.report.columns.status" },
  { value: "accessLevel", labelKey: "friends.report.columns.accessLevel" },
];

export const REPORT_PAGE_SIZES = [10, 25, 50, 100];

export const ANIMATION = {
  CARD_ENTER: 300,
  CARD_EXIT: 200,
  PANEL_SLIDE: 350,
  FADE: 200,
  STAT_COUNT: 800,
};

export const SIDEBAR_WIDTH = {
  EXPANDED: 240,
  COLLAPSED: 64,
};

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
};

export const SECTION_ICONS = {
  [FRIEND_SECTIONS.MY_FRIENDS]: "People",
  [FRIEND_SECTIONS.REQUESTS]: "PersonAdd",
  [FRIEND_SECTIONS.DISCOVER]: "Explore",
  [FRIEND_SECTIONS.SHARING]: "Share",
  [FRIEND_SECTIONS.BLOCKED]: "Block",
  [FRIEND_SECTIONS.REPORT]: "Assessment",
};
