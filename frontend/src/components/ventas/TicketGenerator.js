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
      year: 'numeric'
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
            className="bg-white text-black p-6"
            style={{ width: '300px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}
          >
            {/* Header con logo */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold" style={{ letterSpacing: '2px' }}>JessicaAleSuarez</h1>
                <div className="text-xs mt-1" style={{ lineHeight: '1.3' }}>
                  <p>Plaza de la Tecnología</p>
                  <p>Local 26 Entrada sobre Uruguay 11</p>
                  <p>Con salida al pasillo 2</p>
                </div>
              </div>
              <div className="border-2 border-black rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold italic">J</span>
              </div>
            </div>

            <div className="border-t-2 border-black my-3"></div>

            {/* Cliente */}
            <div className="mb-3">
              <div className="text-sm font-semibold">Cliente:</div>
              <div className="text-2xl font-bold mt-1" style={{ letterSpacing: '1px' }}>{pedido.cliente}</div>
            </div>

            {/* Usuario, Fecha, No */}
            <div className="text-xs mb-3" style={{ lineHeight: '1.6' }}>
              <div className="flex justify-between">
                <span className="font-semibold">Usuario:</span>
                <span>GMAIL LOGIN</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Fecha:</span>
                <span>{formatDate(pedido.fecha)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">No.</span>
                <span>{pedido.numero || 'N/A'}</span>
              </div>
            </div>

            <div className="border-t-2 border-black my-3"></div>

            {/* Tabla de productos */}
            <div className="mb-3">
              <table className="w-full text-xs" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left font-bold pb-1" style={{ width: '35%' }}>PRODUCTO</th>
                    <th className="text-center font-bold pb-1" style={{ width: '20%' }}>CANTIDAD</th>
                    <th className="text-right font-bold pb-1" style={{ width: '22%' }}>P/PIEZA</th>
                    <th className="text-right font-bold pb-1" style={{ width: '23%' }}>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.productos.map((producto, index) => {
                    const totalQty = producto.colores.reduce((sum, c) => sum + c.cantidad, 0);
                    const totalPrice = producto.precioUnitario * totalQty;
                    
                    return (
                      <React.Fragment key={index}>
                        <tr className="border-b border-gray-300">
                          <td className="py-2 align-top" style={{ wordWrap: 'break-word' }}>
                            <span className="font-semibold">{producto.nombre}</span>
                          </td>
                          <td className="py-2 text-center align-top">{totalQty}</td>
                          <td className="py-2 text-right align-top">${producto.precioUnitario.toFixed(2)}</td>
                          <td className="py-2 text-right align-top font-bold">${totalPrice.toFixed(2)}</td>
                        </tr>
                        {producto.colores && producto.colores.length > 0 && producto.colores.map((color, i) => (
                          <tr key={`${index}-${i}`}>
                            <td colSpan="4" className="pb-1">
                              <div className="flex justify-between items-center text-[10px] ml-2">
                                <span>- {color.nombre}</span>
                                <span className="font-semibold">(x{color.cantidad})</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Nota de productos */}
            <div className="text-center text-xs font-bold my-4" style={{ lineHeight: '1.4' }}>
              <p>PRODUCTOS</p>
              <p>EL LARGO DE ESTE ESPACIO</p>
              <p>DEPENDE DE LA CANTIDAD</p>
              <p>DE PRODUCTOS</p>
            </div>

            <div className="border-t-2 border-black my-3"></div>

            {/* Totales */}
            <div className="text-sm mb-3">
              <div className="flex justify-between mb-1">
                <span>Total de artículos:</span>
                <span className="font-bold">
                  {pedido.productos.reduce((sum, p) => {
                    return sum + p.colores.reduce((s, c) => s + c.cantidad, 0);
                  }, 0)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Precio total con IVA:</span>
                <span>${pedido.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t-2 border-black my-3"></div>

            {/* Garantía */}
            <div className="text-[9px] text-center" style={{ lineHeight: '1.5' }}>
              <p className="font-bold text-[10px] mb-1">7 DÍAS DE GARANTÍA CON TICKET ORIGINAL</p>
              <p>(REPARACIÓN) ES PIEZAS NO ROTO NO</p>
              <p>DEFECTOS DE FÁBRICA NO ROTO NO</p>
              <p>MALTRATADO NO HAY CAMBIOS NI</p>
              <p>DEVOLUCIONES MENORES A $50 MXN NO HAY</p>
              <p>GARANTÍA</p>
              <p className="font-bold text-[10px] mt-2">DE LUNES A SÁBADO DE 11AM A 6PM</p>
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