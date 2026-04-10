import React, { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../Toast';
import { Trash2, Eye, X, Package, FileText, Search } from 'lucide-react';
import TicketGenerator from './TicketGenerator';

const PedidosPanel = ({ pedidos, onPedidosChange }) => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [showTicket, setShowTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar pedidos
  const filteredPedidos = pedidos.filter(pedido =>
    pedido.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pedido.numero?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeletePedido = async (pedidoId) => {
    if (!window.confirm('¿Estás seguro de eliminar este pedido?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'pedidos', pedidoId));
      onPedidosChange();
      showToast('Pedido eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error eliminando pedido:', error);
      showToast('Error al eliminar pedido', 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold">Pedidos ({filteredPedidos.length})</h2>
        <div className="relative w-full sm:w-auto">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente o No..."
            className={`w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg outline-none border transition-all ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-white/30'
                : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500 focus:border-black'
            }`}
          />
        </div>
      </div>

      {filteredPedidos.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className={`mx-auto mb-4 ${
            isDark ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {searchTerm ? 'No se encontraron pedidos' : 'No hay pedidos registrados'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPedidos.map((pedido) => (
            <div
              key={pedido.id}
              className={`rounded-xl border p-4 transition-all duration-300 hover:shadow-lg ${
                isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{pedido.cliente}</h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {formatDate(pedido.fecha)}
                  </p>
                  {pedido.numero && (
                    <p className={`text-xs font-mono ${
                      isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      No. {pedido.numero}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl">${pedido.total.toFixed(2)}</p>
                  {pedido.adeudo > 0 && (
                    <p className="text-sm text-red-500">
                      Adeudo: ${pedido.adeudo.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {/* Products Summary */}
              <div className={`mb-3 p-3 rounded-lg ${
                isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                {pedido.productos.map((producto, index) => (
                  <div key={index} className="flex justify-between text-sm py-1">
                    <span>
                      {producto.nombre} x{producto.cantidad}
                    </span>
                    <span className="font-medium">
                      ${(producto.precioUnitario * producto.cantidad).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedPedido(pedido)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/20'
                      : 'bg-black/5 hover:bg-black/10'
                  }`}
                >
                  <Eye size={16} />
                  <span className="text-sm">Detalle</span>
                </button>
                <button
                  onClick={() => setShowTicket(pedido)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                  }`}
                >
                  <FileText size={16} />
                  <span className="text-sm">Ticket</span>
                </button>
                <button
                  onClick={() => handleDeletePedido(pedido.id)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                  }`}
                >
                  <Trash2 size={16} />
                  <span className="text-sm">Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
            isDark ? 'bg-zinc-900' : 'bg-white'
          }`}>
            <div className={`p-6 border-b flex items-center justify-between ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <div>
                <h3 className="text-xl font-bold">Detalle del Pedido</h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {formatDate(selectedPedido.fecha)}
                </p>
              </div>
              <button
                onClick={() => setSelectedPedido(null)}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Cliente
                </label>
                <p className="text-lg font-semibold">{selectedPedido.cliente}</p>
              </div>

              <div>
                <label className={`text-sm font-medium mb-2 block ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Productos
                </label>
                <div className={`rounded-lg overflow-hidden border ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <table className="w-full">
                    <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                      <tr>
                        <th className="text-left px-4 py-2 text-sm">Producto</th>
                        <th className="text-center px-4 py-2 text-sm">Cant.</th>
                        <th className="text-right px-4 py-2 text-sm">Precio</th>
                        <th className="text-right px-4 py-2 text-sm">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPedido.productos.map((producto, index) => (
                        <tr key={index} className={`border-t ${
                          isDark ? 'border-white/10' : 'border-gray-200'
                        }`}>
                          <td className="px-4 py-3">{producto.nombre}</td>
                          <td className="text-center px-4 py-3">{producto.cantidad}</td>
                          <td className="text-right px-4 py-3">
                            ${producto.precioUnitario.toFixed(2)}
                          </td>
                          <td className="text-right px-4 py-3 font-semibold">
                            ${(producto.cantidad * producto.precioUnitario).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`p-4 rounded-lg space-y-2 ${
                isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                <div className="flex justify-between">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">
                    ${selectedPedido.total.toFixed(2)}
                  </span>
                </div>
                {selectedPedido.pagado > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Pagado:</span>
                    <span>${selectedPedido.pagado.toFixed(2)}</span>
                  </div>
                )}
                {selectedPedido.adeudo > 0 && (
                  <div className="flex justify-between text-red-500 font-semibold">
                    <span>Adeudo:</span>
                    <span>${selectedPedido.adeudo.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className={`p-6 border-t ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <button
                onClick={() => setSelectedPedido(null)}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicket && (
        <TicketGenerator
          pedido={showTicket}
          onClose={() => setShowTicket(null)}
        />
      )}
    </div>
  );
};

export default PedidosPanel;
