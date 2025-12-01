import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Close as CloseIcon,
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  RestartAlt as ResetIcon,
  Dashboard as DashboardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useTheme } from '../hooks/useTheme';

export default function DashboardCustomizationModal({
  open,
  onClose,
  sections,
  onToggleSection,
  onReorderSections,
  onResetLayout,
  onSaveLayout,
}) {
  const { colors, isDark } = useTheme();
  const [localSections, setLocalSections] = useState(sections);

  // Sync with parent sections when modal opens
  useEffect(() => {
    if (open) {
      setLocalSections(sections);
    }
  }, [open, sections]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Moving from available to active (or vice versa)
    if (source.droppableId !== destination.droppableId) {
      const sourceList = source.droppableId === 'available-sections' 
        ? localSections.filter(s => !s.visible)
        : localSections.filter(s => s.visible);
      
      const destList = destination.droppableId === 'available-sections'
        ? localSections.filter(s => !s.visible)
        : localSections.filter(s => s.visible);

      const movedSection = sourceList[source.index];
      
      // Toggle visibility
      setLocalSections(current =>
        current.map(section =>
          section.id === movedSection.id
            ? { ...section, visible: !section.visible }
            : section
        )
      );
    } else {
      // Reordering within active sections
      if (destination.droppableId === 'active-sections') {
        const activeSections = localSections.filter(s => s.visible);
        const inactiveSections = localSections.filter(s => !s.visible);
        
        const [reorderedItem] = activeSections.splice(source.index, 1);
        activeSections.splice(destination.index, 0, reorderedItem);
        
        // Combine back
        setLocalSections([...activeSections, ...inactiveSections]);
      }
    }
  };

  const handleToggle = (sectionId) => {
    setLocalSections(current =>
      current.map(section =>
        section.id === sectionId
          ? { ...section, visible: !section.visible }
          : section
      )
    );
  };

  const handleSave = () => {
    onSaveLayout(localSections);
    onClose();
  };

  const handleReset = () => {
    onResetLayout();
    onClose();
  };

  const getSectionIcon = (type) => {
    switch (type) {
      case 'full':
        return '▬';
      case 'half':
        return '▬▬';
      case 'bottom':
        return '▭';
      default:
        return '■';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          backgroundColor: colors.cardBackground || colors.secondary_bg,
          color: colors.primary_text,
          borderRadius: 4,
          border: `1px solid ${colors.border_color}`,
          boxShadow: isDark 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          backgroundImage: isDark
            ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.03) 0%, rgba(6, 182, 212, 0.03) 100%)'
            : 'linear-gradient(135deg, rgba(20, 184, 166, 0.02) 0%, rgba(6, 182, 212, 0.02) 100%)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pb: 2.5,
          pt: 3,
          px: 3,
          borderBottom: `1px solid ${colors.border_color}`,
          background: isDark
            ? 'linear-gradient(180deg, rgba(20, 184, 166, 0.05) 0%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(20, 184, 166, 0.03) 0%, transparent 100%)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              background: isDark
                ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)'
                : 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${isDark ? 'rgba(20, 184, 166, 0.3)' : 'rgba(20, 184, 166, 0.2)'}`,
            }}
          >
            <DashboardIcon sx={{ color: '#14b8a6', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography 
              variant="h5" 
              fontWeight="700"
              sx={{
                color: colors.primary_text,
                mb: 0.5,
              }}
            >
              Customize Dashboard
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: colors.secondary_text,
                fontWeight: 400,
                letterSpacing: 0.2,
              }}
            >
              Drag sections between columns • Reorder active sections
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Close" arrow placement="left">
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: colors.secondary_text,
              width: 36,
              height: 36,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              '&:hover': { 
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                color: colors.primary_text,
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent sx={{ py: 3, px: 3 }}>
        {/* Statistics Row */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
            label={`${localSections.filter(s => s.visible).length} Active`}
            size="small"
            sx={{
              backgroundColor: isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(34, 197, 94, 0.12)',
              color: isDark ? '#4ade80' : '#16a34a',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 28,
              border: `1px solid ${isDark ? 'rgba(74, 222, 128, 0.3)' : 'rgba(34, 197, 94, 0.2)'}`,
              '& .MuiChip-icon': {
                color: isDark ? '#4ade80' : '#16a34a',
              },
            }}
          />
          <Chip
            icon={<VisibilityOffIcon sx={{ fontSize: 16 }} />}
            label={`${localSections.filter(s => !s.visible).length} Available`}
            size="small"
            sx={{
              backgroundColor: isDark ? 'rgba(156, 163, 175, 0.15)' : 'rgba(107, 114, 128, 0.12)',
              color: isDark ? '#9ca3af' : '#6b7280',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 28,
              border: `1px solid ${isDark ? 'rgba(156, 163, 175, 0.3)' : 'rgba(107, 114, 128, 0.2)'}`,
              '& .MuiChip-icon': {
                color: isDark ? '#9ca3af' : '#6b7280',
              },
            }}
          />
        </Box>

        {/* Two Column Layout */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Box sx={{ display: 'flex', gap: 3, minHeight: 400 }}>
            {/* LEFT: Available Sections */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ 
                mb: 2, 
                pb: 1.5,
                borderBottom: `2px solid ${colors.border_color}`,
              }}>
                <Typography 
                  variant="subtitle2" 
                  fontWeight="700"
                  sx={{ 
                    color: colors.primary_text,
                    fontSize: '0.9rem',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}
                >
                  📦 Available Sections
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: colors.secondary_text,
                    fontSize: '0.7rem',
                  }}
                >
                  Drag sections to the right to activate
                </Typography>
              </Box>

              <Droppable droppableId="available-sections">
                {(provided, snapshot) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      maxHeight: 450,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      pr: 1,
                      backgroundColor: snapshot.isDraggingOver
                        ? isDark ? 'rgba(156, 163, 175, 0.08)' : 'rgba(156, 163, 175, 0.05)'
                        : 'transparent',
                      borderRadius: 3,
                      padding: snapshot.isDraggingOver ? 2 : 1,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: snapshot.isDraggingOver 
                        ? `2px dashed ${isDark ? 'rgba(156, 163, 175, 0.4)' : 'rgba(156, 163, 175, 0.3)'}`
                        : '2px dashed transparent',
                      minHeight: 100,
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: isDark ? 'rgba(156, 163, 175, 0.3)' : 'rgba(156, 163, 175, 0.4)',
                        borderRadius: '4px',
                        '&:hover': {
                          backgroundColor: isDark ? 'rgba(156, 163, 175, 0.5)' : 'rgba(156, 163, 175, 0.6)',
                        },
                      },
                    }}
                  >
                    {localSections.filter(s => !s.visible).length === 0 ? (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        color: colors.secondary_text,
                      }}>
                        <VisibilityIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                        <Typography variant="body2">All sections are active!</Typography>
                      </Box>
                    ) : (
                      localSections.filter(s => !s.visible).map((section, index) => (
                        <Draggable
                          key={section.id}
                          draggableId={section.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                padding: '12px 14px',
                                backgroundColor: snapshot.isDragging
                                  ? isDark ? 'rgba(156, 163, 175, 0.12)' : 'rgba(156, 163, 175, 0.08)'
                                  : colors.cardBackground || colors.secondary_bg,
                                border: `1.5px solid ${
                                  snapshot.isDragging
                                    ? isDark ? '#9ca3af' : '#6b7280'
                                    : isDark ? 'rgba(156, 163, 175, 0.2)' : 'rgba(156, 163, 175, 0.15)'
                                }`,
                                borderRadius: 2,
                                cursor: 'grab',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: 0.8,
                                boxShadow: snapshot.isDragging
                                  ? isDark 
                                    ? '0 8px 16px -4px rgba(0, 0, 0, 0.4)'
                                    : '0 8px 16px -4px rgba(0, 0, 0, 0.2)'
                                  : 'none',
                                transform: snapshot.isDragging ? 'scale(1.02)' : 'scale(1)',
                                '&:hover': {
                                  opacity: 1,
                                  transform: 'translateX(4px)',
                                  borderColor: isDark ? '#9ca3af' : '#6b7280',
                                },
                                '&:active': {
                                  cursor: 'grabbing',
                                },
                              }}
                            >
                              <DragIcon 
                                fontSize="small" 
                                sx={{ color: colors.secondary_text }} 
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  fontWeight="600"
                                  sx={{
                                    color: colors.secondary_text,
                                    fontSize: '0.85rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {section.name}
                                </Typography>
                              </Box>
                              <Chip
                                label={
                                  section.type === 'full' ? 'Full' :
                                  section.type === 'half' ? 'Half' : 
                                  'Bottom'
                                }
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.6rem',
                                  fontWeight: 600,
                                  backgroundColor: isDark 
                                    ? 'rgba(99, 102, 241, 0.12)' 
                                    : 'rgba(99, 102, 241, 0.08)',
                                  color: isDark ? '#a5b4fc' : '#6366f1',
                                  '& .MuiChip-label': {
                                    px: 0.8,
                                  },
                                }}
                              />
                            </Box>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Box>

            {/* CENTER: Arrow Indicator */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.secondary_text,
              fontSize: '2rem',
              opacity: 0.3,
            }}>
              →
            </Box>

            {/* RIGHT: Active Sections */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ 
                mb: 2, 
                pb: 1.5,
                borderBottom: `2px solid ${isDark ? 'rgba(20, 184, 166, 0.4)' : 'rgba(20, 184, 166, 0.3)'}`,
              }}>
                <Typography 
                  variant="subtitle2" 
                  fontWeight="700"
                  sx={{ 
                    color: isDark ? '#14b8a6' : '#0d9488',
                    fontSize: '0.9rem',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}
                >
                  ✓ Active Sections
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: colors.secondary_text,
                    fontSize: '0.7rem',
                  }}
                >
                  Reorder by dragging • Remove by dragging left
                </Typography>
              </Box>

              <Droppable droppableId="active-sections">
                {(provided, snapshot) => (
                  <Box
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      maxHeight: 450,
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      pr: 1,
                      backgroundColor: snapshot.isDraggingOver
                        ? isDark ? 'rgba(20, 184, 166, 0.08)' : 'rgba(20, 184, 166, 0.05)'
                        : 'transparent',
                      borderRadius: 3,
                      padding: snapshot.isDraggingOver ? 2 : 1,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: snapshot.isDraggingOver 
                        ? `2px dashed ${isDark ? 'rgba(20, 184, 166, 0.4)' : 'rgba(20, 184, 166, 0.3)'}`
                        : '2px dashed transparent',
                      minHeight: 100,
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: isDark ? 'rgba(20, 184, 166, 0.3)' : 'rgba(20, 184, 166, 0.4)',
                        borderRadius: '4px',
                        '&:hover': {
                          backgroundColor: isDark ? 'rgba(20, 184, 166, 0.5)' : 'rgba(20, 184, 166, 0.6)',
                        },
                      },
                    }}
                  >
                    {localSections.filter(s => s.visible).length === 0 ? (
                      <Box sx={{ 
                        textAlign: 'center', 
                        py: 6,
                        color: colors.secondary_text,
                      }}>
                        <VisibilityOffIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                        <Typography variant="body2">Drag sections here to activate</Typography>
                      </Box>
                    ) : (
                      localSections.filter(s => s.visible).map((section, index) => (
                        <Draggable
                          key={section.id}
                          draggableId={section.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <Box
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                padding: '12px 14px',
                                backgroundColor: snapshot.isDragging
                                  ? isDark ? 'rgba(20, 184, 166, 0.12)' : 'rgba(20, 184, 166, 0.08)'
                                  : colors.cardBackground || colors.secondary_bg,
                                border: `1.5px solid ${
                                  snapshot.isDragging
                                    ? '#14b8a6'
                                    : isDark ? 'rgba(20, 184, 166, 0.3)' : 'rgba(20, 184, 166, 0.25)'
                                }`,
                                borderRadius: 2,
                                cursor: 'grab',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: snapshot.isDragging
                                  ? isDark 
                                    ? '0 8px 16px -4px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(20, 184, 166, 0.3)'
                                    : '0 8px 16px -4px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(20, 184, 166, 0.2)'
                                  : 'none',
                                transform: snapshot.isDragging ? 'scale(1.02)' : 'scale(1)',
                                '&:hover': {
                                  transform: 'translateX(-4px)',
                                  borderColor: '#14b8a6',
                                  boxShadow: isDark
                                    ? '0 4px 12px -2px rgba(0, 0, 0, 0.2)'
                                    : '0 4px 12px -2px rgba(0, 0, 0, 0.1)',
                                },
                                '&:active': {
                                  cursor: 'grabbing',
                                },
                              }}
                            >
                              <DragIcon 
                                fontSize="small" 
                                sx={{ color: '#14b8a6' }} 
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  fontWeight="600"
                                  sx={{
                                    color: colors.primary_text,
                                    fontSize: '0.85rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                  }}
                                >
                                  {section.name}
                                </Typography>
                              </Box>
                              <Chip
                                label={
                                  section.type === 'full' ? 'Full' :
                                  section.type === 'half' ? 'Half' : 
                                  'Bottom'
                                }
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.6rem',
                                  fontWeight: 600,
                                  backgroundColor: isDark 
                                    ? 'rgba(99, 102, 241, 0.15)' 
                                    : 'rgba(99, 102, 241, 0.1)',
                                  color: isDark ? '#a5b4fc' : '#6366f1',
                                  '& .MuiChip-label': {
                                    px: 0.8,
                                  },
                                }}
                              />
                              <VisibilityIcon 
                                fontSize="small" 
                                sx={{ 
                                  color: isDark ? '#4ade80' : '#16a34a',
                                  fontSize: 18,
                                }} 
                              />
                            </Box>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Box>
          </Box>
        </DragDropContext>
      </DialogContent>

      <Divider sx={{ borderColor: colors.border_color }} />

      <DialogActions 
        sx={{ 
          p: 3, 
          gap: 1.5,
          background: isDark
            ? 'linear-gradient(180deg, transparent 0%, rgba(20, 184, 166, 0.03) 100%)'
            : 'linear-gradient(180deg, transparent 0%, rgba(20, 184, 166, 0.02) 100%)',
        }}
      >
        <Tooltip title="Restore default layout" arrow>
          <Button
            variant="outlined"
            startIcon={<ResetIcon />}
            onClick={handleReset}
            sx={{
              color: colors.secondary_text,
              borderColor: isDark ? 'rgba(156, 163, 175, 0.3)' : 'rgba(107, 114, 128, 0.2)',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                borderColor: isDark ? 'rgba(248, 113, 113, 0.5)' : 'rgba(239, 68, 68, 0.4)',
                backgroundColor: isDark ? 'rgba(248, 113, 113, 0.1)' : 'rgba(239, 68, 68, 0.08)',
                color: isDark ? '#f87171' : '#dc2626',
              },
            }}
          >
            Reset to Default
          </Button>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            color: colors.secondary_text,
            borderColor: colors.border_color,
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 2,
            '&:hover': {
              borderColor: colors.secondary_text,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<CheckCircleIcon />}
          sx={{
            background: 'linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 700,
            px: 3.5,
            py: 1,
            borderRadius: 2,
            boxShadow: isDark
              ? '0 4px 12px -2px rgba(20, 184, 166, 0.4)'
              : '0 4px 12px -2px rgba(20, 184, 166, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0d9488 0%, #06748c 100%)',
              boxShadow: isDark
                ? '0 6px 16px -4px rgba(20, 184, 166, 0.5)'
                : '0 6px 16px -4px rgba(20, 184, 166, 0.4)',
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          Save Layout
        </Button>
      </DialogActions>
    </Dialog>
  );
}
