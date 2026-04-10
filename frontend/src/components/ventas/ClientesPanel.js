import React, { useState } from 'react';
import { addDoc, updateDoc, deleteDoc, doc, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../Toast';
import { Plus, Edit2, Trash2, MoreVertical, X, DollarSign } from 'lucide-react';

const ClientesPanel = ({ clientes, onClientesChange }) => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [showMenuId, setShowMenuId] = useState(null);
  const [clienteName, setClienteName] = useState('');

  const handleAddCliente = async () => {
    if (!clienteName.trim()) {
      showToast('El nombre del cliente es obligatorio', 'warning');
      return;
    }

    try {
      await addDoc(collection(db, 'clientes'), {
        nombre: clienteName.trim(),
        pedidos: 0,
        adeudo: 0,
        preciosEspeciales: {},
        createdAt: new Date().toISOString()
      });
      setClienteName('');
      setShowAddModal(false);
      onClientesChange();
      showToast('Cliente agregado correctamente', 'success');
    } catch (error) {
      console.error('Error agregando cliente:', error);
      showToast('Error al agregar cliente', 'error');
    }
  };

  const handleEditCliente = async () => {
    if (!clienteName.trim()) {
      showToast('El nombre del cliente es obligatorio', 'warning');
      return;
    }

    try {
      await updateDoc(doc(db, 'clientes', editingCliente.id), {
        nombre: clienteName.trim()
      });
      setClienteName('');
      setEditingCliente(null);
      onClientesChange();
      showToast('Cliente actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      showToast('Error al actualizar cliente', 'error');
    }
  };

  const handleDeleteCliente = async (clienteId) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'clientes', clienteId));
      onClientesChange();
      setShowMenuId(null);
      showToast('Cliente eliminado correctamente', 'success');
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      showToast('Error al eliminar cliente', 'error');
    }
  };

  const openEditModal = (cliente) => {
    setEditingCliente(cliente);
    setClienteName(cliente.nombre);
    setShowMenuId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Clientes ({clientes.length})</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isDark
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          <Plus size={18} />
          Agregar Cliente
        </button>
      </div>

      {/* Clientes List */}
      <div className={`rounded-xl border overflow-hidden ${
        isDark ? 'bg-zinc-900 border-white/10' : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
              <tr>
                <th className="text-left px-4 py-3 font-medium">Nombre</th>
                <th className="text-left px-4 py-3 font-medium">Pedidos</th>
                <th className="text-left px-4 py-3 font-medium">Adeudo</th>
                <th className="text-right px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      No hay clientes registrados
                    </p>
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className={`border-t ${
                      isDark ? 'border-white/10' : 'border-gray-200'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium">{cliente.nombre}</td>
                    <td className="px-4 py-3">{cliente.pedidos || 0}</td>
                    <td className="px-4 py-3">
                      <span className={cliente.adeudo > 0 ? 'text-red-500' : ''}>
                        ${cliente.adeudo?.toFixed(2) || '0.00'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2 relative">
                        <button
                          onClick={() => setShowMenuId(showMenuId === cliente.id ? null : cliente.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                          }`}
                        >
                          <MoreVertical size={18} />
                        </button>

                        {showMenuId === cliente.id && (
                          <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border z-10 ${
                            isDark ? 'bg-zinc-800 border-white/10' : 'bg-white border-gray-200'
                          }`}>
                            <button
                              onClick={() => openEditModal(cliente)}
                              className={`w-full flex items-center gap-2 px-4 py-2 transition-colors ${
                                isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                              }`}
                            >
                              <Edit2 size={16} />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteCliente(cliente.id)}
                              className={`w-full flex items-center gap-2 px-4 py-2 transition-colors text-red-500 ${
                                isDark ? 'hover:bg-red-500/10' : 'hover:bg-red-50'
                              }`}
                            >
                              <Trash2 size={16} />
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingCliente) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${
            isDark ? 'bg-zinc-900' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">
                {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCliente(null);
                  setClienteName('');
                }}
                className={`p-2 rounded-full transition-colors ${
                  isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Nombre del Cliente
              </label>
              <input
                type="text"
                value={clienteName}
                onChange={(e) => setClienteName(e.target.value)}
                placeholder="Nombre completo"
                className={`w-full px-4 py-3 rounded-lg border outline-none transition-all ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white focus:border-white/30'
                    : 'bg-gray-50 border-gray-200 text-black focus:border-black'
                }`}
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCliente(null);
                  setClienteName('');
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
                onClick={editingCliente ? handleEditCliente : handleAddCliente}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-white text-black hover:bg-gray-200'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {editingCliente ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesPanel;
