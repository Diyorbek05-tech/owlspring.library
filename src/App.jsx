import Layout from './components/Layout';
import Home from './pages/Home';
import Kutubxonalar from './pages/Kutubxonalar';
import LibraryDetail from './pages/LibraryDetailPage';
import Kitoblar from './pages/Kitoblar';
import BookDetail from './pages/BookDetail';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';

const App = ({ toggleColorScheme, colorScheme }) => {
  return (
    <Routes>
      <Route element={<Layout toggleColorScheme={toggleColorScheme} colorScheme={colorScheme} />}>
        <Route path="/" element={<Home />} />
        <Route path="/kutubxonalar" element={<Kutubxonalar />} />
        <Route path="/kutubxonalar/:id" element={<LibraryDetail />} />
        <Route path="/kitoblar" element={<Kitoblar />} />
        <Route path="/kitoblar/:id" element={<BookDetail />} />
        <Route path="/kutubxonachi" element={<LoginPage />} />
      </Route>
    </Routes>
  );
};

export default App;