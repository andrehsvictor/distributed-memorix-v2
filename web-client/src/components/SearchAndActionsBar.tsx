import React from 'react';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Paper,
  alpha,
  Zoom,
} from '@mui/material';
import {
  Search,
  Refresh,
  Add,
} from '@mui/icons-material';

interface SearchAndActionsBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onCreateNew: () => void;
  isLoading?: boolean;
  createLabel?: string;
  showDebugActions?: boolean;
  onDebugAction?: () => void;
}

const SearchAndActionsBar: React.FC<SearchAndActionsBarProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  onCreateNew,
  isLoading = false,
  createLabel = 'Create',
  showDebugActions = false,
  onDebugAction,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha('#ffffff', 0.9)}, ${alpha('#f5f5f5', 0.6)})`,
        border: `1px solid ${alpha('#1976d2', 0.08)}`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', md: 'center' },
        }}
      >
        {/* Search Field */}
        <Box sx={{ flex: 1, maxWidth: { xs: '100%', md: 400 } }}>
          <TextField
            fullWidth
            placeholder="Search your decks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                bgcolor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha('#1976d2', 0.2),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha('#1976d2', 0.4),
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
              },
            }}
          />
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', md: 'flex-end' },
          }}
        >
          <Zoom in timeout={400}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={onRefresh}
              disabled={isLoading}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontWeight: 500,
                borderColor: alpha('#1976d2', 0.3),
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: alpha('#1976d2', 0.04),
                },
              }}
            >
              Refresh
            </Button>
          </Zoom>

          <Zoom in timeout={600}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onCreateNew}
              disabled={isLoading}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.35)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {createLabel}
            </Button>
          </Zoom>

          {showDebugActions && onDebugAction && (
            <Zoom in timeout={800}>
              <Button
                variant="outlined"
                onClick={onDebugAction}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  borderColor: 'warning.main',
                  color: 'warning.main',
                  '&:hover': {
                    borderColor: 'warning.dark',
                    bgcolor: alpha('#ff9800', 0.04),
                  },
                }}
              >
                Debug
              </Button>
            </Zoom>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default SearchAndActionsBar;