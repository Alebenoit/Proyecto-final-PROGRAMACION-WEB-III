import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_ROUTES } from "../api/apiroutes";

const Ventas = ({ usuario }) => {
    const [codigo, setCodigo] = useState("");
    const [productos, setProductos] = useState([]);
    const [cantidadPagada, setCantidadPagada] = useState("");
    const [totalVenta, setTotalVenta] = useState(0);

    useEffect(() => {
        const totalCalculado = productos.reduce((total, producto) => {
            const precio = parseFloat(producto.pre_publico) || 0;
            const cantidad = parseInt(producto.cantidad) || 0;
            return total + (precio * cantidad);
        }, 0);
        setTotalVenta(totalCalculado);
    }, [productos]);

    const handleCodigoChange = (e) => {
        setCodigo(e.target.value);
    };

    const handleCantidadPagadaChange = (e) => {
        setCantidadPagada(e.target.value);
    };

    const obtenerProducto = () => {
        if (!codigo.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor ingresa un código del producto válido'
            });
            return;
        }
        
        axios.get(API_ROUTES.OBTENER_PRODUCTO_POR_CODIGO(codigo))
        .then(response => {

            console.log("DATOS DEL PRODUCTO:", response.data);

            console.log("PRODUCTO RECIBIDO:");
            console.log(response.data);
            
            if (response.data) {
                const productoData = Array.isArray(response.data) ? response.data : response.data;

                const nuevoProducto = {
                    codigo: productoData.codigo || codigo,
                    nom_producto: productoData.nom_producto || "Producto sin nombre",
                    pre_publico: parseFloat(productoData.pre_publico) || 0,
                    cantidad: 1 
                };

                setProductos((prevProductos) => {
                    const existe = prevProductos.find(p => p.codigo === nuevoProducto.codigo);

                    if (existe) {
                        return prevProductos.map(p => 
                            p.codigo === nuevoProducto.codigo 
                                ? { ...p, cantidad: Number(p.cantidad) + 1 } 
                                : p
                        );
                    } else {
                        return [...prevProductos, nuevoProducto];
                    }
                });
                setCodigo("");
            } else {
                Swal.fire({
                    icon: 'warning',
                    title: 'No encontrado',
                    text: 'El código ingresado no coincide con ningún producto existente'
                });
            }
        })
        .catch(err => {
            console.error('Error al obtener el producto', err);
            Swal.fire({
                icon: 'error',
                title: 'Error de red',
                text: 'No se pudo conectar con el servidor para buscar el producto'
            });
        });
    };

    const eliminarProducto = (codigoEliminar) => {
        setProductos(prev => prev.filter(p => p.codigo !== codigoEliminar));
    };

    const handleCantidadTableChange = (codigoProducto, valorInput) => {
        const nuevaCantidad = Number(valorInput);
        
        if (isNaN(nuevaCantidad) || nuevaCantidad < 1) return;

        setProductos(prevProductos => 
            prevProductos.map(p => {
                if (p.codigo === codigoProducto) {
                    return {
                        ...p,
                        cantidad: nuevaCantidad
                    };
                }
                return p;
            })
        );
    };

    const registrarVenta = async () => {
        if (productos.length === 0) {
            Swal.fire({ icon: 'error', title: 'Oops..', text: 'No hay productos en la venta actual' });
            return;
        }

        const total = totalVenta;

        if (!cantidadPagada || isNaN(cantidadPagada) || parseFloat(cantidadPagada) <= 0) {
            Swal.fire({ icon: 'error', title: 'Oops..', text: 'Por favor, ingresa una cantidad válida para pagar' });
            return;
        }

        if (parseFloat(cantidadPagada) < total) {
            Swal.fire({ icon: 'error', title: 'Oops..', text: 'La cantidad que el cliente dio es menor al total a pagar' });
            return;
        }

        let cambio = 0;
        if (parseFloat(cantidadPagada) > total) {
            cambio = parseFloat(cantidadPagada) - total;
        }

        const detallesVenta = productos.map(producto => {
            const subtotal = producto.pre_publico * producto.cantidad;
            return `${producto.codigo},${producto.nom_producto},${producto.pre_publico},${producto.cantidad},${subtotal}`;
        }).join(';');

        const mensajeVenta = `${detallesVenta}_${total}_${usuario.nombre}`;

        try {
            const response = await axios.post(API_ROUTES.REGISTRAR_VENTA, {
                venta: mensajeVenta
            });

            if (response.status === 201 || response.status === 200) {
                const idVenta = response.data?.id_venta || "Exitosa";
                Swal.fire({
                    icon: 'success',
                    title: `Venta registrada con éxito`,
                    text: `ID Venta: ${idVenta}. ${cambio > 0 ? `\nEl cambio a entregar es: $${cambio.toFixed(2)}` : ''}`
                });
                setProductos([]);
                setCantidadPagada("");
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema al registrar la venta' });
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-center mb-4">
                <input 
                    type="text" 
                    className="form-control me-2"
                    placeholder="Ingresa el código del producto"
                    value={codigo}
                    onChange={handleCodigoChange}
                    onKeyDown={(e) => e.key === 'Enter' && obtenerProducto()}
                    style={{ width: "300px" }}
                />
                <button className="btn btn-primary" onClick={obtenerProducto} style={{ height: "calc(2.25rem + 2px)" }}>
                    Buscar
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered table-striped align-middle">
                    <thead>
                        <tr className="text-center table-dark" style={{ textTransform: 'uppercase' }}>
                            <th>Código</th>
                            <th>Producto</th>
                            <th>Precio Unidad</th>
                            <th>Cantidad</th>
                            <th>Total</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productos.length > 0 ? (
                            productos.map((producto, index) => {
                                const subtotalFila = (parseFloat(producto.pre_publico || 0) * parseInt(producto.cantidad || 0)).toFixed(2);
                                
                                return (
                                    <tr key={`${producto.codigo}-${producto.cantidad}`} className="text-center">
                                        <td>{producto.codigo}</td>
                                        <td className="text-start ps-3">{producto.nom_producto}</td>
                                        <td>$ {parseFloat(producto.pre_publico).toFixed(2)}</td>
                                        <td>
                                            <div className="d-flex justify-content-center">
                                                <input 
                                                    type="number" 
                                                    className="form-control text-center"
                                                    value={producto.cantidad}
                                                    min="1"
                                                    onChange={(e) => handleCantidadTableChange(producto.codigo, e.target.value)}
                                                    style={{ width: "80px", height: "32px" }}
                                                />
                                            </div>
                                        </td>
                                        {}
                                        <td className="fw-bold">
                                            $ {subtotalFila}
                                        </td>
                                        <td>
                                            <button className="btn btn-danger btn-sm" onClick={() => eliminarProducto(producto.codigo)}>
                                                <i className="bi bi-trash"></i> Quitar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center text-muted py-3">
                                    No hay productos agregados a la venta.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {}
            {productos.length > 0 && (
                <div className="row justify-content-end mt-4">
                    <div className="col-md-4 card p-3 shadow-sm me-3">
                        <h4 className="text-center mb-3">Total a pagar: $ <br/>
                            <span className="text-success fw-bold" style={{ fontSize: "1.8rem" }}>
                                {totalVenta.toFixed(2)}
                            </span>
                        </h4>
                        
                        <div className="mb-3">
                            <label className="form-label fw-bold">Efectivo Recibido:</label>
                            <input 
                                type="number"
                                className="form-control"
                                placeholder="0.00"
                                value={cantidadPagada}
                                onChange={handleCantidadPagadaChange}
                            />
                        </div>

                        <button className="btn btn-success w-100 fw-bold" onClick={registrarVenta}>
                            <i className="bi bi-cash-register"></i> Registrar Venta
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Ventas;










