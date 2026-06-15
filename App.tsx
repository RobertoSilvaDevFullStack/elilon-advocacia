import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Lazy loading components
const Home = React.lazy(() =>
  import("./pages/Home").then((module) => ({ default: module.Home })),
);
const About = React.lazy(() =>
  import("./pages/About").then((module) => ({ default: module.About })),
);
const Professionals = React.lazy(() =>
  import("./pages/Professionals").then((module) => ({
    default: module.Professionals,
  })),
);
const Solutions = React.lazy(() =>
  import("./pages/Solutions").then((module) => ({ default: module.Solutions })),
);
const Innovation = React.lazy(() =>
  import("./pages/Innovation").then((module) => ({
    default: module.Innovation,
  })),
);
const Testimonials = React.lazy(() =>
  import("./pages/Testimonials").then((module) => ({
    default: module.Testimonials,
  })),
);
const ProfessionalDetail = React.lazy(() =>
  import("./pages/ProfessionalDetail").then((module) => ({
    default: module.ProfessionalDetail,
  })),
);
const Areas = React.lazy(() =>
  import("./pages/Areas").then((module) => ({ default: module.Areas })),
);
const Blog = React.lazy(() =>
  import("./pages/Blog").then((module) => ({ default: module.Blog })),
);
const BlogPostDetail = React.lazy(() =>
  import("./pages/BlogPostDetail").then((module) => ({
    default: module.BlogPostDetail,
  })),
);
const Contact = React.lazy(() =>
  import("./pages/Contact").then((module) => ({ default: module.Contact })),
);
const Admin = React.lazy(() =>
  import("./pages/Admin").then((module) => ({ default: module.Admin })),
);
const PrivacyPolicy = React.lazy(() =>
  import("./pages/PrivacyPolicy").then((module) => ({
    default: module.PrivacyPolicy,
  })),
);
const TermsOfUse = React.lazy(() =>
  import("./pages/TermsOfUse").then((module) => ({
    default: module.TermsOfUse,
  })),
);

// Landing Pages
const BPCLandingPage = React.lazy(() => import("./pages/BPCLandingPage"));
const IRLandingPage = React.lazy(() => import("./pages/IRLandingPage"));

// Components
import MetaPixel from "./components/MetaPixel";
import { ChatWidget } from "./src/modules/chat";

// Default exports
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));

// Loading Fallback
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-accent-600">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent-600"></div>
  </div>
);

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

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
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />

            {/* Landing Pages */}
            <Route path="/bpc" element={<BPCLandingPage />} />
            <Route path="/isencao-ir" element={<IRLandingPage />} />

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
          <MetaPixel />
          <ChatWidget />
        </Suspense>
      </Router>
    </HelmetProvider>
  );
};

export default App;
