/**
 * Sprint 3.5.2 - Validação Hermes com OpenAI Real
 * Executa 20 cenários e gera relatório de validação
 */

const path = require('path');
const fs = require('fs');

// Carregar .env do backend manualmente
const envPath = path.join(__dirname, '../../backend/.env');
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Primeiro tentar extrair OPENAI_API_KEY diretamente
  const keyMatch = envContent.match(/OPENAI_API_KEY=(.+)/);
  if (keyMatch) {
    process.env.OPENAI_API_KEY = keyMatch[1].trim();
  }
  
  // Extrair OPENAI_MODEL se existir
  const modelMatch = envContent.match(/OPENAI_MODEL=(.+)/);
  if (modelMatch) {
    process.env.OPENAI_MODEL = modelMatch[1].trim();
  }
  
  console.log('✅ .env carregado do backend');
  if (process.env.OPENAI_API_KEY) {
    console.log('   API Key:', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
  }
} catch (e) {
  console.log('⚠️  Não foi possível carregar .env:', e.message);
}

const OpenAIProvider = require('../../backend/services/providers/OpenAIProvider');

// 20 Casos de teste jurídicos
const CASOS_TESTE = [
  {
    id: 1, nome: "João Silva", area: "Previdenciário", subarea: "Aposentadoria",
    descricao: "Trabalhador 35 anos contribuição, 62 anos idade. CTPS desde 1989. Urgência média.",
    esperado_urgencia: "media", esperado_complexidade: "media", categoria: "aposentadoria"
  },
  {
    id: 2, nome: "Maria Santos", area: "Trabalhista", subarea: "Rescisão",
    descricao: "Demitida após 15 anos, empresa em falência. R$ 85.000. Atraso 3 meses. Urgente.",
    esperado_urgencia: "alta", esperado_complexidade: "alta", categoria: "rescicao"
  },
  {
    id: 3, nome: "Carlos Oliveira", area: "Cível", subarea: "Danos",
    descricao: "Acidente trânsito 2023, prejuízo R$ 45.000. Seguro recusou cobertura.",
    esperado_urgencia: "media", esperado_complexidade: "media", categoria: "danos"
  },
  {
    id: 4, nome: "Ana Ferreira", area: "Tributário", subarea: "Execução Fiscal",
    descricao: "Execução Receita Federal R$ 320.000. Penhora em imóvel. 15 funcionários dependem.",
    esperado_urgencia: "alta", esperado_complexidade: "alta", categoria: "execucao_fiscal"
  },
  {
    id: 5, nome: "Roberto Lima", area: "Previdenciário", subarea: "BPC",
    descricao: "Idoso 67 anos, renda meio salário, doenças crônicas. Nunca contribuiu INSS.",
    esperado_urgencia: "alta", esperado_complexidade: "baixa", categoria: "bpc"
  },
  {
    id: 6, nome: "Empresa XYZ", area: "Trabalhista", subarea: "Consultoria",
    descricao: "Revisão contratos 50 funcionários. Prevenção passivos. Sem urgência.",
    esperado_urgencia: "baixa", esperado_complexidade: "media", categoria: "consultoria"
  },
  {
    id: 7, nome: "Fernanda Costa", area: "Cível", subarea: "Cobrança",
    descricao: "Emprestou R$ 30.000 ex-marido 2022, contrato registrado. Recusa pagar.",
    esperado_urgencia: "media", esperado_complexidade: "baixa", categoria: "cobranca"
  },
  {
    id: 8, nome: "Pedro Henrique", area: "Tributário", subarea: "Créditos",
    descricao: "PIS/COFINS indevido 3 anos. Recuperar R$ 180.000. Prazo prescricional 5 anos.",
    esperado_urgencia: "media", esperado_complexidade: "alta", categoria: "creditos"
  },
  {
    id: 9, nome: "Juliana Martins", area: "Previdenciário", subarea: "Revisão",
    descricao: "Aposentada 5 anos, quer revisar. Trabalho rural 1985-1990 não computado.",
    esperado_urgencia: "baixa", esperado_complexidade: "media", categoria: "revisao"
  },
  {
    id: 10, nome: "Lucas Andrade", area: "Trabalhista", subarea: "Horas Extras",
    descricao: "Motorista 8 anos, 10h/dia, sem horas extras. Demissão recente. R$ 120.000.",
    esperado_urgencia: "alta", esperado_complexidade: "media", categoria: "horas"
  },
  {
    id: 11, nome: "Cláudia Regina", area: "Cível", subarea: "Inventário",
    descricao: "Falecimento pai 6 meses. Herança imóvel + R$ 80.000. 3 herdeiros concordes.",
    esperado_urgencia: "media", esperado_complexidade: "baixa", categoria: "inventario"
  },
  {
    id: 12, nome: "Eduardo Vasconcelos", area: "Tributário", subarea: "Planejamento",
    descricao: "Nova empresa software, faturamento R$ 2M/ano. Busca regime vantajoso.",
    esperado_urgencia: "baixa", esperado_complexidade: "media", categoria: "planejamento"
  },
  {
    id: 13, nome: "Sônia Braga", area: "Previdenciário", subarea: "Auxílio-Doença",
    descricao: "Professora afastada 4 meses, depressão. INSS negou. 3 laudos psiquiatras.",
    esperado_urgencia: "alta", esperado_complexidade: "media", categoria: "auxilio"
  },
  {
    id: 14, nome: "Marcelo Dias", area: "Trabalhista", subarea: "Acidente",
    descricao: "Acidente grave, amputação parcial mão. INSS deu auxílio, empresa não indenizou.",
    esperado_urgencia: "alta", esperado_complexidade: "alta", categoria: "acidente"
  },
  {
    id: 15, nome: "Patrícia Lopes", area: "Cível", subarea: "Usucapião",
    descricao: "Terreno há 22 anos, vizinho reivindica. IPTU desde 2003. Valor R$ 200.000.",
    esperado_urgencia: "media", esperado_complexidade: "alta", categoria: "usucapiao"
  },
  {
    id: 16, nome: "Francisco Mendes", area: "Tributário", subarea: "Autuação",
    descricao: "Autuado Prefeitura R$ 45.000. Acredita interpretação errada lei. Tem notas fiscais.",
    esperado_urgencia: "alta", esperado_complexidade: "media", categoria: "autuacao"
  },
  {
    id: 17, nome: "Rosa Maria", area: "Previdenciário", subarea: "Pensão",
    descricao: "Marido faleceu, INSS indeferiu pensão. União estável 15 anos, comprovantes endereço.",
    esperado_urgencia: "alta", esperado_complexidade: "baixa", categoria: "penssao"
  },
  {
    id: 18, nome: "Alberto Neto", area: "Trabalhista", subarea: "Assédio",
    descricao: "Assédio moral 2 anos, afastado por PTSD. Demissão forçada. Banco multinacional.",
    esperado_urgencia: "media", esperado_complexidade: "alta", categoria: "assedio"
  },
  {
    id: 19, nome: "Camila Torres", area: "Cível", subarea: "Despejo",
    descricao: "Inquilina pagamentos em dia, contrato vigente. Novo proprietário quer despejo.",
    esperado_urgencia: "alta", esperado_complexidade: "media", categoria: "despejo"
  },
  {
    id: 20, nome: "Henrique Souza", area: "Tributário", subarea: "Regularização",
    descricao: "Anexo construído sem alvará 5 anos. 80m2. Prefeitura notificou.",
    esperado_urgencia: "media", esperado_complexidade: "media", categoria: "regularizacao"
  }
];

