import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaMousePointer, FaDollarSign, FaBoxOpen, FaUsers } from 'react-icons/fa';

export const AnalyticsDashboard: React.FC = () => {
  const { getAnalytics } = useAdmin();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getAnalytics().then(data => {
      const clickMap = data.clicks.reduce((acc: any, curr: any) => {
        const date = curr.clicked_at.split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.keys(clickMap).map(date => ({
        date: date.slice(5),
        clicks: clickMap[date]
      })).slice(-30);

      setStats({ ...data, chartData });
    });
  }, []);

  if (!stats) return <div>Loading Analytics...</div>;

  const cards = [
    { label: 'Total Products', value: stats.totalProducts, icon: FaBoxOpen, color: 'text-blue-500' },
    { label: 'Total Users', value: stats.totalUsers, icon: FaUsers, color: 'text-purple-500' },
    { label: '30-Day Clicks', value: stats.clicks.length, icon: FaMousePointer, color: 'text-orange-500' },
    { label: 'Est. Revenue', value: `$${(stats.clicks.length * 0.12).toFixed(2)}`, icon: FaDollarSign, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      
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

      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 h-[400px]">
        <h3 className="text-lg font-bold mb-4 text-zinc-300">Affiliate Clicks (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height="100%">
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
    </div>
  );
};
