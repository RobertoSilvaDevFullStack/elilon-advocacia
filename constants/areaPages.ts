export interface AreaPageSection {
  title: string;
  text: string;
}

export interface AreaPageContent {
  slug: string;
  headline: string;
  lead: string;
  introTitle: string;
  intro: string;
  sections: AreaPageSection[];
  closing: string;
  ctaLabel: string;
}

/** Conteúdo editorial das páginas de área — alinhado ao posicionamento Elilon. */
export const AREA_PAGES: AreaPageContent[] = [
  {
    slug: "trabalhista-bancario",
    headline: "Advogado Trabalhista para Bancários",
    lead: "O setor bancário tem direitos específicos. Defendê-los exige quem conhece essa realidade por dentro.",
    introTitle: "Bancários têm direitos que vão além da CLT",
    intro:
      "A categoria bancária possui convenção coletiva própria, com regras sobre jornada, horas extras, cargos de gestão e remuneração variável. Instituições financeiras conhecem bem essas regras — e, em muitos casos, se aproveitam do desconhecimento do trabalhador. No Elilon Lopes Advogados, atuamos na defesa de bancários que tiveram direitos desrespeitados: horas extras incorretas, enquadramento indevido como cargo de confiança, assédio moral ou rescisões com verbas calculadas de forma equivocada.",
    sections: [
      {
        title: "Horas extras e jornada bancária",
        text: "A jornada de 6 horas é um direito da categoria. Quando desrespeitada, ou quando o cargo de confiança é aplicado indevidamente para suprimir esse direito, é possível buscar a reparação pelas horas trabalhadas além do permitido.",
      },
      {
        title: "Assédio moral e pressão por metas",
        text: "Cobranças abusivas, exposição em rankings, ameaças veladas e pressão constante por desempenho são práticas frequentes no setor bancário e podem configurar assédio moral passível de reparação.",
      },
      {
        title: "Cargo de confiança indevido",
        text: "Receber uma gratificação de função não significa automaticamente abrir mão dos direitos da categoria. Analisamos se o enquadramento feito pelo banco é legítimo ou uma forma de reduzir seus direitos.",
      },
      {
        title: "Rescisão e verbas trabalhistas",
        text: "Planos de demissão voluntária, desligamentos após reestruturações e rescisões negociadas envolvem valores consideráveis. Antes de assinar, é fundamental entender o que cada cláusula representa.",
      },
    ],
    closing:
      "Trabalhou anos em banco, contribuiu para metas, liderou equipes — e agora seus direitos não estão sendo respeitados. Atuamos para que sua trajetória profissional seja reconhecida dentro e fora da instituição.",
    ctaLabel: "Quero falar sobre meu caso",
  },
  {
    slug: "trabalhista",
    headline: "Direito Trabalhista",
    lead: "Consultoria e defesa em relações de trabalho — para empresas e profissionais.",
    introTitle: "Prevenção e defesa com estratégia",
    intro:
      "Atuamos em rescisões, contratos, compliance trabalhista e litígios na Justiça do Trabalho. O objetivo é reduzir passivos, organizar processos internos e defender direitos com clareza técnica.",
    sections: [
      {
        title: "Rescisões e verbas",
        text: "Análise de cálculos, homologações e negociações de desligamento para evitar prejuízos e surpresas futuras.",
      },
      {
        title: "Contratos e políticas internas",
        text: "Revisão de contratos de trabalho, políticas de jornada e documentos internos alinhados à legislação vigente.",
      },
      {
        title: "Compliance trabalhista",
        text: "Diagnóstico de riscos e recomendações práticas para empresas que querem prevenir processos.",
      },
      {
        title: "Defesa em reclamatórias",
        text: "Atuação estratégica em ações trabalhistas, com foco em resultado e comunicação clara com o cliente.",
      },
    ],
    closing:
      "Seja na prevenção ou na defesa, tratamos cada demanda com atenção ao detalhe e à estratégia do caso.",
    ctaLabel: "Fale com um advogado",
  },
  {
    slug: "previdenciario",
    headline: "Direito Previdenciário",
    lead: "Planejamento previdenciário e benefícios do INSS com acompanhamento técnico.",
    introTitle: "Aposentadoria e benefícios com segurança",
    intro:
      "Orientamos segurados e empresas em requerimentos, revisões e planejamento previdenciário — para que decisões importantes não sejam tomadas no escuro.",
    sections: [
      {
        title: "Aposentadorias",
        text: "Análise de tempo de contribuição, regras de transição e melhores estratégias para o benefício.",
      },
      {
        title: "Benefícios por incapacidade",
        text: "Auxílio-doença, aposentadoria por invalidez e demais benefícios vinculados à capacidade laboral.",
      },
      {
        title: "Revisões e recursos",
        text: "Revisão de benefícios concedidos e recursos administrativos quando o INSS indefere o pedido.",
      },
      {
        title: "Planejamento",
        text: "Simulações e planejamento para quem quer se aposentar com previsibilidade e menos risco.",
      },
    ],
    closing:
      "O planejamento previdenciário bem feito evita erros caros. Estamos prontos para analisar o seu caso.",
    ctaLabel: "Quero orientação previdenciária",
  },
  {
    slug: "tributario",
    headline: "Direito Tributário",
    lead: "Planejamento, defesa em autuações e recuperação de créditos tributários.",
    introTitle: "Tributos com estratégia e conformidade",
    intro:
      "Apoiamos empresas e contribuintes em planejamento tributário, contencioso administrativo e judicial, e na identificação de oportunidades legítimas de recuperação de créditos.",
    sections: [
      {
        title: "Planejamento tributário",
        text: "Estruturação de operações e regimes com foco em eficiência e segurança jurídica.",
      },
      {
        title: "Defesa em autuações",
        text: "Resposta a autos de infração e defesa administrativa e judicial em matéria fiscal.",
      },
      {
        title: "Recuperação de créditos",
        text: "Identificação e pleito de créditos tributários indevidamente recolhidos.",
      },
      {
        title: "Reforma e adequação",
        text: "Orientação sobre impactos da reforma tributária e adequação de processos internos.",
      },
    ],
    closing:
      "Tributação exige técnica e visão de negócio. Vamos analisar a situação da sua empresa.",
    ctaLabel: "Falar sobre tributário",
  },
  {
    slug: "imobiliario",
    headline: "Direito Imobiliário",
    lead: "Assessoria em compra, venda, locação e regularização de imóveis.",
    introTitle: "Segurança jurídica em negócios imobiliários",
    intro:
      "Atuamos em contratos, due diligence, regularização fundiária e litígios imobiliários — para que o patrimônio esteja protegido em cada etapa.",
    sections: [
      {
        title: "Compra e venda",
        text: "Análise documental, contratos e cuidados na aquisição ou alienação de imóveis.",
      },
      {
        title: "Locação",
        text: "Contratos de locação, garantias e resolução de conflitos entre locador e locatário.",
      },
      {
        title: "Regularização",
        text: "Regularização de imóveis, inventários e questões registrais.",
      },
      {
        title: "Incorporação e construção",
        text: "Assessoria a construtoras, incorporadoras e investidores em operações do setor.",
      },
    ],
    closing:
      "Negócio imobiliário bem estruturado começa com análise jurídica. Conte conosco.",
    ctaLabel: "Fale sobre seu imóvel",
  },
  {
    slug: "empresarial",
    headline: "Direito Empresarial",
    lead: "Consultoria societária, contratos e compliance para o crescimento seguro do negócio.",
    introTitle: "Empresas que se protegem crescem com mais segurança",
    intro:
      "Apoiamos empresários na organização societária, contratos comerciais e compliance — prevenindo passivos e fortalecendo a governança.",
    sections: [
      {
        title: "Societário",
        text: "Constituição, alterações contratuais, acordos de sócios e reestruturações.",
      },
      {
        title: "Contratos comerciais",
        text: "Elaboração e revisão de contratos alinhados ao risco e ao objetivo do negócio.",
      },
      {
        title: "Compliance",
        text: "Políticas internas e práticas que reduzem exposição legal e reputacional.",
      },
      {
        title: "Contencioso empresarial",
        text: "Defesa e cobrança em disputas comerciais e societárias.",
      },
    ],
    closing:
      "Prevenir custa menos do que remediar. Vamos estruturar a proteção jurídica do seu negócio.",
    ctaLabel: "Falar com o escritório",
  },
  {
    slug: "civel",
    headline: "Direito Cível",
    lead: "Demandas cíveis, contratos e responsabilidade civil com atendimento próximo.",
    introTitle: "Soluções cíveis com clareza e técnica",
    intro:
      "Atuamos em obrigações, contratos, indenizações e demais demandas do Direito Civil — sempre com comunicação clara e estratégia definida.",
    sections: [
      {
        title: "Contratos",
        text: "Elaboração, revisão e litígios decorrentes de relações contratuais.",
      },
      {
        title: "Responsabilidade civil",
        text: "Indenizações por danos materiais e morais, com análise objetiva do caso.",
      },
      {
        title: "Obrigações e cobranças",
        text: "Cobrança e defesa em dívidas e obrigações civis.",
      },
      {
        title: "Família e sucessões (quando aplicável)",
        text: "Orientação em inventários e questões patrimoniais relacionadas.",
      },
    ],
    closing:
      "Cada demanda cível tem um caminho. Vamos definir o melhor para o seu caso.",
    ctaLabel: "Entrar em contato",
  },
];

export function getAreaPage(slug: string): AreaPageContent | undefined {
  return AREA_PAGES.find((p) => p.slug === slug);
}