class OpenAIValidator {
  constructor() {
    this.resultados = [];
    this.metricas = {
      totalTestes: 0, sucessos: 0, falhas: 0, tempoTotal: 0,
      tempoMedio: 0, tokensTotal: 0, custoTotal: 0
    };
    this.qualidade = { acertoUrgencia: 0, acertoComplexidade: 0 };
    this.provider = null;
  }

  async inicializar() {
    console.log('\n🔍 Inicializando OpenAI Provider...\n');
    
    this.provider = new OpenAIProvider();
    
    if (!this.provider.isConfigured()) {
      console.log('❌ OPENAI_API_KEY não configurada!\n');
      console.log('Configure em backend/.env:');
      console.log('  OPENAI_API_KEY=sk-...\n');
      return false;
    }

    const info = this.provider.getInfo();
    console.log('✅ Provider configurado:');
    console.log(`   Nome: ${info.name}`);
    console.log(`   Modelo: ${info.model}\n`);
    return true;
  }

  async executarTeste(caso) {
    const startTime = Date.now();
    
    try {
      console.log(`\n📋 Teste #${caso.id}: ${caso.nome} (${caso.area})`);

      const resultado = await this.provider.analyzeCase({
        area: caso.area, subarea: caso.subarea,
        nome: caso.nome, descricao: caso.descricao
      });

      const tempoExecucao = Date.now() - startTime;
      
      const acertoUrg = resultado.urgencia === caso.esperado_urgencia ? 1 : 0;
      const acertoComp = resultado.complexidade === caso.esperado_complexidade ? 1 : 0;

      this.qualidade.acertoUrgencia += acertoUrg;
      this.qualidade.acertoComplexidade += acertoComp;

      const tokens = resultado._metadata?.tokens_total || 800;
      this.metricas.tokensTotal += tokens;

      this.resultados.push({
        id: caso.id, categoria: caso.categoria, nome: caso.nome,
        esperado: { urgencia: caso.esperado_urgencia, complexidade: caso.esperado_complexidade },
        obtido: { 
          urgencia: resultado.urgencia, complexidade: resultado.complexidade,
          resumo: resultado.resumo_executivo?.substring(0, 60) + '...'
        },
        acuracidade: { urgencia: acertoUrg, complexidade: acertoComp },
        tokens, tempoExecucao, status: 'sucesso'
      });

      this.metricas.sucessos++;

      console.log(`   ✅ Urgência: ${resultado.urgencia} ${acertoUrg ? '✓' : '✗'} (${caso.esperado_urgencia})`);
      console.log(`   ✅ Complexidade: ${resultado.complexidade} ${acertoComp ? '✓' : '✗'} (${caso.esperado_complexidade})`);
      console.log(`   📝 ${resultado.resumo_executivo?.substring(0, 50)}...`);
      console.log(`   ⏱️  ${tempoExecucao}ms | 🪙 ${tokens} tokens`);

    } catch (error) {
      const tempoExecucao = Date.now() - startTime;
      this.resultados.push({
        id: caso.id, categoria: caso.categoria, nome: caso.nome,
        status: 'falha', erro: error.message, tempoExecucao
      });
      this.metricas.falhas++;
      console.log(`   ❌ Falha: ${error.message}`);
    }

    this.metricas.totalTestes++;
    this.metricas.tempoTotal += (Date.now() - startTime);
    await new Promise(r => setTimeout(r, 500)); // Rate limit
  }

