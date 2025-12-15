import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Professionals } from "./pages/Professionals";
import { Solutions } from "./pages/Solutions";
import { Innovation } from "./pages/Innovation";
import { Awards } from "./pages/Awards";
import { ProfessionalDetail } from "./pages/ProfessionalDetail";
import { Areas } from "./pages/Areas";
import { Blog } from "./pages/Blog";
import { BlogPostDetail } from "./pages/BlogPostDetail";
import { Contact } from "./pages/Contact";
import { Admin } from "./pages/Admin";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfUse } from "./pages/TermsOfUse";

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = React.useLocation
    ? React.useLocation()
    : { pathname: "" };

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />

          {/* About Routes */}
          <Route path="/sobre" element={<About />} />
          <Route path="/sobre/entrega" element={<Solutions />} />
          <Route path="/sobre/inovacao" element={<Innovation />} />
          <Route path="/sobre/premios" element={<Awards />} />

          <Route path="/profissionais" element={<Professionals />} />
          <Route path="/profissionais/:id" element={<ProfessionalDetail />} />
          <Route path="/areas" element={<Areas />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPostDetail />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/privacidade" element={<PrivacyPolicy />} />
          <Route path="/termos" element={<TermsOfUse />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
};

export default App;
