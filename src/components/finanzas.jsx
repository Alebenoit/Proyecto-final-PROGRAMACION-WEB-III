import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_ROUTES } from "../api/apiroutes";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Bar } from "react-chartjs-2";

import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title
} from "chart.js";

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title
);

const Finanzas = () => {
    const [ventas, setVentas] = useState([]);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");

    const [modal, setModal] = useState(false);
    const [ventaSeleccionada, setVentaSeleccionada] = useState({});
    const [productosVenta, setProductosVenta] = useState([]);

    const handleFechaInicioChange = (e) => {
        setFechaInicio(e.target.value);
    };

   
    const handleFechaFinChange = (e) => {
        setFechaFin(e.target.value);
    };

    const parsearProductosString = (productosString) => {
        if (typeof productosString !== "string" || productosString.trim() === "") return [];
        
        const filasDeProductos = productosString.includes(";") ? productosString.split(";") : productosString.split("\n");
        
        return filasDeProductos.map((producto) => {
            const fragmentos = producto.split(",");
            if (fragmentos.length < 5) return null;
            
            const [codigo, nombre, precio, cantidad, total] = fragmentos;
            return {
                codigo: codigo?.trim() || "",
                nombre: nombre?.trim() || "",
                precio: parseFloat(precio) || 0,
                cantidad: parseInt(cantidad) || 0,
                total: parseFloat(total) || 0
            };
        }).filter(p => p !== null && p.codigo !== "");
    };

    // Funcion para abrir el modal
    const verVenta = (venta) => {
        setVentaSeleccionada(venta);
        setModal(true);
        const productosParseados = parsearProductosString(venta.productos);
        setProductosVenta(productosParseados);
    };

    const cerrarModal = () => {
        setModal(false);
        setVentaSeleccionada({});
    };

    const obtenerVentas = () => {
        if (!fechaInicio || !fechaFin) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor seleccione tanto la fecha de inicio como la fecha final'
            });
            return;
        }

        axios.get(API_ROUTES.OBTENER_VENTAS, {
            params: {
                inicio: fechaInicio,
                fin: fechaFin
            }
        })
        .then((response) => {
            setVentas(response.data || []);
        })
        .catch((err) => {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al obtener las ventas'
            });
        });
    };

    const ventasPorDia = ventas.reduce((acc, venta) => {
        if (!venta.fecha_venta) return acc;
        const fecha = venta.fecha_venta.includes("T") ? venta.fecha_venta.split("T")[0] : venta.fecha_venta;
        acc[fecha] = (acc[fecha] || 0) + (parseFloat(venta.total_venta) || 0);
        return acc;
    }, {});

    const data = {
        labels: Object.keys(ventasPorDia),
        datasets: [
            {
                label: "Total de ventas por día",
                data: Object.values(ventasPorDia),
                backgroundColor: "rgba(75,192,192,0.6)",
                borderColor: "rgba(75,192,192,1)",
                borderWidth: 1
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top"
            },
            title: {
                display: true,
                text: "Ventas Diarias"
            }
        }
    };

    const generarPDF = () => {
        if (ventas.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Sin datos',
                text: 'No hay ventas para exportar en el rango de fechas seleccionados'
            });
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Reporte de ventas", 14, 22);
        doc.setFontSize(12);
        doc.text(`Desde: ${fechaInicio} - Hasta: ${fechaFin}`, 14, 30);

        let startV = 40;

        ventas.forEach((venta) => {
            const fecha = venta.fecha_venta.includes("T") ? venta.fecha_venta.split("T")[0] : venta.fecha_venta;

            if (startV > 240) {
                doc.addPage();
                startV = 20;
            }

            doc.setFontSize(12);
            doc.text(`Venta ID: ${venta.id_venta} | Fecha: ${fecha} | Vendedor: ${venta.vendedor}`, 14, startV);

            startV += 6;
            doc.text(`Total venta: $${venta.total_venta.toFixed(2)}`, 14, startV);

            startV += 4;

            const productos = parsearProductosString(venta.productos);
            const productosTabla = productos.map(p => [
                p.codigo,
                p.nombre,
                `$${p.precio.toFixed(2)}`,
                p.cantidad,
                `$${p.total.toFixed(2)}`
            ]);

            autoTable(doc, {
                startY: startV + 2,
                head: [["Codigo", "Producto", "Precio", "Cantidad", "Total"]],
                body: productosTabla,
                margin: { left: 14, right: 14 },
                styles: { fontSize: 10 },
                theme: "grid",
                didDrawPage: (data) => {
                    startV = data.cursor.y + 10;
                }
            });
        });
        doc.save(`reporte_venta_${fechaInicio}_a_${fechaFin}.pdf`);
    };

    return (
        <div>
            {}
            <div className="d-flex justify-content-center mt-4 mb-4">
                <div className="me-3">
                    <label htmlFor="fechaInicio" className="form-label text-center w-100">Fecha inicial ventas</label>
                    <input 
                        id="fechaInicio"
                        type="date"
                        className="form-control"
                        value={fechaInicio} 
                        onChange={handleFechaInicioChange}
                        onClick={(e) => {
                            e.target.focus();
                            e.target.showPicker();
                        }}
                        style={{ width: "250px", cursor: "pointer" }}
                    />
                </div>

                <div>
                    <label htmlFor="fechaFin" className="form-label text-center w-100">Fecha final ventas</label>
                    <input 
                        id="fechaFin"
                        type="date"
                        className="form-control"
                        value={fechaFin} 
                        onChange={handleFechaFinChange}
                        onClick={(e) => {
                            e.target.focus();
                            e.target.showPicker();
                        }}
                        style={{ width: "250px", cursor: "pointer" }}
                    />
                </div>
            </div>

            {}
            <div className="d-flex justify-content-center">
                <button 
                    className="btn btn-primary me-3"
                    onClick={obtenerVentas}
                >
                    Ver ventas
                </button>

                <button 
                    className="btn btn-danger"
                    onClick={generarPDF}
                    disabled={ventas.length === 0}
                >
                    Exportar PDF
                </button>
            </div>

            {}
            <div className="container mt-4" style={{ width: '100%', maxWidth: '1000px', height: '400px', margin: '0 auto' }}>
                <Bar data={data} options={options} />
            </div>

            {}
            <div className="container mt-4 shadow-sm p-3 bg-white rounded mb-5">
                {ventas.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-bordered table-striped align-middle">
                            <thead className="table-dark text-center">
                                <tr style={{ textTransform: 'uppercase' }}>
                                    <th>ID Venta</th>
                                    <th>Total Venta</th>
                                    <th>Fecha Venta</th>
                                    <th>Vendedor</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {ventas.map((venta) => {
                                    const fechaFila = venta.fecha_venta?.includes("T") ? venta.fecha_venta.split("T")[0] : venta.fecha_venta;
                                    return (
                                        <tr key={venta.id_venta}>
                                            <td>{venta.id_venta}</td>
                                            <td className="fw-bold text-success">${venta.total_venta.toFixed(2)}</td>
                                            <td>{fechaFila}</td>
                                            <td>{venta.vendedor}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-warning btn-sm fw-bold text-dark"
                                                    onClick={() => verVenta(venta)}
                                                >
                                                    <i className="bi bi-eye"></i> Ver
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-muted mt-3">No se encontraron ventas para las fechas seleccionadas</p>
                )}

                {}
                {modal && (
                    <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg">
                                <div className="modal-header">
                                    <h5 className="modal-title fw-bold">Detalles de la venta</h5>
                                    <button
                                        type="button" 
                                        className="btn-close"
                                        onClick={cerrarModal}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <p><strong>ID Venta: </strong> {ventaSeleccionada.id_venta}</p>
                                    <p><strong>Productos: </strong></p>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered text-center align-middle">
                                            <thead className="table-light">
                                                <tr style={{ textTransform: 'uppercase' }}>
                                                    <th>Codigo</th>
                                                    <th>Producto</th>
                                                    <th>Precio unidad</th>
                                                    <th>Cantidad</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {productosVenta.map((producto, index) => (
                                                    <tr key={index}>
                                                        <td>{producto.codigo}</td>
                                                        <td className="text-start ps-2">{producto.nombre}</td>
                                                        <td>${producto.precio.toFixed(2)}</td>
                                                        <td>{producto.cantidad}</td>
                                                        <td className="fw-bold">${producto.total.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <p className="mt-3"><strong>Total venta: </strong>${ventaSeleccionada.total_venta?.toFixed(2)}</p>
                                    <p><strong>Fecha: </strong>{ventaSeleccionada.fecha_venta?.includes("T") ? ventaSeleccionada.fecha_venta.split("T")[0] : ventaSeleccionada.fecha_venta}</p>
                                    <p><strong>Vendedor: </strong>{ventaSeleccionada.vendedor}</p>
                                </div>
                                <div className="modal-footer border-0">
                                    <button 
                                        className="btn btn-secondary px-4"
                                        onClick={cerrarModal}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Finanzas;







