import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../Toast';
import { X, Plus, Minus, Trash2, ShoppingCart, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { ColorCircle } from '../../utils/colorUtils';
import TicketGenerator from './TicketGenerator';

const CrearPedidoModal = ({ cliente, onClose, onPedidoCreated }) => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [montoPagado, setMontoPagado] = useState('');
  const [creando, setCreando] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [colorQuantities, setColorQuantities] = useState({});
  const [selectedPriceType, setSelectedPriceType] = useState(null);
  const [customPrice, setCustomPrice] = useState('');

  useEffect(() => {
    loadProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProductos = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'productos'));
      const productosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProductos(productosData);
    } catch (error) {
      console.error('Error cargando productos:', error);
      showToast('Error al cargar productos', 'error');
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

  const agregarAlCarrito = () => {
    if (!selectedProduct) return;

    // Validar que haya colores seleccionados
    const coloresConCantidad = Object.entries(colorQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }));

    if (coloresConCantidad.length === 0) {
      showToast('Selecciona al menos un color', 'warning');
      return;
    }

    // Validar precio
    let precio = 0;
    let tipoLabel = '';

    if (selectedPriceType === 'custom') {
      if (!customPrice || parseFloat(customPrice) <= 0) {
        showToast('Ingresa un precio personalizado válido', 'warning');
        return;
      }
      precio = parseFloat(customPrice);
      tipoLabel = 'personalizado';
    } else if (selectedPriceType === 'listado' && cliente.preciosEspeciales?.[selectedProduct.id]) {
      precio = cliente.preciosEspeciales[selectedProduct.id];
      tipoLabel = 'listado';
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
      showToast('Selecciona un tipo de precio', 'warning');
      return;
    }

    // Agregar al carrito
    setCarrito([...carrito, {
      id: selectedProduct.id,
      nombre: selectedProduct.nombre,
      colores: coloresConCantidad,
      precioUnitario: precio,
      priceType: tipoLabel,
      imagen: selectedProduct.imagenes?.[0] || null
    }]);

    showToast(`${selectedProduct.nombre} agregado al carrito`, 'success');
    setSelectedProduct(null);
  };

  const eliminarDelCarrito = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const getTotal = () => {
    return carrito.reduce((sum, item) => {
      const totalColorQty = item.colores.reduce((s, c) => s + c.cantidad, 0);
      return sum + (item.precioUnitario * totalColorQty);
    }, 0);
  };

  const getTotalItems = () => {
    return carrito.reduce((sum, item) => {
      return sum + item.colores.reduce((s, c) => s + c.cantidad, 0);
    }, 0);
  };

  const handleFinalizarPedido = async () => {
    if (carrito.length === 0) {
      showToast('El carrito está vacío', 'warning');
      return;
    }

    try {
      setCreando(true);
      const total = getTotal();
      const pago = parseFloat(montoPagado) || 0;
      const numeroPedido = `${Date.now().toString().slice(-8)}`.toUpperCase();

      const pedidoData = {
        numero: numeroPedido,
        cliente: cliente.nombre,
        productos: carrito.map(item => ({
          id: item.id,
          nombre: item.nombre,
          colores: item.colores,
          precioUnitario: item.precioUnitario,
          priceType: item.priceType,
          imagen: item.imagen
        })),
        total,
        pagado: pago,
        adeudo: Math.max(0, total - pago),
        fecha: new Date().toISOString(),
        estado: pago >= total ? 'completado' : 'pendiente'
      };

      const docRef = await addDoc(collection(db, 'pedidos'), pedidoData);
      
      const ticketData = {
        ...pedidoData,
        id: docRef.id
      };
      setGeneratedTicket(ticketData);
      
      showToast('Pedido finalizado correctamente', 'success');
      onPedidoCreated();
    } catch (error) {
      console.error('Error creando pedido:', error);
      showToast('Error al finalizar pedido', 'error');
    } finally {
      setCreando(false);
    }
  };

  const cambio = montoPagado && parseFloat(montoPagado) > getTotal() 
    ? parseFloat(montoPagado) - getTotal() 
    : 0;

  const tienePrecioListado = selectedProduct && cliente.preciosEspeciales?.[selectedProduct.id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-7xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${
        isDark ? 'bg-zinc-900' : 'bg-white'
      }`}>
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div>
            <h2 className="text-2xl font-bold">Finalizar Pedido</h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Cliente: {cliente.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Lista de Productos - 3 columnas */}
            <div className="lg:col-span-3">
              <h3 className="font-semibold text-lg mb-4">Productos</h3>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                    isDark ? 'border-white' : 'border-black'
                  }`}></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {productos.map(producto => (
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
            </div>

            {/* Carrito - 1 columna */}
            <div className="lg:col-span-1">
              <div className={`sticky top-0 rounded-xl border p-4 ${
                isDark ? 'bg-zinc-800 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingCart size={20} />
                  <h3 className="font-bold text-lg">Carrito</h3>
                  <span className={`ml-auto text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {getTotalItems()} items
                  </span>
                </div>

                <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
                  {carrito.length === 0 ? (
                    <div className="text-center py-8">
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Vacío
                      </p>
                    </div>
                  ) : (
                    carrito.map((item, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${
                        isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{item.nombre}</p>
                            <p className="text-xs text-green-600 capitalize">{item.priceType} - ${item.precioUnitario}</p>
                          </div>
                          <button
                            onClick={() => eliminarDelCarrito(idx)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="space-y-1">
                          {item.colores.map((color, i) => (
                            <div key={i} className="text-xs flex items-center justify-between">
                              <span>- {color.nombre}</span>
                              <span className="font-semibold">x{color.cantidad}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className={`border-t pt-4 space-y-3 ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="text-2xl font-bold">${getTotal().toFixed(2)}</span>
                  </div>
                  
                  <input
                    type="number"
                    value={montoPagado}
                    onChange={(e) => setMontoPagado(e.target.value)}
                    placeholder="Monto pagado"
                    className={`w-full px-4 py-3 rounded-lg border outline-none ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white border-gray-200'
                    }`}
                  />
                  
                  {montoPagado && parseFloat(montoPagado) < getTotal() && (
                    <div className="text-sm text-red-500 font-semibold">
                      Adeudo: ${(getTotal() - parseFloat(montoPagado)).toFixed(2)}
                    </div>
                  )}
                  {cambio > 0 && (
                    <div className="text-sm text-green-600 font-semibold">
                      Cambio: ${cambio.toFixed(2)}
                    </div>
                  )}

                  <button
                    onClick={handleFinalizarPedido}
                    disabled={carrito.length === 0 || creando}
                    className={`w-full py-3 rounded-lg font-bold transition-colors ${
                      isDark
                        ? 'bg-white text-black hover:bg-gray-200'
                        : 'bg-black text-white hover:bg-gray-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {creando ? 'Procesando...' : 'Finalizar Pedido'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                <div className="grid grid-cols-2 gap-3">
                  {tienePrecioListado && (
                    <button
                      onClick={() => setSelectedPriceType('listado')}
                      className={`p-3 rounded-lg border text-left ${
                        selectedPriceType === 'listado'
                          ? 'border-green-500 bg-green-50'
                          : 'border-green-200 bg-green-50/50'
                      }`}
                    >
                      <div className="text-sm text-green-700 font-medium">Listado</div>
                      <div className="text-lg font-bold text-green-800">${cliente.preciosEspeciales[selectedProduct.id]}</div>
                    </button>
                  )}
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
                onClick={agregarAlCarrito}
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

      {/* Ticket Generator */}
      {generatedTicket && (
        <TicketGenerator
          pedido={generatedTicket}
          onClose={() => {
            setGeneratedTicket(null);
            onClose();
          }}
        />
      )}
    </div>
  );
};

export default CrearPedidoModal;