import Layout from './components/Layout';
import Home from './pages/Home';
import Kutubxonalar from './pages/Kutubxonalar';
import Kitoblar from './pages/Kitoblar';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';

const App = ({ toggleColorScheme, colorScheme }) => {
  return (
    <Routes>
      <Route element={<Layout toggleColorScheme={toggleColorScheme} colorScheme={colorScheme} />}>
        <Route path="/" element={<Home />} />
        <Route path="/kutubxonalar" element={<Kutubxonalar />} />
        <Route path="/kitoblar" element={<Kitoblar />} />
        <Route path="/kutubxonachi" element={<LoginPage />} />
      </Route>
    </Routes>
  );
};

export default App;