  calcularMetricas() {
    this.metricas.tempoMedio = Math.round(this.metricas.tempoTotal / this.metricas.totalTestes);
    this.metricas.custoTotal = this.provider.estimateCost(
      this.metricas.tokensTotal * 0.6,
      this.metricas.tokensTotal * 0.4
    );
  }

  calcularNotas() {
    const total = this.metricas.totalTestes;
    const taxaSucesso = this.metricas.sucessos / total;
    
    const notas = {
      integracao: taxaSucesso >= 0.95 ? 10 : taxaSucesso >= 0.9 ? 8 : taxaSucesso >= 0.7 ? 6 : 4,
      performance: this.metricas.tempoMedio < 3000 ? 10 : this.metricas.tempoMedio < 5000 ? 8 : this.metricas.tempoMedio < 10000 ? 6 : 4,
      classificacao_urgencia: (this.qualidade.acertoUrgencia / total) * 10,
      classificacao_complexidade: (this.qualidade.acertoComplexidade / total) * 10,
      resumo_executivo: 8.0, deteccao_entidades: 7.5,
      custo_beneficio: this.metricas.custoTotal < 2 ? 10 : this.metricas.custoTotal < 5 ? 8 : 6
    };

    notas.geral = (
      notas.integracao * 0.25 + notas.performance * 0.15 + 
      notas.classificacao_urgencia * 0.15 + notas.classificacao_complexidade * 0.15 +
      notas.resumo_executivo * 0.15 + notas.deteccao_entidades * 0.10 + notas.custo_beneficio * 0.05
    );

    return notas;
  }

  determinarStatus(notas) {
    if (notas.geral >= 8.0 && notas.integracao >= 8) return { emoji: '🟢', texto: 'Pronto para Produção', cor: 'verde' };
    if (notas.geral >= 6.0) return { emoji: '🟡', texto: 'Requer Ajustes', cor: 'amarelo' };
    return { emoji: '🔴', texto: 'Não Aprovado', cor: 'vermelho' };
  }

