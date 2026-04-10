import React, { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../Toast';
import { DollarSign, Plus, Check, X, Search } from 'lucide-react';

const AdeudosPanel = ({ pedidos, onPedidosChange }) => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [montoAbono, setMontoAbono] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPagarConfirm, setShowPagarConfirm] = useState(null);

  // Filtrar adeudos
  const filteredAdeudos = pedidos.filter(pedido =>
    pedido.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pedido.numero?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAbonar = async () => {
    if (!selectedPedido || !montoAbono) {
      showToast('Ingresa un monto válido', 'warning');
      return;
    }

    const abono = parseFloat(montoAbono);
    if (abono <= 0 || abono > selectedPedido.adeudo) {
      showToast('El monto debe ser mayor a 0 y menor o igual al adeudo', 'warning');
      return;
    }

    try {
      setProcessing(true);
      const nuevoAdeudo = selectedPedido.adeudo - abono;
      const nuevoPagado = selectedPedido.pagado + abono;

      await updateDoc(doc(db, 'pedidos', selectedPedido.id), {
        adeudo: nuevoAdeudo,
        pagado: nuevoPagado,
        estado: nuevoAdeudo === 0 ? 'completado' : 'pendiente'
      });

      setMontoAbono('');
      setSelectedPedido(null);
      onPedidosChange();
      showToast('Abono registrado correctamente', 'success');
    } catch (error) {
      console.error('Error registrando abono:', error);
      showToast('Error al registrar el abono', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleMarcarPagado = async (pedido) => {
    try {
      await updateDoc(doc(db, 'pedidos', pedido.id), {
        adeudo: 0,
        pagado: pedido.total,
        estado: 'completado'
      });
      onPedidosChange();
      showToast('Pedido marcado como pagado', 'success');
      setShowPagarConfirm(null);
    } catch (error) {
      console.error('Error actualizando pedido:', error);
      showToast('Error al actualizar el pedido', 'error');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Adeudos ({filteredAdeudos.length})</h2>
          {filteredAdeudos.length > 0 && (
            <p className={`text-sm mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total adeudado: ${filteredAdeudos.reduce((sum, p) => sum + p.adeudo, 0).toFixed(2)}
            </p>
          )}
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar adeudo..."
            className={`w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg outline-none border transition-all ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder-gray-400 focus:border-white/30'
                : 'bg-gray-50 border-gray-200 text-black placeholder-gray-500 focus:border-black'
            }`}
          />
        </div>
      </div>

      {filteredAdeudos.length === 0 ? (
        <div className="text-center py-20">
          <DollarSign size={48} className={`mx-auto mb-4 ${
            isDark ? 'text-gray-600' : 'text-gray-400'
          }`} />
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {searchTerm ? 'No se encontraron adeudos' : 'No hay adeudos pendientes'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAdeudos.map((pedido) => (
            <div
              key={pedido.id}
              className={`rounded-xl border p-4 transition-all duration-300 ${
                isDark ? 'bg-zinc-900 border-red-500/20' : 'bg-white border-red-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{pedido.cliente}</h3>
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Pedido del {formatDate(pedido.fecha)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Total: ${pedido.total.toFixed(2)}
                  </p>
                  <p className="text-sm">
                    Pagado: ${pedido.pagado.toFixed(2)}
                  </p>
                  <p className="font-bold text-xl text-red-500 mt-1">
                    Adeudo: ${pedido.adeudo.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Products Summary */}
              <div className={`mb-3 p-3 rounded-lg text-sm ${
                isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}>
                {pedido.productos.slice(0, 2).map((producto, index) => (
                  <div key={index} className="py-0.5">
                    {producto.nombre} x{producto.cantidad}
                  </div>
                ))}
                {pedido.productos.length > 2 && (
                  <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    +{pedido.productos.length - 2} más
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPedido(pedido)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/20'
                      : 'bg-black/5 hover:bg-black/10'
                  }`}
                >
                  <Plus size={16} />
                  Abonar
                </button>
                <button
                  onClick={() => setShowPagarConfirm(pedido)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isDark
                      ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                      : 'bg-green-50 hover:bg-green-100 text-green-600'
                  }`}
                >
                  <Check size={16} />
                  Marcar Pagado
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Abono Modal */}
      {selectedPedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
            isDark ? 'bg-zinc-900' : 'bg-white'
          }`}>
            <div className={`p-6 border-b flex items-center justify-between ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <div>
                <h3 className="text-xl font-bold">Registrar Abono</h3>
                <p className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {selectedPedido.cliente}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedPedido(null);
                  setMontoAbono('');
                }}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className={`p-4 rounded-lg ${
                isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Adeudo actual:</span>
                  <span className="font-bold text-xl text-red-500">
                    ${selectedPedido.adeudo.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Monto a Abonar
                </label>
                <input
                  type="number"
                  value={montoAbono}
                  onChange={(e) => setMontoAbono(e.target.value)}
                  step="0.01"
                  max={selectedPedido.adeudo}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white focus:border-white/30'
                      : 'bg-gray-50 border-gray-200 text-black focus:border-black'
                  }`}
                  autoFocus
                />
              </div>

              {montoAbono && parseFloat(montoAbono) > 0 && (
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Adeudo actual:</span>
                    <span>${selectedPedido.adeudo.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Abono:</span>
                    <span>-${parseFloat(montoAbono).toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between font-semibold pt-2 mt-2 border-t ${
                    isDark ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <span>Nuevo adeudo:</span>
                    <span className="text-red-500">
                      ${Math.max(0, selectedPedido.adeudo - parseFloat(montoAbono)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className={`p-6 border-t flex gap-3 ${
              isDark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <button
                onClick={() => {
                  setSelectedPedido(null);
                  setMontoAbono('');
                }}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleAbonar}
                disabled={processing || !montoAbono || parseFloat(montoAbono) <= 0}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-black text-white hover:bg-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processing ? 'Registrando...' : 'Registrar Abono'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Pagar Modal */}
      {showPagarConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${
            isDark ? 'bg-zinc-900' : 'bg-white'
          }`}>
            <h3 className="text-xl font-bold mb-4">¿Marcar como Pagado?</h3>
            <p className={`mb-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Esto marcará el pedido de {showPagarConfirm.cliente} como completamente pagado.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPagarConfirm(null)}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleMarcarPagado(showPagarConfirm)}
                className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors bg-green-500 hover:bg-green-600 text-white"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdeudosPanel;