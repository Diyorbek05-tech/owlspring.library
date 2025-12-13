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

    if (formData.password.length < 6) {
      notifications.show({
        title: 'Xatolik',
        message: "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
        color: 'red',
        autoClose: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      
      const socialMedia = {};
      if (formData.instagram?.trim()) socialMedia.instagram = formData.instagram.trim();
      if (formData.facebook?.trim()) socialMedia.facebook = formData.facebook.trim();
      if (formData.telegram?.trim()) socialMedia.telegram = formData.telegram.trim();

      const requestBody = {
        user: {
          password: formData.password,
          name: formData.name.trim(),
          phone: formData.phone.replace(/\s/g, '')
        },
        library: {
          address: "Not specified",
          social_media: Object.keys(socialMedia).length > 0 ? socialMedia : {},
          can_rent_books: false,
          latitude: "0",
          longitude: "0"
        }
      };

      const API_URL = 'https://org-ave-jimmy-learners.trycloudflare.com/api/v1/auth/register-library/';
      
      console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      console.log('📥 Response:', JSON.stringify(data, null, 2));

      if (response.ok) {
        notifications.show({
          title: 'Muvaffaqiyatli!',
          message: "Ro'yxatdan o'tdingiz. Yo'naltirilmoqdasiz...",
          color: 'green',
          autoClose: 2000,
        });

        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', 'authenticated_' + data.id);

        setTimeout(() => navigate('/kutubxonalar'), 2000);
      } else {
        let errorMessage = "Ro'yxatdan o'tishda xatolik";
        
        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.user) {
          const userErrors = Object.entries(data.user)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          errorMessage = userErrors;
        } else if (data.library) {
          const libraryErrors = Object.entries(data.library)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          errorMessage = libraryErrors;
        } else if (typeof data === 'object') {
          errorMessage = JSON.stringify(data);
        }

        notifications.show({
          title: 'Xatolik',
          message: errorMessage,
          color: 'red',
          autoClose: 5000,
        });
      }
    } catch (err) {
      notifications.show({
        title: 'Xatolik',
        message: 'Server bilan aloqada muammo: ' + err.message,
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
        position: 'fixed',
        inset: 0,
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
        zIndex: 9999,
      }}
    >
      <Box
        style={{
          position: 'absolute',
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
            padding: 24,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Group justify="space-between" mb="sm">
            <ActionIcon
              onClick={() => navigate('/')}
              variant="subtle"
              size="md"
              color={isDark ? 'white' : 'gray'}
            >
              <IconHome size={18} />
            </ActionIcon>
            <ActionIcon
              onClick={() => toggleColorScheme()}
              variant="subtle"
              size="md"
              color={isDark ? 'yellow' : 'gray'}
            >
              {isDark ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Group>

          <Text
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 16,
              color: isDark ? '#fff' : '#000',
              textAlign: 'center',
            }}
          >
            Ro'yxatdan o'tish
          </Text>

          <Stack gap="sm">
            <TextInput
              label="Ism"
              placeholder="Ismingizni kiriting"
              size="sm"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              leftSection={<IconUser size={16} />}
              styles={{
                input: {
                  backgroundColor: isDark ? '#2a2a2a' : '#f8f8f8',
                  border: `1px solid ${isDark ? '#3a3a3a' : '#e0e0e0'}`,
                  color: isDark ? '#fff' : '#000',
                },
                label: { color: isDark ? '#fff' : '#000', marginBottom: 4, fontSize: 12 },
              }}
            />

            <TextInput
              label="Telefon raqami"
              placeholder="+998 __ ___ __ __"
              size="sm"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              leftSection={<IconPhone size={16} />}
              styles={{
                input: {
                  backgroundColor: isDark ? '#2a2a2a' : '#f8f8f8',
                  border: `1px solid ${isDark ? '#3a3a3a' : '#e0e0e0'}`,
                  color: isDark ? '#fff' : '#000',
                },
                label: { color: isDark ? '#fff' : '#000', marginBottom: 4, fontSize: 12 },
              }}
            />

            <PasswordInput
              label="Parol"
              placeholder="Parol kiriting (kamida 6 ta belgi)"
              size="sm"
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
                label: { color: isDark ? '#fff' : '#000', marginBottom: 4, fontSize: 12 },
              }}
            />

            <Text
              size="xs"
              style={{
                color: isDark ? '#b0b0b0' : '#666',
                marginTop: 4,
                marginBottom: 2,
              }}
            >
              Ijtimoiy tarmoqlar
            </Text>

            <TextInput
              placeholder="Instagram username"
              size="sm"
              value={formData.instagram}
              onChange={(e) => handleInputChange('instagram', e.target.value)}
              disabled={loading}
              leftSection={<IconBrandInstagram size={16} />}
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
              size="sm"
              value={formData.facebook}
              onChange={(e) => handleInputChange('facebook', e.target.value)}
              disabled={loading}
              leftSection={<IconBrandFacebook size={16} />}
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
              size="sm"
              value={formData.telegram}
              onChange={(e) => handleInputChange('telegram', e.target.value)}
              disabled={loading}
              leftSection={<IconBrandTelegram size={16} />}
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
              size="sm"
              style={{
                backgroundColor: '#0088cc',
                color: '#fff',
                fontWeight: 700,
                borderRadius: 8,
                marginTop: 8,
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
                marginTop: 8,
                color: isDark ? '#b0b0b0' : '#666',
                fontSize: 12,
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