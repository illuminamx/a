import React, { useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { X, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TicketGenerator = ({ pedido, onClose }) => {
  const { isDark } = useTheme();
  const ticketRef = useRef(null);

  const handlePrint = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, canvas.height * 80 / canvas.width]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 80, canvas.height * 80 / canvas.width);
      
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
    } catch (error) {
      console.error('Error generando PDF:', error);
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

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${
        isDark ? 'bg-zinc-900' : 'bg-white'
      }`}>
        <div className={`p-4 border-b flex items-center justify-between ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <h3 className="font-bold text-lg">Ticket de Venta</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div
            ref={ticketRef}
            className="bg-white text-black p-8 font-mono"
            style={{ width: '300px', margin: '0 auto' }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-1">JessicaAleSuarez</h1>
              <div className="text-xs leading-relaxed">
                <p>Plaza de la Tecnología</p>
                <p>Local 26 Entrada sobre Uruguay 11</p>
                <p>Con salida al pasillo 2</p>
              </div>
            </div>

            <div className="border-t-2 border-b-2 border-black py-2 mb-4">
              <div className="text-center">
                <p className="text-sm mb-1">Cliente:</p>
                <p className="text-xl font-bold">{pedido.cliente}</p>
              </div>
            </div>

            {/* Info del pedido */}
            <div className="text-xs mb-4 space-y-1">
              <div className="flex justify-between">
                <span>Usuario:</span>
                <span>{pedido.usuario || 'GMAIL LOGIN'}</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span>{new Date(pedido.fecha).toLocaleDateString('es-MX')}</span>
              </div>
              <div className="flex justify-between">
                <span>Hora:</span>
                <span>{formatTime(pedido.fecha)}</span>
              </div>
              <div className="flex justify-between">
                <span>No.:</span>
                <span className="font-bold">{pedido.numero}</span>
              </div>
            </div>

            <div className="border-t-2 border-black mb-3"></div>

            {/* Productos */}
            <table className="w-full mb-3">
              <thead>
                <tr className="text-xs border-b-2 border-black">
                  <th className="text-left pb-2">PRODUCTO</th>
                  <th className="text-center pb-2">CANT</th>
                  <th className="text-right pb-2">P/PIEZA</th>
                  <th className="text-right pb-2">TOTAL</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {pedido.productos.map((producto, index) => (
                  <React.Fragment key={index}>
                    <tr className="border-b border-gray-300">
                      <td className="py-2 pr-2">
                        <div className="font-bold">{producto.nombre}</div>
                        {producto.colores && producto.colores.length > 0 && (
                          <div className="text-[10px] text-gray-600">
                            {typeof producto.colores[0] === 'string' 
                              ? producto.colores.slice(0, 2).join(', ')
                              : producto.colores.slice(0, 2).map(c => c.nombre || c).join(', ')}
                          </div>
                        )}
                      </td>
                      <td className="text-center py-2">{producto.cantidad}</td>
                      <td className="text-right py-2">${producto.precioUnitario.toFixed(2)}</td>
                      <td className="text-right py-2 font-bold">
                        ${(producto.cantidad * producto.precioUnitario).toFixed(2)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            <div className="border-t-2 border-black pt-3 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total de artículos:</span>
                  <span className="font-bold">
                    {pedido.productos.reduce((sum, p) => sum + p.cantidad, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <span>Precio total con IVA:</span>
                  <span>${pedido.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-black pt-3 mb-4"></div>

            {/* Política */}
            <div className="text-[9px] text-center leading-tight space-y-1">
              <p className="font-bold text-[10px] mb-2">7 DÍAS DE GARANTÍA CON TICKET ORIGINAL</p>
              <p>(REPARACIÓN) ES PIEZAS NO ROTO NO</p>
              <p>DEFECTOS DE FÁBRICA NO ROTO NO</p>
              <p>MALTRATADO NO HAY CAMBIOS NI</p>
              <p>DEVOLUCIONES MENORES A $50 MXN NO HAY</p>
              <p>GARANTÍA</p>
              <p className="font-bold text-[10px] mt-3">DE LUNES A SÁBADO DE 11AM A 6PM</p>
            </div>
          </div>
        </div>

        <div className={`p-4 border-t flex gap-3 ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <button
            onClick={handlePrint}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            <Printer size={18} />
            Abrir para Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketGenerator;
