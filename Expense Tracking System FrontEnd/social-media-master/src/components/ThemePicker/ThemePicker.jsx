import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tooltip,
  Switch,
  FormControlLabel,
  ButtonBase,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ComputerIcon from '@mui/icons-material/Computer';
import { useTheme } from '../../hooks/useTheme';

/**
 * ThemePicker Component
 * 
 * Allows users to select a color palette and toggle between light/dark modes.
 * Shows a visual preview of each available palette.
 */
const ThemePicker = ({ showModeToggle = true, compact = false }) => {
  const {
    mode,
    palette: currentPalette,
    availablePalettes,
    useSystemPreference,
    setMode,
    setPaletteId,
    toggle,
    setUseSystem,
  } = useTheme();

  const handlePaletteSelect = (paletteId) => {
    setPaletteId(paletteId);
  };

  const handleModeToggle = () => {
    toggle();
  };

  const handleSystemPreferenceToggle = (event) => {
    setUseSystem(event.target.checked);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Mode Toggle Section */}
      {showModeToggle && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
            Appearance
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {/* Light Mode Button */}
            <ButtonBase
              onClick={() => setMode('light')}
              disabled={useSystemPreference}
              sx={{
                p: 2,
                borderRadius: 2,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                border: '2px solid',
                borderColor: mode === 'light' && !useSystemPreference ? 'primary.main' : 'divider',
                backgroundColor: mode === 'light' && !useSystemPreference ? 'rgba(0,0,0,0.05)' : 'transparent',
                opacity: useSystemPreference ? 0.5 : 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: useSystemPreference ? 'divider' : 'primary.main',
                },
              }}
            >
              <LightModeIcon sx={{ fontSize: 28, color: 'text.primary' }} />
              <Typography variant="body2">Light</Typography>
            </ButtonBase>

            {/* Dark Mode Button */}
            <ButtonBase
              onClick={() => setMode('dark')}
              disabled={useSystemPreference}
              sx={{
                p: 2,
                borderRadius: 2,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                border: '2px solid',
                borderColor: mode === 'dark' && !useSystemPreference ? 'primary.main' : 'divider',
                backgroundColor: mode === 'dark' && !useSystemPreference ? 'rgba(255,255,255,0.05)' : 'transparent',
                opacity: useSystemPreference ? 0.5 : 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: useSystemPreference ? 'divider' : 'primary.main',
                },
              }}
            >
              <DarkModeIcon sx={{ fontSize: 28, color: 'text.primary' }} />
              <Typography variant="body2">Dark</Typography>
            </ButtonBase>

            {/* System Preference Button */}
            <ButtonBase
              onClick={() => setUseSystem(!useSystemPreference)}
              sx={{
                p: 2,
                borderRadius: 2,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                border: '2px solid',
                borderColor: useSystemPreference ? 'primary.main' : 'divider',
                backgroundColor: useSystemPreference ? 'rgba(0,0,0,0.05)' : 'transparent',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <ComputerIcon sx={{ fontSize: 28, color: 'text.primary' }} />
              <Typography variant="body2">System</Typography>
            </ButtonBase>
          </Box>
        </Box>
      )}

      {/* Color Palette Section */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 600 }}>
          Accent Color
        </Typography>
        
        <Grid container spacing={compact ? 1.5 : 2}>
          {availablePalettes.map((palette) => (
            <Grid item xs={compact ? 4 : 6} sm={compact ? 3 : 4} md={compact ? 2 : 3} key={palette.id}>
              <PaletteOption
                palette={palette}
                isSelected={currentPalette === palette.id}
                onClick={() => handlePaletteSelect(palette.id)}
                compact={compact}
                mode={mode}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

/**
 * Individual Palette Option Component
 */
const PaletteOption = ({ palette, isSelected, onClick, compact, mode }) => {
  const isDark = mode === 'dark';
  
  return (
    <Tooltip title={palette.description || palette.name} arrow placement="top">
      <Paper
        onClick={onClick}
        elevation={isSelected ? 4 : 1}
        sx={{
          cursor: 'pointer',
          borderRadius: 2,
          overflow: 'hidden',
          border: '2px solid',
          borderColor: isSelected ? palette.primary : 'transparent',
          transition: 'all 0.2s ease',
          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
          '&:hover': {
            borderColor: isSelected ? palette.primary : palette.primary + '66',
            transform: 'scale(1.02)',
          },
        }}
      >
        {/* Color Preview Bar */}
        <Box
          sx={{
            height: compact ? 32 : 40,
            display: 'flex',
            position: 'relative',
          }}
        >
          {/* Primary Color */}
          <Box
            sx={{
              flex: 2,
              backgroundColor: palette.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isSelected && (
              <CheckIcon
                sx={{
                  color: '#ffffff',
                  fontSize: compact ? 18 : 22,
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                }}
              />
            )}
          </Box>
          
          {/* Secondary Color */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: palette.secondary,
            }}
          />
          
          {/* Accent Color */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: palette.accent,
            }}
          />
        </Box>

        {/* Palette Name */}
        <Box
          sx={{
            p: compact ? 0.75 : 1,
            backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.9)',
          }}
        >
          <Typography
            variant={compact ? 'caption' : 'body2'}
            sx={{
              fontWeight: isSelected ? 600 : 400,
              textAlign: 'center',
              textTransform: 'capitalize',
              color: isSelected ? palette.primary : 'text.primary',
            }}
          >
            {palette.name}
          </Typography>
        </Box>
      </Paper>
    </Tooltip>
  );
};

export default ThemePicker;
