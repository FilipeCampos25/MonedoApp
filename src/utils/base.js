export function getPayload(data) {
  if (data && typeof data === 'object' && data.data && typeof data.data === 'object') {
    return data.data;
  }

  return data || {};
}

export function asString(value, fallback = '') {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

export function asNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function normalizePercent(value) {
  const numeric = asNumber(value, 0);

  if (numeric < 0) {
    return 0;
  }

  if (numeric > 100) {
    return 100;
  }

  return numeric;
}

export function formatCurrentDateLabel() {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
  });
}
