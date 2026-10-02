/**
 * Sprint 3.4.3 - Fase 1: Validação Real de Arquivos
 * Validação por assinatura binária (magic numbers)
 * Não confia apenas em extensão ou mime type
 */

const MAGIC_NUMBERS = {
  // PDF - %PDF
  pdf: {
    signature: [0x25, 0x50, 0x44, 0x46],
    mimeType: 'application/pdf',
    extensions: ['.pdf']
  },
  // JPEG/JPG - FF D8 FF
  jpg: {
    signature: [0xFF, 0xD8, 0xFF],
    mimeType: 'image/jpeg',
    extensions: ['.jpg', '.jpeg']
  },
  // PNG - 89 50 4E 47 0D 0A 1A 0A
  png: {
    signature: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    mimeType: 'image/png',
    extensions: ['.png']
  },
  // DOCX (ZIP) - 50 4B 03 04
  docx: {
    signature: [0x50, 0x4B, 0x03, 0x04],
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extensions: ['.docx'],
    // DOCX é um ZIP, então verificamos também se contém [Content_Types].xml
    additionalCheck: (buffer) => {
      const contentTypes = Buffer.from('[Content_Types].xml');
      return buffer.indexOf(contentTypes) !== -1;
    }
  }
};

/**
 * Valida o conteúdo de um arquivo pelos magic numbers
 * @param {Buffer} buffer - Buffer do arquivo
 * @param {string} expectedType - Tipo esperado (pdf, jpg, png, docx)
 * @returns {boolean} - true se válido
 */
function validateMagicNumbers(buffer, expectedType) {
  const config = MAGIC_NUMBERS[expectedType.toLowerCase()];
  if (!config) {
    return false;
  }

  // Verificar se buffer tem tamanho suficiente
  if (buffer.length < config.signature.length) {
    return false;
  }

  // Comparar magic numbers
  for (let i = 0; i < config.signature.length; i++) {
    if (buffer[i] !== config.signature[i]) {
      return false;
    }
  }

  // Verificação adicional (para DOCX)
  if (config.additionalCheck && !config.additionalCheck(buffer)) {
    return false;
  }

  return true;
}

/**
 * Detecta o tipo de arquivo pelo conteúdo
 * @param {Buffer} buffer - Buffer do arquivo
 * @returns {string|null} - Tipo detectado ou null
 */
function detectFileType(buffer) {
  for (const [type, config] of Object.entries(MAGIC_NUMBERS)) {
    if (buffer.length >= config.signature.length) {
      let matches = true;
      for (let i = 0; i < config.signature.length; i++) {
        if (buffer[i] !== config.signature[i]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        // Verificação adicional para DOCX
        if (config.additionalCheck && !config.additionalCheck(buffer)) {
          continue;
        }
        return type;
      }
    }
  }
  return null;
}

/**
 * Valida um arquivo completo (extensão + conteúdo)
 * @param {Buffer} buffer - Buffer do arquivo
 * @param {string} originalName - Nome original do arquivo
 * @param {string} claimedMimeType - MIME type informado
 * @returns {object} - Resultado da validação
 */
function validateFile(buffer, originalName, claimedMimeType) {
  const ext = originalName.toLowerCase().substring(originalName.lastIndexOf('.'));
  
  // Detectar tipo real pelo conteúdo
  const detectedType = detectFileType(buffer);
  
  if (!detectedType) {
    return {
      valid: false,
      error: 'Arquivo com conteúdo inválido ou formato não suportado',
      details: {
        originalName,
        claimedMimeType,
        detectedType: null,
        reason: 'MAGIC_NUMBER_MISMATCH'
      }
    };
  }

  const config = MAGIC_NUMBERS[detectedType];
  
  // Verificar se extensão corresponde ao conteúdo
  if (!config.extensions.includes(ext)) {
    return {
      valid: false,
      error: `Extensão ${ext} não corresponde ao conteúdo real (${detectedType})`,
      details: {
        originalName,
        claimedMimeType,
        detectedType,
        expectedExtensions: config.extensions,
        reason: 'EXTENSION_MISMATCH'
      }
    };
  }

  // Verificar se MIME type corresponde (opcional, apenas log)
  if (claimedMimeType && claimedMimeType !== config.mimeType) {
    console.warn(`[FileValidator] MIME type divergente: informado ${claimedMimeType}, real ${config.mimeType}`);
  }

  return {
    valid: true,
    type: detectedType,
    mimeType: config.mimeType,
    extension: ext,
    size: buffer.length
  };
}

/**
 * Middleware para validação de arquivo em requisições multipart
 * Deve ser usado após o multer (como segundo filtro)
 */
function createFileValidationMiddleware() {
  return (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const invalidFiles = [];
    
    for (const file of req.files) {
      // Ler arquivo do disco
      const fs = require('fs');
      const buffer = fs.readFileSync(file.path);
      
      const result = validateFile(buffer, file.originalname, file.mimetype);
      
      if (!result.valid) {
        invalidFiles.push({
          filename: file.originalname,
          error: result.error,
          details: result.details
        });
        
        // Remover arquivo inválido
        fs.unlinkSync(file.path);
      } else {
        // Adicionar informações validadas ao file object
        file.validatedType = result.type;
        file.validatedMimeType = result.mimeType;
      }
    }

    if (invalidFiles.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Arquivos inválidos detectados',
        invalidFiles
      });
    }

    next();
  };
}

module.exports = {
  validateMagicNumbers,
  detectFileType,
  validateFile,
  createFileValidationMiddleware,
  MAGIC_NUMBERS
};
