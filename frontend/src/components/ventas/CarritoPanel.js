import React, { useState } from 'react';
import { addDoc, collection, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Trash2, Plus, Minus, X, Check } from 'lucide-react';
import TicketGenerator from './TicketGenerator';

const CarritoPanel = ({ onPedidoCreated }) => {
  const { isDark } = useTheme();
  const { 
    cart, 
    clientName, 
    setClientName,
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotal,
    getTotalItems
  } = useCart();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [montoPagado, setMontoPagado] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [creatingPedido, setCreatingPedido] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);

  const total = getTotal();
  const adeudo = montoPagado ? Math.max(0, total - parseFloat(montoPagado)) : 0;

  const handleFinalizarPedido = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const pago = parseFloat(montoPagado) || 0;
    const esAdeudo = pago < total;

    if (esAdeudo && clientName === 'LOCAL' && !nombreCliente.trim()) {
      alert('Para pago parcial, debes especificar el nombre del cliente');
      return;
    }

    try {
      setCreatingPedido(true);

      const clienteFinal = esAdeudo ? nombreCliente.trim() : clientName;
      
      const pedidoData = {
        cliente: clienteFinal,
        productos: cart.map(item => ({
          id: item.id,
          nombre: item.nombre,
          cantidad: item.quantity,
          precioUnitario: item.unitPrice,
          priceType: item.priceType,
          colores: item.colores || [],
          imagen: item.imagenes?.[0] || null
        })),
        total,
        pagado: pago,
        adeudo: esAdeudo ? adeudo : 0,
        fecha: new Date().toISOString(),
        estado: esAdeudo ? 'pendiente' : 'completado'
      };

      const docRef = await addDoc(collection(db, 'pedidos'), pedidoData);

      // Si no es LOCAL, actualizar estadísticas del cliente
      if (clienteFinal !== 'LOCAL') {
        // Aquí podrías buscar y actualizar el documento del cliente
        // Por ahora solo guardamos el pedido
      }

      // Generar ticket
      const ticketData = {
        ...pedidoData,
        numero: docRef.id.slice(-8).toUpperCase()
      };
      setGeneratedTicket(ticketData);

      clearCart();
      setShowCheckout(false);
      setMontoPagado('');
      setNombreCliente('');
      onPedidoCreated();

    } catch (error) {
      console.error('Error creando pedido:', error);
      alert('Error al crear el pedido');
    } finally {
      setCreatingPedido(false);
    }
  };

  return (
    <div>
      <div className={`rounded-xl border sticky top-24 ${
        isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-200'
      }`}>
        <div  className="p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}">
          <div  className="flex items-center justify-between mb-2">
            <div  className="flex items-center gap-2">
              <ShoppingCart size={20} />
              <h3  className="font-semibold">Carrito</h3>
            </div>
            <span className={`text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {getTotalItems()} items
            </span>
          </div>
          {/* Client Name Input */}
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
             placeholder="Nombre del cliente"
            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all text-sm ${
              isDark
                ? 'bg-white/5 border-white/10 text-white focus:border-white/30'
                : 'bg-gray-50 border-gray-200 text-black focus:border-black'
            }`}
          />
        </div>
        {/* Cart Items */}
        <div  className="max-h-96 overflow-y-auto">
          {cart.length === 0 ? (
            <div  className="p-8 text-center">
              <ShoppingCart size={48} className={`mx-auto mb-4 ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                El carrito está vacío
              </p>
            </div>
          ) : (
            <div  className="divide-y ${isDark ? 'divide-white/10' : 'divide-gray-200'}">
              {cart.map((item) => (
                <div key={`${item.id}-${item.priceType}`}  className="p-4">
                  <div  className="flex gap-3">
                    {/* Image */}
                    <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${
                      isDark ? 'bg-white/5' : 'bg-gray-100'
                    }`}>
                      {item.imagenes?.[0] ? (
                        <img
                          src={item.imagenes[0]}
                          alt={item.nombre}
                           className="w-full h-full object-cover"
                        />
                      ) : (
                        <div  className="w-full h-full flex items-center justify-center text-xs">
                          Sin img
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div  className="flex-1 min-w-0">
                      <h4  className="font-medium text-sm mb-1 truncate">
                        {item.nombre}
                      </h4>
                      <p className={`text-xs mb-2 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {item.priceType === 'pieza' ? 'Pieza' :
                         item.priceType === 'mayoreo' ? 'Mayoreo' : 'Caja'}
                        {' - '}${item.unitPrice}
                      </p>
                      {/* Quantity Controls */}
                      <div  className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.priceType, item.quantity - 1)}
                          className={`p-1 rounded transition-colors ${
                            isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                          }`}
                        >
                          <Minus size={14} />
                        </button>
                        <span  className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.priceType, item.quantity + 1)}
                          className={`p-1 rounded transition-colors ${
                            isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                          }`}
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id, item.priceType)}
                           className="ml-auto p-1 rounded transition-colors text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {/* Subtotal */}
                    <div  className="text-right">
                      <p  className="font-semibold">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Total & Actions */}
        {cart.length > 0 && (
          <div className={`p-4 border-t ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div  className="flex items-center justify-between mb-4">
              <span  className="font-semibold text-lg">Total:</span>
              <span  className="font-bold text-2xl">${total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-white text-black hover:bg-gray-200'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
      {/* Checkout Modal */}
      {showCheckout && (
        <div  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
            isDark ? 'bg-zinc-900' : 'bg-white'
          }`}>
            <div className={`p-6 border-b ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <div  className="flex items-center justify-between">
                <h3  className="text-xl font-bold">Finalizar Pedido</h3>
                <button
                  onClick={() => setShowCheckout(false)}
                  className={`p-2 rounded-full transition-colors ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div  className="p-6 space-y-4">
              {/* Resumen */}
              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <div  className="space-y-2">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.priceType}`}  className="flex justify-between text-sm">
                      <span>
                        {item.nombre} x{item.quantity}
                      </span>
                      <span  className="font-medium">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className={`pt-2 mt-2 border-t flex justify-between font-semibold ${
                    isDark ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {/* Monto Pagado */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Monto Pagado
                </label>
                <input
                  type="number"
                  value={montoPagado}
                  onChange={(e) => setMontoPagado(e.target.value)}
                  step="0.01"
                   placeholder="0.00"
                  className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white focus:border-white/30'
                      : 'bg-gray-50 border-gray-200 text-black focus:border-black'
                  }`}
                />
              </div>
              {/* Adeudo */}
              {adeudo > 0 && (
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
                }`}>
                  <div  className="flex justify-between items-center">
                    <span  className="text-red-500 font-medium">Adeudo:</span>
                    <span  className="text-red-500 font-bold text-lg">
                      ${adeudo.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
              {/* Nombre Cliente (para adeudos) */}
              {adeudo > 0 && clientName === 'LOCAL' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Nombre del Cliente (Obligatorio para adeudos)
                  </label>
                  <input
                    type="text"
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                     placeholder="Nombre completo"
                    className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white focus:border-white/30'
                        : 'bg-gray-50 border-gray-200 text-black focus:border-black'
                    }`}
                  />
                </div>
              )}
            </div>
            <div className={`p-6 border-t flex gap-3 ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setShowCheckout(false)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleFinalizarPedido}
                disabled={creatingPedido}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-black text-white hover:bg-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {creatingPedido ? (
                  'Creando...'
                ) : (
                  <>
                    <Check size={18} />
                    Confirmar Pedido
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Ticket Generator */}
      {generatedTicket && (
        <TicketGenerator
          pedido={generatedTicket}
          onClose={() => setGeneratedTicket(null)}
        />
      )}    </div>  );};export default CarritoPanel;
