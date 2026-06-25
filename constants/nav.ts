import type { NavItem } from "../types";

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", path: "/" },
  {
    label: "Sobre Nós",
    path: "/sobre",
    subItems: [
      { label: "Entrega e Soluções", path: "/sobre/entrega" },
      { label: "Pensamento Inovador", path: "/sobre/inovacao" },
      { label: "Depoimentos", path: "/sobre/depoimentos" },
    ],
  },
  { label: "Profissionais", path: "/profissionais" },
  { label: "Áreas de Atuação", path: "/areas" },
  { label: "Blog", path: "/blog" },
  {
    label: "Diagnóstico Tributário",
    path: "/diagnostico-reforma-tributaria",
    highlight: true,
  },
];
