import React, { useState, useEffect } from 'react';
import { Container, Box, Text, Card, Image, useMantineColorScheme, Badge, Button, Pagination, Grid, Loader, Center } from '@mantine/core';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://org-ave-jimmy-learners.trycloudflare.com/api/v1',
});

const BOOK_IMAGE = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
const ITEMS_PER_PAGE = 12;

const Kitoblar = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(1);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/books/books/');
      const booksData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setBooks(booksData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(books.length / ITEMS_PER_PAGE);
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBooks = books.slice(startIndex, endIndex);

  return (
    <Box py={60} bg={isDark ? 'dark.9' : 'gray.0'} style={{ minHeight: '100vh' }}>
      <Container size="xl">
        <Box mb={50} style={{ textAlign: 'center' }}>
          <Text size="xl" fw={700} mb="md" c={isDark ? 'white' : 'dark'}>
            Barcha kitoblar
          </Text>
          <Text size="sm" c="dimmed">
            Kutubxonamizdagi barcha kitoblarni ko'ring
          </Text>
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
            {currentBooks.length > 0 ? (
              <>
                <Grid gutter="lg" mb={40}>
                  {currentBooks.map((book) => (
                    <Grid.Col key={book.id} span={{ base: 12, xs: 6, sm: 4, md: 3 }}>
                      <Card shadow="sm" radius="md" withBorder={false} bg={isDark ? 'dark.7' : 'white'} style={{ height: '100%' }}>
                        <Card.Section>
                          <Image src={BOOK_IMAGE} height={250} alt={book.name} style={{ objectFit: 'cover' }} />
                        </Card.Section>
                        <Box p="lg">
                          <Text fw={600} size="sm" mb="xs" lineClamp={2}>
                            {book.name}
                          </Text>
                          {book.author && (
                            <>
                              <Text size="xs" c="dimmed" fw={500}>Muallif:</Text>
                              <Text size="xs" c="dimmed" mb="xs">{book.author}</Text>
                            </>
                          )}
                          {book.publisher && (
                            <>
                              <Text size="xs" c="dimmed" fw={500}>Nashriyot:</Text>
                              <Text size="xs" c="dimmed" mb="md">{book.publisher}</Text>
                            </>
                          )}
                          {book.quantity_in_library && (
                            <Badge size="lg" radius="xl" color="cyan" variant="light" fullWidth mb="md">
                              {book.quantity_in_library} TA KITOB MAVJUD
                            </Badge>
                          )}
                          <Button variant="light" color="blue" fullWidth size="sm">
                            Ko'rish
                          </Button>
                        </Box>
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

                <Center mt={20}>
                  <Text size="sm" c="dimmed">
                    {startIndex + 1}-{Math.min(endIndex, books.length)} dan {books.length} ta kitob
                  </Text>
                </Center>
              </>
            ) : (
              <Center style={{ minHeight: '400px' }}>
                <Box style={{ textAlign: 'center' }}>
                  <Text size="lg" c="dimmed">
                    Kitoblar topilmadi
                  </Text>
                </Box>
              </Center>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Kitoblar;