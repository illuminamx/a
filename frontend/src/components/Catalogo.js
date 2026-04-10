import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Moon, Sun, Search, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import ProductCard from './ProductCard';

const Catalogo = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.colores?.some(color => {
          const colorStr = typeof color === 'string' ? color : color.nombre || '';
          return colorStr.toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-lg ${
        isDark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-black/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">Jessica Ale Suarez</h1>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                }`}
              >
                <Search size={20} />
              </button>
              
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                }`}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="mt-4 animate-fade-in">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar productos..."
                  className={`w-full px-4 py-3 rounded-lg outline-none border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'
                  }`}
                  autoFocus
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${
                      isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                    }`}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
              isDark ? 'border-white' : 'border-black'
            }`}></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} showPrices={false} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`mt-20 border-t ${
        isDark ? 'border-white/10' : 'border-black/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              Jessica Ale Suarez - Plaza de la Tecnología
            </p>
            <p className={`text-sm mt-2 ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>
              Local 26 Entrada sobre Uruguay 11 - Con salida al pasillo 2
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Catalogo;
