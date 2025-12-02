import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { FaUserSlash, FaUserCheck, FaSearch } from 'react-icons/fa';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('profiles').select('*');
      setUsers(data || []);
    };
    fetchUsers();
  }, []);

  const toggleBan = async (id: string, currentStatus: boolean) => {
    await supabase.from('profiles').update({ is_banned: !currentStatus }).eq('id', id);
    setUsers(users.map(u => u.id === id ? { ...u, is_banned: !currentStatus } : u));
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white focus:border-orange-500 outline-none w-64"
          />
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-800 text-zinc-400 uppercase text-xs">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-white">{user.username || 'No Username'}</div>
                  <div className="text-sm text-zinc-500">{user.email}</div>
                </td>
                <td className="p-4 text-zinc-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  {user.is_banned ? (
                    <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs font-bold">BANNED</span>
                  ) : (
                    <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold">ACTIVE</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => toggleBan(user.id, user.is_banned)}
                    className={`p-2 rounded hover:bg-zinc-700 transition ${user.is_banned ? 'text-green-500' : 'text-red-500'}`}
                    title={user.is_banned ? "Unban User" : "Ban User"}
                  >
                    {user.is_banned ? <FaUserCheck /> : <FaUserSlash />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
