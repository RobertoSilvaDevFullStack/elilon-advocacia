import React, { useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { PROFESSIONALS } from "../constants";
import {
  Linkedin,
  Mail,
  Phone,
  ChevronLeft,
  GraduationCap,
  Award,
  BookOpen,
} from "lucide-react";

export const ProfessionalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const professional = PROFESSIONALS.find((p) => p.id === Number(id));

  // Scroll to top when mounting
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!professional) {
    return <Navigate to="/profissionais" replace />;
  }

  return (
    <Layout>
      <div className="bg-neutral-900 text-white py-12 md:py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-neutral-800 transform skew-x-12 translate-x-1/4 opacity-50 z-0"></div>

        <div className="container mx-auto px-4 relative z-10">
          <Link
            to="/profissionais"
            className="inline-flex items-center text-gold-500 hover:text-gold-400 mb-8 transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            Voltar para lista
          </Link>

          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="w-full md:w-1/3 max-w-sm mx-auto md:mx-0">
              <div className="relative rounded-lg overflow-hidden shadow-2xl border-4 border-gold-600/30">
                <img
                  src={professional.image}
                  alt={professional.name}
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <span className="text-gold-500 font-bold tracking-widest uppercase text-sm mb-2 block">
                {professional.role}
              </span>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
                {professional.name}
              </h1>
              <p className="text-neutral-400 text-lg mb-8">
                {professional.area} | {professional.location}
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <a
                  href={`mailto:${professional.email}`}
                  className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded transition-colors text-sm"
                >
                  <Mail size={16} className="text-gold-500" />
                  {professional.email}
                </a>
                <a
                  href={`tel:${professional.phone}`}
                  className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded transition-colors text-sm"
                >
                  <Phone size={16} className="text-gold-500" />
                  {professional.phone}
                </a>
                <a
                  href={professional.linkedin}
                  className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded transition-colors text-sm"
                >
                  <Linkedin size={16} className="text-gold-500" />
                  LinkedIn
                </a>
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-neutral-300">
                  {professional.bio || "Descrição não disponível."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Left Column: Education & OAB */}
            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Award className="text-gold-600" size={28} />
                  <h3 className="text-2xl font-serif font-bold text-neutral-900">
                    Registro Profissional
                  </h3>
                </div>
                <div className="bg-neutral-50 p-6 rounded-lg border-l-4 border-gold-500 shadow-sm">
                  <p className="font-bold text-xl text-neutral-800">
                    {professional.oab || "Consultar"}
                  </p>
                  <p className="text-sm text-neutral-500">
                    Ordem dos Advogados do Brasil
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-6">
                  <GraduationCap className="text-gold-600" size={28} />
                  <h3 className="text-2xl font-serif font-bold text-neutral-900">
                    Formação Acadêmica
                  </h3>
                </div>
                <ul className="space-y-4">
                  {professional.education &&
                  professional.education.length > 0 ? (
                    professional.education.map((edu, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-neutral-700"
                      >
                        <div className="w-2 h-2 rounded-full bg-gold-400 mt-2"></div>
                        <span>{edu}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-neutral-500 italic">
                      Informações acadêmicas não disponíveis.
                    </p>
                  )}
                </ul>
              </div>
            </div>

            {/* Right Column: Specializations */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="text-gold-600" size={28} />
                <h3 className="text-2xl font-serif font-bold text-neutral-900">
                  Especializações
                </h3>
              </div>
              <div className="grid gap-4">
                {professional.specializations &&
                professional.specializations.length > 0 ? (
                  professional.specializations.map((spec, index) => (
                    <div
                      key={index}
                      className="bg-neutral-50 p-4 rounded hover:bg-neutral-100 transition-colors border border-transparent hover:border-gold-200"
                    >
                      <p className="font-semibold text-neutral-800">{spec}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-neutral-500 italic">
                    Nenhuma especialização listada.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};
