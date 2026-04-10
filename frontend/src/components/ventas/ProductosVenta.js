import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { Search, X, Plus, Minus, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { ColorCircle } from '../../utils/colorUtils';

const ProductosVenta = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [colorQuantities, setColorQuantities] = useState({});
  const [selectedPriceType, setSelectedPriceType] = useState(null);
  const [customPrice, setCustomPrice] = useState('');

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

  const openProductDetail = (producto) => {
    setSelectedProduct(producto);
    setColorQuantities({});
    setSelectedPriceType(null);
    setCustomPrice('');
  };

  const updateColorQuantity = (colorName, delta) => {
    setColorQuantities(prev => {
      const current = prev[colorName] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const { [colorName]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [colorName]: newValue };
    });
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;

    // Preparar colores con cantidad
    const coloresConCantidad = Object.entries(colorQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }));

    // Validar precio
    let precio = 0;
    let tipoLabel = '';

    if (selectedPriceType === 'custom') {
      if (!customPrice || parseFloat(customPrice) <= 0) {
        alert('Ingresa un precio personalizado válido');
        return;
      }
      precio = parseFloat(customPrice);
      tipoLabel = 'personalizado';
    } else if (selectedPriceType === 'pieza' && selectedProduct.pieza) {
      precio = selectedProduct.pieza;
      tipoLabel = 'pieza';
    } else if (selectedPriceType === 'mayoreo' && selectedProduct.mayoreo) {
      precio = selectedProduct.mayoreo;
      tipoLabel = 'mayoreo';
    } else if (selectedPriceType === 'caja' && selectedProduct.caja) {
      precio = selectedProduct.caja;
      tipoLabel = 'caja';
    } else {
      alert('Selecciona un tipo de precio');
      return;
    }

    // Calcular cantidad total
    const totalQty = coloresConCantidad.reduce((sum, c) => sum + c.cantidad, 0) || 1;

    // Agregar al carrito
    addToCart({
      ...selectedProduct,
      colores: coloresConCantidad
    }, totalQty, tipoLabel, precio);

    setSelectedProduct(null);
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

      {/* Products List */}
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
        <div className="space-y-2">
          {filteredProducts.map(producto => (
            <button
              key={producto.id}
              onClick={() => openProductDetail(producto)}
              className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:bg-white/10'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                {producto.imagenes?.[0] ? (
                  <img src={producto.imagenes[0]} alt={producto.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-base">{producto.nombre}</h4>
                {producto.colores && producto.colores.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {producto.colores.slice(0, 5).map((color, idx) => {
                      const colorStr = typeof color === 'string' ? color : color.nombre;
                      return <ColorCircle key={idx} colorName={colorStr} size={16} />;
                    })}
                    {producto.colores.length > 5 && (
                      <span className="text-xs text-gray-500">+{producto.colores.length - 5}</span>
                    )}
                  </div>
                )}
              </div>
              <ChevronRight size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            </button>
          ))}
        </div>
      )}

      {/* Modal Detalle de Producto */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className={`w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl ${
            isDark ? 'bg-zinc-900' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{selectedProduct.nombre}</h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedProduct.descripcion}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className={`p-2 rounded-full ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(85vh-250px)]">
              {/* Imágenes */}
              {selectedProduct.imagenes && selectedProduct.imagenes.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Fotos</h4>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedProduct.imagenes.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${selectedProduct.nombre} ${idx + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Colores */}
              {selectedProduct.colores && selectedProduct.colores.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Colores disponibles</h4>
                  <div className="space-y-2">
                    {selectedProduct.colores.map((color, idx) => {
                      const colorStr = typeof color === 'string' ? color : color.nombre;
                      const qty = colorQuantities[colorStr] || 0;
                      
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <ColorCircle colorName={colorStr} size={24} />
                            <span className="font-medium">{colorStr}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateColorQuantity(colorStr, -1)}
                              className={`p-1.5 rounded ${
                                isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                              }`}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-bold w-8 text-center">{qty}</span>
                            <button
                              onClick={() => updateColorQuantity(colorStr, 1)}
                              className={`p-1.5 rounded ${
                                isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                              }`}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Opciones de Precio */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Tipo de Precio</h4>
                
                {/* Precio Personalizado */}
                <div className={`mb-3 p-4 rounded-lg border ${
                  selectedPriceType === 'custom'
                    ? 'border-blue-500 bg-blue-50'
                    : isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="radio"
                      checked={selectedPriceType === 'custom'}
                      onChange={() => setSelectedPriceType('custom')}
                      className="w-4 h-4"
                    />
                    <span className="font-medium">Precio Personalizado</span>
                  </label>
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="Ingresa precio"
                    disabled={selectedPriceType !== 'custom'}
                    className={`w-full px-3 py-2 rounded border outline-none ${
                      selectedPriceType !== 'custom' ? 'opacity-50' : ''
                    } ${
                      isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-200'
                    }`}
                  />
                </div>

                {/* Otras opciones */}
                <div className="grid grid-cols-3 gap-3">
                  {selectedProduct.pieza && (
                    <button
                      onClick={() => setSelectedPriceType('pieza')}
                      className={`p-3 rounded-lg border text-left ${
                        selectedPriceType === 'pieza'
                          ? isDark ? 'border-white bg-white/20' : 'border-black bg-black/5'
                          : isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium">Pieza</div>
                      <div className="text-lg font-bold">${selectedProduct.pieza}</div>
                    </button>
                  )}
                  {selectedProduct.mayoreo && (
                    <button
                      onClick={() => setSelectedPriceType('mayoreo')}
                      className={`p-3 rounded-lg border text-left ${
                        selectedPriceType === 'mayoreo'
                          ? isDark ? 'border-white bg-white/20' : 'border-black bg-black/5'
                          : isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium">Mayoreo</div>
                      <div className="text-lg font-bold">${selectedProduct.mayoreo}</div>
                    </button>
                  )}
                  {selectedProduct.caja && (
                    <button
                      onClick={() => setSelectedPriceType('caja')}
                      className={`p-3 rounded-lg border text-left ${
                        selectedPriceType === 'caja'
                          ? isDark ? 'border-white bg-white/20' : 'border-black bg-black/5'
                          : isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium">Caja</div>
                      <div className="text-lg font-bold">${selectedProduct.caja}</div>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer con botón Añadir */}
            <div className={`p-6 border-t flex gap-3 ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setSelectedProduct(null)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium ${
                  isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddToCart}
                className={`flex-1 px-4 py-3 rounded-lg font-bold ${
                  isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                Añadir al Carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductosVenta;
