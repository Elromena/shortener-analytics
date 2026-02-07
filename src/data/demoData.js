import { storage } from '../storage';

const generateShortCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export const createDemoData = () => {
  const brands = storage.getBrands();
  const links = storage.getLinks();
  const clicks = storage.getClicks();

  if (brands.length > 0 || links.length > 0 || clicks.length > 0) {
    return;
  }

  const now = new Date();
  const brand = {
    id: 1,
    name: 'Blockchain Ads',
    slug: 'ba',
    domain: 'blockchain-ads.com',
    default_categories: ['Gaming', 'Fintech', 'Advertising', 'Mobile Apps'],
    default_tags: ['campaign', 'social', 'promo'],
    created_at: now.toISOString(),
  };

  const platforms = ['Twitter', 'LinkedIn', 'Facebook', 'Instagram'];
  const categories = ['Gaming', 'Fintech', 'Advertising', 'Mobile Apps'];
  const contentTypes = ['Blog Post', 'Video', 'Infographic', 'Landing Page'];

  const sampleLinks = [
    { title: 'Q1 Campaign Launch', platform: 'Twitter', category: 'Advertising' },
    { title: 'DeFi Guide Article', platform: 'LinkedIn', category: 'Fintech' },
    { title: 'Mobile Game Preview', platform: 'Facebook', category: 'Gaming' },
    { title: 'Product Showcase', platform: 'Instagram', category: 'Mobile Apps' },
    { title: 'Industry Report Share', platform: 'Twitter', category: 'Fintech' },
  ];

  const createdLinks = sampleLinks.map((item, i) => ({
    id: i + 1,
    brand_id: 1,
    short_code: generateShortCode(),
    original_url: `https://example.com/article-${i + 1}`,
    title: item.title,
    platform: item.platform,
    category: item.category,
    content_type: contentTypes[i % contentTypes.length],
    tags: ['campaign', 'social', 'promo'].slice(0, (i % 3) + 1),
    status: 'active',
    created_at: new Date(now - (i + 1) * 86400000 * 2).toISOString(),
  }));

  const allClicks = [];
  let clickId = 1;

  for (let day = 0; day < 30; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    date.setHours(0, 0, 0, 0);

    const clicksPerDay = Math.floor(Math.random() * 40) + 15;
    for (let c = 0; c < clicksPerDay; c++) {
      const linkId = createdLinks[Math.floor(Math.random() * createdLinks.length)].id;
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      const clickDate = new Date(date);
      clickDate.setHours(hour, minute, 0, 0);
      allClicks.push({
        id: clickId++,
        link_id: linkId,
        clicked_at: clickDate.toISOString(),
      });
    }
  }

  storage.setBrands([brand]);
  storage.setLinks(createdLinks);
  storage.setClicks(allClicks);
};
