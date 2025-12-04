import React from 'react';
import { Container, Group, Text, Stack, Anchor, useMantineColorScheme, Box, Divider } from '@mantine/core';
import { IconPhone, IconMail, IconMapPin, IconBrandFacebook, IconBrandInstagram, IconBrandYoutube } from '@tabler/icons-react';
import logo from '../assets/logo.png';

const Footer = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const footerLinks = [
    { label: 'Bosh sahifa', href: '/' },
    { label: 'Kutubxonalar', href: '/kutubxonalar' },
    { label: 'Kitoblar', href: '/kitoblar' },
    { label: 'Tadbirlar', href: '#' },
    { label: 'Biz haqimizda', href: '#' }
  ];

  return (
    <Box
      component="footer"
      bg={isDark ? 'dark.8' : 'gray.0'}
      style={{ borderTop: `1px solid ${isDark ? '#373a40' : '#e9ecef'}` }}
      pt={60}
      pb={30}
    >
      <Container size="xl">
        <Group justify="space-between" mb={50} grow>
          <Stack gap="md">
            <img src={logo} alt="Owlspring"  style={{ width: 70 }} />
            <Text size="sm" c="dimmed" maw={300}>
              O'zbekistonning eng yirik kutubxona tarmog'i. Biz bilan kitob o'qishni boshlang!
            </Text>
          </Stack>

          <Stack gap="md">
            <Text size="md" fw={600}>Tezkor havolalar</Text>
            <Stack gap="xs">
              {footerLinks.map((link) => (
                <Anchor
                  key={link.label}
                  href={link.href}
                  size="sm"
                  c="dimmed"
                  style={{ textDecoration: 'none' }}
                >
                  {link.label}
                </Anchor>
              ))}
            </Stack>
          </Stack>

          <Stack gap="md">
            <Text size="md" fw={600}>Bog'lanish</Text>
            <Stack gap="xs">
              <Group gap="xs">
                <IconPhone size={16} stroke={1.5} />
                <Text size="sm" c="dimmed">+998 90 123 45 67</Text>
              </Group>
              <Group gap="xs">
                <IconMail size={16} stroke={1.5} />
                <Text size="sm" c="dimmed">info@ezma.uz</Text>
              </Group>
              <Group gap="xs">
                <IconMapPin size={16} stroke={1.5} />
                <Text size="sm" c="dimmed">Toshkent shahri, Yunusobod tumani</Text>
              </Group>
            </Stack>
          </Stack>

          <Stack gap="md">
            <Text size="md" fw={600}>Ijtimoiy tarmoqlar</Text>
            <Group gap="md">
              <IconBrandFacebook size={20} style={{ cursor: 'pointer' }} stroke={1.5} />
              <IconBrandInstagram size={20} style={{ cursor: 'pointer' }} stroke={1.5} />
              <IconBrandYoutube size={20} style={{ cursor: 'pointer' }} stroke={1.5} />
            </Group>
          </Stack>
        </Group>

        <Divider my={30} />

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            © 2024 EZMA. Barcha huquqlar himoyalangan
          </Text>
          <Group gap="xl">
            <Anchor href="#" size="xs" c="dimmed" style={{ textDecoration: 'none' }}>
              Maxfiylik siyosati
            </Anchor>
            <Anchor href="#" size="xs" c="dimmed" style={{ textDecoration: 'none' }}>
              Foydalanish shartlari
            </Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  );
};

export default Footer;