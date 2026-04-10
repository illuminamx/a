import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { Search, X, Plus } from 'lucide-react';
import ProductCard from '../ProductCard';
import { ColorCircle } from '../../utils/colorUtils';

const ProductosVenta = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const { addToCart } = useCart();
  const [selectedPriceType, setSelectedPriceType] = useState({});

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleAddToCart = (product, priceType) => {
    addToCart(product, 1, priceType);
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            className={`w-full pl-10 pr-10 py-3 rounded-lg outline-none border ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500'
            }`}
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

      {/* Products Grid */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg ${
                isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-200'
              }`}
            >
              {/* Product Image */}
              <div className="relative aspect-video overflow-hidden">
                {product.imagenes && product.imagenes.length > 0 ? (
                  <img
                    src={product.imagenes[0]}
                    alt={product.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    isDark ? 'bg-white/5' : 'bg-gray-100'
                  }`}>
                    <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Sin imagen</p>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.nombre}</h3>
                
                {product.descripcion && (
                  <p className={`text-sm mb-3 line-clamp-2 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {product.descripcion}
                  </p>
                )}

                {/* Quick Add Buttons */}
                <div className="space-y-2">
                  {product.pieza && (
                    <button
                      onClick={() => handleAddToCart(product, 'pieza')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isDark
                          ? 'bg-white/10 hover:bg-white/20'
                          : 'bg-black/5 hover:bg-black/10'
                      }`}
                    >
                      <span className="text-sm flex-shrink-0">Pieza</span>
                      <span className="font-semibold flex-1 text-right">${product.pieza}</span>
                      <Plus size={16} className="flex-shrink-0" />
                    </button>
                  )}
                  {product.mayoreo && (
                    <button
                      onClick={() => handleAddToCart(product, 'mayoreo')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isDark
                          ? 'bg-white/10 hover:bg-white/20'
                          : 'bg-black/5 hover:bg-black/10'
                      }`}
                    >
                      <span className="text-sm flex-shrink-0">Mayoreo</span>
                      <span className="font-semibold flex-1 text-right">${product.mayoreo}</span>
                      <Plus size={16} className="flex-shrink-0" />
                    </button>
                  )}
                  {product.caja && (
                    <button
                      onClick={() => handleAddToCart(product, 'caja')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isDark
                          ? 'bg-white/10 hover:bg-white/20'
                          : 'bg-black/5 hover:bg-black/10'
                      }`}
                    >
                      <span className="text-sm flex-shrink-0">Caja</span>
                      <span className="font-semibold flex-1 text-right">${product.caja}</span>
                      <Plus size={16} className="flex-shrink-0" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductosVenta;
