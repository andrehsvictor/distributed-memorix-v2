import React from 'react';
import type { ReactNode } from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%',
    }}>
      <Header />
      <Container
        maxWidth="xl"
        sx={{
          flexGrow: 1,
          py: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 2, md: 3 },
          width: '100%',
          maxWidth: '100% !important',
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default Layout;