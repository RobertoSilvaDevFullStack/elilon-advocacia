import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import Header from "../components/lp/ir/Header";
import Hero from "../components/lp/ir/Hero";
import DiseasesList from "../components/lp/ir/DiseasesList";
import Process from "../components/lp/ir/Process";
import SocialProof from "../components/lp/ir/SocialProof";
import Footer from "../components/lp/ir/Footer";

const IRLandingPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-[#161213]">
      <Helmet>
        <title>Isenção IR Doenças Graves - Elilon Lopes Advogados</title>
        <meta
          name="description"
          content="Recupere o Imposto de Renda pago indevidamente. Isenção total para portadores de doenças graves conforme Lei 7.713/88."
        />
      </Helmet>

      <Header />

      <main>
        <Hero />
        <DiseasesList />
        <Process />
        <SocialProof />
      </main>

      <Footer />

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/553899576682"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => window.fbq?.("track", "Contact")}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25D366]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="currentColor"
          viewBox="0 0 16 16"
          className="w-8 h-8"
        >
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
        </svg>
      </a>
    </div>
  );
};

export default IRLandingPage;
