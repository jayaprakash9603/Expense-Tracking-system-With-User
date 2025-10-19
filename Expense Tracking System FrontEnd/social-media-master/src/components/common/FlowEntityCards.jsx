import React, { useState } from "react";
import {
  Skeleton,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import NoDataPlaceholder from "../NoDataPlaceholder";
import { formatCurrencyCompact } from "../../utils/numberFormatters";

/**
 * FlowEntityCards
 * Generic card list component for CategoryFlow & PaymentMethodFlow (and future flows).
 * Expects each entity to have: categoryName, categoryId, totalAmount, expenseCount, color.
 */
const FlowEntityCards = ({
  entities = [],
  loading = false,
  search = "",
  isMobile,
  isTablet,
  flowTab,
  selectedEntityId,
  hasWriteAccess,
  onSelect, // (entity) => void
  onDouble, // (entity, event) => void
  onEdit, // (entity) => void
  onDelete, // (entity) => void
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuEntity, setMenuEntity] = useState(null);

  const openMenu = (e, entity) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
    setMenuEntity(entity);
  };
  const closeMenu = (e) => {
    if (e) e.stopPropagation();
    setMenuAnchorEl(null);
    setMenuEntity(null);
  };
  const handleEdit = (e) => {
    e.stopPropagation();
    if (menuEntity) onEdit?.(menuEntity);
    closeMenu(e);
  };
  const handleDelete = (e) => {
    e.stopPropagation();
    if (menuEntity) onDelete?.(menuEntity);
    closeMenu(e);
  };

  if (loading && !search) {
    return (
      <div
        className="flex flex-wrap justify-start custom-scrollbar"
        style={{
          maxHeight: isMobile ? 200 : isTablet ? 250 : 360,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: isMobile ? 4 : isTablet ? 8 : 16,
          gap: isMobile ? 8 : 16,
          width: "100%",
          paddingLeft: "16px",
        }}
      >
        {Array.from({ length: 3 }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rectangular"
            width={isMobile ? "100%" : 220}
            height={130}
            animation="wave"
            sx={{ bgcolor: "#23243a", borderRadius: 2 }}
            style={{ margin: "0 0 16px 0" }}
          />
        ))}
      </div>
    );
  }

  if (!loading && entities.length === 0) {
    return (
      <div
        className="flex flex-wrap justify-start custom-scrollbar"
        style={{
          maxHeight: isMobile ? 200 : isTablet ? 250 : 360,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: isMobile ? 4 : isTablet ? 8 : 16,
          gap: isMobile ? 8 : 16,
          width: "100%",
          paddingLeft: "16px",
        }}
      >
        <NoDataPlaceholder
          size={isMobile ? "lg" : "fill"}
          fullWidth
          iconSize={isMobile ? 54 : 72}
          style={{ minHeight: isMobile ? 260 : 340 }}
          message={search ? "No matches" : "No data found"}
          subMessage={
            search
              ? "Try a different search term"
              : "Adjust filters or change the period"
          }
        />
      </div>
    );
  }

  return (
    <>
      <div
        className="flex flex-wrap justify-start custom-scrollbar"
        style={{
          maxHeight: isMobile ? 200 : isTablet ? 250 : 360,
          overflowY: "auto",
          overflowX: "hidden",
          paddingRight: isMobile ? 4 : isTablet ? 8 : 16,
          gap: isMobile ? 8 : 16,
          width: "100%",
          paddingLeft: "16px",
        }}
      >
        {entities.map((entity, idx) => {
          const isSelected = selectedEntityId === entity.categoryId;
          return (
            <div
              key={entity.categoryId || idx}
              className={`bg-[#1b1b1b] rounded-lg shadow-md flex flex-col justify-between relative group transition-colors duration-200 ${
                isSelected
                  ? `ring-2 ${
                      flowTab === "outflow"
                        ? "ring-[#ff4d4f]"
                        : flowTab === "inflow"
                        ? "ring-[#06d6a0]"
                        : "ring-[#5b7fff]"
                    }`
                  : ""
              }`}
              style={{
                minHeight: "130px",
                maxHeight: "130px",
                height: "130px",
                width: isMobile ? "100%" : 220,
                padding: "16px 20px",
                boxSizing: "border-box",
                overflow: "hidden",
                cursor: "pointer",
                background: "#1b1b1b",
                transition: "background 0.2s, box-shadow 0.2s, border 0.2s",
                border: "2px solid transparent",
                borderLeft: `6px solid ${entity.color}`,
                margin: "4px",
              }}
              onClick={() => onSelect?.(entity)}
              onDoubleClick={(e) => onDouble?.(entity, e)}
            >
              {hasWriteAccess && (
                <div
                  className="absolute top-2 right-2 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                  style={{ opacity: 0.9, zIndex: 10 }}
                >
                  <IconButton
                    size="small"
                    sx={{
                      color: "#ffffff",
                      padding: "4px",
                      backgroundColor: "#28282a80",
                      "&:hover": { backgroundColor: `${entity.color}22` },
                    }}
                    onClick={(e) => openMenu(e, entity)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </div>
              )}
              <div className="flex flex-col gap-2" style={{ height: "100%" }}>
                <div className="flex items-center justify-between min-w-0">
                  <span
                    className="font-semibold text-base truncate min-w-0 text-white"
                    title={entity.categoryName}
                    style={{
                      maxWidth: "70%",
                      fontSize: "15px",
                      fontWeight: 700,
                    }}
                  >
                    {entity.categoryName}
                  </span>
                </div>
                <div className="text-base font-bold flex items-center gap-1">
                  <span
                    style={{
                      color: entity.color,
                      fontSize: "16px",
                      fontWeight: 700,
                    }}
                  >
                    {formatCurrencyCompact(entity.totalAmount)}
                  </span>
                </div>
                <div
                  className="text-gray-300 text-sm break-words card-comments-clamp"
                  style={{
                    wordBreak: "break-word",
                    flex: 1,
                    overflow: "hidden",
                  }}
                >
                  {`${entity.expenseCount} expense${
                    entity.expenseCount !== 1 ? "s" : ""
                  }`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeMenu}
        onClick={(e) => e.stopPropagation()}
        PaperProps={{
          sx: {
            backgroundColor: "#1b1b1b",
            color: "white",
            border: "1px solid #333",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            minWidth: "150px",
            "& .MuiMenuItem-root": {
              fontSize: "14px",
              padding: "8px 16px",
              "&:hover": { backgroundColor: "#333" },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon
              fontSize="small"
              sx={{ color: menuEntity?.color || "#00dac6" }}
            />
          </ListItemIcon>
          <ListItemText primary="Edit" />
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: "#ff5252" }} />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      </Menu>
    </>
  );
};

export default FlowEntityCards;
