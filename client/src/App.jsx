import React, { useState, useEffect } from 'react';
import './App.css';
import { api } from './api/client';
import { useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Notification from './components/Notification';
import BrandsView from './views/BrandsView';
import CreateBrandView from './views/CreateBrandView';
import CreateLinkView from './views/CreateLinkView';
import DashboardView from './views/DashboardView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import TeamManagementView from './views/TeamManagementView';
import BrandSettingsView from './views/BrandSettingsView';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [brands, setBrands] = useState([]);
  const [currentView, setCurrentView] = useState('brands');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [notification, setNotification] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (user) {
      loadBrands();
    }
  }, [user]);

  const loadConfig = async () => {
    try {
      const { appUrl } = await api.getConfig();
      setAppUrl(appUrl);
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  };

  const loadBrands = async () => {
    try {
      setLoading(true);
      const { brands } = await api.getBrands();
      setBrands(brands);
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const getBrandStats = async (brandId, dateRange = 30) => {
    try {
      const stats = await api.getBrandStats(brandId, dateRange);
      return stats;
    } catch (error) {
      console.error('Get brand stats error:', error);
      return { totalClicks: 0, activeLinks: 0 };
    }
  };

  const getPerformanceChartData = async (brandId, dateRange, chartMetrics) => {
    try {
      const { data } = await api.getPerformanceData(brandId, dateRange, chartMetrics);
      return data;
    } catch (error) {
      console.error('Get performance data error:', error);
      return [];
    }
  };

  const getFilteredLinks = async (brandId, filters) => {
    try {
      const { links } = await api.getLinks(brandId, {
        search: filters.searchQuery,
        platform: filters.platformFilter,
        category: filters.categoryFilter,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
      return links;
    } catch (error) {
      console.error('Get links error:', error);
      return [];
    }
  };

  const getTopPerformers = async (brandId, limit = 5, dateRange = 30) => {
    try {
      const { links } = await api.getTopPerformers(brandId, limit, dateRange);
      return links;
    } catch (error) {
      console.error('Get top performers error:', error);
      return [];
    }
  };

  const createBrand = async (data) => {
    try {
      const { brand } = await api.createBrand(data);
      await loadBrands(); // Reload all brands from server
      setSelectedBrand(brand);
      setCurrentView('dashboard');
      showNotification('Brand created successfully');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const updateBrand = async (brandId, data) => {
    try {
      const { brand } = await api.updateBrand(brandId, data);
      await loadBrands(); // Reload all brands from server
      setSelectedBrand(brand);
      showNotification('Brand updated successfully');
      return true;
    } catch (error) {
      showNotification(error.message, 'error');
      return false;
    }
  };

  const createLink = async (data) => {
    try {
      const { link } = await api.createLink(data);
      const brand = brands.find((b) => b.id === selectedBrand.id);
      const shortUrl = `${appUrl}/r/${brand.slug}/${link.short_code}`;
      navigator.clipboard.writeText(shortUrl);
      showNotification('Link created! Short URL copied to clipboard.');
      setCurrentView('dashboard');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const deleteLink = async (linkId) => {
    try {
      await api.deleteLink(linkId);
      showNotification('Link deleted');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const archiveLinks = async (linkIds) => {
    try {
      await api.archiveLinks(linkIds);
      showNotification(`${linkIds.length} link(s) archived`);
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const trackClick = async (linkId) => {
    try {
      await api.trackClick(linkId);
      showNotification('Test click recorded');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const duplicateLink = async (link) => {
    try {
      const newLink = {
        brand_id: link.brand_id,
        original_url: link.original_url,
        title: `${link.title} (copy)`,
        platform: link.platform,
        category: link.category,
        content_type: link.content_type,
        tags: link.tags,
      };
      const { link: created } = await api.createLink(newLink);
      const brand = brands.find((b) => b.id === selectedBrand.id);
      const shortUrl = `${appUrl}/r/${brand.slug}/${created.short_code}`;
      navigator.clipboard.writeText(shortUrl);
      showNotification('Link duplicated! Short URL copied.');
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const exportCSV = () => {
    api.exportCSV(selectedBrand.id);
    showNotification('CSV exported');
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    if (view === 'brands') {
      setSelectedBrand(null);
    }
  };

  if (authLoading) {
    return (
      <div className="app loading-screen">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        {authView === 'login' ? (
          <LoginView onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterView onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

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
            onDeleteLink={deleteLink}
            onExportCSV={exportCSV}
            onTrackClick={trackClick}
            onDuplicateLink={duplicateLink}
            onCreateLink={() => setCurrentView('create-link')}
            onNavigate={setCurrentView}
            appUrl={appUrl}
          />
        )}
        {currentView === 'create-link' && selectedBrand && (
          <CreateLinkView
            brand={selectedBrand}
            onCreateLink={createLink}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}
        {currentView === 'team-management' && selectedBrand && (
          <TeamManagementView
            brand={selectedBrand}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
        {currentView === 'brand-settings' && selectedBrand && (
          <BrandSettingsView
            brand={selectedBrand}
            onUpdateBrand={updateBrand}
            onBack={() => setCurrentView('dashboard')}
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
