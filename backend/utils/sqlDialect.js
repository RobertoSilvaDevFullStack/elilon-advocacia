/**
 * Traduz SQL PostgreSQL para SQLite (dev local).
 * Produção usa PostgreSQL nativamente — esta função só é aplicada no wrapper SQLite.
 */
function translatePostgresToSqlite(sql) {
  let s = sql;

  // Filtro fim de dia: ($1::date + interval '1 day')
  s = s.replace(
    /\(\$(\d+)::date\s*\+\s*interval\s+'1 day'\)/gi,
    (_, n) => `(date($${n}, '+1 day'))`,
  );

  // Cast de data: coluna::date
  s = s.replace(/([a-zA-Z_][\w.]*)::date/g, "date($1)");

  // Intervalo relativo
  s = s.replace(
    /\bNOW\(\)\s*-\s*INTERVAL\s+'(\d+)\s+days'/gi,
    "datetime('now', '-$1 days')",
  );

  s = s.replace(/\bNOW\(\)/gi, "datetime('now')");

  s = s.replace(/\bILIKE\b/gi, "LIKE");
  s = s.replace(/\bTRUE\b/gi, "1");
  s = s.replace(/\bFALSE\b/gi, "0");

  s = s.replace(/\$(\d+)/g, "?");

  return s;
}

/** Normaliza nomes de colunas agregadas (COUNT(*) → count). */
function normalizeSqliteRow(row) {
  if (!row || typeof row !== "object") return row;
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = key.replace(/^COUNT\(\*\)$/i, "count").toLowerCase();
    out[normalizedKey] = value;
  }
  return out;
}

function isPostgres() {
  const dbType = process.env.DATABASE_TYPE || "sqlite";
  return dbType === "postgres" || dbType === "postgresql";
}

module.exports = {
  translatePostgresToSqlite,
  normalizeSqliteRow,
  isPostgres,
};
