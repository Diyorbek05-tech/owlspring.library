import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Text, Card, Image, useMantineColorScheme, Badge, Button, Pagination, Grid, Loader, Center, Modal, TextInput, NumberInput, Group, Alert, ActionIcon, Stack, Tabs, FileInput, Table, Menu } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconAlertCircle, IconSearch, IconUpload, IconChevronDown } from '@tabler/icons-react';
import ExcelJS from 'exceljs';

const API_BASE = 'https://org-ave-jimmy-learners.trycloudflare.com/api/v1';
const BOOK_IMAGE = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60';
const ITEMS_PER_PAGE = 12;

const Kitoblar = () => {
  const { colorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const isDark = colorScheme === 'dark';
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('single');
  const [excelFile, setExcelFile] = useState(null);
  const [excelPreview, setExcelPreview] = useState([]);
  const [multipleBooks, setMultipleBooks] = useState([
    { name: '', author: '', publisher: '', quantity_in_library: '' }
  ]);
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
        let booksData = Array.isArray(data) ? data : data.results || [];
        booksData = booksData.reverse();
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
      setActiveTab('single');
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        author: '',
        publisher: '',
        quantity_in_library: '',
      });
      setActiveTab('single');
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setExcelFile(null);
    setExcelPreview([]);
    setMultipleBooks([{ name: '', author: '', publisher: '', quantity_in_library: '' }]);
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
        : `${API_BASE}/books/books/`;

      const payload = {
        name: formData.name.trim(),
        author: formData.author.trim(),
      };

      if (formData.publisher && formData.publisher.trim()) {
        payload.publisher = formData.publisher.trim();
      }

      if (formData.quantity_in_library && parseInt(formData.quantity_in_library) > 0) {
        payload.quantity_in_library = parseInt(formData.quantity_in_library);
      }

      console.log('Yuborilayotgan URL:', url);
      console.log('Yuborilayotgan ma\'lumot:', payload);

      const response = await fetch(url, {
        method,
        headers: getHeaders(token),
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      console.log('Response Status:', response.status);
      console.log('Response Body:', text);

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (response.ok || response.status === 201) {
        handleCloseModal();
        fetchBooks(token);
        setError(null);
      } else {
        try {
          const errData = JSON.parse(text);
          setError(errData.detail || 'Saqlashda xatolik yuz berdi');
        } catch {
          setError(`Xatolik (${response.status}): ${text}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMultiple = async () => {
    const validBooks = multipleBooks.filter(b => b.name && b.author);
    
    if (validBooks.length === 0) {
      setError('Kamida bitta kitobning nomi va muallifi bo\'lishi kerak');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      for (const book of validBooks) {
        const payload = {
          name: book.name.trim(),
          author: book.author.trim(),
        };

        if (book.publisher && book.publisher.trim()) {
          payload.publisher = book.publisher.trim();
        }

        if (book.quantity_in_library && parseInt(book.quantity_in_library) > 0) {
          payload.quantity_in_library = parseInt(book.quantity_in_library);
        }

        console.log('Yuborilayotgan ma\'lumot:', payload);

        const response = await fetch(`${API_BASE}/books/books/`, {
          method: 'POST',
          headers: getHeaders(token),
          body: JSON.stringify(payload),
        });

        const text = await response.text();
        console.log('Response Status:', response.status);

        if (!response.ok && response.status !== 201) {
          try {
            const errData = JSON.parse(text);
            setError(`Xatolik: ${errData.detail || JSON.stringify(errData)}`);
          } catch {
            setError(`Xatolik (${response.status}): ${text}`);
          }
          return;
        }
      }

      handleCloseModal();
      fetchBooks(token);
      setError(null);
    } catch (err) {
      console.error('Catch Error:', err);
      setError('Saqlashda xatolik: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const parseExcelFile = async (file) => {
    try {
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.worksheets[0];

      const jsonData = [];
      const headerRow = worksheet.getRow(1);
      const headers = [];

      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value ? String(cell.value).toLowerCase() : '';
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber];
          if (header) {
            rowData[header] = cell.value;
          }
        });
        
        if (Object.keys(rowData).length > 0) {
          jsonData.push(rowData);
        }
      });

      console.log('ExcelJS ma\'lumotlari:', jsonData);

      if (jsonData.length === 0) {
        setError('Faylda ma\'lumot topilmadi');
        setExcelPreview([]);
        return;
      }

      const parsedBooks = jsonData.map(row => {
        const book = {
          name: String(row.name || row.kitob || row['kitob nomi'] || '').trim() || '',
          author: String(row.author || row.muallif || row['muallif nomi'] || '').trim() || '',
          publisher: String(row.publisher || row.nashriyot || '').trim() || '',
          quantity_in_library: String(row.quantity_in_library || row.soni || '0').trim() || '0',
        };
        console.log('Parse qilingan kitob:', book);
        return book;
      }).filter(b => b.name && b.author);

      console.log('Final parsed books:', parsedBooks);

      if (parsedBooks.length === 0) {
        setError('Nomi va muallifi bo\'lgan kitob topilmadi');
        setExcelPreview([]);
        return;
      }

      setExcelPreview(parsedBooks);
      setMultipleBooks(parsedBooks);
      setError(null);
    } catch (err) {
      console.error('Parse xatosi:', err);
      setError('Faylni o\'qishda xatolik: ' + err.message);
      setExcelPreview([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ushbu kitobni o\'chirish rostmi?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE}/books/book/${id}/`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
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
               Barcha kitoblar
            </Text>
            <Text size="sm" c="dimmed">
              Jami {books.length} ta kitob
            </Text>
          </Box>
          <Group>
            {isAuthenticated && (
              <Menu shadow="md">
                <Menu.Target>
                  <Button
                    leftSection={<IconPlus size={18} />}
                    rightSection={<IconChevronDown size={18} />}
                    color="blue"
                    size="md"
                  >
                    Kitob qo'shish
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item 
                    leftSection={<IconPlus size={16} />}
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ name: '', author: '', publisher: '', quantity_in_library: '' });
                      setActiveTab('single');
                      setModalOpen(true);
                    }}
                  >
                    Bitta kitob qo'shish
                  </Menu.Item>
                  <Menu.Item 
                    leftSection={<IconPlus size={16} />}
                    onClick={() => {
                      setEditingId(null);
                      setMultipleBooks([{ name: '', author: '', publisher: '', quantity_in_library: '' }]);
                      setActiveTab('multiple');
                      setModalOpen(true);
                    }}
                  >
                    Bir nechta kitob qo'shish
                  </Menu.Item>
                  <Menu.Item 
                    leftSection={<IconUpload size={16} />}
                    onClick={() => {
                      setEditingId(null);
                      setExcelPreview([]);
                      setExcelFile(null);
                      setActiveTab('excel');
                      setModalOpen(true);
                    }}
                  >
                    Fayldan yuklash
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
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
                          cursor: 'pointer',
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
                        {isAuthenticated && (
                          <Group
                            gap="xs"
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              zIndex: 10,
                            }}
                            onClick={(e) => e.stopPropagation()}
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
                          <Box onClick={() => navigate(`/kitoblar/${book.id}`)} style={{ cursor: 'pointer' }}>
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
        title={editingId ? 'Kitobni tahrirlash' : 'Kitob qo\'shish'}
        size="lg"
        centered
      >
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="single">
              Bitta kitob
            </Tabs.Tab>
            <Tabs.Tab value="multiple">
              Bir nechta kitob
            </Tabs.Tab>
            <Tabs.Tab value="excel">
              Excel fayldan
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="single" pt="md">
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
                  {editingId ? 'Saqlash' : 'Qo\'shish'}
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="multiple" pt="md">
            <Stack gap="lg" style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
              {multipleBooks.map((book, idx) => (
                <Box key={idx} p="md" bg={isDark ? 'dark.7' : 'gray.1'} radius="md">
                  <Group justify="space-between" mb="md">
                    <Text fw={600}>Kitob {idx + 1}</Text>
                    {multipleBooks.length > 1 && (
                      <ActionIcon
                        color="red"
                        size="sm"
                        onClick={() => {
                          setMultipleBooks(multipleBooks.filter((_, i) => i !== idx));
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                  <Stack gap="sm">
                    <TextInput
                      label="Kitob nomi *"
                      placeholder="Kitob nomini kiritish"
                      value={book.name}
                      onChange={(e) => {
                        const updated = [...multipleBooks];
                        updated[idx].name = e.currentTarget.value;
                        setMultipleBooks(updated);
                      }}
                      size="sm"
                    />

                    <TextInput
                      label="Muallif *"
                      placeholder="Muallif nomini kiritish"
                      value={book.author}
                      onChange={(e) => {
                        const updated = [...multipleBooks];
                        updated[idx].author = e.currentTarget.value;
                        setMultipleBooks(updated);
                      }}
                      size="sm"
                    />

                    <TextInput
                      label="Nashriyot"
                      placeholder="Nashriyot nomini kiritish"
                      value={book.publisher}
                      onChange={(e) => {
                        const updated = [...multipleBooks];
                        updated[idx].publisher = e.currentTarget.value;
                        setMultipleBooks(updated);
                      }}
                      size="sm"
                    />

                    <NumberInput
                      label="Soni"
                      placeholder="0"
                      value={book.quantity_in_library}
                      onChange={(val) => {
                        const updated = [...multipleBooks];
                        updated[idx].quantity_in_library = val;
                        setMultipleBooks(updated);
                      }}
                      min={0}
                      size="sm"
                    />
                  </Stack>
                </Box>
              ))}

              <Button
                variant="light"
                onClick={() => {
                  setMultipleBooks([...multipleBooks, { name: '', author: '', publisher: '', quantity_in_library: '' }]);
                }}
                fullWidth
              >
                Yana qo'shish
              </Button>

              <Group justify="flex-end" mt="xl">
                <Button variant="light" onClick={handleCloseModal} size="md">
                  Bekor qilish
                </Button>
                <Button onClick={handleSaveMultiple} loading={loading} size="md">
                  Saqlash ({multipleBooks.filter(b => b.name && b.author).length})
                </Button>
              </Group>
            </Stack>
            </Tabs.Panel>

          <Tabs.Panel value="excel" pt="md">
            <Stack gap="lg">
              <Alert icon={<IconAlertCircle size={16} />} color="blue" title="Ma'lumot">
                XLSX faylni tanlang - u avtomatik parse qilinadi va "Bir nechta kitob" tab'iga o'tadi
              </Alert>

              <FileInput
                label="XLSX fayl tanlang"
                placeholder="Fayl (.xlsx)"
                icon={<IconUpload size={14} />}
                accept=".xlsx,.xls"
                onChange={(file) => {
                  if (file) {
                    parseExcelFile(file);
                  }
                }}
              />

              {excelPreview.length > 0 && (
                <Box>
                  <Text fw={600} mb="sm">Topilgan kitoblar ({excelPreview.length} ta):</Text>
                  <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
                    <Table striped size="sm">
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Kitob nomi</Table.Th>
                          <Table.Th>Muallif</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {excelPreview.map((book, idx) => (
                          <Table.Tr key={idx}>
                            <Table.Td>{book.name}</Table.Td>
                            <Table.Td>{book.author}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </div>
                </Box>
              )}

              <Group justify="flex-end" mt="xl">
                <Button variant="light" onClick={handleCloseModal} size="md">
                  Bekor qilish
                </Button>
                <Button 
                  onClick={handleSaveMultiple} 
                  loading={loading} 
                  size="md"
                  disabled={excelPreview.length === 0}
                >
                  Saqlash ({excelPreview.length})
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Modal>
    </Box>
  );
};

export default Kitoblar;