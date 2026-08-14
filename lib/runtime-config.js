function parsePort(value, fallback = 3000) {
  const candidate = value === undefined || value === '' ? fallback : Number(value);
  if (!Number.isInteger(candidate) || candidate < 1 || candidate > 65535) {
    throw new RangeError(`PORT deve ser um número inteiro entre 1 e 65535; recebido: ${String(value)}`);
  }
  return candidate;
}

module.exports = { parsePort };
