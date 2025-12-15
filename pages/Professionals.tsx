import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Hero, SectionTitle } from "../components/Components";
import { PROFESSIONALS, LOCATIONS, ROLES, AREAS } from "../constants";
import { Linkedin, Mail, Phone } from "lucide-react";
import { SEO } from "../components/SEO";
import { ScrollReveal } from "../components/ScrollReveal";

export const Professionals: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("");

  const filteredProfessionals = useMemo(() => {
    return PROFESSIONALS.filter((p) => {
      const matchesSearch = p.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesLocation = selectedLocation
        ? p.location === selectedLocation
        : true;
      const matchesArea = selectedArea ? p.area === selectedArea : true;
      const matchesRole = selectedRole ? p.role === selectedRole : true;
      const matchesLetter = selectedLetter
        ? p.name
            .replace(/^(Dr\.|Dra\.)\s+/, "")
            .trim()
            .toUpperCase()
            .startsWith(selectedLetter)
        : true;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesArea &&
        matchesRole &&
        matchesLetter
      );
    });
  }, [
    searchTerm,
    selectedLocation,
    selectedArea,
    selectedRole,
    selectedLetter,
  ]);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <Layout>
      <SEO
        title="Nossos Profissionais"
        description="Conheça nossa equipe de advogados especialistas prontos para defender seus interesses."
      />
      <Hero
        title="Nossos Profissionais"
        subtitle="Equipe"
        image="/images/elilon-imac.JPG"
        height="small"
      />

      <section className="py-12 bg-white border-b border-neutral-200 sticky top-[70px] z-30 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Buscar por nome..."
              className="bg-neutral-50 border border-neutral-300 px-4 py-2 rounded-none focus:outline-none focus:border-accent-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="bg-neutral-50 border border-neutral-300 px-4 py-2 rounded-none focus:outline-none focus:border-accent-500"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">Todas as Filiais</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <select
              className="bg-neutral-50 border border-neutral-300 px-4 py-2 rounded-none focus:outline-none focus:border-accent-500"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
            >
              <option value="">Todas as Áreas</option>
              {AREAS.map((a) => (
                <option key={a.id} value={a.title}>
                  {a.title}
                </option>
              ))}
            </select>
            <select
              className="bg-neutral-50 border border-neutral-300 px-4 py-2 rounded-none focus:outline-none focus:border-accent-500"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Todas as Posições</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap justify-center gap-2 items-center text-sm">
            <button
              onClick={() => setSelectedLetter("")}
              className={`px-2 py-1 ${
                selectedLetter === ""
                  ? "font-bold text-accent-600"
                  : "text-neutral-500 hover:text-accent-600"
              }`}
            >
              TODOS
            </button>
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`px-2 py-1 ${
                  selectedLetter === letter
                    ? "font-bold text-accent-600 border-b border-accent-600"
                    : "text-neutral-400 hover:text-neutral-900"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProfessionals.length > 0 ? (
              filteredProfessionals.map((prof, index) => (
                <ScrollReveal
                  animation="fade-in-up"
                  delay={
                    `delay-${Math.min((index % 3) * 100 + 100, 500)}` as any
                  }
                  key={prof.id}
                >
                  <div
                    onClick={() => navigate(`/profissionais/${prof.id}`)}
                    key={prof.id}
                    className="bg-white group hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row h-full md:h-64 overflow-hidden cursor-pointer"
                  >
                    <div className="md:w-5/12 h-64 md:h-full relative overflow-hidden">
                      <img
                        src={prof.image}
                        alt={prof.name}
                        className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                    </div>
                    <div className="p-6 flex flex-col justify-center w-full md:w-7/12">
                      <span className="text-xs uppercase font-bold text-accent-600 mb-1">
                        {prof.role}
                      </span>
                      <h3 className="text-xl font-headline font-bold text-neutral-900 mb-2">
                        {prof.name}
                      </h3>
                      <p className="text-sm text-neutral-500 mb-4">
                        {prof.area}
                      </p>
                      <p className="text-xs text-neutral-400 mb-6">
                        {prof.location}
                      </p>

                      <div className="flex space-x-3 mt-auto">
                        <a
                          href={`mailto:${prof.email}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-neutral-400 hover:text-accent-600"
                        >
                          <Mail size={16} />
                        </a>
                        <a
                          href={`tel:${prof.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-neutral-400 hover:text-accent-600"
                        >
                          <Phone size={16} />
                        </a>
                        <a
                          href={prof.linkedin}
                          onClick={(e) => e.stopPropagation()}
                          className="text-neutral-400 hover:text-accent-600"
                        >
                          <Linkedin size={16} />
                        </a>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-neutral-500">
                Nenhum profissional encontrado com os filtros selecionados.
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};
