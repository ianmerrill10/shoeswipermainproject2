import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { useAnalytics } from '../../hooks/useAnalytics';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { FaMousePointer, FaDollarSign, FaBoxOpen, FaUsers, FaMusic, FaSpotify, FaApple, FaAmazon } from 'react-icons/fa';

interface AdminAnalytics {
  totalUsers: number;
  totalProducts: number;
  clicks: Array<{ clicked_at: string }>;
  chartData?: Array<{ date: string; clicks: number }>;
}

interface AnalyticsSummary {
  totalEvents?: number;
  shoeViews?: number;
  shoeClicks?: number;
  musicClicks?: Record<string, number>;
  panelOpens?: Record<string, number>;
  shares?: number;
  favorites?: number;
  recentEvents?: unknown[];
  topShoes?: Array<[string, number]>;
}

export const AnalyticsDashboard: React.FC = () => {
  const { getAnalytics } = useAdmin();
  const { getAnalyticsSummary } = useAnalytics();
  const [stats, setStats] = useState<AdminAnalytics | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    // Load basic admin analytics
    getAnalytics().then(data => {
      const clickMap = data.clicks.reduce((acc: Record<string, number>, curr: { clicked_at: string }) => {
        const date = curr.clicked_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const chartData = Object.keys(clickMap).map(date => ({
        date: date.slice(5),
        clicks: clickMap[date]
      })).slice(-30);

      setStats({ ...data, chartData });
    });

    // Load detailed analytics from useAnalytics hook
    getAnalyticsSummary().then(data => {
      setAnalyticsData(data);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!stats) return <div className="text-zinc-400">Loading Analytics...</div>;

  const cards = [
    { label: 'Total Products', value: stats.totalProducts, icon: FaBoxOpen, color: 'text-blue-500' },
    { label: 'Total Users', value: stats.totalUsers, icon: FaUsers, color: 'text-purple-500' },
    { label: '30-Day Clicks', value: stats.clicks.length, icon: FaMousePointer, color: 'text-orange-500' },
    { label: 'Est. Revenue', value: `$${(stats.clicks.length * 0.12).toFixed(2)}`, icon: FaDollarSign, color: 'text-green-500' },
  ];

  // Music platform colors
  const MUSIC_COLORS = {
    spotify: '#1DB954',
    apple_music: '#FA57C1',
    amazon_music: '#00A8E1',
  };

  // Prepare music click data for pie chart
  const musicClickData = analyticsData?.musicClicks ? [
    { name: 'Spotify', value: analyticsData.musicClicks.spotify || 0, color: MUSIC_COLORS.spotify },
    { name: 'Apple Music', value: analyticsData.musicClicks.apple_music || 0, color: MUSIC_COLORS.apple_music },
    { name: 'Amazon Music', value: analyticsData.musicClicks.amazon_music || 0, color: MUSIC_COLORS.amazon_music },
  ].filter(d => d.value > 0) : [];

  const totalMusicClicks = musicClickData.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-zinc-400 text-sm mb-1">{card.label}</p>
                <h3 className="text-3xl font-bold text-white">{card.value}</h3>
              </div>
              <card.icon className={`text-2xl ${card.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Affiliate Clicks Chart */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 h-[400px]">
          <h3 className="text-lg font-bold mb-4 text-zinc-300">Affiliate Clicks (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="clicks" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Music Platform Analytics */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 h-[400px]">
          <h3 className="text-lg font-bold mb-4 text-zinc-300 flex items-center gap-2">
            <FaMusic className="text-orange-500" />
            Music Platform Clicks
          </h3>
          {totalMusicClicks > 0 ? (
            <div className="flex items-center h-[85%]">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={musicClickData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {musicClickData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <FaSpotify className="text-2xl text-[#1DB954]" />
                  <div>
                    <p className="text-white font-bold">{analyticsData?.musicClicks?.spotify || 0}</p>
                    <p className="text-zinc-500 text-sm">Spotify clicks</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaApple className="text-2xl text-[#FA57C1]" />
                  <div>
                    <p className="text-white font-bold">{analyticsData?.musicClicks?.apple_music || 0}</p>
                    <p className="text-zinc-500 text-sm">Apple Music clicks</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaAmazon className="text-2xl text-[#00A8E1]" />
                  <div>
                    <p className="text-white font-bold">{analyticsData?.musicClicks?.amazon_music || 0}</p>
                    <p className="text-zinc-500 text-sm">Amazon Music clicks</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-zinc-800">
                  <p className="text-orange-400 font-bold text-lg">{totalMusicClicks} total</p>
                  <p className="text-zinc-500 text-sm">music affiliate clicks</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[85%] text-zinc-500">
              <div className="text-center">
                <FaMusic className="text-4xl mx-auto mb-2 opacity-50" />
                <p>No music clicks tracked yet</p>
                <p className="text-sm">Clicks will appear here in real-time</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Analytics Summary */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <p className="text-zinc-400 text-sm mb-1">Panel Opens</p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-white">{analyticsData.panelOpens?.shoe || 0}</span>
                <span className="text-zinc-500 text-sm ml-2">Shoe</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">{analyticsData.panelOpens?.music || 0}</span>
                <span className="text-zinc-500 text-sm ml-2">Music</span>
              </div>
            </div>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <p className="text-zinc-400 text-sm mb-1">Shares</p>
            <h3 className="text-3xl font-bold text-white">{analyticsData.shares || 0}</h3>
          </div>
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <p className="text-zinc-400 text-sm mb-1">Favorites</p>
            <h3 className="text-3xl font-bold text-white">{analyticsData.favorites || 0}</h3>
          </div>
        </div>
      )}
    </div>
  );
};
