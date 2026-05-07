import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Hero } from "../components/Components";
import { LOCATIONS, ROLES, AREAS } from "../constants";
import { Linkedin, Mail, Phone } from "lucide-react";
import { SEO } from "../components/SEO";
import { ScrollReveal } from "../components/ScrollReveal";
import { getApiBaseUrl } from "../utils/api";

const API_URL = getApiBaseUrl();

interface Professional {
  id: number;
  name: string;
  role: string;
  oab: string;
  area: string;
  image: string;
  bio: string;
  email: string;
  linkedin: string;
  phone: string;
  location?: string;
}

export const Professionals: React.FC = () => {
  const navigate = useNavigate();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const response = await fetch(`${API_URL}/professionals`);
        const data = await response.json();
        // Check if data is array direct (Postgres controller) or { success: ... }
        if (Array.isArray(data)) {
          setProfessionals(data);
        } else if (data.success && Array.isArray(data.professionals)) {
          setProfessionals(data.professionals);
        }
      } catch (error) {
        console.error("Error fetching professionals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedLocation,
    selectedArea,
    selectedRole,
    selectedLetter,
  ]);

  const filteredProfessionals = useMemo(() => {
    const hasFilters =
      searchTerm ||
      selectedLocation ||
      selectedArea ||
      selectedRole ||
      selectedLetter;

    let filtered = professionals.filter((p) => {
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

    // Dr. Elilon sempre primeiro quando não há filtros
    if (!hasFilters) {
      filtered = filtered.sort((a, b) => {
        if (a.name.includes("Elilon")) return -1;
        if (b.name.includes("Elilon")) return 1;
        return 0;
      });
    }

    return filtered;
  }, [
    professionals,
    searchTerm,
    selectedLocation,
    selectedArea,
    selectedRole,
    selectedLetter,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredProfessionals.length / ITEMS_PER_PAGE);
  const paginatedProfessionals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProfessionals.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProfessionals, currentPage]);

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
            {loading ? (
              <div className="col-span-full text-center py-20 text-neutral-500">
                Carregando profissionais...
              </div>
            ) : paginatedProfessionals.length > 0 ? (
              paginatedProfessionals.map((prof, index) => (
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
                        src={
                          prof.image ||
                          "https://via.placeholder.com/300x400?text=Sem+Foto"
                        }
                        alt={prof.name}
                        className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://via.placeholder.com/300x400?text=Sem+Foto";
                        }}
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
                        {prof.location || "Escritório Central"}
                      </p>

                      <div className="flex space-x-3 mt-auto">
                        {prof.email && (
                          <a
                            href={`mailto:${prof.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-neutral-400 hover:text-accent-600"
                          >
                            <Mail size={16} />
                          </a>
                        )}
                        {prof.phone && (
                          <a
                            href={`tel:${prof.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-neutral-400 hover:text-accent-600"
                          >
                            <Phone size={16} />
                          </a>
                        )}
                        {prof.linkedin && (
                          <a
                            href={prof.linkedin}
                            onClick={(e) => e.stopPropagation()}
                            className="text-neutral-400 hover:text-accent-600"
                          >
                            <Linkedin size={16} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-neutral-500">
                Nenhum profissional encontrado.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-neutral-300 text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border transition-colors ${
                      currentPage === page
                        ? "bg-accent-600 text-white border-accent-600"
                        : "border-neutral-300 text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-neutral-300 text-neutral-600 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};
