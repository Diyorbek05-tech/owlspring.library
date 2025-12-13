import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Avatar, 
  Group, 
  Text, 
  Stack, 
  Tabs,
  Box,
  Loader,
  Alert,
  Button,
  ActionIcon,
  Paper,
  Title,
  Badge,
  useMantineColorScheme
} from '@mantine/core';
import { 
  IconBook, 
  IconShare, 
  IconMapPin, 
  IconPhone,
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandTelegram,
  IconSettings,
  IconAlertCircle,
  IconHome
} from '@tabler/icons-react';
import { YMaps, Map, Placemark, ZoomControl, FullscreenControl } from 'react-yandex-maps';

const ProfileContent = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('xarita');
  
  const [mapCenter, setMapCenter] = useState([41.2995, 69.2401]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (!token) {
        setError('Token topilmadi. Iltimos qayta login qiling.');
        setLoading(false);
        return;
      }

      const response = await fetch(
        'https://org-ave-jimmy-learners.trycloudflare.com/api/v1/auth/profile/',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessiya tugagan. Iltimos qayta login qiling.');
        }
        throw new Error(`HTTP xato: ${response.status}`);
      }

      const data = await response.json();
      console.log('API\'dan olingan ma\'lumot:', data);
      
      setProfileData(data);
      
      if (data.latitude && data.longitude) {
        const center = [parseFloat(data.latitude), parseFloat(data.longitude)];
        setMapCenter(center);
        setSelectedLocation(center);
      }
      
      try {
        localStorage.setItem('userData', JSON.stringify(data));
      } catch (e) {
        console.log('Ma\'lumotni saqlashda xatolik:', e);
      }

    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Profil ma\'lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = async (e) => {
    const coords = e.get('coords');
    setMapCenter(coords);
    setSelectedLocation(coords);
    setLocationLoading(true);
    
    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=bc32072f-a50d-4f7e-b22c-a4b70bba1202&geocode=${coords[1]},${coords[0]}&format=json&lang=uz_UZ`
      );
      const data = await response.json();
      
      const geoObject = data.response.GeoObjectCollection.featureMember[0];
      if (geoObject) {
        const name = geoObject.GeoObject.name;
        const description = geoObject.GeoObject.description;
        setLocationName(`${name}${description ? ', ' + description : ''}`);
      } else {
        setLocationName('Joy nomi topilmadi');
      }
    } catch (error) {
      console.error('Xatolik:', error);
      setLocationName('Joy nomini olishda xatolik');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleBookRentalToggle = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const newValue = !profileData.can_rent_books;
      
      const response = await fetch(
        'https://org-ave-jimmy-learners.trycloudflare.com/api/v1/auth/profile/',
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ can_rent_books: newValue })
        }
      );

      if (response.ok) {
        const updatedData = await response.json();
        setProfileData(updatedData);
        
        try {
          localStorage.setItem('userData', JSON.stringify(updatedData));
        } catch (e) {
          console.log('Ma\'lumotni saqlashda xatolik:', e);
        }
      }
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const getUserName = () => {
    if (!profileData?.user) return 'Foydalanuvchi';
    return profileData.user.name || profileData.user.phone || 'Foydalanuvchi';
  };

  const getUserInitial = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <Box 
        style={{ 
          minHeight: 'calc(100vh - 80px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: isDark ? '#141414' : '#f8f9fa'
        }}
      >
        <Stack align="center" gap="md">
          <Loader size="lg" color="cyan" />
          <Text size="lg" c={isDark ? '#fff' : 'dimmed'}>Yuklanmoqda...</Text>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        style={{ 
          minHeight: 'calc(100vh - 80px)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: isDark ? '#141414' : '#f8f9fa'
        }} 
        p="md"
      >
        <Container size="sm">
          <Alert 
            icon={<IconAlertCircle size={24} />} 
            title="Xatolik!" 
            color="red"
            variant="filled"
          >
            <Text mb="md">{error}</Text>
            <Button 
              onClick={fetchProfile} 
              color="white" 
              variant="outline"
              fullWidth
            >
              Qayta urinish
            </Button>
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!profileData) {
    return null;
  }

  return (
    <Box 
      style={{ 
        minHeight: 'calc(100vh - 80px)',
        backgroundColor: isDark ? '#141414' : '#f8f9fa',
        transition: 'background-color 0.3s ease'
      }} 
      py={0}
      px={0}
    >
      <Container size="lg" px="md" py="xl">
        <Stack gap="lg">
    
          <Card 
            shadow="sm" 
            padding="xl" 
            radius="md" 
            withBorder
            style={{
              backgroundColor: isDark ? '#25262b' : '#ffffff',
              borderColor: isDark ? '#373A40' : '#dee2e6',
              transition: 'all 0.3s ease'
            }}
          >
            <Group wrap="nowrap" gap="xl" align="flex-start">
              <Avatar
                size={120}
                radius="md"
                src={profileData.image}
                alt={getUserName()}
                styles={{
                  root: {
                    background: 'linear-gradient(135deg, #00BCD4, #0097A7)',
                    flexShrink: 0
                  }
                }}
              >
                {!profileData.image && <Text size="2.5rem" fw={700} c="white">{getUserInitial()}</Text>}
              </Avatar>

              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group gap="sm" mb="md" wrap="wrap">
                  <Title 
                    order={2} 
                    size="h1" 
                    style={{ 
                      margin: 0,
                      color: isDark ? '#fff' : '#000'
                    }}
                  >
                    {getUserName()}
                  </Title>
                  <ActionIcon variant="subtle" color="cyan" size="md">
                    <IconSettings size={20} />
                  </ActionIcon>
                </Group>

                <Stack gap="sm">
                  <Group gap="sm" wrap="nowrap">
                    <IconPhone size={18} color="#00BCD4" style={{ flexShrink: 0 }} />
                    <Text 
                      size="sm" 
                      c={isDark ? '#909296' : 'dimmed'} 
                      style={{ wordBreak: 'break-all' }}
                    >
                      {profileData.user?.phone || 'Telefon kiritilmagan'}
                    </Text>
                  </Group>

                  <Group gap="sm" wrap="nowrap">
                    <IconHome size={18} color="#00BCD4" style={{ flexShrink: 0 }} />
                    <Text 
                      size="sm" 
                      c={isDark ? '#909296' : 'dimmed'} 
                      lineClamp={2}
                    >
                      {profileData.address || 'Manzil kiritilmagan'}
                    </Text>
                  </Group>

                  <Box mt="sm">
                    <Paper 
                      p="sm" 
                      radius="md" 
                      withBorder
                      style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: isDark ? '#2C2E33' : '#f8f9fa',
                        borderColor: isDark ? '#373A40' : '#dee2e6'
                      }}
                    >
                      <IconBook size={16} color="#00BCD4" />
                      <Text 
                        size="xs" 
                        fw={500}
                        c={isDark ? '#fff' : '#000'}
                      >
                        Kitob ijarasi mavjud
                      </Text>
                      <Box
                        style={{
                          width: 40,
                          height: 20,
                          borderRadius: 20,
                          backgroundColor: profileData.can_rent_books ? '#00BCD4' : '#ced4da',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s'
                        }}
                        onClick={handleBookRentalToggle}
                      >
                        <Box
                          style={{
                            position: 'absolute',
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            top: 2,
                            left: profileData.can_rent_books ? 22 : 2,
                            transition: 'left 0.3s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        />
                      </Box>
                    </Paper>
                  </Box>
                </Stack>
              </Box>
            </Group>
          </Card>

          <Card 
            shadow="sm" 
            padding={0} 
            radius="md" 
            withBorder
            style={{
              backgroundColor: isDark ? '#25262b' : '#ffffff',
              borderColor: isDark ? '#373A40' : '#dee2e6',
              transition: 'all 0.3s ease'
            }}
          >
            <Tabs value={activeTab} onChange={setActiveTab} variant="default">
              <Tabs.List 
                grow
                style={{
                  backgroundColor: isDark ? '#25262b' : '#ffffff'
                }}
              >
                <Tabs.Tab 
                  value="kitoblarim" 
                  leftSection={<IconBook size={18} />}
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '12px 16px',
                    color: isDark ? '#C1C2C5' : '#495057'
                  }}
                >
                  Kitoblarim
                </Tabs.Tab>
                <Tabs.Tab 
                  value="tarmoqlarim" 
                  leftSection={<IconShare size={18} />}
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '12px 16px',
                    color: isDark ? '#C1C2C5' : '#495057'
                  }}
                >
                  Tarmoqlarim
                </Tabs.Tab>
                <Tabs.Tab 
                  value="xarita" 
                  leftSection={<IconMapPin size={18} />}
                  style={{ 
                    fontSize: '0.9rem', 
                    padding: '12px 16px',
                    color: isDark ? '#C1C2C5' : '#495057'
                  }}
                >
                  Xarita
                </Tabs.Tab>
              </Tabs.List>

              <Box p="lg">
             
                <Tabs.Panel value="kitoblarim">
                  <Stack align="center" gap="lg" py="xl">
                    <Box
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        backgroundColor: isDark ? '#2C2E33' : '#e7f5ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <IconBook size={40} color="#00BCD4" />
                    </Box>
                    <Title 
                      order={3} 
                      ta="center"
                      c={isDark ? '#fff' : '#000'}
                    >
                      Kitoblar ro'yxati
                    </Title>
                    <Text 
                      c={isDark ? '#909296' : 'dimmed'} 
                      ta="center" 
                      maw={400}
                    >
                      Bu bo'limda sizning kitoblaringiz ko'rsatiladi
                    </Text>
                  </Stack>
                </Tabs.Panel>

               
                <Tabs.Panel value="tarmoqlarim">
                  <Stack gap="md">
                    <Title 
                      order={3} 
                      mb="xs"
                      c={isDark ? '#fff' : '#000'}
                    >
                      Ijtimoiy tarmoqlar
                    </Title>
                    
                    {profileData.social_media?.instagram && (
                      <Paper 
                        component="a"
                        href={`https://instagram.com/${profileData.social_media.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        p="md"
                        radius="md"
                        withBorder
                        style={{ 
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          display: 'block',
                          backgroundColor: isDark ? '#2C2E33' : '#ffffff',
                          borderColor: isDark ? '#373A40' : '#dee2e6'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(4px)';
                          e.currentTarget.style.borderColor = '#E1306C';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.borderColor = isDark ? '#373A40' : '#dee2e6';
                        }}
                      >
                        <Group gap="md" wrap="nowrap">
                          <Box
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <IconBrandInstagram size={24} color="white" />
                          </Box>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text 
                              size="xs" 
                              c={isDark ? '#909296' : 'dimmed'} 
                              mb={2}
                            >
                              Instagram
                            </Text>
                            <Text 
                              size="sm" 
                              fw={500} 
                              style={{ 
                                wordBreak: 'break-all',
                                color: isDark ? '#fff' : '#000'
                              }}
                            >
                              @{profileData.social_media.instagram}
                            </Text>
                          </Box>
                        </Group>
                      </Paper>
                    )}

                    {profileData.social_media?.facebook && (
                      <Paper 
                        component="a"
                        href={`https://facebook.com/${profileData.social_media.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        p="md"
                        radius="md"
                        withBorder
                        style={{ 
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          display: 'block',
                          backgroundColor: isDark ? '#2C2E33' : '#ffffff',
                          borderColor: isDark ? '#373A40' : '#dee2e6'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(4px)';
                          e.currentTarget.style.borderColor = '#1877F2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.borderColor = isDark ? '#373A40' : '#dee2e6';
                        }}
                      >
                        <Group gap="md" wrap="nowrap">
                          <Box
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              backgroundColor: '#1877F2',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <IconBrandFacebook size={24} color="white" />
                          </Box>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text 
                              size="xs" 
                              c={isDark ? '#909296' : 'dimmed'} 
                              mb={2}
                            >
                              Facebook
                            </Text>
                            <Text 
                              size="sm" 
                              fw={500} 
                              style={{ 
                                wordBreak: 'break-all',
                                color: isDark ? '#fff' : '#000'
                              }}
                            >
                              {profileData.social_media.facebook}
                            </Text>
                          </Box>
                        </Group>
                      </Paper>
                    )}

                    {profileData.social_media?.telegram && (
                      <Paper 
                        component="a"
                        href={`https://t.me/${profileData.social_media.telegram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        p="md"
                        radius="md"
                        withBorder
                        style={{ 
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          display: 'block',
                          backgroundColor: isDark ? '#2C2E33' : '#ffffff',
                          borderColor: isDark ? '#373A40' : '#dee2e6'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(4px)';
                          e.currentTarget.style.borderColor = '#0088cc';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.borderColor = isDark ? '#373A40' : '#dee2e6';
                        }}
                      >
                        <Group gap="md" wrap="nowrap">
                          <Box
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 8,
                              backgroundColor: '#0088cc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            <IconBrandTelegram size={24} color="white" />
                          </Box>
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text 
                              size="xs" 
                              c={isDark ? '#909296' : 'dimmed'} 
                              mb={2}
                            >
                              Telegram
                            </Text>
                            <Text 
                              size="sm" 
                              fw={500} 
                              style={{ 
                                wordBreak: 'break-all',
                                color: isDark ? '#fff' : '#000'
                              }}
                            >
                              @{profileData.social_media.telegram}
                            </Text>
                          </Box>
                        </Group>
                      </Paper>
                    )}

                    {!profileData.social_media?.instagram && 
                     !profileData.social_media?.facebook && 
                     !profileData.social_media?.telegram && (
                      <Alert 
                        color="blue" 
                        variant="light" 
                        icon={<IconAlertCircle size={20} />}
                        style={{
                          backgroundColor: isDark ? '#1e3a5f' : '#e7f5ff'
                        }}
                      >
                        <Text c={isDark ? '#74c0fc' : '#1971c2'}>
                          Ijtimoiy tarmoqlar ma'lumotlari kiritilmagan
                        </Text>
                      </Alert>
                    )}
                  </Stack>
                </Tabs.Panel>

             
                <Tabs.Panel value="xarita">
                  <Stack gap="md">
                    <Title 
                      order={3}
                      c={isDark ? '#fff' : '#000'}
                    >
                      Manzilim
                    </Title>
                    
                    <Paper 
                      p="md" 
                      radius="md" 
                      withBorder
                      style={{ 
                        backgroundColor: isDark ? '#2C2E33' : '#f8f9fa',
                        borderColor: isDark ? '#373A40' : '#dee2e6'
                      }}
                    >
                      <Group gap="md" align="flex-start" wrap="nowrap">
                        <IconMapPin size={20} color="#00BCD4" style={{ marginTop: 2, flexShrink: 0 }} />
                        <Text 
                          size="sm" 
                          style={{ 
                            flex: 1,
                            color: isDark ? '#C1C2C5' : '#000'
                          }}
                        >
                          {profileData.address || 'Manzil kiritilmagan'}
                        </Text>
                      </Group>
                    </Paper>

                    {selectedLocation && locationName && (
                      <Alert 
                        color="cyan" 
                        variant="light"
                        icon={<IconMapPin size={20} />}
                        style={{
                          backgroundColor: isDark ? '#1a3a3a' : '#e3fafc'
                        }}
                      >
                        <Group gap="xs" wrap="wrap">
                          <Text 
                            fw={600} 
                            size="sm"
                            c={isDark ? '#5ce1e6' : '#0c8599'}
                          >
                            Tanlangan joy:
                          </Text>
                          {locationLoading ? (
                            <Group gap="xs">
                              <Loader size="xs" color="cyan" />
                              <Text size="sm" c={isDark ? '#99e9f2' : '#0c8599'}>
                                Yuklanmoqda...
                              </Text>
                            </Group>
                          ) : (
                            <Text 
                              size="sm" 
                              c={isDark ? '#99e9f2' : '#0c8599'}
                            >
                              {locationName}
                            </Text>
                          )}
                        </Group>
                        <Text 
                          size="xs" 
                          c={isDark ? '#66d9e8' : '#1098ad'} 
                          mt={4}
                        >
                          Koordinatalar: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
                        </Text>
                      </Alert>
                    )}

                    <Badge 
                      size="lg" 
                      variant="light" 
                      color="cyan"
                      style={{ alignSelf: 'flex-start' }}
                    >
                      💡 Xaritaning istalgan joyini bosing
                    </Badge>

                    <div 
                      style={{ 
                        width: '100%', 
                        height: 500, 
                        borderRadius: 12, 
                        overflow: 'hidden',
                        border: isDark ? '1px solid #373A40' : '1px solid #dee2e6',
                        boxShadow: isDark 
                          ? '0 4px 12px rgba(0, 0, 0, 0.5)' 
                          : '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <YMaps query={{ apikey: 'bc32072f-a50d-4f7e-b22c-a4b70bba1202', lang: 'uz_UZ' }}>
                        <Map
                          width="100%"
                          height="100%"
                          state={{
                            center: mapCenter,
                            zoom: 15,
                          }}
                          onClick={handleMapClick}
                        >
                          {selectedLocation && (
                            <Placemark
                              geometry={selectedLocation}
                              options={{
                                preset: 'islands#redDotIcon',
                              }}
                              properties={{
                                balloonContent: locationName || 'Tanlangan joy',
                              }}
                            />
                          )}
                          <ZoomControl options={{ float: 'right' }} />
                          <FullscreenControl />
                        </Map>
                      </YMaps>
                    </div>
                  </Stack>
                </Tabs.Panel>
              </Box>
            </Tabs>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
};

export default function Profile() {
  return <ProfileContent />;
}