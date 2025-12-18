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
import { Testimonials } from "./pages/Testimonials";
import { ProfessionalDetail } from "./pages/ProfessionalDetail";
import { Areas } from "./pages/Areas";
import { Blog } from "./pages/Blog";
import { BlogPostDetail } from "./pages/BlogPostDetail";
import { Contact } from "./pages/Contact";
import { Admin } from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfUse } from "./pages/TermsOfUse";
import ComingSoon from "./pages/ComingSoon";

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
          {/* 
            ========================================
            🚀 ATIVAR SITE COMPLETO - 02/01/2026
            ========================================
            
            INSTRUÇÕES PARA LANÇAMENTO:
            
            1. REMOVER a linha 52 (Coming Soon)
            2. DESCOMENTAR a linha 57 (Home completa)
            3. SALVAR o arquivo
            4. Executar: npm run build
            5. Fazer upload do dist/ via FileZilla
            
            ANTES (ATUAL):
            <Route path="/" element={<ComingSoon />} />
            
            DEPOIS (DIA 02/01/2026):
            <Route path="/" element={<Home />} />
            
            ========================================
          */}

          {/* Coming Soon - REMOVER ESTA LINHA NO DIA 02/01/2026 */}
          <Route path="/" element={<ComingSoon />} />

          {/* Main Site - DESCOMENTAR ESTA LINHA NO DIA 02/01/2026 */}
          {/* <Route path="/" element={<Home />} /> */}

          {/* Acesso temporário ao site completo durante desenvolvimento */}
          <Route path="/site" element={<Home />} />

          {/* About Routes */}
          <Route path="/sobre" element={<About />} />
          <Route path="/sobre/entrega" element={<Solutions />} />
          <Route path="/sobre/inovacao" element={<Innovation />} />
          <Route path="/sobre/depoimentos" element={<Testimonials />} />

          <Route path="/profissionais" element={<Professionals />} />
          <Route path="/profissionais/:id" element={<ProfessionalDetail />} />
          <Route path="/areas" element={<Areas />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPostDetail />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/admin/reset-password" element={<ResetPassword />} />
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
