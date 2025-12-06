import React, { useState, useEffect } from 'react';
import { Container, Box, Text, Card, Image, useMantineColorScheme, Badge, Button, Pagination, Grid, Loader, Center, Modal, TextInput, NumberInput, Group, Alert, ActionIcon, Table, Stack } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconAlertCircle, IconSearch } from '@tabler/icons-react';

const API_BASE = 'https://org-ave-jimmy-learners.trycloudflare.com/api/v1';
const BOOK_IMAGE = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
const ITEMS_PER_PAGE = 12;

const Kitoblar = () => {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    author: '',
    publisher: '',
    quantity_in_library: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    fetchBooks(token);
  }, []);

  const getHeaders = (token = null) => {
    const authToken = token || localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  };

  const fetchBooks = async (token = null) => {
    try {
      setLoading(true);
      const authToken = token || localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/books/books/`, {
        headers: getHeaders(authToken),
      });

      if (response.ok) {
        const data = await response.json();
        const booksData = Array.isArray(data) ? data : data.results || [];
        setBooks(booksData);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        setError('Sessiyaniz tugildi. Qayta kiring');
        setBooks([]);
      } else {
        setError('Kitoblar yuklashda xatolik');
        setBooks([]);
      }
    } catch (err) {
      setError('Xatolik: ' + err.message);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (book = null) => {
    if (book) {
      setEditingId(book.id);
      setFormData({
        name: book.name || '',
        author: book.author || '',
        publisher: book.publisher || '',
        quantity_in_library: book.quantity_in_library || '',
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        author: '',
        publisher: '',
        quantity_in_library: '',
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.author) {
      setError('Kitob nomi va muallifi talab qilinadi');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `${API_BASE}/books/book/${editingId}/` 
        : `${API_BASE}/books/add-books/`;

      const response = await fetch(url, {
        method,
        headers: getHeaders(token),
        body: JSON.stringify({
          name: formData.name,
          author: formData.author,
          publisher: formData.publisher,
          quantity_in_library: parseInt(formData.quantity_in_library) || 0,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.ok || response.status === 201) {
        handleCloseModal();
        fetchBooks(token);
        setError(null);
      } else {
        const errData = await response.json();
        setError(errData.detail || 'Saqlashda xatolik yuz berdi');
      }
    } catch (err) {
      setError('Saqlashda xatolik yuz berdi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ushbu kitobni o\'chirish rostmi?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch(`${API_BASE}/books/book/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.ok || response.status === 204) {
        fetchBooks(token);
        setError(null);
      } else {
        const errData = await response.json();
        setError(errData.detail || 'O\'chirishda xatolik yuz berdi');
      }
    } catch (err) {
      setError('O\'chirishda xatolik yuz berdi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  // Filter books
  const filteredBooks = books.filter(book =>
    book.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBooks = filteredBooks.slice(startIndex, endIndex);

  return (
    <Box py={40} bg={isDark ? 'dark.9' : 'gray.0'} style={{ minHeight: '100vh' }}>
      <Container size="xl">
        <Group justify="space-between" mb={40} align="flex-start">
          <Box>
            <Text size="xl" fw={700} mb="xs" c={isDark ? 'white' : 'dark'}>
              📚 Barcha kitoblar
            </Text>
            <Text size="sm" c="dimmed">
              Jami {books.length} ta kitob
            </Text>
          </Box>
          <Group>
            {isAuthenticated && (
              <>
                <Button
                  leftSection={<IconPlus size={18} />}
                  onClick={() => handleOpenModal()}
                  color="blue"
                  size="md"
                >
                  Yangi kitob
                </Button>
                <Button
                  variant="light"
                  color="red"
                  onClick={handleLogout}
                  size="md"
                >
                  Chiqish
                </Button>
              </>
            )}
          </Group>
        </Group>

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            mb="md"
            title="Xatolik"
            withCloseButton
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <TextInput
          placeholder="Kitob yoki muallif bo'yicha qidirish..."
          leftSection={<IconSearch size={18} />}
          mb="lg"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.currentTarget.value);
            setActivePage(1);
          }}
          size="md"
          radius="md"
          styles={{
            input: {
              backgroundColor: isDark ? '#2a2a2a' : '#fff',
              border: `1px solid ${isDark ? '#3a3a3a' : '#e0e0e0'}`,
            }
          }}
        />

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
                        {/* Edit/Delete buttons */}
                        {isAuthenticated && (
                          <Group
                            gap="xs"
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              zIndex: 10,
                            }}
                          >
                            <ActionIcon
                              size="md"
                              color="blue"
                              variant="filled"
                              onClick={() => handleOpenModal(book)}
                              title="Tahrirlash"
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              size="md"
                              color="red"
                              variant="filled"
                              onClick={() => handleDelete(book.id)}
                              title="O'chirish"
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        )}

                        <Card.Section>
                          <Image
                            src={BOOK_IMAGE}
                            height={260}
                            alt={book.name}
                            style={{ objectFit: 'cover' }}
                          />
                        </Card.Section>

                        <Stack gap="sm" p="md" style={{ flex: 1 }}>
                          <Box>
                            <Text fw={700} size="md" mb="4px" lineClamp={2}>
                              {book.name}
                            </Text>
                            {book.author && (
                              <Text size="sm" c="dimmed" fw={500}>
                                {book.author}
                              </Text>
                            )}
                          </Box>

                          {book.publisher && (
                            <Text size="xs" c="dimmed" lineClamp={1}>
                              {book.publisher}
                            </Text>
                          )}

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

                <Center mt={20}>
                  <Text size="sm" c="dimmed">
                    {startIndex + 1}-{Math.min(endIndex, filteredBooks.length)} dan {filteredBooks.length} ta kitob
                  </Text>
                </Center>
              </>
            ) : (
              <Center style={{ minHeight: '400px' }}>
                <Box style={{ textAlign: 'center' }}>
                  <Text size="lg" c="dimmed" mb="md">
                    📭 Kitoblar topilmadi
                  </Text>
                  {isAuthenticated && (
                    <Button onClick={() => handleOpenModal()} leftSection={<IconPlus size={18} />}>
                      Birinchi kitobni qo'shish
                    </Button>
                  )}
                </Box>
              </Center>
            )}
          </>
        )}
      </Container>

      <Modal
        opened={modalOpen}
        onClose={handleCloseModal}
        title={editingId ? '✏️ Kitobni tahrirlash' : '➕ Yangi kitob qo\'shish'}
        size="lg"
        centered
      >
        <Stack gap="lg">
          <TextInput
            label="Kitob nomi *"
            placeholder="Kitob nomini kiritish"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.currentTarget.value })}
            size="md"
            required
          />

          <TextInput
            label="Muallif *"
            placeholder="Muallif nomini kiritish"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.currentTarget.value })}
            size="md"
            required
          />

          <TextInput
            label="Nashriyot"
            placeholder="Nashriyot nomini kiritish"
            value={formData.publisher}
            onChange={(e) => setFormData({ ...formData, publisher: e.currentTarget.value })}
            size="md"
          />

          <NumberInput
            label="Kutubxonada mavjud kitoblar soni"
            placeholder="0"
            value={formData.quantity_in_library}
            onChange={(val) => setFormData({ ...formData, quantity_in_library: val })}
            min={0}
            size="md"
          />

          <Group justify="flex-end" mt="xl">
            <Button variant="light" onClick={handleCloseModal} size="md">
              Bekor qilish
            </Button>
            <Button onClick={handleSave} loading={loading} size="md">
              {editingId ? '💾 Saqlash' : '➕ Qo\'shish'}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
};

export default Kitoblar;