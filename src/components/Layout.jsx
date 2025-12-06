import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './header';
import Footer from './footer';
import { Outlet } from 'react-router-dom';
import { Box, Container, useMantineColorScheme } from '@mantine/core';

const Layout = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/kutubxonachi';

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
      bg={isDark ? 'dark.9' : 'gray.1'}
      c={isDark ? 'gray.1' : 'gray.9'}
    >
      <Header />
      
      <Box
        component="main"
        style={{ flex: 1 }}
        p="md"
      >
        <Container size="xl">
          <Outlet />
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout;