import React from "react";
import { Group, Button, Box, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';

const Header = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const isDark = colorScheme === 'dark';

  const navLinks = [
    { to: "/", label: "Bosh sahifa" },
    { to: "/kitoblar", label: "Kitoblar" },
    { to: "/kutubxonalar", label: "Kutubxonalar" }
  ];

  return (
    <Box
      component="header"
      style={{
        height: "70px",
        padding: "0 48px",
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        alignItems: "center",
        transition: "0.3s"
      }}
      bg={isDark ? "dark.8" : "white"}
    >
      <Group style={{ width: "100%", justifyContent: "space-between" }}>
        <NavLink to="/" style={{ textDecoration: 'none' }}>
          <Group gap="sm">
            <img src={logo} alt="Logo" style={{  width: 68 }} />
            <span style={{ fontSize: 24, fontWeight: 700, color: isDark ? "#fff" : "#000" }}>
              Owlspring
            </span>
          </Group>
        </NavLink>

        <Group gap="lg">
          {navLinks.map((link) => (
            <NavLink 
              key={link.to}
              to={link.to} 
              style={{ textDecoration: 'none' }}
            >
              {({ isActive }) => (
                <Button 
                  variant="subtle"
                  color={isActive ? "blue" : "gray"}
                >
                  {link.label}
                </Button>
              )}
            </NavLink>
          ))}
        </Group>

        {/* Right Section */}
        <Group>
          <button
            onClick={() => toggleColorScheme()}
            style={{
              width: 50,
              height: 26,
              borderRadius: 13,
              border: "none",
              backgroundColor: isDark ? "#373a40" : "#e9ecef",
              position: "relative",
              cursor: "pointer",
              transition: "0.3s"
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: "#fff",
                position: "absolute",
                top: 3,
                left: isDark ? 27 : 3,
                transition: "0.3s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13
              }}
            >
              {isDark ? "🌙" : "☀️"}
            </div>
          </button>

          <NavLink to="/kutubxonachi" style={{ textDecoration: 'none' }}>
            <Button variant="filled" radius="md">Kutubxonachi bo'lish</Button>
          </NavLink>
        </Group>
      </Group>
    </Box>
  );
};

export default Header;