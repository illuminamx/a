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
            className="bg-white text-black p-6 font-mono text-sm"
            style={{ width: '300px', margin: '0 auto' }}
          >
            {/* Header con logo */}
            <div className="text-center mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_vendor-dashboard-69/artifacts/ye64n03n_Logotipo-Ticket.png" 
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 text-right">
                  <h1 className="text-xl font-bold leading-tight">JessicaAleSuarez</h1>
                </div>
              </div>
              <div className="text-xs leading-relaxed">
                <p>Plaza de la Tecnología</p>
                <p>Local 26 Entrada sobre Uruguay 11</p>
                <p>Con salida al pasillo 2</p>
              </div>
            </div>

            <div className="border-t-2 border-black my-3"></div>

            {/* Cliente */}
            <div className="mb-3">
              <div className="text-center mb-1">
                <span className="text-xs">Cliente:</span>
              </div>
              <div className="text-center text-lg font-bold mb-2">
                {pedido.cliente}
              </div>
              
              <div className="text-xs">
                <div className="flex justify-between mb-1">
                  <span>Fecha:</span>
                  <span>{formatDate(pedido.fecha)}</span>
                </div>
                <div className="flex justify-between">
                  <span>No.</span>
                  <span className="font-bold">{pedido.numero}</span>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-black my-3"></div>

            {/* Products */}
            <table className="w-full text-xs mb-3">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-1 px-0">PRODUCTO</th>
                  <th className="text-center py-1 px-1">CANT</th>
                  <th className="text-right py-1 px-0">P/PZA</th>
                  <th className="text-right py-1 px-0">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {pedido.productos.map((producto, index) => (
                  <tr key={index}>
                    <td className="py-1 px-0 align-top">
                      <div className="font-semibold">{producto.nombre}</div>
                      {producto.colores && producto.colores.length > 0 && (
                        <div className="text-[10px] leading-tight">
                          {typeof producto.colores[0] === 'string' 
                            ? producto.colores.join(', ') 
                            : producto.colores.map(c => c.nombre || c).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="text-center py-1 px-1 align-top">{producto.cantidad}</td>
                    <td className="text-right py-1 px-0 align-top">${producto.precioUnitario.toFixed(2)}</td>
                    <td className="text-right py-1 px-0 align-top font-semibold">
                      ${(producto.cantidad * producto.precioUnitario).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t-2 border-black my-3"></div>

            {/* Totals */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span>Total de artículos:</span>
                <span className="font-bold">
                  {pedido.productos.reduce((sum, p) => sum + p.cantidad, 0)}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Precio total con IVA:</span>
                <span>${pedido.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t-2 border-black my-3"></div>

            {/* Footer */}
            <div className="text-[10px] text-center leading-tight space-y-0.5">
              <p className="font-bold mb-1">7 DÍAS DE GARANTÍA CON TICKET ORIGINAL</p>
              <p>(REPARACIÓN) ES PIEZAS NO ROTO NO</p>
              <p>DEFECTOS DE FÁBRICA NO ROTO NO</p>
              <p>MALTRATADO NO HAY CAMBIOS NI</p>
              <p>DEVOLUCIONES MENORES A $50 MXN NO HAY</p>
              <p>GARANTÍA</p>
              <p className="font-bold mt-2">DE LUNES A SÁBADO DE 11AM A 6PM</p>
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
