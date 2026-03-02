import { useState, useEffect } from "react";
import { DailyLineChart, WeeklyChart, WeeklySummary } from "./WeeklyChartView";

const CHART_COLORS = {
  total: "#6366f1",
  Twitter: "#1da1f2",
  LinkedIn: "#0a66c2",
  Facebook: "#1877f2",
  Instagram: "#e4405f",
  Gaming: "#22c55e",
  Fintech: "#f59e0b",
  Advertising: "#8b5cf6",
  "Mobile Apps": "#ec4899",
};

export default function DashboardView({
  brand,
  getBrandStats,
  getPerformanceChartData,
  getFilteredLinks,
  getTopPerformers,
  onArchiveLinks,
  onDeleteLink,
  onExportCSV,
  onTrackClick,
  onDuplicateLink,
  onCreateLink,
  onNavigate,
  appUrl,
}) {
  const [dateRange, setDateRange] = useState(30);
  // const [responseData, setResponseData] = useState([]);
  const [chartMetrics, setChartMetrics] = useState({
    total: false,
    byPlatform: true,
    byCategory: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedLinks, setSelectedLinks] = useState(new Set());
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [stats, setStats] = useState({ totalClicks: 0, activeLinks: 0 });
  const [chartData, setChartData] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [linkId, setLinkId] = useState("");
  const [viewType, setViewType] = useState("daily"); // 'daily' or 'weekly'

  useEffect(() => {
    loadStats();
  }, [brand.id, dateRange]);

  useEffect(() => {
    loadChartData();
  }, [brand.id, dateRange, chartMetrics, linkId]);

  useEffect(() => {
    loadLinks();
  }, [
    brand.id,
    searchQuery,
    platformFilter,
    categoryFilter,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    loadTopPerformers();
  }, [brand.id, dateRange]);

  const loadStats = async () => {
    const data = await getBrandStats(brand.id, dateRange);
    setStats(data);
  };

  const loadChartData = async () => {
    const data = await getPerformanceChartData(
      brand.id,
      dateRange,
      chartMetrics,
      linkId,
    );

    setChartData(data);
  };

  const loadLinks = async () => {
    setLoading(true);
    const data = await getFilteredLinks(brand.id, {
      searchQuery,
      platformFilter,
      categoryFilter,
      sortBy,
      sortOrder,
    });
    setFilteredLinks(data);
    setLoading(false);
  };

  const loadTopPerformers = async () => {
    const data = await getTopPerformers(brand.id, 5, dateRange);
    setTopPerformers(data);
  };

  const totalPages = Math.ceil(filteredLinks.length / itemsPerPage);
  const paginatedLinks = filteredLinks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const categories = brand?.default_categories?.length
    ? brand.default_categories
    : ["Gaming", "Fintech", "Advertising", "Mobile Apps"];
  const platforms = ["Twitter", "LinkedIn", "Facebook", "Instagram"];

  const toggleChartMetric = (key) => {
    setChartMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleLinkSelection = (id) => {
    setSelectedLinks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllSelection = () => {
    const ids = paginatedLinks.map((l) => l.id);
    const allSelected = ids.every((id) => selectedLinks.has(id));
    if (allSelected) {
      setSelectedLinks((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedLinks((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const handleArchiveSelected = () => {
    setShowArchiveConfirm(true);
  };

  const confirmArchive = async () => {
    await onArchiveLinks(Array.from(selectedLinks));
    setSelectedLinks(new Set());
    setShowArchiveConfirm(false);
    loadLinks();
    loadStats();
  };

  const copyShortUrl = (link) => {
    const url = `${appUrl}/r/${brand.slug}/${link.short_code}`;
    navigator.clipboard.writeText(url);
  };

  const chartLines = (() => {
    const lines = [];
    if (chartMetrics.total)
      lines.push({
        key: "total",
        label: "Total Clicks",
        color: CHART_COLORS.total,
      });
    if (chartMetrics.byPlatform) {
      platforms.forEach((p) =>
        lines.push({ key: p, label: p, color: CHART_COLORS[p] || "#9ca3af" }),
      );
    }
    if (chartMetrics.byCategory) {
      categories.forEach((c) =>
        lines.push({ key: c, label: c, color: CHART_COLORS[c] || "#9ca3af" }),
      );
    }
    return lines;
  })();

  return (
    <div className="view dashboard-view">
      <header className="view-header">
        <h1>{brand.name} — Dashboard</h1>
        <div className="header-actions">
          <button
            className="btn btn-ghost"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("brand-settings");
            }}
          >
            ⚙️ Settings
          </button>
          <button
            className="btn btn-ghost"
            onClick={(e) => {
              e.preventDefault();
              onNavigate("team-management");
            }}
          >
            👥 Team
          </button>
          <button className="btn btn-secondary" onClick={onExportCSV}>
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={onCreateLink}>
            + Create Link
          </button>
        </div>
      </header>

      <section className="stats-cards">
        <div className="stat-card">
          <span className="stat-label">Total Clicks</span>
          <span className="stat-value">{stats.totalClicks}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Links</span>
          <span className="stat-value">{stats.activeLinks}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg per Link</span>
          <span className="stat-value">
            {stats.activeLinks > 0
              ? Math.round(stats.totalClicks / stats.activeLinks)
              : 0}
          </span>
        </div>
      </section>

      <section className="chart-section">
        <div className="chart-header">
          <h2>Performance</h2>
          <div className="chart-controls">
            <div className="view-type-buttons">
              <button
                className={`btn btn-sm ${viewType === "daily" ? "active" : "btn-ghost"}`}
                onClick={() => setViewType("daily")}
              >
                Daily
              </button>
              <button
                className={`btn btn-sm ${viewType === "weekly" ? "active" : "btn-ghost"}`}
                onClick={() => setViewType("weekly")}
              >
                Weekly
              </button>
            </div>

            {viewType === "daily" ? (
              <div className="date-range-buttons">
                {[7, 30, 60, 90].map((days) => (
                  <button
                    key={days}
                    className={`btn btn-sm ${dateRange === days ? "active" : "btn-ghost"}`}
                    onClick={() => setDateRange(days)}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            ) : (
              <div className="weekly-note">
                <span className="text-sm text-secondary">Last 8 weeks</span>
              </div>
            )}

            <div className="chart-metrics">
              {/* <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={chartMetrics.total}
                  onChange={() => toggleChartMetric("total")}
                />
                Total Clicks
              </label> */}
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={chartMetrics.byPlatform}
                  onChange={() => toggleChartMetric("byPlatform")}
                />
                By Platform
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={chartMetrics.byCategory}
                  onChange={() => toggleChartMetric("byCategory")}
                />
                By Category
              </label>
            </div>
          </div>
        </div>

        {viewType === "weekly" && <WeeklySummary data={chartData} />}

        <div className="chart-container">
          {viewType === "daily" && (
            <DailyLineChart chartLines={chartLines} data={chartData} />
          )}

          {viewType === "weekly" && (
            <WeeklyChart chartMetrics={chartMetrics} data={chartData} />
          )}
        </div>
      </section>

      <section className="top-performers">
        <h2>Top Performers</h2>
        <div className="top-performers-list">
          {topPerformers.map((link, i) => (
            <div
              key={link.id}
              className={`top-performer-item ${linkId === link?.id && "top-performer-item-active"}`}
            >
              <span className="rank">#{i + 1}</span>
              <div className="info">
                <span className="title">{link.title}</span>
                <span className="meta">
                  {link.platform} • {link.category} • {link.clickCount} clicks
                </span>
              </div>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setLinkId(linkId === link.id ? "" : link.id)}
              >
                Metrics
              </button>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => copyShortUrl(link)}
              >
                Copy
              </button>
            </div>
          ))}
          {topPerformers.length === 0 && (
            <p className="empty-state">No clicks in this date range.</p>
          )}
        </div>
      </section>

      <section className="links-section">
        <div className="links-header">
          <h2>All Links</h2>
          {selectedLinks.size > 0 && (
            <button className="btn btn-warning" onClick={handleArchiveSelected}>
              Archive Selected ({selectedLinks.size})
            </button>
          )}
        </div>

        <div className="filters">
          <input
            type="search"
            className="search-input"
            placeholder="Search by title, code, or tags..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            value={platformFilter}
            onChange={(e) => {
              setPlatformFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Platforms</option>
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="created_at">Date</option>
            <option value="title">Title</option>
            <option value="clicks">Clicks</option>
            <option value="platform">Platform</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="links-table-wrapper">
          <table className="links-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      paginatedLinks.length > 0 &&
                      paginatedLinks.every((l) => selectedLinks.has(l.id))
                    }
                    onChange={toggleAllSelection}
                  />
                </th>
                <th>Title</th>
                <th>Short URL</th>
                <th>Platform</th>
                <th>Content Type</th>
                <th>Clicks</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLinks.map((link) => (
                <tr
                  key={link.id}
                  className={link.status === "archived" ? "archived" : ""}
                >
                  <td>
                    {link.status === "active" && (
                      <input
                        type="checkbox"
                        checked={selectedLinks.has(link.id)}
                        onChange={() => toggleLinkSelection(link.id)}
                      />
                    )}
                  </td>
                  <td>{link.title}</td>
                  <td>
                    <code className="short-url">
                      {appUrl
                        ? `${appUrl}/r/${brand.slug}/${link.short_code}`
                        : "Loading..."}
                    </code>
                  </td>
                  <td>{link.platform}</td>
                  <td>{link.content_type}</td>
                  <td>{link.click_count}</td>
                  <td>
                    <span className={`status-badge status-${link.status}`}>
                      {link.status}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => copyShortUrl(link)}
                      >
                        Copy
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => onTrackClick(link.id)}
                        title="Test click"
                      >
                        Test
                      </button>
                      {link.status === "active" && (
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => onDuplicateLink(link)}
                        >
                          Duplicate
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-ghost"
                        style={{ color: "var(--error)" }}
                        onClick={() => {
                          if (
                            confirm(
                              `Delete "${link.title}"? This cannot be undone.`,
                            )
                          ) {
                            onDeleteLink(link.id).then(() => loadLinks());
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-ghost"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {showArchiveConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Archive Selected Links?</h3>
            <p>
              You are about to archive {selectedLinks.size} link(s). They will
              no longer appear in active links but can be reactivated later.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setShowArchiveConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn btn-warning" onClick={confirmArchive}>
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
