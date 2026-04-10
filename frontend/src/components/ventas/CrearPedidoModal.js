import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../Toast';
import { X, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import TicketGenerator from './TicketGenerator';

const CrearPedidoModal = ({ cliente, onClose, onPedidoCreated }) => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usarPreciosEspeciales, setUsarPreciosEspeciales] = useState(true);
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

  const getPrecioProducto = (producto) => {
    // Si hay precio especial y está activado
    if (usarPreciosEspeciales && cliente.preciosEspeciales?.[producto.id]) {
      return {
        precio: cliente.preciosEspeciales[producto.id],
        tipo: 'especial'
      };
    }
    // Precio por defecto (pieza)
    return {
      precio: producto.pieza || producto.mayoreo || producto.caja || 0,
      tipo: 'pieza'
    };
  };

  const agregarAlCarrito = (producto, priceType = 'pieza') => {
    const existente = carrito.find(item => item.id === producto.id && item.priceType === priceType);
    
    const precioInfo = usarPreciosEspeciales && cliente.preciosEspeciales?.[producto.id]
      ? { precio: cliente.preciosEspeciales[producto.id], tipo: 'especial' }
      : { precio: producto[priceType] || producto.pieza, tipo: priceType };

    if (existente) {
      setCarrito(carrito.map(item =>
        item.id === producto.id && item.priceType === priceType
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, {
        ...producto,
        cantidad: 1,
        precioUnitario: precioInfo.precio,
        priceType: precioInfo.tipo
      }]);
    }
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
          colores: item.colores || [],
          imagen: item.imagenes?.[0] || null
        })),
        total,
        pagado: pago,
        adeudo: Math.max(0, total - pago),
        fecha: new Date().toISOString(),
        estado: pago >= total ? 'completado' : 'pendiente'
      };

      const docRef = await addDoc(collection(db, 'pedidos'), pedidoData);
      
      // Generar ticket
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
      <div className={`w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl ${
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Productos */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Productos</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usarPreciosEspeciales}
                    onChange={(e) => setUsarPreciosEspeciales(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Usar precios especiales</span>
                </label>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                    isDark ? 'border-white' : 'border-black'
                  }`}></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {productos.map(producto => {
                    const precioInfo = getPrecioProducto(producto);
                    return (
                      <div
                        key={producto.id}
                        className={`p-3 rounded-lg border ${
                          isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                            {producto.imagenes?.[0] ? (
                              <img src={producto.imagenes[0]} alt={producto.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-full h-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{producto.nombre}</h4>
                            <p className="text-xs text-green-500 font-semibold mt-1">
                              ${precioInfo.precio} 
                              {precioInfo.tipo === 'especial' && ' (Especial)'}
                            </p>
                            <button
                              onClick={() => agregarAlCarrito(producto, precioInfo.tipo)}
                              className={`mt-2 w-full text-xs px-2 py-1 rounded transition-colors ${
                                isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'
                              }`}
                            >
                              <Plus size={12} className="inline mr-1" />
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Carrito */}
            <div className="lg:col-span-1">
              <div className={`sticky top-0 rounded-lg border p-4 ${
                isDark ? 'bg-zinc-800 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <ShoppingCart size={20} />
                  Carrito ({carrito.reduce((sum, item) => sum + item.cantidad, 0)})
                </h3>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {carrito.length === 0 ? (
                    <p className={`text-sm text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Vacío
                    </p>
                  ) : (
                    carrito.map((item, idx) => (
                      <div key={idx} className={`p-2 rounded border ${
                        isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium flex-1 truncate">{item.nombre}</span>
                          <button
                            onClick={() => actualizarCantidad(item.id, item.priceType, 0)}
                            className="text-red-500 p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => actualizarCantidad(item.id, item.priceType, item.cantidad - 1)}
                              className={`p-1 rounded ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm w-6 text-center">{item.cantidad}</span>
                            <button
                              onClick={() => actualizarCantidad(item.id, item.priceType, item.cantidad + 1)}
                              className={`p-1 rounded ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-semibold">
                            ${(item.precioUnitario * item.cantidad).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className={`border-t pt-3 mb-3 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold">${getTotal().toFixed(2)}</span>
                  </div>
                  <input
                    type="number"
                    value={montoPagado}
                    onChange={(e) => setMontoPagado(e.target.value)}
                    placeholder="Monto pagado"
                    className={`w-full px-3 py-2 rounded-lg border text-sm outline-none ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-white border-gray-200 text-black'
                    }`}
                  />
                  {montoPagado && parseFloat(montoPagado) < getTotal() && (
                    <p className="text-xs text-red-500 mt-1">
                      Adeudo: ${(getTotal() - parseFloat(montoPagado)).toFixed(2)}
                    </p>
                  )}
                  {cambio > 0 && (
                    <p className="text-xs text-green-500 mt-1">
                      Cambio: ${cambio.toFixed(2)}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleFinalizarPedido}
                  disabled={carrito.length === 0 || creando}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
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