import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Professionals } from './pages/Professionals';
import { Areas } from './pages/Areas';
import { Blog } from './pages/Blog';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = React.useLocation ? React.useLocation() : { pathname: '' };
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* About Routes */}
        <Route path="/sobre" element={<About />} />
        <Route path="/sobre/somos" element={<About />} />
        <Route path="/sobre/entrega" element={<About />} />
        <Route path="/sobre/inovacao" element={<About />} />
        <Route path="/sobre/premios" element={<About />} />

        <Route path="/profissionais" element={<Professionals />} />
        <Route path="/areas" element={<Areas />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;