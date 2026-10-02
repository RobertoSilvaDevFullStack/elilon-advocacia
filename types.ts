export interface Professional {
  id: number;
  name: string;
  role:
    | "Sócio"
    | "Associado"
    | "Advogado Sênior"
    | "Advogado Pleno"
    | "Advogado Júnior";
  area: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  image: string;
  bio?: string;
  oab?: string;
  education?: string[];
  specializations?: string[];
}

export interface AreaOfPractice {
  id: number;
  title: string;
  description: string;
  slug: string;
  image: string;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  slug: string;
  content?: string;
  author?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  interest: string;
  message: string;
  timestamp: string;
  status: "Novo" | "Em contato" | "Arquivado";
}

export interface NavItem {
  label: string;
  path: string;
  subItems?: { label: string; path: string }[];
  highlight?: boolean;
}
