import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Menu as MenuIcon, Home, Style } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography
          variant={isMobile ? "h6" : "h5"}
          component="div"
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
          onClick={() => navigate('/')}
        >
          Memorix
        </Typography>

        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
          <Button
            color="inherit"
            startIcon={!isMobile ? <Home /> : undefined}
            onClick={() => navigate('/')}
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            size={isMobile ? 'small' : 'medium'}
          >
            {isMobile ? <Home /> : 'Decks'}
          </Button>
          <Button
            color="inherit"
            startIcon={!isMobile ? <Style /> : undefined}
            onClick={() => navigate('/cards')}
            variant={location.pathname === '/cards' ? 'outlined' : 'text'}
            size={isMobile ? 'small' : 'medium'}
          >
            {isMobile ? <Style /> : 'Cards'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;