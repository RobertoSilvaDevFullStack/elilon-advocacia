import { Professional, AreaOfPractice, BlogPost, NavItem } from "./types";

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
  { label: "Diagnóstico Tributário", path: "/diagnostico-reforma-tributaria", highlight: true },
];

export const AREAS: AreaOfPractice[] = [
  {
    id: 1,
    title: "Direito Trabalhista",
    slug: "trabalhista",
    description:
      "Consultoria em rescisões, contratos e compliance trabalhista.",
    image: "/images/direito-trabalhista.webp",
  },
  {
    id: 3,
    title: "Direito Previdenciário",
    slug: "previdenciario",
    description:
      "Planejamento previdenciário e requerimento de benefícios do INSS.",
    image: "/images/direito-previdenciario.webp",
  },
  {
    id: 5,
    title: "Direito Tributário",
    slug: "tributario",
    description:
      "Planejamento tributário, defesa em autuações e recuperação de créditos.",
    image: "/images/direito-tributario.webp",
  },
  {
    id: 4,
    title: "Direito Imobiliário",
    slug: "imobiliario",
    description:
      "Assessoria em compra, venda, locação e regularização de imóveis.",
    image: "/images/direito-imobiliario.webp",
  },
  {
    id: 2,
    title: "Direito Civil",
    slug: "civil",
    description:
      "Soluções em contratos, responsabilidade civil, família e sucessões.",
    image: "/images/direito-civil.webp",
  },
];

