export const normalizeApiBaseUrl = (baseUrl) => baseUrl.replace(/\/+$/, '');

export const buildApiUrl = (baseUrl, path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizeApiBaseUrl(baseUrl)}${normalizedPath}`;
};
