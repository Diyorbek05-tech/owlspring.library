import React, { useState, useEffect } from 'react';
import { Container, Box, Text, Card, Image, useMantineColorScheme, Button, Grid, Loader, Center, TextInput, Stack, Checkbox } from '@mantine/core';
import { IconSearch, IconBook, IconPhone, IconMail, IconMapPin } from '@tabler/icons-react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://org-ave-jimmy-learners.trycloudflare.com/api/v1',
});

const LIBRARY_IMAGE = 'https://ezma-client.vercel.app/assets/library-CY0z204p.webp';

const Kutubxonalar = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [libraries, setLibraries] = useState([]);
  const [filteredLibraries, setFilteredLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'name-asc', 
    hasBooks: false
  });

  useEffect(() => {
    fetchLibraries();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, libraries]);

  const fetchLibraries = async () => {
    try {
      setLoading(true);
      const response = await api.get('/libraries/libraries/');
      const librariesData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setLibraries(librariesData);
      setFilteredLibraries(librariesData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching libraries:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...libraries];

    if (searchQuery.trim()) {
      filtered = filtered.filter((library) =>
        library.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        library.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.hasBooks) {
      filtered = filtered.filter((library) => library.total_books > 0);
    }

    if (filters.sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filters.sortBy === 'books-asc') {
      filtered.sort((a, b) => (a.total_books || 0) - (b.total_books || 0));
    } else if (filters.sortBy === 'books-desc') {
      filtered.sort((a, b) => (b.total_books || 0) - (a.total_books || 0));
    }

    setFilteredLibraries(filtered);
  };

  const handleSortChange = (sortType) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortType
    }));
  };

  return (
    <Box py={60} bg={isDark ? 'dark.9' : 'gray.0'} style={{ minHeight: '100vh' }}>
      <Container size="xl">
        <Box mb={40} style={{ textAlign: 'center' }}>
          <Text size="xl" fw={700} mb="md" c={isDark ? 'white' : 'dark'}>
            Kutubxonalar ro'yxati
          </Text>
        </Box>

        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Box style={{ position: 'sticky', top: '80px' }}>
              <Card shadow="sm" radius="md" bg={isDark ? 'dark.7' : 'white'} p="lg">
                <Stack gap="md">
                  <Box>
                    <Button 
                      fullWidth 
                      variant={filters.sortBy === 'name-asc' ? 'filled' : 'light'}
                      color="blue"
                      size="md"
                      onClick={() => handleSortChange('name-asc')}
                    >
                      Nomi (A-Z)
                    </Button>
                  </Box>

                  <Box>
                    <Button
                      fullWidth
                      variant={filters.sortBy === 'books-asc' ? 'filled' : 'light'}
                      color="blue"
                      size="sm"
                      onClick={() => handleSortChange('books-asc')}
                    >
                      Kitoblar soni (kamdan ko'p)
                    </Button>
                  </Box>

                  <Box>
                    <Button
                      fullWidth
                      variant={filters.sortBy === 'books-desc' ? 'filled' : 'light'}
                      color="blue"
                      size="sm"
                      onClick={() => handleSortChange('books-desc')}
                    >
                      Kitoblar soni (ko'p dan kam)
                    </Button>
                  </Box>

                  <Box>
                    <Checkbox
                      checked={filters.hasBooks}
                      onChange={() => setFilters(prev => ({ ...prev, hasBooks: !prev.hasBooks }))}
                      label="Faqat kitoblari mavjudlar"
                      styles={{ label: { fontSize: '14px' } }}
                    />
                  </Box>
                </Stack>
              </Card>
            </Box>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 9 }}>
            <Box mb="lg">
              <TextInput
                placeholder="Qidirish (nomi bo'yicha)..."
                size="md"
                radius="md"
                leftSection={<IconSearch size={18} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
              />
            </Box>

            {error && (
              <Box bg="red.1" p="md" mb={20} style={{ borderRadius: '8px' }}>
                <Text c="red">Xatolik: {error}</Text>
              </Box>
            )}

            {loading ? (
              <Center style={{ minHeight: '400px' }}>
                <Loader size="lg" />
              </Center>
            ) : (
              <>
                {filteredLibraries.length > 0 ? (
                  <Grid gutter="lg">
                    {filteredLibraries.map((library) => (
                      <Grid.Col key={library.id} span={{ base: 12, sm: 6, lg: 4 }}>
                        <Card 
                          shadow="sm" 
                          radius="md" 
                          withBorder={false} 
                          bg={isDark ? 'dark.7' : 'white'} 
                          style={{ height: '100%', position: 'relative' }}
                        >
                          {library.is_active && (
                            <Box
                              style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                zIndex: 1
                              }}
                            >
                              Faol
                            </Box>
                          )}

                          <Card.Section>
                            <Image 
                              src={library.image || LIBRARY_IMAGE} 
                              height={200} 
                              alt={library.name}
                              style={{ objectFit: 'cover' }} 
                            />
                          </Card.Section>

                          <Box p="lg">
                            <Text fw={700} size="lg" mb="sm">
                              {library.name}
                            </Text>

                            <Stack gap="xs" mb="md">
                              {library.total_books !== undefined && (
                                <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <IconBook size={16} color={isDark ? '#aaa' : '#666'} />
                                  <Text size="sm" c="dimmed">
                                    {library.total_books} Kitob
                                  </Text>
                                </Box>
                              )}

                              {library.address && (
                                <Box style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                  <IconMapPin size={16} color={isDark ? '#aaa' : '#666'} style={{ marginTop: '2px', flexShrink: 0 }} />
                                  <Text size="sm" c="dimmed" lineClamp={2}>
                                    {library.address}
                                  </Text>
                                </Box>
                              )}
                            </Stack>

                            <div style={{ position: 'sticky', bottom: 0 }}>
                                <Button 
                                  variant="light" 
                                  color="blue" 
                                  fullWidth 
                                  size="sm"
                                  leftSection={<IconMapPin size={16} />}
                                >
                                  Google Maps
                                </Button>
                              </div>

                          </Box>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                ) : (
                  <Center style={{ minHeight: '400px' }}>
                    <Box style={{ textAlign: 'center' }}>
                      <Text size="lg" c="dimmed">
                        Kutubxonalar topilmadi
                      </Text>
                    </Box>
                  </Center>
                )}
              </>
            )}
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

export default Kutubxonalar;