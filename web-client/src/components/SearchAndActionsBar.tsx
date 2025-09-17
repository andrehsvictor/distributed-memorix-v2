import React from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
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
    <>
      {/* Header */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: { xs: 2, sm: 0 },
      }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreateNew}
          size="large"
          sx={{ 
            minWidth: { xs: '100%', sm: 'auto' },
            alignSelf: { xs: 'stretch', sm: 'auto' }
          }}
          disabled={isLoading}
        >
          {createLabel}
        </Button>
      </Box>

      {/* Search and Actions */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2, 
        alignItems: { xs: 'stretch', sm: 'center' } 
      }}>
        <FormControl variant="outlined" sx={{ 
          flexGrow: 1, 
          maxWidth: { xs: '100%', sm: 400 } 
        }}>
          <InputLabel htmlFor="search-items">Search</InputLabel>
          <OutlinedInput
            id="search-items"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            }
            label="Search"
            disabled={isLoading}
          />
        </FormControl>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={onRefresh}
          sx={{ 
            minWidth: { xs: '100%', sm: 'auto' } 
          }}
          disabled={isLoading}
        >
          Refresh
        </Button>
        
        {/* Debug Actions - remove in production */}
        {showDebugActions && import.meta.env.DEV && onDebugAction && (
          <Button
            variant="outlined"
            color="warning"
            onClick={onDebugAction}
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' } 
            }}
            disabled={isLoading}
          >
            Test 503
          </Button>
        )}
      </Box>
    </>
  );
};

export default SearchAndActionsBar;