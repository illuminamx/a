import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { X, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const TicketGenerator = ({ pedido, onClose }) => {
  const { isDark } = useTheme();
  const ticketRef = useRef(null);

  const handleDownloadPDF = async () => {
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
        format: [80, canvas.height * 80 / canvas.width] // Ticket size
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 80, canvas.height * 80 / canvas.width);
      pdf.save(`ticket-${pedido.numero}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  const handleDownloadImage = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });

      const link = document.createElement('a');
      link.download = `ticket-${pedido.numero}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generando imagen:', error);
      alert('Error al generar la imagen');
    }
  };

  return (
    <div  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${        isDark ? 'bg-zinc-900' : 'bg-white'      }`}>        {/* Header */}        <div className={`p-4 border-b flex items-center justify-between ${          isDark ? 'border-white/10' : 'border-gray-200'        }`}>          <h3  className="font-bold text-lg">Ticket de Venta</h3>          <button            onClick={onClose}            className={`p-2 rounded-full transition-colors ${              isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'            }`}          >            <X size={20} />          </button>        </div>        {/* Ticket Preview */}        <div  className="p-4 max-h-[60vh] overflow-y-auto">          <div            ref={ticketRef}             className="bg-white text-black p-6 font-mono text-sm"            style={{ width: '300px', margin: '0 auto' }}          >            {/* Header */}            <div  className="text-center mb-4 border-b-2 border-black pb-4">              <div  className="flex items-center justify-between mb-2">                <div  className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center">                  <span  className="text-2xl font-bold">J</span>                </div>                <div  className="flex-1 text-right">                  <h1  className="text-xl font-bold">JessicaAleSuarez</h1>                </div>              </div>              <p  className="text-xs mt-2">Plaza de la Tecnología</p>              <p  className="text-xs">Local 26 Entrada sobre Uruguay 11</p>              <p  className="text-xs">Con salida al pasillo 2</p>            </div>            <div  className="border-b border-black pb-2 mb-3">              <div  className="text-xs space-y-1">                <div  className="flex justify-between">                  <span>Cliente:</span>                  <span  className="font-bold">{pedido.cliente}</span>                </div>                <div  className="flex justify-between">                  <span>Fecha:</span>                  <span>{new Date(pedido.fecha).toLocaleString('es-MX')}</span>                </div>                <div  className="flex justify-between">                  <span>No.:</span>                  <span  className="font-bold">{pedido.numero}</span>                </div>              </div>            </div>            {/* Products Table */}            <div  className="mb-3">              <table  className="w-full text-xs">                <thead>                  <tr  className="border-b border-black">                    <th  className="text-left py-1">PRODUCTO</th>                    <th  className="text-center py-1">CANT</th>                    <th  className="text-right py-1">P/PIEZA</th>                    <th  className="text-right py-1">TOTAL</th>                  </tr>                </thead>                <tbody>                  {pedido.productos.map((producto, index) => (                    <tr key={index}  className="border-b border-gray-300">                      <td  className="py-2">                        <div>                          <div  className="font-semibold">{producto.nombre}</div>                          {producto.colores && producto.colores.length > 0 && (                            <div  className="text-xs text-gray-600">                              {producto.colores.join(', ')}                            </div>                          )}                        </div>                      </td>                      <td  className="text-center py-2">{producto.cantidad}</td>                      <td  className="text-right py-2">${producto.precioUnitario.toFixed(2)}</td>                      <td  className="text-right py-2 font-semibold">                        ${(producto.cantidad * producto.precioUnitario).toFixed(2)}                      </td>                    </tr>                  ))}                </tbody>              </table>            </div>            {/* Totals */}            <div  className="border-t-2 border-black pt-2 mb-3">              <div  className="flex justify-between text-xs mb-1">                <span>Total de artículos:</span>                <span  className="font-bold">                  {pedido.productos.reduce((sum, p) => sum + p.cantidad, 0)}                </span>              </div>              <div  className="flex justify-between text-sm font-bold">                <span>Precio total:</span>                <span>${pedido.total.toFixed(2)}</span>              </div>              {pedido.pagado > 0 && (                <div  className="flex justify-between text-xs">                  <span>Pagado:</span>                  <span>${pedido.pagado.toFixed(2)}</span>                </div>              )}              {pedido.adeudo > 0 && (                <div  className="flex justify-between text-xs text-red-600 font-bold">                  <span>Adeudo:</span>                  <span>${pedido.adeudo.toFixed(2)}</span>                </div>              )}            </div>            {/* Footer */}            <div  className="border-t border-black pt-3 text-xs text-center space-y-1">              <p  className="font-bold">7 DÍAS DE GARANTÍA CON TICKET ORIGINAL</p>              <p>(REPARACIÓN) ES PIEZAS NO ROTO NO</p>              <p>DEFECTOS DE FÁBRICA NO ROTO NO</p>              <p>MALTRATADO NO HAY CAMBIOS NI</p>              <p>DEVOLUCIONES MENORES A $50 MXN NO HAY</p>              <p>GARANTÍA</p>              <p  className="font-bold mt-2">DE LUNES A SÁBADO DE 11AM A 6PM</p>            </div>          </div>        </div>        {/* Actions */}        <div className={`p-4 border-t flex gap-3 ${          isDark ? 'border-white/10' : 'border-gray-200'        }`}>          <button            onClick={handleDownloadImage}            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${              isDark                ? 'bg-white/10 hover:bg-white/20'                : 'bg-gray-100 hover:bg-gray-200'            }`}          >            <Download size={18} />            Descargar Imagen          </button>          <button            onClick={handleDownloadPDF}            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${              isDark                ? 'bg-white text-black hover:bg-gray-200'                : 'bg-black text-white hover:bg-gray-800'            }`}          >            <Download size={18} />            Descargar PDF          </button>        </div>      </div>    </div>  );
};

export default TicketGenerator;
