/**
 * Sprint 3.4.2 - Homologação Operacional
 * Fase 1: Geração de Massa de Testes
 * 
 * Gera 30 pré-atendimentos fictícios:
 * - 10 Previdenciários
 * - 10 Trabalhistas  
 * - 5 Tributários
 * - 5 Cíveis
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const faker = {
  names: [
    'Maria Silva', 'João Santos', 'Ana Pereira', 'Carlos Oliveira', 'Fernanda Lima',
    'Roberto Almeida', 'Patrícia Costa', 'Ricardo Souza', 'Juliana Martins', 'Bruno Ferreira',
    'Camila Rodrigues', 'Lucas Gomes', 'Amanda Rocha', 'Pedro Barbosa', 'Letícia Nunes',
    'Gabriel Mendes', 'Mariana Dias', 'Thiago Moreira', 'Isabela Cardoso', 'Rafael Teixeira',
    'Larissa Pinto', 'Daniel Carvalho', 'Beatriz Araujo', 'Vinícius Ramos', 'Natália Castro',
    'Gustavo Melo', 'Priscila Freitas', 'Leonardo Pires', 'Carolina Duarte', 'Alexandre Moura'
  ],
  cities: [
    'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre',
    'Salvador', 'Recife', 'Fortaleza', 'Brasília', 'Goiânia',
    'Manaus', 'Belém', 'Vitória', 'Florianópolis', 'Natal'
  ],
  states: ['SP', 'RJ', 'MG', 'PR', 'RS', 'BA', 'PE', 'CE', 'DF', 'GO', 'AM', 'PA', 'ES', 'SC', 'RN'],
  
  areas: {
    previdenciario: {
      area: 'Previdenciário',
      subareas: ['Aposentadoria por Idade', 'Aposentadoria por Tempo', 'Auxílio-Doença', 'Pensão por Morte', 'LOAS/BPC']
    },
    trabalhista: {
      area: 'Trabalhista',
      subareas: ['Rescisão Indireta', 'Horas Extras', 'Acidente de Trabalho', 'Assédio Moral', 'Verbas Rescisórias']
    },
    tributario: {
      area: 'Tributário',
      subareas: ['Defesa em Execução Fiscal', 'Parcelamento', 'Anulação de Débito', 'Restituição']
    },
    civil: {
      area: 'Cível',
      subareas: ['Dano Moral', 'Dano Material', 'Contratos', 'Usucapião', 'Inventário']
    }
  },
  
  descriptions: {
    previdenciario: [
      'Preciso me aposentar, tenho 35 anos de contribuição e 60 anos de idade. Quero saber qual a melhor modalidade.',
      'Fui diagnosticado com uma doença grave e não consigo mais trabalhar. Preciso do auxílio-doença.',
      'Meu pai faleceu e minha mãe precisa da pensão por morte. Ele contribuía por mais de 30 anos.',
      'Tenho uma deficiência física e dificuldade para trabalhar. Posso ter direito ao BPC/LOAS?',
      'O INSS negou meu pedido de aposentadoria. Preciso recorrer da decisão.',
      'Trabalhei informalmente por anos e agora preciso comprovar tempo de contribuição.',
      'Sou maior de 65 anos e não tenho renda. Posso solicitar o benefício assistencial?',
      'Minha aposentadoria está com valor errado. Como corrigir?',
      'Fui demitido e preciso saber se tenho direito ao seguro-desemprego.',
      'Tenho uma doença grave listada no INSS. Qual procedimento para auxílio-doença?'
    ],
    trabalhista: [
      'Fui demitido por justa causa mas não concordo. Quero contestar.',
      'Trabalho há 2 anos sem registro em carteira. Como provar vínculo?',
      'Sofri acidente de trabalho e a empresa não quer arcar com as despesas.',
      'Estou sofrendo assédio moral do meu chefe. Tenho testemunhas.',
      'Trabalho mais de 8 horas diárias sem receber horas extras.',
      'Fui demitido grávida. Isso é legal?',
      'A empresa atrasou salários há 3 meses. O que fazer?',
      'Não recebi meu FGTS corretamente. Como reclamar?',
      'Estou em home office mas a empresa não paga os custos. Tenho direito?',
      'Fui transferido para outra função sem meu consentimento. Posso recusar?'
    ],
    tributario: [
      'Recebi uma intimação da Receita Federal. Preciso de ajuda para responder.',
      'Tenho uma dívida tributária grande. Posso parcelar?',
      'A prefeitura está cobrando ISS que já paguei. Como comprovar?',
      'Fui autuado indevidamente. Quero anular o débito.',
      'Paguei imposto a maior e preciso da restituição.'
    ],
    civil: [
      'Fui vítima de calúnia nas redes sociais. Quero processar por dano moral.',
      'Comprei um carro com defeito e a concessionária não resolve.',
      'Preciso fazer um inventário após o falecimento do meu pai.',
      'Moramos há 20 anos na mesma casa sem escritura. Podemos usucapir?',
      'Assinei um contrato mas fui lesado. Posso anular?'
    ]
  }
};

function generatePhone() {
  const ddd = Math.floor(Math.random() * 90) + 10;
  const first = Math.floor(Math.random() * 90000) + 10000;
  const second = Math.floor(Math.random() * 9000) + 1000;
  return `(${ddd}) 9${first}-${second}`;
}

function generateEmail(name) {
  const clean = name.toLowerCase().replace(/\s/g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const domains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br', 'uol.com.br'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${clean}.${Math.floor(Math.random() * 999)}@${domain}`;
}

function generateProtocolo() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `PRT-${timestamp}-${random}`;
}

function createPreAtendimento(areaType, index) {
  const areaData = faker.areas[areaType];
  const name = faker.names[Math.floor(Math.random() * faker.names.length)];
  const cityIndex = Math.floor(Math.random() * faker.cities.length);
  
  return {
    nome: name,
    email: generateEmail(name),
    telefone: generatePhone(),
    cidade: faker.cities[cityIndex],
    estado: faker.states[cityIndex],
    area: areaData.area,
    subarea: areaData.subareas[Math.floor(Math.random() * areaData.subareas.length)],
    descricao: faker.descriptions[areaType][index % faker.descriptions[areaType].length],
    protocolo: generateProtocolo(),
    status: 'novo'
  };
}

async function insertPreAtendimento(data) {
  try {
    const response = await axios.post(`${API_URL}/chat/pre-atendimento`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      data: data
    };
  }
}

async function generateAll() {
  console.log('🚀 Iniciando geração de massa de testes...\n');
  
  const results = {
    total: 0,
    success: 0,
    failed: 0,
    byArea: { previdenciario: 0, trabalhista: 0, tributario: 0, civil: 0 },
    errors: []
  };

  // 10 Previdenciários
  console.log('📋 Gerando 10 pré-atendimentos Previdenciários...');
  for (let i = 0; i < 10; i++) {
    const data = createPreAtendimento('previdenciario', i);
    const result = await insertPreAtendimento(data);
    if (result.success) {
      results.success++;
      results.byArea.previdenciario++;
      console.log(`  ✅ ${data.nome} - Protocolo: ${data.protocolo}`);
    } else {
      results.failed++;
      results.errors.push({ area: 'Previdenciário', name: data.nome, error: result.error });
      console.log(`  ❌ ${data.nome} - Erro: ${result.error}`);
    }
    results.total++;
  }

  // 10 Trabalhistas
  console.log('\n📋 Gerando 10 pré-atendimentos Trabalhistas...');
  for (let i = 0; i < 10; i++) {
    const data = createPreAtendimento('trabalhista', i);
    const result = await insertPreAtendimento(data);
    if (result.success) {
      results.success++;
      results.byArea.trabalhista++;
      console.log(`  ✅ ${data.nome} - Protocolo: ${data.protocolo}`);
    } else {
      results.failed++;
      results.errors.push({ area: 'Trabalhista', name: data.nome, error: result.error });
      console.log(`  ❌ ${data.nome} - Erro: ${result.error}`);
    }
    results.total++;
  }

  // 5 Tributários
  console.log('\n📋 Gerando 5 pré-atendimentos Tributários...');
  for (let i = 0; i < 5; i++) {
    const data = createPreAtendimento('tributario', i);
    const result = await insertPreAtendimento(data);
    if (result.success) {
      results.success++;
      results.byArea.tributario++;
      console.log(`  ✅ ${data.nome} - Protocolo: ${data.protocolo}`);
    } else {
      results.failed++;
      results.errors.push({ area: 'Tributário', name: data.nome, error: result.error });
      console.log(`  ❌ ${data.nome} - Erro: ${result.error}`);
    }
    results.total++;
  }

  // 5 Cíveis
  console.log('\n📋 Gerando 5 pré-atendimentos Cíveis...');
  for (let i = 0; i < 5; i++) {
    const data = createPreAtendimento('civil', i);
    const result = await insertPreAtendimento(data);
    if (result.success) {
      results.success++;
      results.byArea.civil++;
      console.log(`  ✅ ${data.nome} - Protocolo: ${data.protocolo}`);
    } else {
      results.failed++;
      results.errors.push({ area: 'Cível', name: data.nome, error: result.error });
      console.log(`  ❌ ${data.nome} - Erro: ${result.error}`);
    }
    results.total++;
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DA GERAÇÃO');
  console.log('='.repeat(60));
  console.log(`Total de registros: ${results.total}`);
  console.log(`✅ Sucesso: ${results.success}`);
  console.log(`❌ Falhas: ${results.failed}`);
  console.log('\nPor área:');
  console.log(`  • Previdenciário: ${results.byArea.previdenciario}`);
  console.log(`  • Trabalhista: ${results.byArea.trabalhista}`);
  console.log(`  • Tributário: ${results.byArea.tributario}`);
  console.log(`  • Cível: ${results.byArea.civil}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Erros encontrados:');
    results.errors.forEach(e => console.log(`  - ${e.area}: ${e.name} - ${e.error}`));
  }
  
  console.log('\n✨ Geração concluída!');
}

generateAll().catch(console.error);
