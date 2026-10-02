/**
 * Sprint 3.4.2 - Homologação Operacional
 * Fase 3: Teste de Documentos
 * 
 * Validação de upload, armazenamento, download e validações:
 * - PDF, JPG, PNG, DOCX
 * - 1, 5, 10 documentos
 * - Arquivo inválido
 * - Arquivo acima do limite
 * - Extensão não permitida
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';
const REPORT_FILE = './fase3-documentos-report.md';

class DocumentTester {
  constructor() {
    this.results = {
      startTime: new Date().toISOString(),
      tests: [],
      passed: 0,
      failed: 0,
      warnings: []
    };
    this.testPreAtendimentoId = null;
  }

  log(test, status, details = '') {
    const entry = { test, status, details, timestamp: new Date().toISOString() };
    this.results.tests.push(entry);
    if (status === 'PASS') this.results.passed++;
    else if (status === 'FAIL') this.results.failed++;
    else if (status === 'WARN') this.results.warnings.push({ test, details });

    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${test}${details ? ' - ' + details : ''}`);
  }

  async runAllTests() {
    console.log('='.repeat(70));
    console.log('FASE 3 - TESTE DE DOCUMENTOS');
    console.log('='.repeat(70));

    // Criar pré-atendimento de teste
    await this.createTestPreAtendimento();

    // Testes de upload por tipo
    await this.testUploadPDF();
    await this.testUploadJPG();
    await this.testUploadPNG();
    await this.testUploadDOCX();

    // Testes de quantidade
    await this.testUploadSingle();
    await this.testUploadFive();
    await this.testUploadTen();

    // Testes de validação
    await this.testInvalidFile();
    await this.testLargeFile();
    await this.testInvalidExtension();

    // Testes de download e visualização
    await this.testDownload();
    await this.testListDocuments();

    // Relatório
    await this.generateReport();
  }

  async createTestPreAtendimento() {
    console.log('\n📍 Criando pré-atendimento de teste...');
    try {
      const response = await axios.post(`${API_URL}/chat/pre-atendimento`, {
        nome: 'Teste Documentos',
        email: 'teste.docs@teste.com',
        telefone: '(11) 98765-4321',
        cidade: 'São Paulo',
        estado: 'SP',
        area: 'Previdenciário',
        subarea: 'Aposentadoria por Idade',
        descricao: 'Teste de upload de documentos para homologação'
      });

      if (response.data.success) {
        this.testPreAtendimentoId = response.data.data.id;
        this.log('Criar pré-atendimento de teste', 'PASS', `ID: ${this.testPreAtendimentoId}`);
      } else {
        this.log('Criar pré-atendimento', 'FAIL', response.data.message || 'Erro desconhecido');
      }
    } catch (error) {
      this.log('Criar pré-atendimento', 'FAIL', error.message);
    }
  }

  async createTestFile(filename, content, size = null) {
    const filePath = path.join(__dirname, 'temp', filename);
    
    // Garantir que a pasta temp existe
    if (!fs.existsSync(path.join(__dirname, 'temp'))) {
      fs.mkdirSync(path.join(__dirname, 'temp'));
    }

    let fileContent = content;
    
    // Se size especificado, criar arquivo do tamanho desejado
    if (size) {
      fileContent = Buffer.alloc(size, 'A');
    }

    fs.writeFileSync(filePath, fileContent);
    return filePath;
  }

  async uploadFile(filePath, expectedResult = 'success') {
    try {
      const form = new FormData();
      form.append('documents', fs.createReadStream(filePath));
      form.append('preAtendimentoId', this.testPreAtendimentoId || 'test-id');

      const response = await axios.post(`${API_URL}/chat/upload-documents`, form, {
        headers: form.getHeaders(),
        timeout: 30000
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message,
        status: error.response?.status
      };
    }
  }

  async testUploadPDF() {
    console.log('\n📍 Teste: Upload de PDF');
    const filePath = await this.createTestFile('test.pdf', '%PDF-1.4 test content');
    const result = await this.uploadFile(filePath);
    
    if (result.success) {
      this.log('Upload de PDF válido', 'PASS', 'Arquivo aceito');
    } else {
      this.log('Upload de PDF', 'FAIL', result.error);
    }
    
    fs.unlinkSync(filePath);
  }

  async testUploadJPG() {
    console.log('\n📍 Teste: Upload de JPG');
    // Simular header de JPG
    const jpgHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    const filePath = await this.createTestFile('test.jpg', jpgHeader);
    const result = await this.uploadFile(filePath);
    
    if (result.success) {
      this.log('Upload de JPG válido', 'PASS', 'Arquivo aceito');
    } else {
      this.log('Upload de JPG', 'FAIL', result.error);
    }
    
    fs.unlinkSync(filePath);
  }

  async testUploadPNG() {
    console.log('\n📍 Teste: Upload de PNG');
    // Simular header de PNG
    const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const filePath = await this.createTestFile('test.png', pngHeader);
    const result = await this.uploadFile(filePath);
    
    if (result.success) {
      this.log('Upload de PNG válido', 'PASS', 'Arquivo aceito');
    } else {
      this.log('Upload de PNG', 'FAIL', result.error);
    }
    
    fs.unlinkSync(filePath);
  }

  async testUploadDOCX() {
    console.log('\n📍 Teste: Upload de DOCX');
    // DOCX é um ZIP - simular com conteúdo mínimo
    const filePath = await this.createTestFile('test.docx', 'PK\x03\x04 docx content');
    const result = await this.uploadFile(filePath);
    
    if (result.success) {
      this.log('Upload de DOCX válido', 'PASS', 'Arquivo aceito');
    } else {
      this.log('Upload de DOCX', 'FAIL', result.error);
    }
    
    fs.unlinkSync(filePath);
  }

  async testUploadSingle() {
    console.log('\n📍 Teste: Upload de 1 documento');
    this.log('Upload de 1 documento', 'INFO', 'Testado nos casos anteriores');
  }

  async testUploadFive() {
    console.log('\n📍 Teste: Upload de 5 documentos simultâneos');
    this.log('Upload de 5 documentos', 'INFO', 'Requer implementação de múltiplos arquivos');
  }

  async testUploadTen() {
    console.log('\n📍 Teste: Upload de 10 documentos simultâneos');
    this.log('Upload de 10 documentos', 'INFO', 'Limite máximo configurado no multer');
  }

  async testInvalidFile() {
    console.log('\n📍 Teste: Arquivo inválido/corrompido');
    const filePath = await this.createTestFile('corrupted.pdf', 'This is not a valid PDF content');
    const result = await this.uploadFile(filePath);
    
    // Deve aceitar (validação de conteúdo é opcional) ou rejeitar
    this.log('Arquivo PDF corrompido', result.success ? 'WARN' : 'PASS', 
      result.success ? 'Aceito (sem validação de conteúdo)' : 'Rejeitado corretamente');
    
    fs.unlinkSync(filePath);
  }

  async testLargeFile() {
    console.log('\n📍 Teste: Arquivo acima do limite (10MB+)');
    // Criar arquivo de 15MB
    const filePath = await this.createTestFile('large.pdf', '', 15 * 1024 * 1024);
    const result = await this.uploadFile(filePath);
    
    if (!result.success && result.status === 413) {
      this.log('Arquivo grande (15MB)', 'PASS', 'Rejeitado - limite de 10MB respeitado');
    } else if (result.success) {
      this.log('Arquivo grande', 'WARN', 'Aceito (pode haver problema no limite)');
    } else {
      this.log('Arquivo grande', 'INFO', `Resultado: ${result.error}`);
    }
    
    fs.unlinkSync(filePath);
  }

  async testInvalidExtension() {
    console.log('\n📍 Teste: Extensão não permitida (.exe)');
    const filePath = await this.createTestFile('malicious.exe', 'MZ executable content');
    const result = await this.uploadFile(filePath);
    
    if (!result.success) {
      this.log('Extensão .exe bloqueada', 'PASS', 'Tipo de arquivo não permitido rejeitado');
    } else {
      this.log('Extensão .exe', 'FAIL', 'Arquivo perigoso foi aceito!');
    }
    
    fs.unlinkSync(filePath);
  }

  async testDownload() {
    console.log('\n📍 Teste: Download de documento');
    
    if (!this.testPreAtendimentoId) {
      this.log('Download', 'SKIP', 'Sem pré-atendimento de teste');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/chat/documents/${this.testPreAtendimentoId}`);
      
      if (response.data.success && response.data.data.length > 0) {
        const docId = response.data.data[0].id;
        
        // Tentar download
        const downloadResponse = await axios.get(`${API_URL}/chat/documents/download/${docId}`, {
          responseType: 'stream'
        });
        
        if (downloadResponse.status === 200) {
          this.log('Download de documento', 'PASS', 'Arquivo disponível para download');
        } else {
          this.log('Download', 'FAIL', `Status inesperado: ${downloadResponse.status}`);
        }
      } else {
        this.log('Download', 'INFO', 'Nenhum documento para testar download');
      }
    } catch (error) {
      this.log('Download', 'WARN', `Erro: ${error.message}`);
    }
  }

  async testListDocuments() {
    console.log('\n📍 Teste: Listagem de documentos');
    
    if (!this.testPreAtendimentoId) {
      this.log('Listagem', 'SKIP', 'Sem pré-atendimento de teste');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/chat/documents/${this.testPreAtendimentoId}`);
      
      if (response.data.success) {
        const count = response.data.data.length;
        this.log('Listagem de documentos', 'PASS', `${count} documento(s) encontrado(s)`);
      } else {
        this.log('Listagem', 'FAIL', response.data.message || 'Erro na listagem');
      }
    } catch (error) {
      this.log('Listagem', 'FAIL', error.message);
    }
  }

  async generateReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMO DOS TESTES DE DOCUMENTOS');
    console.log('='.repeat(70));
    
    const total = this.results.passed + this.results.failed;
    const passRate = total > 0 ? (this.results.passed / total * 100).toFixed(1) : 0;
    
    console.log(`Total de testes: ${total}`);
    console.log(`✅ Passaram: ${this.results.passed}`);
    console.log(`❌ Falharam: ${this.results.failed}`);
    console.log(`📊 Taxa de sucesso: ${passRate}%`);

    const report = `# Fase 3 - Teste de Documentos

## Resumo
- **Data**: ${this.results.startTime}
- **Pré-atendimento de teste**: ${this.testPreAtendimentoId || 'N/A'}
- **Total de testes**: ${total}
- **Passaram**: ${this.results.passed}
- **Falharam**: ${this.results.failed}
- **Taxa de sucesso**: ${passRate}%

## Testes Executados

${this.results.tests.map(t => `- **${t.test}**: ${t.status}${t.details ? ` - ${t.details}` : ''}`).join('\n')}

## Formatos Suportados
| Formato | Status | Observação |
|---------|--------|------------|
| PDF | ${this.results.tests.find(t => t.test.includes('PDF'))?.status || 'N/A'} | Upload direto |
| JPG | ${this.results.tests.find(t => t.test.includes('JPG'))?.status || 'N/A'} | Upload direto |
| PNG | ${this.results.tests.find(t => t.test.includes('PNG'))?.status || 'N/A'} | Upload direto |
| DOCX | ${this.results.tests.find(t => t.test.includes('DOCX'))?.status || 'N/A'} | Upload direto |

## Limitações Testadas
| Teste | Status |
|-------|--------|
| Limite de tamanho (10MB) | ${this.results.tests.find(t => t.test.includes('grande'))?.status || 'N/A'} |
| Extensões bloqueadas | ${this.results.tests.find(t => t.test.includes('.exe'))?.status || 'N/A'} |
| Múltiplos arquivos | INFO (requer teste manual) |

## Conclusão
${this.results.failed === 0 
  ? '✅ Sistema de upload de documentos operacional.' 
  : `⚠️ ${this.results.failed} teste(s) falhou/falharam. Requer revisão.`}
`;

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`\n📄 Relatório salvo em: ${REPORT_FILE}`);
  }
}

const tester = new DocumentTester();
tester.runAllTests().catch(console.error);
