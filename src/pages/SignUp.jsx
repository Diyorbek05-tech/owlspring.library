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
  Loader,
  Stack
} from '@mantine/core';
import { IconEye, IconEyeOff, IconSun, IconMoon, IconHome, IconUser, IconPhone, IconBrandInstagram, IconBrandFacebook, IconBrandTelegram } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const SignUp = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '+998 ',
    password: '',
    instagram: '',
    facebook: '',
    telegram: ''
  });

  const formatPhone = (value) => {
    let numbers = value.replace(/\D/g, '');
    if (!numbers.startsWith('998')) {
      numbers = '998' + numbers;
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

  const handleInputChange = (field, value) => {
    if (field === 'phone') {
      value = formatPhone(value);
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) handleSignup();
  };

  const handleSignup = async () => {
    if (!formData.name || !formData.phone || !formData.password) {
      notifications.show({
        title: 'Xatolik',
        message: "Barcha majburiy maydonlarni to'ldiring",
        color: 'red',
        autoClose: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      
      const cleanPhone = '+' + formData.phone.replace(/\D/g, '');
      
      const requestBody = {
        user: {
          password: formData.password,
          name: formData.name,
          phone: cleanPhone
        },
        library: {
          address: null,
          social_media: {},
          can_rent_books: false,
          latitude: null,
          longitude: null
        }
      };

      if (formData.instagram) {
        requestBody.library.social_media.instagram = formData.instagram;
      }
      if (formData.facebook) {
        requestBody.library.social_media.facebook = formData.facebook;
      }
      if (formData.telegram) {
        requestBody.library.social_media.telegram = formData.telegram;
      }

      const response = await fetch(
        'https://org-ave-jimmy-learners.trycloudflare.com/api/v1/auth/register-library/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (response.ok) {
        notifications.show({
          title: 'Muvaffaqiyatli!',
          message: "Ro'yxatdan o'tdingiz. Yo'naltirilmoqdasiz...",
          color: 'green',
          autoClose: 2000,
        });

        localStorage.setItem('token', data.access);
        localStorage.setItem('refresh', data.refresh);
        localStorage.setItem('user', JSON.stringify(data.user || { phone: cleanPhone }));

        setTimeout(() => navigate('/kitoblar'), 2000);
      } else {
        notifications.show({
          title: 'Xatolik',
          message: data.detail || "Ro'yxatdan o'tishda xatolik",
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
          maxWidth: '500px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#fff',
              marginBottom: 8,
              textShadow: '0 4px 15px rgba(0,0,0,0.3)',
            }}
          >
            Kutubxonachi bo'lish
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
            Ro'yxatdan o'tish
          </Text>

          <Stack gap="md">
            <TextInput
              label="Ism"
              placeholder="Ismingizni kiriting"
              size="md"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              leftSection={<IconUser size={18} />}
              styles={{
                input: {
                  backgroundColor: isDark ? '#2a2a2a' : '#f8f8f8',
                  border: `1px solid ${isDark ? '#3a3a3a' : '#e0e0e0'}`,
                  color: isDark ? '#fff' : '#000',
                },
                label: { color: isDark ? '#fff' : '#000', marginBottom: 8 },
              }}
            />

            <TextInput
              label="Telefon raqami"
              placeholder="+998 __ ___ __ __"
              size="md"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              leftSection={<IconPhone size={18} />}
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
              placeholder="Parol kiriting"
              size="md"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.currentTarget.value)}
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

            <Text
              size="sm"
              style={{
                color: isDark ? '#b0b0b0' : '#666',
                marginTop: 8,
                marginBottom: 4,
              }}
            >
              Ijtimoiy tarmoqlar (ixtiyoriy)
            </Text>

            <TextInput
              placeholder="Instagram username"
              size="md"
              value={formData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              disabled={loading}
              leftSection={<IconBrandInstagram size={18} />}
              styles={{
                input: {
                  backgroundColor: isDark ? '#2a2a2a' : '#f8f8f8',
                  border: `1px solid ${isDark ? '#3a3a3a' : '#e0e0e0'}`,
                  color: isDark ? '#fff' : '#000',
                },
              }}
            />

            <TextInput
              placeholder="Facebook username"
              size="md"
              value={formData.facebook}
              onChange={(e) => handleInputChange('facebook', e.target.value)}
              disabled={loading}
              leftSection={<IconBrandFacebook size={18} />}
              styles={{
                input: {
                  backgroundColor: isDark ? '#2a2a2a' : '#f8f8f8',
                  border: `1px solid ${isDark ? '#3a3a3a' : '#e0e0e0'}`,
                  color: isDark ? '#fff' : '#000',
                },
              }}
            />

            <TextInput
              placeholder="Telegram username"
              size="md"
              value={formData.telegram}
              onChange={(e) => handleInputChange('telegram', e.target.value)}
              disabled={loading}
              leftSection={<IconBrandTelegram size={18} />}
              styles={{
                input: {
                  backgroundColor: isDark ? '#2a2a2a' : '#f8f8f8',
                  border: `1px solid ${isDark ? '#3a3a3a' : '#e0e0e0'}`,
                  color: isDark ? '#fff' : '#000',
                },
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
                marginTop: 16,
              }}
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <Group gap="xs">
                  <Loader size="xs" color="white" />
                  <span>Ro'yxatdan o'tmoqda...</span>
                </Group>
              ) : (
                "Ro'yxatdan o'tish"
              )}
            </Button>

            <Text
              style={{
                textAlign: 'center',
                marginTop: 12,
                color: isDark ? '#b0b0b0' : '#666',
                fontSize: 14,
              }}
            >
              Hisobingiz bormi?{' '}
              <Text
                component="span"
                style={{
                  color: '#0088cc',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
                onClick={() => navigate('/kutubxonachi')}
              >
                Kirish
              </Text>
            </Text>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default SignUp;