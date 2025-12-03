import { Professional, AreaOfPractice, BlogPost, NavItem } from './types';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/' },
  { 
    label: 'Sobre Nós', 
    path: '/sobre',
    subItems: [
      { label: 'Somos ELADV', path: '/sobre/somos' },
      { label: 'Entrega e Soluções', path: '/sobre/entrega' },
      { label: 'Pensamento Inovador', path: '/sobre/inovacao' },
      { label: 'Prêmios', path: '/sobre/premios' },
    ]
  },
  { label: 'Profissionais', path: '/profissionais' },
  { label: 'Áreas de Atuação', path: '/areas' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contato', path: '/contato' },
];

export const AREAS: AreaOfPractice[] = [
  { id: 1, title: 'Direito Empresarial', slug: 'empresarial', description: 'Soluções corporativas completas para empresas.', image: 'https://picsum.photos/800/1200?grayscale&random=1' },
  { id: 2, title: 'Direito Tributário', slug: 'tributario', description: 'Planejamento e contencioso fiscal.', image: 'https://picsum.photos/800/1200?grayscale&random=2' },
  { id: 3, title: 'Direito Trabalhista', slug: 'trabalhista', description: 'Gestão de passivo e consultoria RH.', image: 'https://picsum.photos/800/1200?grayscale&random=3' },
  { id: 4, title: 'Contratos', slug: 'contratos', description: 'Elaboração e análise de instrumentos contratuais.', image: 'https://picsum.photos/800/1200?grayscale&random=4' },
  { id: 5, title: 'Direito Digital', slug: 'digital', description: 'LGPD e proteção de dados.', image: 'https://picsum.photos/800/1200?grayscale&random=5' },
  { id: 6, title: 'Agronegócio', slug: 'agro', description: 'Suporte jurídico para o setor rural.', image: 'https://picsum.photos/800/1200?grayscale&random=6' },
];

export const PROFESSIONALS: Professional[] = [
  { id: 1, name: 'Dr. Carlos Silva', role: 'Sócio', area: 'Direito Empresarial', location: 'Montes Claros - MG', email: 'carlos@eladv.com', phone: '(38) 3222-0000', linkedin: '#', image: 'https://picsum.photos/400/500?grayscale&random=10' },
  { id: 2, name: 'Dra. Ana Pereira', role: 'Sócio', area: 'Direito Tributário', location: 'Belo Horizonte - MG', email: 'ana@eladv.com', phone: '(31) 3222-0000', linkedin: '#', image: 'https://picsum.photos/400/500?grayscale&random=11' },
  { id: 3, name: 'Dr. Roberto Mendes', role: 'Associado', area: 'Direito Trabalhista', location: 'Montes Claros - MG', email: 'roberto@eladv.com', phone: '(38) 3222-0000', linkedin: '#', image: 'https://picsum.photos/400/500?grayscale&random=12' },
  { id: 4, name: 'Dra. Fernanda Costa', role: 'Advogado Sênior', area: 'Direito Digital', location: 'São Paulo - SP', email: 'fernanda@eladv.com', phone: '(11) 3222-0000', linkedin: '#', image: 'https://picsum.photos/400/500?grayscale&random=13' },
  { id: 5, name: 'Dr. Lucas Oliveira', role: 'Advogado Pleno', area: 'Contratos', location: 'Montes Claros - MG', email: 'lucas@eladv.com', phone: '(38) 3222-0000', linkedin: '#', image: 'https://picsum.photos/400/500?grayscale&random=14' },
];

export const BLOG_POSTS: BlogPost[] = [
  { id: 1, title: 'A importância do Compliance Trabalhista', summary: 'Saiba como adequar sua empresa às novas normas e evitar passivos judiciais.', date: '20 Out 2023', category: 'Trabalhista', slug: 'compliance-trabalhista', image: 'https://picsum.photos/800/400?grayscale&random=20' },
  { id: 2, title: 'Reforma Tributária: O que muda?', summary: 'Uma análise profunda sobre os impactos da reforma para o setor de serviços.', date: '15 Out 2023', category: 'Tributário', slug: 'reforma-tributaria', image: 'https://picsum.photos/800/400?grayscale&random=21' },
  { id: 3, title: 'LGPD no Agronegócio', summary: 'Desafios e soluções para a proteção de dados no campo.', date: '10 Out 2023', category: 'Agronegócio', slug: 'lgpd-agro', image: 'https://picsum.photos/800/400?grayscale&random=22' },
];

export const LOCATIONS = ['Montes Claros - MG', 'Belo Horizonte - MG', 'São Paulo - SP'];
export const ROLES = ['Sócio', 'Associado', 'Advogado Sênior', 'Advogado Pleno', 'Advogado Júnior'];
