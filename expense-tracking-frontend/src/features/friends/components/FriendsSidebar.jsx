import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  IconButton,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
} from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ExploreIcon from "@mui/icons-material/Explore";
import ShareIcon from "@mui/icons-material/Share";
import BlockIcon from "@mui/icons-material/Block";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";
import { FRIEND_SECTIONS, SIDEBAR_WIDTH, BREAKPOINTS } from "../constants/friendsConstants";

const SECTION_CONFIG = [
  { section: FRIEND_SECTIONS.MY_FRIENDS, icon: PeopleAltIcon, labelKey: "myFriends" },
  { section: FRIEND_SECTIONS.REQUESTS, icon: PersonAddIcon, labelKey: "requests", showBadge: true },
  { section: FRIEND_SECTIONS.DISCOVER, icon: ExploreIcon, labelKey: "discover" },
  { section: FRIEND_SECTIONS.SHARING, icon: ShareIcon, labelKey: "sharing" },
  { section: FRIEND_SECTIONS.BLOCKED, icon: BlockIcon, labelKey: "blocked" },
];

const FriendsSidebar = ({
  activeSection,
  onSectionChange,
  pendingCount = 0,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const isTabletOrBelow = useMediaQuery(`(max-width:${BREAKPOINTS.TABLET}px)`);

  const navItem = (config) => {
    const Icon = config.icon;
    const isActive = activeSection === config.section;
    const iconEl = (
      <Icon
        sx={{
          color: isActive ? colors.primary_accent : colors.secondary_text,
        }}
      />
    );

    if (config.showBadge && pendingCount > 0) {
      return (
        <Badge badgeContent={pendingCount} color="error">
          {iconEl}
        </Badge>
      );
    }
    return iconEl;
  };

  if (isTabletOrBelow) {
    return (
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          backgroundColor: colors.card_bg,
          borderTop: `1px solid ${colors.border_color}`,
        }}
      >
        <BottomNavigation
          value={activeSection}
          onChange={(_, value) => onSectionChange(value)}
          showLabels={false}
          sx={{
            backgroundColor: colors.card_bg,
            "& .MuiBottomNavigationAction-root": {
              color: colors.secondary_text,
            },
            "& .Mui-selected": {
              color: colors.primary_accent,
            },
          }}
        >
          {SECTION_CONFIG.map((config) => (
            <BottomNavigationAction
              key={config.section}
              value={config.section}
              icon={navItem(config)}
            />
          ))}
        </BottomNavigation>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: isCollapsed ? SIDEBAR_WIDTH.COLLAPSED : SIDEBAR_WIDTH.EXPANDED,
        backgroundColor: colors.card_bg,
        borderRight: `1px solid ${colors.border_color}`,
        transition: "width 0.3s ease",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          p: 1,
          borderBottom: `1px solid ${colors.border_color}`,
          display: "flex",
          justifyContent: isCollapsed ? "center" : "flex-end",
        }}
      >
        <IconButton
          onClick={onToggleCollapse}
          size="small"
          sx={{
            color: colors.secondary_text,
            "&:hover": {
              backgroundColor: colors.hover_bg,
              color: colors.primary_accent,
            },
          }}
        >
          {isCollapsed ? (
            <ChevronRightIcon />
          ) : (
            <ChevronLeftIcon />
          )}
        </IconButton>
      </Box>
      <List sx={{ flex: 1, py: 0 }}>
        {SECTION_CONFIG.map((config) => {
          const Icon = config.icon;
          const isActive = activeSection === config.section;
          return (
            <ListItemButton
              key={config.section}
              selected={isActive}
              onClick={() => onSectionChange(config.section)}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: `${colors.primary_accent}26`,
                  "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                    color: colors.primary_accent,
                  },
                  "&:hover": {
                    backgroundColor: `${colors.primary_accent}33`,
                  },
                },
                "&:hover": {
                  backgroundColor: colors.hover_bg,
                },
                "& .MuiListItemIcon-root, & .MuiListItemText-primary": {
                  color: isActive ? colors.primary_accent : colors.secondary_text,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: isCollapsed ? "auto" : 56 }}>
                {config.showBadge && pendingCount > 0 ? (
                  <Badge badgeContent={pendingCount} color="error">
                    <Icon />
                  </Badge>
                ) : (
                  <Icon />
                )}
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText primary={t(`friends.sections.${config.labelKey}`)} />
              )}
            </ListItemButton>
          );
        })}
      </List>
      {!isCollapsed && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${colors.border_color}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: colors.secondary_text,
              opacity: 0.8,
            }}
          >
            Expensio
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default FriendsSidebar;
