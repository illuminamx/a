import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, X, ChevronDown, MessageCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ColorCircle } from '../utils/colorUtils';

const Catalogo = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const { isDark, toggleTheme } = useTheme();
  const searchInputRef = useRef(null);
  const productsRef = useRef(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const results = searchProducts(searchTerm);
      setSearchResults(results);
    } else {
      setSearchResults([]);
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

  const searchProducts = (term) => {
    return products.filter(product =>
      product.nombre?.toLowerCase().includes(term.toLowerCase()) ||
      product.descripcion?.toLowerCase().includes(term.toLowerCase()) ||
      product.colores?.some(color => {
        const colorStr = typeof color === 'string' ? color : color.nombre || '';
        return colorStr.toLowerCase().includes(term.toLowerCase());
      })
    );
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/527297441082', '_blank');
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setIsSearchOpen(false);
    document.body.style.overflow = 'hidden';
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'auto';
  };

  const nextImage = () => {
    if (selectedProduct && selectedProduct.imagenes) {
      setCurrentImageIndex((prev) =>
        prev === selectedProduct.imagenes.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProduct && selectedProduct.imagenes) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProduct.imagenes.length - 1 : prev - 1
      );
    }
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderColorBadge = (color, size = 'normal') => {
    const colorName = typeof color === 'string' ? color : (color?.nombre || '');
    if (!colorName) return null;

    const sizeClasses = size === 'small'
      ? 'px-2 py-0.5 text-[10px] gap-1'
      : 'px-2.5 py-1 text-xs gap-1.5';

    return (
      <span
        key={colorName}
        className={`inline-flex items-center ${sizeClasses} rounded-full font-medium ${
          isDark 
            ? 'bg-white/10 text-white border border-white/20' 
            : 'bg-gray-100 text-gray-700 border border-gray-200'
        }`}
      >
        <ColorCircle colorName={colorName} size={size === 'small' ? 14 : 16} />
        <span>{colorName}</span>
      </span>
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Elegant Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b ${
        isDark 
          ? 'bg-black/95 border-white/10' 
          : 'bg-white/95 border-gray-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <h1
              className="text-sm sm:text-base md:text-lg font-light tracking-[0.2em] uppercase"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              <span className="hidden sm:inline">JESSICAALESUAREZ</span>
              <span className="sm:hidden">JESSICA</span>
            </h1>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={openSearch}
                className={`p-2.5 rounded-full transition-colors ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-full transition-colors ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className={`fixed inset-0 z-50 animate-fadeIn ${
          isDark ? 'bg-black' : 'bg-white'
        }`}>
          {/* Search Header */}
          <div className={`border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
            <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
              <Search className={`w-5 h-5 ${isDark ? 'text-white/50' : 'text-gray-400'}`} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="¿Qué estás buscando?"
                className={`flex-1 text-lg sm:text-xl bg-transparent focus:outline-none ${
                  isDark 
                    ? 'text-white placeholder-white/40' 
                    : 'text-gray-800 placeholder-gray-400'
                }`}
                autoFocus
              />
              <button
                onClick={closeSearch}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-w-4xl mx-auto px-4 py-6 max-h-[calc(100vh-80px)] overflow-y-auto">
            {searchTerm.trim() === '' ? (
              <div className="text-center py-16">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Escribe para buscar productos por nombre o color
                </p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-16">
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  No se encontraron productos para "{searchTerm}"
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className={`text-xs uppercase tracking-wider mb-4 ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                </p>
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => openProductModal(product)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors text-left group ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                      isDark ? 'bg-white/5' : 'bg-gray-100'
                    }`}>
                      {product.imagenes && product.imagenes.length > 0 ? (
                        <img
                          src={product.imagenes[0]}
                          alt={product.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-xs ${
                          isDark ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          Sin imagen
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate group-hover:opacity-70 transition-opacity">
                        {product.nombre}
                      </h4>
                      {product.colores && product.colores.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {product.colores.map(c => renderColorBadge(c, 'small'))}
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 pt-14 sm:pt-16">
        <div className="text-center space-y-6 sm:space-y-8 animate-fadeIn">
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight tracking-[0.08em] sm:tracking-[0.15em] uppercase leading-tight">
            <span className="block">JESSICA</span>
            <span className="block">ALESUAREZ</span>
          </h2>
          <p className={`tracking-[0.1em] sm:tracking-[0.15em] uppercase text-[10px] sm:text-xs ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Descubre nuestro catálogo
          </p>
          <button
            onClick={scrollToProducts}
            className="mt-6 sm:mt-8 group"
            aria-label="Ver productos"
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto border rounded-full flex items-center justify-center transition-all duration-300 ${
              isDark 
                ? 'border-white hover:bg-white' 
                : 'border-gray-800 hover:bg-gray-800'
            }`}>
              <ChevronDown className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors animate-bounce ${
                isDark 
                  ? 'text-white group-hover:text-black' 
                  : 'text-gray-800 group-hover:text-white'
              }`} />
            </div>
          </button>
        </div>
      </section>

      {/* Products Section */}
      <section ref={productsRef} className={`py-16 sm:py-24 px-4 sm:px-6 ${
        isDark ? 'bg-black' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.1em] uppercase mb-4">
              Nuestros Productos
            </h3>
            <div className={`w-16 sm:w-24 h-[1px] mx-auto ${
              isDark ? 'bg-white' : 'bg-gray-800'
            }`}></div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${
                isDark ? 'border-white' : 'border-gray-800'
              }`}></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                No hay productos disponibles
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => openProductModal(product)}
                  className="group cursor-pointer animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border ${
                    isDark 
                      ? 'bg-white/5 border-white/10 hover:border-white/20' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}>
                    {/* Product Image */}
                    <div className={`relative w-full aspect-square overflow-hidden ${
                      isDark ? 'bg-white/5' : 'bg-gray-100'
                    }`}>
                      {product.imagenes && product.imagenes.length > 0 ? (
                        <img
                          src={product.imagenes[0]}
                          alt={product.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-xs sm:text-sm ${
                          isDark ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          Sin imagen
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    {/* Product Info */}
                    <div className="p-3 sm:p-4 space-y-2">
                      <h4 className="text-sm sm:text-base font-medium line-clamp-2 group-hover:opacity-70 transition-opacity duration-300">
                        {product.nombre}
                      </h4>
                      
                      {product.colores && product.colores.length > 0 && (
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                          {product.colores.map(c => renderColorBadge(c, 'small'))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Product Drawer */}
      {selectedProduct && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={closeProductModal}
          />

          {/* Drawer Container */}
          <div
            className={`fixed inset-y-0 right-0 z-50 w-full md:w-[500px] lg:w-[600px] shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto ${
              isDark ? 'bg-black' : 'bg-white'
            }`}
            style={{ animation: 'slideInRight 0.3s ease-out' }}
          >
            {/* Close Button */}
            <button
              onClick={closeProductModal}
              className={`fixed top-4 right-4 z-[60] w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform border ${
                isDark 
                  ? 'bg-black/95 border-white/10' 
                  : 'bg-white/95 border-gray-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="flex flex-col h-full">
              {/* Image Carousel */}
              <div className={`relative w-full h-[45vh] md:h-[50vh] flex-shrink-0 ${
                isDark ? 'bg-white/5' : 'bg-gray-100'
              }`}>
                {selectedProduct.imagenes && selectedProduct.imagenes.length > 0 ? (
                  <>
                    <img
                      src={selectedProduct.imagenes[currentImageIndex]}
                      alt={`${selectedProduct.nombre} - ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedProduct.imagenes.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform ${
                            isDark ? 'bg-white/10' : 'bg-white/90'
                          }`}
                        >
                          <ChevronDown className="w-5 h-5 rotate-90" />
                        </button>
                        <button
                          onClick={nextImage}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform ${
                            isDark ? 'bg-white/10' : 'bg-white/90'
                          }`}
                        >
                          <ChevronDown className="w-5 h-5 -rotate-90" />
                        </button>
                        
                        {/* Image Indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {selectedProduct.imagenes.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setCurrentImageIndex(idx)}
                              className={`h-1.5 rounded-full transition-all ${
                                idx === currentImageIndex
                                  ? 'bg-white w-6'
                                  : 'bg-white/50 w-1.5 hover:bg-white/70'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${
                    isDark ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6">
                  <h2 className="text-2xl md:text-3xl font-medium mb-4 pr-12">
                    {selectedProduct.nombre}
                  </h2>

                  {selectedProduct.descripcion && (
                    <p className={`text-base leading-relaxed mb-6 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {selectedProduct.descripcion}
                    </p>
                  )}

                  {selectedProduct.colores && selectedProduct.colores.length > 0 && (
                    <div className="mb-6">
                      <p className={`text-xs uppercase tracking-wider mb-3 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Colores disponibles
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colores.map(c => renderColorBadge(c))}
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp Button */}
                <div className={`p-6 border-t ${
                  isDark ? 'border-white/10' : 'border-gray-100'
                }`}>
                  <button
                    onClick={handleWhatsApp}
                    className="w-full py-4 bg-[#25D366] hover:bg-[#20BD5A] text-white text-base font-medium rounded-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Consultar por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className={`border-t py-6 mt-8 ${
        isDark 
          ? 'bg-black/95 border-white/10' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
            © 2026 jessicaalesuarez
          </p>
          <p className={`text-xs italic ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            Gracias por su preferencia ♥
          </p>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <button
        onClick={handleWhatsApp}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40 hover:scale-110 active:scale-95"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Catalogo;
