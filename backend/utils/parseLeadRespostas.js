/**
 * Normaliza campo respostas (JSON string no SQLite → objeto).
 */
function parseRespostasField(value) {
  if (value == null) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return {};
    }
  }
  return {};
}

function normalizeDiagnosticoLead(row) {
  if (!row) return row;
  return {
    ...row,
    respostas: parseRespostasField(row.respostas),
  };
}

module.exports = { parseRespostasField, normalizeDiagnosticoLead };
