import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export const WeeklySummary = ({ data }) => {
  const weeklyData = processWeeklyData(data);

  if (weeklyData.length < 2) return null;

  const thisWeek = weeklyData[weeklyData.length - 1].total;
  const lastWeek = weeklyData[weeklyData.length - 2].total;
  const percentChange =
    lastWeek === 0
      ? 100
      : (((thisWeek - lastWeek) / lastWeek) * 100).toFixed(1);
  const isPositive = percentChange > 0;

  return (
    <div className="weekly-summary">
      <div className="summary-card">
        <span className="summary-label">This Week</span>
        <span className="summary-value">{thisWeek.toLocaleString()}</span>
      </div>
      <div className="summary-card">
        <span className="summary-label">Last Week</span>
        <span className="summary-value">{lastWeek.toLocaleString()}</span>
      </div>
      <div
        className={`summary-card change ${isPositive ? "positive" : "negative"}`}
      >
        <span className="summary-label">Week-over-Week</span>
        <span className="summary-value">
          {isPositive ? "▲" : "▼"} {Math.abs(percentChange)}%
        </span>
      </div>
    </div>
  );
};

// Weekly Chart Component (Bar Chart)
export const WeeklyChart = ({ data, chartMetrics }) => {
  const weeklyData = processWeeklyData(data);

  if (weeklyData.length === 0) {
    return <div className="no-data">No weekly data available</div>;
  }

  // Determine which metrics to show
  const platforms = [
    "Twitter",
    "LinkedIn",
    "YouTube",
    "Facebook",
    "Instagram",
    "Ecommerce",
  ];
  const showTotal = chartMetrics.total;
  const showByPlatform = chartMetrics.byPlatform;

  // Platform colors (use your existing colors)
  const platformColors = {
    Twitter: "#1DA1F2",
    LinkedIn: "#0077B5",
    YouTube: "#FF0000",
    Facebook: "#4267B2",
    Instagram: "#E1306C",
    Ecommerce: "#10b981",
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={weeklyData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        className="weekly-bar-chart" // Add class for styling
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="week"
          stroke="var(--text-secondary)"
          tick={{ fontSize: 12 }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "var(--text-primary)" }}
          cursor={{ fill: "transparent" }} // This removes the hover background
        />
        <Legend />

        {showTotal && (
          <Bar
            dataKey="total"
            name="Total Clicks"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
            barSize={40} // Control bar width
          />
        )}

        {showByPlatform &&
          platforms.map((platform) => (
            <Bar
              key={platform}
              dataKey={platform}
              name={platform}
              fill={platformColors[platform] || "#8884d8"}
              stackId="platforms"
              radius={[4, 4, 0, 0]}
              barSize={40} // Control bar width
            />
          ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

// Daily Line Chart Component (your existing chart)
export const DailyLineChart = ({ data, chartLines }) => {
  const shouldShowTick = (date, index, data) => {
    // Show first, last, and every 3rd date in between
    if (index === 0 || index === data.length - 1) return true;
    if (index % 3 === 0) return true;
    return false;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          stroke="var(--text-secondary)"
          tick={{ fontSize: 12 }}
          tickCount={8} // Force exactly 8 ticks
          interval="preserveStartEnd"
          tickFormatter={(value, index) => {
            // Return the date only for specific indices
            return shouldShowTick(value, index, data) ? value : "";
          }}
        />
        <YAxis stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            background: "var(--bg-tertiary)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "var(--text-primary)" }}
        />
        <Legend />
        {chartLines.map(({ key, label, color }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={label}
            stroke={color}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Helper function to group daily data into weeks (Monday-Sunday)
const processWeeklyData = (dailyData) => {
  if (!dailyData || dailyData.length === 0) return [];

  // Get last 8 weeks of data
  const weeks = [];
  const weekMap = new Map();

  // Platform colors (use your existing colors)
  const platformColors = {
    Twitter: "#1DA1F2",
    LinkedIn: "#0077B5",
    YouTube: "#FF0000",
    Facebook: "#4267B2",
    Instagram: "#E1306C",
    Ecommerce: "#10b981", // Add if needed
  };

  dailyData.forEach((day) => {
    const date = new Date(day.dateKey);

    // Find Monday of the week (adjust if your week starts on Sunday)
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const monday = new Date(date);
    // If Sunday (0), go back 6 days to Monday; otherwise go back (dayOfWeek - 1) days
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(date.getDate() - daysToSubtract);

    const weekKey = monday.toISOString().split("T")[0];
    const weekLabel = `Week of ${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        week: weekKey,
        weekLabel,
        total: 0,
        platforms: {},
        monday: monday,
      });
    }

    const weekData = weekMap.get(weekKey);

    // Add platform data (excluding date and dateKey)
    Object.entries(day).forEach(([key, value]) => {
      if (key !== "date" && key !== "dateKey" && typeof value === "number") {
        weekData.total += value;
        weekData.platforms[key] = (weekData.platforms[key] || 0) + value;
      }
    });
  });

  // Convert to array and sort by week
  const weeksArray = Array.from(weekMap.values()).sort(
    (a, b) => new Date(a.monday) - new Date(b.monday),
  );

  // Get last 8 weeks
  const last8Weeks = weeksArray.slice(-8);

  // Format for chart
  return last8Weeks.map((week) => {
    const chartItem = {
      week: week.weekLabel,
      weekKey: week.week,
      total: week.total,
    };

    // Add individual platform data
    Object.entries(week.platforms).forEach(([platform, value]) => {
      chartItem[platform] = value;
    });

    return chartItem;
  });
};
