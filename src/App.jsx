import React, { useState, useCallback } from 'react';
import './App.css';
import { storage } from './storage';
import { generateShortCode, getNextId, escapeCSV } from './utils';
import Navigation from './components/Navigation';
import Notification from './components/Notification';
import BrandsView from './views/BrandsView';
import CreateBrandView from './views/CreateBrandView';
import CreateLinkView from './views/CreateLinkView';
import DashboardView from './views/DashboardView';

export default function App() {
  const [brands, setBrands] = useState(() => storage.getBrands());
  const [links, setLinks] = useState(() => storage.getLinks());
  const [clicks, setClicks] = useState(() => storage.getClicks());
  const [currentView, setCurrentView] = useState('brands');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [notification, setNotification] = useState(null);

  const persist = useCallback(() => {
    storage.setBrands(brands);
    storage.setLinks(links);
    storage.setClicks(clicks);
  }, [brands, links, clicks]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const getBrandStats = useCallback(
    (brandId, dateRangeDays = 30) => {
      const brandLinks = links.filter((l) => l.brand_id === brandId);
      const activeLinks = brandLinks.filter((l) => l.status === 'active').length;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - dateRangeDays);
      const brandClicks = clicks.filter(
        (c) =>
          brandLinks.some((l) => l.id === c.link_id) &&
          new Date(c.clicked_at) >= cutoff
      );
      return {
        totalClicks: brandClicks.length,
        activeLinks,
      };
    },
    [links, clicks]
  );

  const getPerformanceChartData = useCallback(
    (brandId, dateRangeDays, chartMetrics) => {
      const brand = brands.find((b) => b.id === brandId);
      const brandLinks = links.filter((l) => l.brand_id === brandId);
      const linkMap = Object.fromEntries(brandLinks.map((l) => [l.id, l]));
      const timeline = [];
      const now = new Date();
      const categories = brand?.default_categories?.length
        ? brand.default_categories
        : ['Gaming', 'Fintech', 'Advertising', 'Mobile Apps'];

      for (let i = dateRangeDays - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const dateKey = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const point = { date: label, dateKey };
        if (chartMetrics.total) point.total = 0;
        if (chartMetrics.byPlatform) {
          ['Twitter', 'LinkedIn', 'Facebook', 'Instagram'].forEach((p) => (point[p] = 0));
        }
        if (chartMetrics.byCategory) {
          categories.forEach((c) => (point[c] = 0));
        }
        timeline.push(point);
      }

      const dateIndex = Object.fromEntries(
        timeline.map((t, i) => [t.dateKey, i])
      );

      clicks.forEach((click) => {
        const link = linkMap[click.link_id];
        if (!link) return;
        const clickDate = new Date(click.clicked_at).toISOString().slice(0, 10);
        const idx = dateIndex[clickDate];
        if (idx === undefined) return;
        const point = timeline[idx];
        if (chartMetrics.total) point.total = (point.total || 0) + 1;
        if (chartMetrics.byPlatform && point[link.platform] !== undefined) {
          point[link.platform]++;
        }
        if (chartMetrics.byCategory && point[link.category] !== undefined) {
          point[link.category]++;
        }
      });

      return timeline;
    },
    [brands, links, clicks]
  );

  const getFilteredLinks = useCallback(
    (brandId, opts = {}) => {
      const {
        searchQuery = '',
        platformFilter = '',
        categoryFilter = '',
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = opts;

      let filtered = links.filter((l) => l.brand_id === brandId);

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.short_code.toLowerCase().includes(q) ||
            l.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      if (platformFilter) {
        filtered = filtered.filter((l) => l.platform === platformFilter);
      }
      if (categoryFilter) {
        filtered = filtered.filter((l) => l.category === categoryFilter);
      }

      const clickCounts = clicks.reduce((acc, c) => {
        acc[c.link_id] = (acc[c.link_id] || 0) + 1;
        return acc;
      }, {});

      filtered = filtered.map((l) => ({
        ...l,
        clickCount: clickCounts[l.id] || 0,
      }));

      filtered.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        if (sortBy === 'clicks') {
          aVal = a.clickCount;
          bVal = b.clickCount;
        }
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = String(bVal).toLowerCase();
        }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      return filtered;
    },
    [links, clicks]
  );

  const getTopPerformers = useCallback(
    (brandId, limit = 5, dateRangeDays = 30) => {
      const brandLinks = links.filter((l) => l.brand_id === brandId);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - dateRangeDays);
      const recentClicks = clicks.filter(
        (c) =>
          brandLinks.some((l) => l.id === c.link_id) &&
          new Date(c.clicked_at) >= cutoff
      );
      const counts = {};
      recentClicks.forEach((c) => (counts[c.link_id] = (counts[c.link_id] || 0) + 1));
      const sorted = brandLinks
        .filter((l) => l.status === 'active')
        .map((l) => ({ ...l, clickCount: counts[l.id] || 0 }))
        .sort((a, b) => b.clickCount - a.clickCount)
        .slice(0, limit);
      return sorted;
    },
    [links, clicks]
  );

  const createBrand = (data) => {
    const brand = {
      id: getNextId(brands),
      ...data,
      default_categories: data.default_categories || [],
      default_tags: data.default_tags || [],
      created_at: new Date().toISOString(),
    };
    setBrands((prev) => [...prev, brand]);
    storage.setBrands([...brands, brand]);
    setSelectedBrand(brand);
    setCurrentView('dashboard');
    showNotification('Brand created successfully');
  };

  const createLink = (data) => {
    const link = {
      id: getNextId(links),
      short_code: generateShortCode(),
      ...data,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    setLinks((prev) => [...prev, link]);
    storage.setLinks([...links, link]);
    const shortUrl = `https://${selectedBrand.domain}/${selectedBrand.slug}/${link.short_code}`;
    navigator.clipboard.writeText(shortUrl);
    showNotification('Link created! Short URL copied to clipboard.');
    setCurrentView('dashboard');
  };

  const archiveLinks = (linkIds) => {
    setLinks((prev) =>
      prev.map((l) =>
        linkIds.includes(l.id) ? { ...l, status: 'archived' } : l
      )
    );
    storage.setLinks(
      links.map((l) =>
        linkIds.includes(l.id) ? { ...l, status: 'archived' } : l
      )
    );
    showNotification(`${linkIds.length} link(s) archived`);
  };

  const trackClick = (linkId) => {
    const click = {
      id: getNextId(clicks),
      link_id: linkId,
      clicked_at: new Date().toISOString(),
    };
    setClicks((prev) => [...prev, click]);
    storage.setClicks([...clicks, click]);
    showNotification('Test click recorded');
  };

  const duplicateLink = (link) => {
    const newLink = {
      ...link,
      id: getNextId(links),
      short_code: generateShortCode(),
      title: `${link.title} (copy)`,
      created_at: new Date().toISOString(),
    };
    delete newLink.clickCount;
    setLinks((prev) => [...prev, newLink]);
    storage.setLinks([...links, newLink]);
    const shortUrl = `https://${selectedBrand.domain}/${selectedBrand.slug}/${newLink.short_code}`;
    navigator.clipboard.writeText(shortUrl);
    showNotification('Link duplicated! Short URL copied.');
  };

  const exportCSV = () => {
    const brandLinks = links.filter((l) => l.brand_id === selectedBrand.id);
    const clickCounts = clicks.reduce((acc, c) => {
      acc[c.link_id] = (acc[c.link_id] || 0) + 1;
      return acc;
    }, {});
    const rows = [
      [
        'Title',
        'Short Code',
        'Original URL',
        'Platform',
        'Category',
        'Content Type',
        'Tags',
        'Status',
        'Clicks',
        'Created At',
      ],
      ...brandLinks.map((l) => [
        l.title,
        l.short_code,
        l.original_url,
        l.platform,
        l.category,
        l.content_type,
        (l.tags || []).join('; '),
        l.status,
        clickCounts[l.id] || 0,
        l.created_at,
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedBrand.slug}-links-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('CSV exported');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    if (view === 'create-link') {
      // Keep selectedBrand
    } else if (view === 'brands') {
      setSelectedBrand(null);
    }
  };

  return (
    <div className="app">
      <Navigation
        currentView={currentView}
        selectedBrand={selectedBrand}
        onNavigate={handleNavigate}
      />
      <main className="main">
        {currentView === 'brands' && (
          <BrandsView
            brands={brands}
            getBrandStats={getBrandStats}
            onSelectBrand={(b) => {
              setSelectedBrand(b);
              setCurrentView('dashboard');
            }}
            onCreateBrand={() => setCurrentView('create-brand')}
          />
        )}
        {currentView === 'create-brand' && (
          <CreateBrandView
            onCreateBrand={createBrand}
            onCancel={() => setCurrentView('brands')}
          />
        )}
        {currentView === 'dashboard' && selectedBrand && (
          <DashboardView
            brand={selectedBrand}
            getBrandStats={getBrandStats}
            getPerformanceChartData={getPerformanceChartData}
            getFilteredLinks={getFilteredLinks}
            getTopPerformers={getTopPerformers}
            onArchiveLinks={archiveLinks}
            onExportCSV={exportCSV}
            onTrackClick={trackClick}
            onDuplicateLink={duplicateLink}
            onCreateLink={() => setCurrentView('create-link')}
          />
        )}
        {currentView === 'create-link' && selectedBrand && (
          <CreateLinkView
            brand={selectedBrand}
            onCreateLink={createLink}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}
      </main>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
