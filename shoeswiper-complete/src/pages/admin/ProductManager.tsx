import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { Shoe } from '../../lib/types';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';

export const ProductManager: React.FC = () => {
  const { getProducts, saveProduct, deleteProduct, loading } = useAdmin();
  const [products, setProducts] = useState<Shoe[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Shoe>>({});

  const fetchAll = () => getProducts().then(setProducts);

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProduct(editingProduct);
    setIsModalOpen(false);
    setEditingProduct({});
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      fetchAll();
    }
  };

  const openModal = (shoe?: Shoe) => {
    setEditingProduct(shoe || {});
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Product Management</h2>
        <button 
          onClick={() => openModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition"
        >
          <FaPlus /> Add Product
        </button>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-zinc-800 text-zinc-400 uppercase text-xs">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Brand</th>
              <th className="p-4">Price</th>
              <th className="p-4">Vibe Score</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {products.map((shoe) => (
              <tr key={shoe.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <img src={shoe.image_url} alt="" className="w-10 h-10 rounded object-cover bg-zinc-800" />
                  <span className="font-medium">{shoe.name}</span>
                </td>
                <td className="p-4 text-zinc-400">{shoe.brand}</td>
                <td className="p-4 font-mono text-orange-500">${shoe.price}</td>
                <td className="p-4">{shoe.vibe_score || 0}</td>
                <td className="p-4 text-right space-x-2">
                  <a href={shoe.amazon_url} target="_blank" rel="noreferrer" className="inline-block p-2 text-zinc-400 hover:text-white">
                    <FaExternalLinkAlt />
                  </a>
                  <button onClick={() => openModal(shoe)} className="p-2 text-blue-500 hover:text-blue-400">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(shoe.id)} className="p-2 text-red-500 hover:text-red-400">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 w-full max-w-2xl rounded-2xl border border-zinc-800 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingProduct.id ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><FaTimes /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Brand</label>
                  <input 
                    type="text" 
                    value={editingProduct.brand || ''} 
                    onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Price</label>
                  <input 
                    type="number" 
                    value={editingProduct.price || ''} 
                    onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-500 uppercase mb-1">Model Name</label>
                <input 
                  type="text" 
                  value={editingProduct.name || ''} 
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 uppercase mb-1">Image URL</label>
                <input 
                  type="url" 
                  value={editingProduct.image_url || ''} 
                  onChange={e => setEditingProduct({...editingProduct, image_url: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-500 uppercase mb-1">Amazon URL (Tag auto-appended)</label>
                <input 
                  type="url" 
                  value={editingProduct.amazon_url || ''} 
                  onChange={e => setEditingProduct({...editingProduct, amazon_url: e.target.value})}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-500 uppercase mb-1">Style Tags (Comma separated)</label>
                  <input 
                    type="text" 
                    value={editingProduct.style_tags?.join(', ') || ''} 
                    onChange={e => setEditingProduct({...editingProduct, style_tags: e.target.value.split(',').map(s => s.trim())})}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                   <label className="block text-xs text-zinc-500 uppercase mb-1">Color Tags (Comma separated)</label>
                   <input 
                     type="text" 
                     value={editingProduct.color_tags?.join(', ') || ''} 
                     onChange={e => setEditingProduct({...editingProduct, color_tags: e.target.value.split(',').map(s => s.trim())})}
                     className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none"
                   />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-bold transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
