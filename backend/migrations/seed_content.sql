-- =========================================
-- SEED DATA: Áreas de Atuação
-- =========================================

INSERT INTO areas (id, title, slug, description, image) VALUES
(1, 'Direito Trabalhista', 'trabalhista', 'Consultoria em rescisões, contratos e compliance trabalhista.', '/images/direito-trabalhista.jpg'),
(2, 'Direito Civil', 'civil', 'Soluções em contratos, responsabilidade civil, família e sucessões.', '/images/direito-civil.png'),
(3, 'Direito Previdenciário', 'previdenciario', 'Planejamento previdenciário e requerimento de benefícios do INSS.', '/images/direito-previdenciario.jpg'),
(4, 'Direito Imobiliário', 'imobiliario', 'Assessoria em compra, venda, locação e regularização de imóveis.', '/images/direito-imobiliario.jpg'),
(5, 'Direito Tributário', 'tributario', 'Planejamento tributário, defesa em autuações e recuperação de créditos.', '/images/direito-tributario.jpg')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  image = EXCLUDED.image;

-- =========================================
-- SEED DATA: Profissionais
-- =========================================

INSERT INTO professionals (id, name, role, area, location, email, phone, linkedin, image, bio, oab, education, specializations) VALUES
(1, 'Dr. Elilon Lopes', 'Sócio', 'Direito Trabalhista', 'Montes Claros - MG', 'juridico@elilonlopesadvogados.com.br', '(38) 2200-1615', 'https://www.linkedin.com/in/elilon-lopes/', '/images/elilon-lopes.JPG', 'Dr. Elilon Lopes possui mais de 20 anos de experiência em Direito Trabalhista Empresarial, atuando na defesa dos interesses de grandes corporações. É referência em negociações sindicais e gestão de passivo trabalhista.', 'OAB/MG 00.000', '["Graduação em Direito pela Unimontes", "Pós-graduação em Direito do Trabalho pela PUC-MG", "Mestrado em Direito Empresarial pela UFMG"]'::jsonb, '["Direito Trabalhista Empresarial", "Negociações Sindicais", "Compliance Trabalhista"]'::jsonb),

(2, 'Dr. Einsteinberg Ribeiro Monção', 'Associado', 'Direito Civil', 'Montes Claros - MG', 'einstemberg@elilonlopesadvogados.com.br', '(38) 2200-1615', 'https://www.linkedin.com/in/einsteinberg-ribeiro-mon%C3%A7%C3%A3o-210b41275/', '/images/einsteinberg-ribeiro-mourao.jpeg', 'Dr. Einsteinberg Ribeiro Monção é advogado formado pela Universidade Estadual de Montes Claros (UNIMONTES), com experiência consolidada em instituições de prestígio como a Justiça Federal e a Polícia Federal. Na Justiça Federal, atuou diretamente no apoio à análise processual e organização de documentos jurídicos estratégicos. Na Polícia Federal, desenvolveu expertise em procedimentos investigativos complexos e suporte às demandas institucionais. Sua atuação é marcada pela ética, técnica e estratégia, oferecendo soluções jurídicas seguras e personalizadas.', 'OAB/MG', '["Bacharelado em Direito pela Universidade Estadual de Montes Claros (UNIMONTES)"]'::jsonb, '["Direito Civil", "Direito Administrativo", "Consultoria Jurídica Estratégica"]'::jsonb),

(3, 'Dra. Ana Flávia Cordeiro', 'Associado', 'Direito Trabalhista', 'Montes Claros - MG', 'Anaflaviacordeiro@elilonlopesadvogados.com.br', '(38) 2200-1615', '#', '/images/ana-flavia-cordeiro.jpeg', 'Dra. Ana Flávia Cordeiro é advogada formada pela Universidade Estadual de Montes Claros (UNIMONTES), com trajetória voltada à justiça e equidade. Atualmente, é pós-graduanda em Direitos Humanos, Direito das Pessoas Vulneráveis e Direito do Consumidor pela Faculdade I9 e aluna especial do Mestrado em Desenvolvimento Social da UNIMONTES. Especialista em Direito e Processo do Trabalho, oferece assessoramento jurídico estratégico e humanizado, buscando soluções eficazes para empresas e indivíduos sempre pautada na ética e transparência.', 'OAB/MG', '["Bacharelado em Direito pela Universidade Estadual de Montes Claros (UNIMONTES)", "Pós-graduação em Direitos Humanos e Consumidor pela Faculdade I9 (Em andamento)", "Aluna Especial PPGDS - Desigualdades e Reconhecimento (UNIMONTES)"]'::jsonb, '["Direito e Processo do Trabalho", "Direitos Humanos e Vulneráveis", "Direito do Consumidor"]'::jsonb),

