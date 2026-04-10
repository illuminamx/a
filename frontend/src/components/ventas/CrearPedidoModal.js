import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../Toast';
import { X, Plus, Minus, Trash2, ShoppingCart, DollarSign, Tag, Box } from 'lucide-react';
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

  useEffect(() => {
    loadProductos();
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

  const getPrecioInfo = (producto, priceType) => {
    if (priceType === 'listado' && cliente.preciosEspeciales?.[producto.id]) {
      return {
        precio: cliente.preciosEspeciales[producto.id],
        label: 'Listado',
        icon: Tag,
        color: 'text-green-600'
      };
    } else if (priceType === 'pieza' && producto.pieza) {
      return {
        precio: producto.pieza,
        label: 'Pieza',
        icon: DollarSign,
        color: 'text-blue-600'
      };
    } else if (priceType === 'mayoreo' && producto.mayoreo) {
      return {
        precio: producto.mayoreo,
        label: 'Mayoreo',
        icon: Box,
        color: 'text-purple-600'
      };
    } else if (priceType === 'caja' && producto.caja) {
      return {
        precio: producto.caja,
        label: 'Caja',
        icon: Box,
        color: 'text-orange-600'
      };
    }
    return null;
  };

  const agregarAlCarrito = (producto, priceType, customPriceValue = null) => {
    let precio;
    let tipo;

    if (priceType === 'custom' && customPriceValue) {
      precio = parseFloat(customPriceValue);
      tipo = 'personalizado';
    } else {
      const info = getPrecioInfo(producto, priceType);
      if (!info) {
        showToast('Precio no disponible', 'warning');
        return;
      }
      precio = info.precio;
      tipo = info.label.toLowerCase();
    }

    const existente = carrito.find(item => item.id === producto.id && item.priceType === tipo);

    if (existente) {
      setCarrito(carrito.map(item =>
        item.id === producto.id && item.priceType === tipo
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        id: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precioUnitario: precio,
        priceType: tipo,
        imagen: producto.imagenes?.[0] || null
      }]);
    }

    showToast(`${producto.nombre} agregado`, 'success');
  };

  const actualizarCantidad = (id, priceType, cantidad) => {
    if (cantidad <= 0) {
      setCarrito(carrito.filter(item => !(item.id === id && item.priceType === priceType)));
    } else {
      setCarrito(carrito.map(item =>
        item.id === id && item.priceType === priceType
          ? { ...item, cantidad }
          : item
      ));
    }
  };

  const getTotal = () => {
    return carrito.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0);
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
          cantidad: item.cantidad,
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
            {/* Productos - 3 columnas */}
            <div className="lg:col-span-3">
              <h3 className="font-semibold text-lg mb-4">Productos Disponibles</h3>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                    isDark ? 'border-white' : 'border-black'
                  }`}></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {productos.map(producto => {
                    const tienePrecioListado = cliente.preciosEspeciales?.[producto.id];
                    
                    return (
                      <div
                        key={producto.id}
                        className={`rounded-xl border overflow-hidden transition-all hover:shadow-lg ${
                          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                        }`}
                      >
                        {/* Imagen */}
                        <div className="relative aspect-square overflow-hidden bg-gray-100">
                          {producto.imagenes?.[0] ? (
                            <img 
                              src={producto.imagenes[0]} 
                              alt={producto.nombre} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Box size={48} />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h4 className="font-bold text-base mb-3 truncate">{producto.nombre}</h4>
                          
                          {/* Precios disponibles */}
                          <div className="space-y-2">
                            {tienePrecioListado && (
                              <button
                                onClick={() => agregarAlCarrito(producto, 'listado')}
                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Tag size={14} className="text-green-600" />
                                  <span className="text-sm font-medium text-green-700">Precio Listado</span>
                                </div>
                                <span className="font-bold text-green-700">${cliente.preciosEspeciales[producto.id]}</span>
                              </button>
                            )}
                            
                            {producto.pieza && (
                              <button
                                onClick={() => agregarAlCarrito(producto, 'pieza')}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                  isDark 
                                    ? 'bg-white/10 hover:bg-white/20 border border-white/20' 
                                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                }`}
                              >
                                <span className="text-sm font-medium">Pieza</span>
                                <span className="font-bold">${producto.pieza}</span>
                              </button>
                            )}
                            
                            {producto.mayoreo && (
                              <button
                                onClick={() => agregarAlCarrito(producto, 'mayoreo')}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                  isDark 
                                    ? 'bg-white/10 hover:bg-white/20 border border-white/20' 
                                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                }`}
                              >
                                <span className="text-sm font-medium">Mayoreo</span>
                                <span className="font-bold">${producto.mayoreo}</span>
                              </button>
                            )}
                            
                            {producto.caja && (
                              <button
                                onClick={() => agregarAlCarrito(producto, 'caja')}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                  isDark 
                                    ? 'bg-white/10 hover:bg-white/20 border border-white/20' 
                                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                                }`}
                              >
                                <span className="text-sm font-medium">Caja</span>
                                <span className="font-bold">${producto.caja}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                    {carrito.reduce((sum, item) => sum + item.cantidad, 0)} items
                  </span>
                </div>

                <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto">
                  {carrito.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart size={48} className={`mx-auto mb-3 ${
                        isDark ? 'text-gray-600' : 'text-gray-300'
                      }`} />
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Carrito vacío
                      </p>
                    </div>
                  ) : (
                    carrito.map((item, idx) => (
                      <div key={idx} className={`p-3 rounded-lg border ${
                        isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex items-start gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{item.nombre}</p>
                            <p className="text-xs text-green-600 capitalize">{item.priceType}</p>
                          </div>
                          <button
                            onClick={() => actualizarCantidad(item.id, item.priceType, 0)}
                            className="text-red-500 hover:text-red-600 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => actualizarCantidad(item.id, item.priceType, item.cantidad - 1)}
                              className={`p-1 rounded ${
                                isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                              }`}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold w-8 text-center">{item.cantidad}</span>
                            <button
                              onClick={() => actualizarCantidad(item.id, item.priceType, item.cantidad + 1)}
                              className={`p-1 rounded ${
                                isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                              }`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="text-sm font-bold">
                            ${(item.precioUnitario * item.cantidad).toFixed(2)}
                          </span>
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
                    className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
                        : 'bg-white border-gray-200 text-black placeholder-gray-400'
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