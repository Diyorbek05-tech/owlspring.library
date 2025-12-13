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
} from '@mantine/core';
import { IconArrowLeft, IconAlertCircle } from '@tabler/icons-react';

const API_BASE = 'https://org-ave-jimmy-learners.trycloudflare.com/api/v1';
const BOOK_IMAGE = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookDetail();
  }, [id]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchBookDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/books/book/${id}/`, {
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setBook(data);
      } else if (response.status === 404) {
        setError('Kitob topilmadi');
      } else if (response.status === 401) {
        setError('Sessiyaniz tugildi');
      } else {
        setError('Kitobni yuklashda xatolik');
      }
    } catch (err) {
      setError('Xatolik: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box py={40} bg={isDark ? 'dark.9' : 'gray.0'} style={{ minHeight: '100vh' }}>
        <Center style={{ minHeight: '400px' }}>
          <Loader size="lg" />
        </Center>
      </Box>
    );
  }

  if (error || !book) {
    return (
      <Box py={40} bg={isDark ? 'dark.9' : 'gray.0'} style={{ minHeight: '100vh' }}>
        <Container size="lg">
          <Button
            leftSection={<IconArrowLeft size={18} />}
            variant="subtle"
            onClick={() => navigate(-1)}
            mb="lg"
          >
            Orqaga
          </Button>
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            title="Xatolik"
          >
            {error || 'Kitob topilmadi'}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box py={40} bg={isDark ? 'dark.9' : 'gray.0'} style={{ minHeight: '100vh' }}>
      <Container size="lg">
        <Button
          leftSection={<IconArrowLeft size={18} />}
          variant="subtle"
          onClick={() => navigate('/kitoblar')}
          mb="lg"
          color={isDark ? 'white' : 'dark'}
        >
          Orqaga
        </Button>

        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, xs: 5 }}>
            <Box
              style={{
                position: 'sticky',
                top: '20px',
              }}
            >
              <Image
                src={BOOK_IMAGE}
                alt={book.name}
                radius="md"
                style={{ width: '100%' }}
              />
            </Box>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 7 }}>
            <Stack gap="lg">
              <Box>
                <Text
                  size="xl"
                  fw={700}
                  mb="sm"
                  c={isDark ? 'white' : 'dark'}
                >
                  {book.name}
                </Text>
                {book.author && (
                  <Group gap="xs" mb="md">
                    <Text size="md" fw={500} c="dimmed">
                      Muallif:
                    </Text>
                    <Text size="md" fw={600}>
                      {book.author}
                    </Text>
                  </Group>
                )}
              </Box>

              {book.publisher && (
                <Box
                  p="md"
                  radius="md"
                  bg={isDark ? 'dark.7' : 'gray.1'}
                >
                  <Text size="sm" c="dimmed" mb="4px">
                    NASHRIYOT
                  </Text>
                  <Text fw={600}>{book.publisher}</Text>
                </Box>
              )}

              {book.quantity_in_library !== null &&
                book.quantity_in_library !== undefined && (
                  <Box
                    p="md"
                    radius="md"
                    bg={isDark ? 'dark.7' : 'gray.1'}
                  >
                    <Group justify="space-between" align="center">
                      <Box>
                        <Text size="sm" c="dimmed" mb="4px">
                          KUTUBXONADA MAVJUD
                        </Text>
                        <Text fw={600} size="lg">
                          {book.quantity_in_library} ta
                        </Text>
                      </Box>
                      <Badge
                        size="xl"
                        radius="sm"
                        color={
                          book.quantity_in_library > 0 ? 'green' : 'red'
                        }
                        variant="light"
                      >
                        {book.quantity_in_library > 0
                          ? 'MAVJUD'
                          : 'YO\'Q'}
                      </Badge>
                    </Group>
                  </Box>
                )}

              {book.id && (
                <Box
                  p="md"
                  radius="md"
                  bg={isDark ? 'dark.7' : 'gray.1'}
                >
                 tavsiya etamizki, kitobni olish uchun kutubxonaga oldindan murojaat qiling.
                </Box>
              )}

              <Group grow>
                <Button
                  variant="light"
                  onClick={() => navigate(-1)}
                  size="md"
                >
                  Orqaga
                </Button>
                {book.quantity_in_library > 0 && (
                  <Button color="green" size="md">
                    Olish
                  </Button>
                )}
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  );
};

export default BookDetail;

