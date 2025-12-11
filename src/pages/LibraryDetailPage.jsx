import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Text,
  Button,
  Group,
  Loader,
  Center,
  Alert,
  Grid,
  Badge,
  Image,
  useMantineColorScheme,
  Stack,
  Card,
  Pagination,
} from '@mantine/core';
import { IconArrowLeft, IconAlertCircle, IconPhone, IconMail, IconMapPin, IconBook } from '@tabler/icons-react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://org-ave-jimmy-learners.trycloudflare.com/api/v1',
});

const LIBRARY_IMAGE = 'https://ezma-client.vercel.app/assets/library-CY0z204p.webp';
const BOOK_IMAGE = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
const ITEMS_PER_PAGE = 12;

const LibraryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [library, setLibrary] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalBooks, setTotalBooks] = useState(0);
  const [activePage, setActivePage] = useState(1);

  useEffect(() => {
    fetchLibraryDetail();
  }, [id, activePage]);

  const fetchLibraryDetail = async () => {
    try {
      setLoading(true);
      const pageParam = activePage > 1 ? `?page=${activePage}` : '';
      const response = await api.get(`/libraries/library/${id}/${pageParam}`);
      
      // API response structure: results.library va results.books
      const { results, count } = response.data;
      
      // Library ma'lumotlarini birlashtir
      const libraryData = {
        ...results.library,
        phone: results.phone,
        is_active: results.is_active,
        total_books: results.total_books
      };
      
      setLibrary(libraryData);
      setTotalBooks(count);
      
      // Books array
      const booksData = results.books || [];
      setBooks(booksData);
    } catch (err) {
      setError('Kutubxonani yuklashda xatolik');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = () => {
    if (library?.address) {
      const encoded = encodeURIComponent(library.address);
      window.open(`https://www.google.com/maps/search/${encoded}`, '_blank');
    }
  };

  const totalPages = Math.ceil(totalBooks / 10); // API-da 10 ta book per page
  const startIndex = (activePage - 1) * 10;
  const endIndex = startIndex + 10;
  const currentBooks = books;

  if (error && !library) {
    return (
      <Box py={40} bg={isDark ? 'dark.9' : 'gray.0'} style={{ minHeight: '100vh' }}>
        <Container size="lg">
          <Button
            leftSection={<IconArrowLeft size={18} />}
            variant="subtle"
            onClick={() => navigate('/kutubxonalar')}
            mb="lg"
          >
            Orqaga
          </Button>
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            title="Xatolik"
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!library) {
    return (
      <Box py={40} bg={isDark ? 'dark.9' : 'gray.0'} style={{ minHeight: '100vh' }}>
        <Center style={{ minHeight: '400px' }}>
          <Loader size="lg" />
        </Center>
      </Box>
    );
  }

  return (
    <Box py={40} bg={isDark ? 'dark.9' : 'gray.0'} style={{ minHeight: '100vh' }}>
      <Container size="lg">
        <Button
          leftSection={<IconArrowLeft size={18} />}
          variant="subtle"
          onClick={() => navigate('/kutubxonalar')}
          mb="lg"
          color={isDark ? 'white' : 'dark'}
        >
          Orqaga
        </Button>

        <Grid gutter="xl" mb={60}>
          <Grid.Col span={{ base: 12, xs: 5 }}>
            <Box
              style={{
                position: 'sticky',
                top: '20px',
              }}
            >
              <Image
                src={library.image || LIBRARY_IMAGE}
                alt={library.name}
                radius="md"
                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
              />
            </Box>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 7 }}>
            <Stack gap="lg">
              <Box>
                <Group justify="space-between" align="flex-start" mb="md">
                  <Box>
                    <Text
                      size="xl"
                      fw={700}
                      mb="sm"
                      c={isDark ? 'white' : 'dark'}
                    >
                      {library.name}
                    </Text>
                    {library.is_active && (
                      <Badge color="green" size="lg">
                        Faol
                      </Badge>
                    )}
                  </Box>
                </Group>
              </Box>

              {library.total_books !== undefined && (
                <Box
                  p="md"
                  radius="md"
                  bg={isDark ? 'dark.7' : 'gray.1'}
                >
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" c="dimmed" mb="4px">
                        JAMI KITOBLAR
                      </Text>
                      <Text fw={600} size="lg">
                        {library.total_books} ta
                      </Text>
                    </Box>
                    <IconBook size={32} color="blue" opacity={0.6} />
                  </Group>
                </Box>
              )}

              {library.address && (
                <Box
                  p="md"
                  radius="md"
                  bg={isDark ? 'dark.7' : 'gray.1'}
                >
                  <Group gap="xs" align="flex-start" mb="md">
                    <IconMapPin size={20} color="blue" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <Box>
                      <Text size="sm" c="dimmed" fw={500}>
                        MANZIL
                      </Text>
                      <Text fw={600}>{library.address}</Text>
                    </Box>
                  </Group>
                  <Button
                    fullWidth
                    color="blue"
                    leftSection={<IconMapPin size={18} />}
                    onClick={openGoogleMaps}
                  >
                    Google Maps-da ko'rish
                  </Button>
                </Box>
              )}

              {library.phone && (
                <Box
                  p="md"
                  radius="md"
                  bg={isDark ? 'dark.7' : 'gray.1'}
                >
                  <Group gap="xs" align="center">
                    <IconPhone size={20} color="blue" />
                    <Box>
                      <Text size="sm" c="dimmed">
                        TELEFON
                      </Text>
                      <Text fw={600}>{library.phone}</Text>
                    </Box>
                  </Group>
                </Box>
              )}

              {library.email && (
                <Box
                  p="md"
                  radius="md"
                  bg={isDark ? 'dark.7' : 'gray.1'}
                >
                  <Group gap="xs" align="center">
                    <IconMail size={20} color="blue" />
                    <Box>
                      <Text size="sm" c="dimmed">
                        EMAIL
                      </Text>
                      <Text fw={600}>{library.email}</Text>
                    </Box>
                  </Group>
                </Box>
              )}

              <Button
                variant="light"
                onClick={() => navigate('/kitoblar')}
                size="md"
              >
                Barcha kitoblarni ko'rish
              </Button>
            </Stack>
          </Grid.Col>
        </Grid>

        <Box mb={40}>
          <Text size="xl" fw={700} mb={20}>
            Bu kutubxonaning kitoblari
          </Text>

          {loading ? (
            <Center style={{ minHeight: '400px' }}>
              <Loader size="lg" />
            </Center>
          ) : (
            <>
              {currentBooks.length > 0 ? (
                <>
                  <Grid gutter="lg" mb={40}>
                    {currentBooks.map((book) => (
                      <Grid.Col key={book.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                        <Card
                          shadow="sm"
                          radius="md"
                          withBorder={false}
                          bg={isDark ? 'dark.7' : 'white'}
                          style={{
                            height: '100%',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <Card.Section
                            onClick={() => navigate(`/kitoblar/${book.id}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            <Image
                              src={BOOK_IMAGE}
                              height={260}
                              alt={book.name}
                              style={{ objectFit: 'cover' }}
                            />
                          </Card.Section>

                          <Stack gap="sm" p="md" style={{ flex: 1 }}>
                            <Box
                              onClick={() => navigate(`/kitoblar/${book.id}`)}
                              style={{ cursor: 'pointer' }}
                            >
                              <Text fw={700} size="md" mb="4px" lineClamp={2}>
                                {book.name}
                              </Text>
                              {book.author && (
                                <Text size="sm" c="dimmed" fw={500}>
                                  {book.author}
                                </Text>
                              )}
                            </Box>

                            {book.quantity_in_library && (
                              <Badge
                                size="lg"
                                radius="sm"
                                color="cyan"
                                variant="light"
                                fullWidth
                              >
                                {book.quantity_in_library} TA MAVJUD
                              </Badge>
                            )}

                            <Button
                              variant="light"
                              color="blue"
                              fullWidth
                              size="sm"
                              mt="auto"
                              onClick={() => navigate(`/kitoblar/${book.id}`)}
                            >
                              Ko'rish
                            </Button>
                          </Stack>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>

                  {totalPages > 1 && (
                    <Center mt={40}>
                      <Pagination
                        total={totalPages}
                        value={activePage}
                        onChange={setActivePage}
                        color="blue"
                        size="lg"
                        radius="md"
                      />
                    </Center>
                  )}
                </>
              ) : (
                <Center style={{ minHeight: '400px' }}>
                  <Box style={{ textAlign: 'center' }}>
                    <Text size="lg" c="dimmed">
                      📭 Bu kutubxonada kitoblar topilmadi
                    </Text>
                  </Box>
                </Center>
              )}
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default LibraryDetail;