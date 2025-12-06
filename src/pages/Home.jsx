import React, { useState, useEffect } from 'react';
import { Container, Box, Text, Skeleton, Card, Image, useMantineColorScheme, Badge, Button, Group, ActionIcon, TextInput } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconSearch } from '@tabler/icons-react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://org-ave-jimmy-learners.trycloudflare.com/api/v1',
});

const BOOK_IMAGE = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';

export default function HomePage() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/books/books/');
      const booksData = Array.isArray(response.data) ? response.data : response.data.results || [];
      setBooks(booksData);
      setAllBooks(booksData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    const container = document.getElementById('booksContainer');
    if (container) {
      container.scrollBy({
        left: direction === 'left' ? -300 : 300,
        behavior: 'smooth'
      });
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setBooks(allBooks);
      return;
    }

    const filtered = allBooks.filter((book) =>
      book.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.publisher?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setBooks(filtered);
  };

  return (
    <Box py={60} bg={isDark ? 'dark.9' : 'gray.0'}>
      <Container size="xl">
        <Box mb={50} style={{ textAlign: 'center' }}>
          <Text size="lg" fw={600} mb="md" c="blue">
            Kitoblar bir joyda – qidiruvni shu yerdan boshlang
          </Text>
          <Group gap="sm" justify="center">
            <TextInput
              placeholder="Kitob nomi, muallif nomi"
              style={{ flex: 1, maxWidth: '500px' }}
              radius="md"
              size="md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              size="md"
              radius="md"
              color="blue"
              leftSection={<IconSearch size={18} />}
              onClick={handleSearch}
            >
              Qidirish
            </Button>
          </Group>
        </Box>

        <Text size="xl" fw={700} mb={40}>
          Eng yangi kitoblar
        </Text>

        {error && (
          <Box bg="red.1" p="md" mb={20} style={{ borderRadius: '8px' }}>
            <Text c="red">Xatolik: {error}</Text>
          </Box>
        )}

        <Box style={{ position: 'relative' }}>
          <ActionIcon
            onClick={() => scroll('left')}
            style={{
              position: 'absolute',
              left: -50,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
            }}
            size="lg"
            radius="xl"
            variant="light"
            color="blue"
          >
            <IconChevronLeft size={20} />
          </ActionIcon>

          <Box
            id="booksContainer"
            style={{
              display: 'flex',
              gap: '20px',
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            sx={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            {loading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Box key={i} style={{ flexShrink: 0, width: '280px' }}>
                    <Card shadow="sm" radius="md" withBorder={false} bg={isDark ? 'dark.7' : 'white'}>
                      <Card.Section>
                        <Skeleton height={250} />
                      </Card.Section>
                      <Box p="lg">
                        <Skeleton height={20} mb="sm" />
                        <Skeleton height={16} mb="md" width="70%" />
                        <Skeleton height={36} radius="xl" />
                      </Box>
                    </Card>
                  </Box>
                ))}
              </>
            ) : books.length > 0 ? (
              books.map((book) => (
                <Box key={book.id} style={{ flexShrink: 0, width: '280px' }}>
                  <Card shadow="sm" radius="md" withBorder={false} bg={isDark ? 'dark.7' : 'white'}>
                    <Card.Section>
                      <Image src={BOOK_IMAGE} height={250} alt={book.name} style={{ objectFit: 'cover' }} />
                    </Card.Section>
                    <Box py="lg">
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
                </Box>
              ))
            ) : (
              <Text c="dimmed">Kitoblar topilmadi</Text>
            )}
          </Box>

          <ActionIcon
            onClick={() => scroll('right')}
            style={{
              position: 'absolute',
              right: -50,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
            }}
            size="lg"
            radius="xl"
            variant="light"
            color="blue"
          >
            <IconChevronRight size={20} />
          </ActionIcon>
        </Box>
      </Container>
    </Box>
  );
}