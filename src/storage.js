const STORAGE_KEYS = {
  brands: 'link_shortener_brands',
  links: 'link_shortener_links',
  clicks: 'link_shortener_clicks',
};

export const storage = {
  getBrands: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.brands) || '[]');
    } catch {
      return [];
    }
  },
  setBrands: (brands) => {
    localStorage.setItem(STORAGE_KEYS.brands, JSON.stringify(brands));
  },
  getLinks: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.links) || '[]');
    } catch {
      return [];
    }
  },
  setLinks: (links) => {
    localStorage.setItem(STORAGE_KEYS.links, JSON.stringify(links));
  },
  getClicks: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.clicks) || '[]');
    } catch {
      return [];
    }
  },
  setClicks: (clicks) => {
    localStorage.setItem(STORAGE_KEYS.clicks, JSON.stringify(clicks));
  },
  clear: () => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },
};