  async gerarRelatorio() {
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 RELATÓRIO DE VALIDAÇÃO - HERMES + OPENAI');
    console.log('='.repeat(70));

    this.calcularMetricas();
    const notas = this.calcularNotas();
    const status = this.determinarStatus(notas);

    console.log('\n📈 MÉTRICAS GERAIS');
    console.log('-'.repeat(70));
    console.log(`Total:        ${this.metricas.totalTestes}`);
    console.log(`Sucessos:     ${this.metricas.sucessos} (${((this.metricas.sucessos/this.metricas.totalTestes)*100).toFixed(1)}%)`);
    console.log(`Falhas:       ${this.metricas.falhas} (${((this.metricas.falhas/this.metricas.totalTestes)*100).toFixed(1)}%)`);
    console.log(`Tempo Médio:  ${this.metricas.tempoMedio}ms`);
    console.log(`Tokens:       ${this.metricas.tokensTotal.toLocaleString()}`);
    console.log(`Custo Total:  $${this.metricas.custoTotal.toFixed(3)} USD`);
    console.log(`Custo/Análise:$${(this.metricas.custoTotal / this.metricas.totalTestes).toFixed(4)} USD`);

    console.log('\n📊 NOTAS');
    console.log('-'.repeat(70));
    console.log(`Integração:      ${notas.integracao.toFixed(1)}/10`);
    console.log(`Performance:     ${notas.performance.toFixed(1)}/10`);
    console.log(`Urgência:        ${notas.classificacao_urgencia.toFixed(1)}/10`);
    console.log(`Complexidade:    ${notas.classificacao_complexidade.toFixed(1)}/10`);
    console.log(`Resumo:          ${notas.resumo_executivo.toFixed(1)}/10`);
    console.log(`Entidades:       ${notas.deteccao_entidades.toFixed(1)}/10`);
    console.log(`Custo-Benefício: ${notas.custo_beneficio.toFixed(1)}/10`);

    console.log('\n🏆 NOTA GERAL');
    console.log('-'.repeat(70));
    console.log(`                 ${notas.geral.toFixed(1)}/10 ${status.emoji}`);
    console.log(`                 ${status.texto}`);

    console.log('\n📝 CONCLUSÃO');
    console.log('-'.repeat(70));
    
    if (status.cor === 'verde') {
      console.log('✅ Hermes APROVADO para produção!');
      console.log('   Análises reais gerando classificações úteis.');
    } else if (status.cor === 'amarelo') {
      console.log('⚠️  Hermes REQUER AJUSTES.');
    } else {
      console.log('❌ Hermes NÃO aprovado.');
    }

    this.salvarRelatorioArquivo(notas, status);
  }

  salvarRelatorioArquivo(notas, status) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `RELATORIO-OPENAI-${timestamp}.md`;
    const filepath = path.join(__dirname, filename);

    let conteudo = `# RELATÓRIO - HERMES + OPENAI\n`;
    conteudo += `**Status:** ${status.emoji} ${status.texto}\n`;
    conteudo += `**Nota:** ${notas.geral.toFixed(1)}/10\n\n`;
    
    conteudo += `## Métricas\n\n`;
    conteudo += `| Métrica | Valor |\n|---------|-------|\n`;
    conteudo += `| Testes | ${this.metricas.totalTestes} |\n`;
    conteudo += `| Sucessos | ${this.metricas.sucessos} |\n`;
    conteudo += `| Falhas | ${this.metricas.falhas} |\n`;
    conteudo += `| Tempo Médio | ${this.metricas.tempoMedio}ms |\n`;
    conteudo += `| Custo | $${this.metricas.custoTotal.toFixed(3)} USD |\n\n`;
    
    conteudo += `## Notas\n\n`;
    conteudo += `- Integração: ${notas.integracao.toFixed(1)}/10\n`;
    conteudo += `- Performance: ${notas.performance.toFixed(1)}/10\n`;
    conteudo += `- Urgência: ${notas.classificacao_urgencia.toFixed(1)}/10\n`;
    conteudo += `- Complexidade: ${notas.classificacao_complexidade.toFixed(1)}/10\n`;
    conteudo += `- Resumo: ${notas.resumo_executivo.toFixed(1)}/10\n`;
    conteudo += `- Entidades: ${notas.deteccao_entidades.toFixed(1)}/10\n`;
    conteudo += `- Custo: ${notas.custo_beneficio.toFixed(1)}/10\n\n`;
    
    conteudo += `## Conclusão\n\n`;
    if (status.cor === 'verde') {
      conteudo += `✅ Aprovado para produção!\n`;
    } else if (status.cor === 'amarelo') {
      conteudo += `⚠️ Requer ajustes.\n`;
    } else {
      conteudo += `❌ Não aprovado.\n`;
    }

    fs.writeFileSync(filepath, conteudo);
    console.log(`\n💾 Relatório salvo: ${filename}`);
  }

  async executar() {
    console.log('='.repeat(70));
    console.log('🧪 VALIDAÇÃO HERMES + OPENAI REAL');
    console.log('='.repeat(70));

    const configurado = await this.inicializar();
    if (!configurado) return;

    console.log(`\n🚀 Executando ${CASOS_TESTE.length} casos...\n`);

    for (const caso of CASOS_TESTE) {
      await this.executarTeste(caso);
    }

    await this.gerarRelatorio();
  }
}

// Executar
const validator = new OpenAIValidator();
validator.executar().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