(4, 'Dra. Clara Marinho de Caires Nunes', 'Associado', 'Direito Previdenciário', 'Montes Claros - MG', 'claramarinho@elilonlopesadvogados.com.br', '(38) 2200-1615', 'https://www.linkedin.com/in/claramarinhocn/', '/images/clara.jpeg', 'Dra. Clara Marinho de Caires Nunes é advogada inscrita na OAB/MG nº 240.870, graduada pela UNIMONTES e pós-graduanda em Direitos Humanos e Direito do Trabalho. Com sólida experiência jurídico-administrativa, destaca-se pela gestão, organização e produção de conteúdo jurídico. Possui formação complementar em idiomas (Inglês, Espanhol e Chinês), o que lhe confere uma visão global e versátil na resolução de demandas.', 'OAB/MG 240.870', '["Bacharelado em Direito pela Universidade Estadual de Montes Claros (UNIMONTES)", "Pós-graduação em Direitos Humanos e Direito do Trabalho (Em andamento)", "Idiomas: Inglês, Espanhol e Chinês"]'::jsonb, '["Direito do Trabalho", "Direitos Humanos", "Gestão Jurídica"]'::jsonb),

(5, 'Controladora Jurídica Nadine', 'Associado', 'Direito Imobiliário', 'Montes Claros - MG', 'nadinysilva@elilonlopesadvogados.com.br', '(38) 2200-1615', 'https://www.linkedin.com/in/nadiny-silva-14bb02235/', '/images/nadine.jpeg', 'Atua com excelência no setor imobiliário, assessorando construtoras, incorporadoras e investidores. Especialista em regularização fundiária e contratos de compra e venda.', 'OAB/MG', '["Graduação em Direito pela Unimontes", "Pós-graduação em Direito Imobiliário pela Fadi"]'::jsonb, '["Incorporação Imobiliária", "Regularização de Imóveis", "Contratos Locatícios"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  area = EXCLUDED.area,
  location = EXCLUDED.location,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  linkedin = EXCLUDED.linkedin,
  image = EXCLUDED.image,
  bio = EXCLUDED.bio,
  oab = EXCLUDED.oab,
  education = EXCLUDED.education,
  specializations = EXCLUDED.specializations;

-- =========================================
-- SEED DATA: Blog Posts
-- =========================================

INSERT INTO posts (id, title, slug, category, image, content, excerpt, author_id) VALUES
(1, 'A importância do Compliance Trabalhista', 'compliance-trabalhista', 'Trabalhista', '/images/compliance-trabalhista.jpg', '<p>O <strong>Compliance Trabalhista</strong> tornou-se uma ferramenta indispensável para empresas que buscam sustentabilidade e segurança jurídica. Muito além de apenas cumprir a lei, um programa de compliance eficaz estabelece uma cultura ética e transparente no ambiente corporativo.</p>

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

<p>Em um cenário de mudanças constantes na legislação, contar com assessoria jurídica especializada é fundamental para manter o programa de compliance sempre atualizado e eficaz.</p>', 'Saiba como adequar sua empresa às novas normas e evitar passivos judiciais.', 1),

(2, 'Reforma Tributária: O que muda?', 'reforma-tributaria', 'Tributário', '/images/reforma-tributaria.jpg', '<p>A <strong>Reforma Tributária</strong> aprovada recentemente traz mudanças estruturais significativas para o sistema brasileiro, com impactos diretos sobre todos os setores da economia, especialmente o de serviços.</p>

<h3>Principais Mudanças</h3>
<p>A substituição de cinco tributos (PIS, COFINS, IPI, ICMS e ISS) pelo IVA Dual (CBS e IBS) visa simplificar a arrecadação, mas exige atenção redobrada das empresas durante o período de transição.</p>

<h3>Impactos no Setor de Serviços</h3>
<p>Historicamente, o setor de serviços possuía uma carga tributária sobre o consumo menor em comparação à indústria. Com a unificação, estima-se que a alíquota final possa ser superior à atual para muitas empresas deste segmento.</p>

<p>No entanto, a não cumulatividade plena permitirá o aproveitamento de créditos sobre insumos, o que pode mitigar o aumento da carga em alguns casos. É crucial realizar um planejamento tributário detalhado para entender o impacto real no seu negócio.</p>

<h3>Obrigações Acessórias</h3>
<p>A promessa é de redução drástica na burocracia e nas obrigações acessórias, liberando recursos das empresas para focar em suas atividades fim.</p>

<p>Esta é uma fase de adaptação. Recomendamos que os empresários busquem orientação jurídica e contábil para se prepararem estrategicamente para o novo cenário fiscal brasileiro.</p>', 'Uma análise profunda sobre os impactos da reforma para o setor de serviços.', 1),

(3, 'LGPD no Agronegócio', 'lgpd-agro', 'Agronegócio', '/images/lgpd-agro.jpg', '<p>A <strong>Lei Geral de Proteção de Dados (LGPD)</strong> não se restringe às empresas de tecnologia ou grandes centros urbanos. O Agronegócio, cada vez mais tecnológico e conectado, lida com um volume imenso de dados que precisam de proteção.</p>

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

<p>Adotar a LGPD no campo é um diferencial competitivo, demonstrando profissionalismo e segurança para o mercado internacional.</p>', 'Desafios e soluções para a proteção de dados no campo.', 1)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  category = EXCLUDED.category,
  image = EXCLUDED.image,
  content = EXCLUDED.content,
  excerpt = EXCLUDED.excerpt,
  author_id = EXCLUDED.author_id;

-- Reset sequences to prevent ID conflicts
SELECT setval('areas_id_seq', (SELECT MAX(id) FROM areas));
SELECT setval('professionals_id_seq', (SELECT MAX(id) FROM professionals));
SELECT setval('posts_id_seq', (SELECT MAX(id) FROM posts));