export const PROFESSIONALS: Professional[] = [
  {
    id: 1,
    name: "Dr. Elilon Lopes",
    role: "Sócio",
    area: "Direito Trabalhista",
    location: "Montes Claros - MG",
    email: "juridico@elilonlopesadvogados.com.br",
    phone: "(38) 2200-1615",
    linkedin: "https://www.linkedin.com/in/elilon-lopes/",
    image: "/images/elilon-lopes.webp",
    bio: "Dr. Elilon Lopes possui mais de 20 anos de experiência em Direito Trabalhista Empresarial, atuando na defesa dos interesses de grandes corporações. É referência em negociações sindicais e gestão de passivo trabalhista.",
    oab: "OAB/MG 00.000",
    education: [
      "Graduação em Direito pela Unimontes",
      "Pós-graduação em Direito do Trabalho pela PUC-MG",
      "Mestrado em Direito Empresarial pela UFMG",
    ],
    specializations: [
      "Direito Trabalhista Empresarial",
      "Negociações Sindicais",
      "Compliance Trabalhista",
    ],
  },
  {
    id: 2,
    name: "Dr. Einsteinberg Ribeiro Monção",
    role: "Associado",
    area: "Direito Civil",
    location: "Montes Claros - MG",
    email: "einstemberg@elilonlopesadvogados.com.br",
    phone: "(38) 2200-1615",
    linkedin:
      "https://www.linkedin.com/in/einsteinberg-ribeiro-mon%C3%A7%C3%A3o-210b41275/",
    image: "/images/einsteinberg-ribeiro-mourao.webp",
    bio: "Dr. Einsteinberg Ribeiro Monção é advogado formado pela Universidade Estadual de Montes Claros (UNIMONTES), com experiência consolidada em instituições de prestígio como a Justiça Federal e a Polícia Federal. Na Justiça Federal, atuou diretamente no apoio à análise processual e organização de documentos jurídicos estratégicos. Na Polícia Federal, desenvolveu expertise em procedimentos investigativos complexos e suporte às demandas institucionais. Sua atuação é marcada pela ética, técnica e estratégia, oferecendo soluções jurídicas seguras e personalizadas.",
    oab: "OAB/MG",
    education: [
      "Bacharelado em Direito pela Universidade Estadual de Montes Claros (UNIMONTES)",
    ],
    specializations: [
      "Direito Civil",
      "Direito Administrativo",
      "Consultoria Jurídica Estratégica",
    ],
  },
  {
    id: 3,
    name: "Dra. Ana Flávia Cordeiro",
    role: "Associado",
    area: "Direito Trabalhista",
    location: "Montes Claros - MG",
    email: "Anaflaviacordeiro@elilonlopesadvogados.com.br",
    phone: "(38) 2200-1615",
    linkedin: "#",
    image: "/images/ana-flavia-cordeiro.webp",
    bio: "Dra. Ana Flávia Cordeiro é advogada formada pela Universidade Estadual de Montes Claros (UNIMONTES), com trajetória voltada à justiça e equidade. Atualmente, é pós-graduanda em Direitos Humanos, Direito das Pessoas Vulneráveis e Direito do Consumidor pela Faculdade I9 e aluna especial do Mestrado em Desenvolvimento Social da UNIMONTES. Especialista em Direito e Processo do Trabalho, oferece assessoramento jurídico estratégico e humanizado, buscando soluções eficazes para empresas e indivíduos sempre pautada na ética e transparência.",
    oab: "OAB/MG",
    education: [
      "Bacharelado em Direito pela Universidade Estadual de Montes Claros (UNIMONTES)",
      "Pós-graduação em Direitos Humanos e Consumidor pela Faculdade I9 (Em andamento)",
      "Aluna Especial PPGDS - Desigualdades e Reconhecimento (UNIMONTES)",
    ],
    specializations: [
      "Direito e Processo do Trabalho",
      "Direitos Humanos e Vulneráveis",
      "Direito do Consumidor",
    ],
  },
  {
    id: 4,
    name: "Dra. Clara Marinho de Caires Nunes",
    role: "Associado",
    area: "Direito Previdenciário",
    location: "Montes Claros - MG",
    email: "claramarinho@elilonlopesadvogados.com.br",
    phone: "(38) 2200-1615",
    linkedin: "https://www.linkedin.com/in/claramarinhocn/",
    image: "/images/clara.webp",
    bio: "Dra. Clara Marinho de Caires Nunes é advogada inscrita na OAB/MG nº 240.870, graduada pela UNIMONTES e pós-graduanda em Direitos Humanos e Direito do Trabalho. Com sólida experiência jurídico-administrativa, destaca-se pela gestão, organização e produção de conteúdo jurídico. Possui formação complementar em idiomas (Inglês, Espanhol e Chinês), o que lhe confere uma visão global e versátil na resolução de demandas.",
    oab: "OAB/MG 240.870",
    education: [
      "Bacharelado em Direito pela Universidade Estadual de Montes Claros (UNIMONTES)",
      "Pós-graduação em Direitos Humanos e Direito do Trabalho (Em andamento)",
      "Idiomas: Inglês, Espanhol e Chinês",
    ],
    specializations: [
      "Direito do Trabalho",
      "Direitos Humanos",
      "Gestão Jurídica",
    ],
  },
  {
    id: 5,
    name: "Controladora Jurídica Nadine",
    role: "Associado",
    area: "Direito Imobiliário",
    location: "Montes Claros - MG",
    email: "nadinysilva@elilonlopesadvogados.com.br",
    phone: "(38) 2200-1615",
    linkedin: "https://www.linkedin.com/in/nadiny-silva-14bb02235/",
    image: "/images/nadine.webp",
    bio: "Atua com excelência no setor imobiliário, assessorando construtoras, incorporadoras e investidores. Especialista em regularização fundiária e contratos de compra e venda.",
    oab: "OAB/MG",
    education: [
      "Graduação em Direito pela Unimontes",
      "Pós-graduação em Direito Imobiliário pela Fadi",
    ],
    specializations: [
      "Incorporação Imobiliária",
      "Regularização de Imóveis",
      "Contratos Locatícios",
    ],
  },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "A importância do Compliance Trabalhista",
    summary:
      "Saiba como adequar sua empresa às novas normas e evitar passivos judiciais.",
    date: "20 Out 2023",
    category: "Trabalhista",
    slug: "compliance-trabalhista",
    image: "/images/compliance-trabalhista.webp",
    author: "Dr. Elilon Lopes",
    content: `
      <p>O <strong>Compliance Trabalhista</strong> tornou-se uma ferramenta indispensável para empresas que buscam sustentabilidade e segurança jurídica. Muito além de apenas cumprir a lei, um programa de compliance eficaz estabelece uma cultura ética e transparente no ambiente corporativo.</p>

      <h3>O que é Compliance Trabalhista?</h3>
      <p>Trata-se de um conjunto de medidas e políticas internas destinadas a garantir que a empresa esteja em conformidade com a legislação trabalhista, normas regulamentadoras e convenções coletivas. O objetivo é prevenir riscos, evitar passivos trabalhistas e promover um ambiente de trabalho saudável.</p>

      <h3>Benefícios da Implementação</h3>
      <ul>
        <li><strong>Redução de Passivos:</strong> A prevenção é sempre mais econômica que a correção. Evitar multas administrativas e ações judiciais é um dos principais retornos.</li>
        <li><strong>Reputação da Marca:</strong> Empresas que respeitam seus colaboradores e seguem as normas ganham destaque positivo no mercado.</li>
        <li><strong>Produtividade:</strong> Um ambiente seguro e ético motiva a equipe e reduz a rotatividade.</li>
      </ul>

      <h3>Como implementar?</h3>
      <p>A implementação deve ser personalizada, mas geralmente envolve:</p>
      <ol>
        <li>Auditoria inicial para identificar riscos;</li>
        <li>Criação de um Código de Conduta;</li>
        <li>Revisão de contratos e políticas internas;</li>
        <li>Treinamento contínuo dos colaboradores e gestores;</li>
        <li>Criação de canais de denúncia.</li>
      </ol>

      <p>Em um cenário de mudanças constantes na legislação, contar com assessoria jurídica especializada é fundamental para manter o programa de compliance sempre atualizado e eficaz.</p>
    `,
  },
  {
    id: 2,
    title: "Reforma Tributária: O que muda?",
    summary:
      "Uma análise profunda sobre os impactos da reforma para o setor de serviços.",
    date: "15 Out 2023",
    category: "Tributário",
    slug: "reforma-tributaria",
    image: "/images/reforma-tributaria.webp",
    author: "Equipe Elilon Advocacia",
    content: `
      <p>A <strong>Reforma Tributária</strong> aprovada recentemente traz mudanças estruturais significativas para o sistema brasileiro, com impactos diretos sobre todos os setores da economia, especialmente o de serviços.</p>

      <h3>Principais Mudanças</h3>
      <p>A substituição de cinco tributos (PIS, COFINS, IPI, ICMS e ISS) pelo IVA Dual (CBS e IBS) visa simplificar a arrecadação, mas exige atenção redobrada das empresas durante o período de transição.</p>

      <h3>Impactos no Setor de Serviços</h3>
      <p>Historicamente, o setor de serviços possuía uma carga tributária sobre o consumo menor em comparação à indústria. Com a unificação, estima-se que a alíquota final possa ser superior à atual para muitas empresas deste segmento.</p>
      
      <p>No entanto, a não cumulatividade plena permitirá o aproveitamento de créditos sobre insumos, o que pode mitigar o aumento da carga em alguns casos. É crucial realizar um planejamento tributário detalhado para entender o impacto real no seu negócio.</p>

      <h3>Obrigações Acessórias</h3>
      <p>A promessa é de redução drástica na burocracia e nas obrigações acessórias, liberando recursos das empresas para focar em suas atividades fim.</p>

      <p>Esta é uma fase de adaptação. Recomendamos que os empresários busquem orientação jurídica e contábil para se prepararem estrategicamente para o novo cenário fiscal brasileiro.</p>
    `,
  },
  {
    id: 3,
    title: "Aposentadoria por Idade: Como se Planejar",
    summary: "Dicas essenciais para garantir seu benefício previdenciário.",
    date: "12 Out 2023",
    category: "Previdenciário",
    slug: "aposentadoria-planejamento",
    image: "/images/previdenciario.webp",
    author: "Dra. Clara Marinho",
    content: `
      <p>O <strong>planejamento previdenciário</strong> é fundamental para garantir uma aposentadoria tranquila e sem surpresas. Muitos segurados do INSS deixam para se preocupar com isso apenas quando estão próximos da idade, perdendo oportunidades de maximizar seu benefício.</p>

      <h3>Requisitos Básicos</h3>
      <p>Para a aposentadoria por idade, o segurado precisa comprovar:</p>
      <ul>
        <li><strong>Tempo de Contribuição:</strong> 15 anos de trabalho com carteira assinada ou recolhimento como contribuinte individual.</li>
        <li><strong>Idade:</strong> 65 anos para homens e 62 anos para mulheres.</li>
      </ul>

      <h3>Como Maximizar seu Benefício?</h3>
      <p>O valor da aposentadoria é calculado com base na média de todos os salários de contribuição desde julho de 1994. Para obter o melhor benefício possível:</p>
      <ol>
        <li>Verifique se todas as suas contribuições estão corretamente registradas;</li>
        <li>Considera fazer o recolhimento em atraso de períodos não computados;</li>
        <li>Avalie a possibilidade de descontar períodos de baixa remuneração;</li>
        <li>Planeje a data exata do requerimento.</li>
      </ol>

      <p>A assessoria de um advogado previdenciário pode fazer diferença significativa no valor do seu benefício. Entre em contato para uma análise personalizada.</p>
    `,
  },
  {
    id: 4,
    title: "LGPD no Agronegócio",
    summary: "Desafios e soluções para a proteção de dados no campo.",
    date: "10 Out 2023",
    category: "Agronegócio",
    slug: "lgpd-agro",
    image: "/images/lgpd-agro.webp",
    author: "Dra. Nadine",
    content: `
      <p>A <strong>Lei Geral de Proteção de Dados (LGPD)</strong> não se restringe às empresas de tecnologia ou grandes centros urbanos. O Agronegócio, cada vez mais tecnológico e conectado, lida com um volume imenso de dados que precisam de proteção.</p>

      <h3>Dados no Campo</h3>
      <p>Produtores rurais coletam dados de:</p>
      <ul>
        <li>Funcionários e parceiros comerciais;</li>
        <li>Fornecedores e prestadores de serviços;</li>
        <li>Tecnologias de precisão (drones, sensores) que podem captar informações pessoais indiretas.</li>
      </ul>

      <h3>Riscos e Penalidades</h3>
      <p>O vazamento de informações ou o tratamento inadequado de dados pode acarretar multas pesadas, além de danos à reputação perante parceiros comerciais e exportadores, que exigem cada vez mais conformidade (compliance) de toda a cadeia produtiva.</p>

      <h3>Adequação no Agro</h3>
      <p>O processo de adequação envolve o mapeamento dos dados coletados, a revisão de contratos com fornecedores de software e tecnologia, e o treinamento das equipes.</p>

      <p>Adotar a LGPD no campo é um diferencial competitivo, demonstrando profissionalismo e segurança para o mercado internacional.</p>
    `,
  },
];

export const LOCATIONS = [
  "Montes Claros - MG",
  "Belo Horizonte - MG",
  "São Paulo - SP",
];
export const ROLES = [
  "Sócio",
  "Associado",
  "Advogado Sênior",
  "Advogado Pleno",
  "Advogado Júnior",
];
