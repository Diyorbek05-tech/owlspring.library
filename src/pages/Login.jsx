import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Group,
  useMantineColorScheme,
  ActionIcon,
  Loader
} from '@mantine/core';
import { IconEye, IconEyeOff, IconSun, IconMoon, IconHome } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const LoginPage = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const isDark = colorScheme === 'dark';
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const formatPhone = (value) => {
    let numbers = value.replace(/\D/g, '');
    if (!numbers.startsWith('998')) {
      numbers = '+998' + numbers;
    }
    numbers = numbers.slice(0, 12);
    const raw = numbers.slice(3);
    let result = '+998';
    if (raw.length > 0) result += ' ' + raw.slice(0, 2);
    if (raw.length > 2) result += ' ' + raw.slice(2, 5);
    if (raw.length > 5) result += ' ' + raw.slice(5, 7);
    if (raw.length > 7) result += ' ' + raw.slice(7, 9);
    return result;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) handleLogin();
  };

  const handleLogin = async () => {
    if (!phone || !password) {
      notifications.show({
        title: 'Xatolik',
        message: "Barcha maydonlarni to'ldiring",
        color: 'red',
        autoClose: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      
      const cleanPhone = '+' + phone.replace(/\D/g, '');
      
      const response = await fetch(
        'https://org-ave-jimmy-learners.trycloudflare.com/api/v1/auth/login/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            phone: cleanPhone,
            password: password
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Muvaffaqiyatli!',
          message: "Yo'naltirilmoqdasiz...",
          color: 'green',
          autoClose: 2000,
        });

        localStorage.setItem('token', data.access);
        localStorage.setItem('refresh', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user || { phone }));

        setTimeout(() => navigate('/kitoblar'), 2000);
      } else {
        notifications.show({
          title: 'Xatolik',
          message: data.detail || 'Login amalga oshmadi',
          color: 'red',
          autoClose: 3000,
        });
      }
    } catch (err) {
      notifications.show({
        title: 'Xatolik',
        message: 'Server bilan aloqada muammo',
        color: 'red',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundImage:
          'url(https://as2.ftcdn.net/jpg/09/16/06/87/1000_F_916068754_Zog1aUJEyx7TWrQ9iQUequx2eBOX29sh.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <Box
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <Container
        size="sm"
        style={{
          width: '100%',
          maxWidth: '400px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Text
            style={{
              fontSize: 48,
              marginBottom: 12,
              textShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}
          >
            📚
          </Text>
          <Text
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#fff',
              marginBottom: 8,
              textShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}
          >
            Xush kelibsiz!
          </Text>
        </Box>

        <Box
          style={{
            backgroundColor: isDark ? '#1a1a1a' : '#fff',
            borderRadius: 16,
            padding: 40,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Group justify="space-between" mb="lg">
            <ActionIcon
              onClick={() => navigate('/')}
              variant="subtle"
              size="lg"
              color={isDark ? 'white' : 'gray'}
            >
              <IconHome size={20} />
            </ActionIcon>
            <ActionIcon
              onClick={() => toggleColorScheme()}
              variant="subtle"
              size="lg"
              color={isDark ? 'yellow' : 'gray'}
            >
              {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>
          </Group>

          <Text
            style={{
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 24,
              color: isDark ? '#fff' : '#000',
              textAlign: 'center',
            }}
          >
            Kirish
          </Text>

          <TextInput
            label="Telefon raqami"
            placeholder="+998 __ ___ __ __"
            size="md"
            mb="lg"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            onKeyPress={handleKeyPress}
            disabled={loading}
            styles={{
              input: {
                backgroundColor: isDark ? '#2a2a2a' : '#f8f8f8',
                border: `1px solid ${isDark ? '#3a3a3a' : '#e0e0e0'}`,
                color: isDark ? '#fff' : '#000',
              },
              label: { color: isDark ? '#fff' : '#000', marginBottom: 8 },
            }}
          />

          <PasswordInput
            label="Parol"
            placeholder="Parol kiritish"
            size="md"
            mb="lg"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            visibilityToggleIcon={({ reveal, size }) =>
              reveal ? <IconEyeOff size={size} /> : <IconEye size={size} />
            }
            styles={{
              input: {
                backgroundColor: isDark ? '#2a2a2a' : '#f8f8f8',
                border: `1px solid ${isDark ? '#3a3a3a' : '#e0e0e0'}`,
                color: isDark ? '#fff' : '#000',
              },
              label: { color: isDark ? '#fff' : '#000', marginBottom: 8 },
            }}
          />

          <Button
            fullWidth
            size="lg"
            style={{
              backgroundColor: '#0088cc',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 8,
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Group gap="xs">
                <Loader size="xs" color="white" />
                <span>Kirilmoqda...</span>
              </Group>
            ) : (
              'Kirish'
            )}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;