import React, {useState, useEffect} from "react";
import axios from "axios"
import Swal from "sweetalert2";
import { API_ROUTES } from "../api/apiroutes";
const Almacen = () => {
    const [ productos,setProductos] = useState([])
    const [ modalProducto, setModalProducto] = useState(false)
    const [ filteredProductos, setFilteredProductos] = useState([])
    const [ prodSeleccionado, setProdSeleccionado] = useState({
        codigo: '',
        nom_producto: '',
        dase_producto: '',
        pre_publico: '',
        pre_proveedor: '',
        existencias: '',
        isEditing: false
    })

    const [ filter, setFilter ] = useState("")

  
    useEffect(() =>{
        axios.get(API_ROUTES.OBTENER_PRODUCTOS)
        .then(response => {
            setProductos(response.data)
            setFilteredProductos(response.data)
        })
        .catch(err => {
        console.error(err)

        Swal.fire({
            icon:'error',
            title:'Error',
            text:'No se pudieron cargar los productos'
        })
    })
    },[])

    const handleFilterChange = (e)=>{
        const value = e.target.value
        setFilter(value)

        const filtered = productos.filter(producto =>{
            const codigo = (producto.codigo || "").toLowerCase();
            const nombre = (producto.nom_producto || "").toLowerCase();
            const buscar = value.toLowerCase();

            return codigo.includes(buscar) || nombre.includes(buscar);
        })
          
        
        setFilteredProductos(filtered)
    }

    const nuevoProducto = () =>{
        setProdSeleccionado({
            codigo: '',
            nom_producto: '',
            dase_producto: '',
            pre_publico: '',
            pre_proveedor: '',
            existencias: '',
            isEditing: false
        })

        setModalProducto(true)
    }

    const handleChange = (e) => {
        const {name, value} = e.target
        setProdSeleccionado({
            ...prodSeleccionado,
            [name]: value
        })
    }

    
    const guardarProducto = () => {
        if(prodSeleccionado.isEditing){
            axios.put(API_ROUTES.ACTUALIZAR_PRODUCTO(prodSeleccionado.codigo),{
                nom_producto: prodSeleccionado.nom_producto,
                dase_producto:prodSeleccionado.dase_producto,
                pre_publico:prodSeleccionado.pre_publico,
                pre_proveedor: prodSeleccionado.pre_proveedor,
                existencias: prodSeleccionado.existencias,

            })
            .then(response => {

                const updateProductos = productos.map(producto =>
                    producto.codigo === prodSeleccionado.codigo ? {...prodSeleccionado, ...response.data} : producto
                )

                setProductos(updateProductos)
                setFilteredProductos(updateProductos)
                setModalProducto(false)

                Swal.fire({
                    icon:'success',
                    title:'producto actualizado correctamente',
                    showConfirmButton:false,
                    timer:1500
                })
            })
            .catch(err => {
                Swal.fire({
                    icon:'error',
                    title:'Error al actualizar el producto',
                    text:'Hubo un problema al actualizar los datos'
                })
            })
        } else {

            axios.post(API_ROUTES.CREAR_PRODUCTOS,prodSeleccionado)
            .then(response =>{
                const newProductos = [...productos, response.data]
                setProductos(newProductos)
                setFilteredProductos(newProductos)
                setModalProducto(false)

                Swal.fire({
                    icon:'success',
                    title: 'producto creado correctamente',
                    showConfirmButton: false,
                    timer:1500
                })
            })
            .catch(err =>{
                Swal.fire({
                    icon:'error',
                    title:'error al crear el producto',
                    text: 'hubo un problema al guardar el producto'

                })
            })
        }
    }

    const editarProducto = (producto) =>{
        setProdSeleccionado({
            ...producto,
            isEditing:true
        })

        setModalProducto(true)
    }

    const borrarProducto = (producto)=>{
        Swal.fire({
            icon:'warning',
            title:'¿Estas seguro?',
            text: `No podras revertir la eliminacion del producto: ${producto.codigo} - ${producto.nom_producto}`,
            showCancelButton: true,
            confirmButtonText:'Si,eliminar',
            cancelButtonText:'Cancelar'
        })
        .then((result) => {
            if(result.isConfirmed){
                axios.delete(API_ROUTES.ELIMINAR_PRODUCTO(producto.codigo))
                .then(() => {
                    const updateProductos = productos.filter(p => p.codigo !== producto.codigo)
                    setProductos(updateProductos)
                    setFilteredProductos(updateProductos)

                    Swal.fire({
                        icon: 'success',
                        title:'Producto eliminado',
                        showConfirmButton: false,
                        timer: 1500
                    })
                })
                .catch(err =>{
                    Swal.fire({
                        icon:'error',
                        title:'Error al eliminar el producto',
                        text:'Hubo un problema al eliminar el producto'
                    })
                })
            }
        })
    }

    const getEstadoExistenciasClass = (existencias) =>{
        if(existencias <= 10){
            return'bg-danger text-white'
        }else if(existencias > 10 && existencias <=15){
            return 'bg-warning text-white'
        }else{
            return'bg-success text-white'
        }
    }

    return(
        <div className="container mt-4">
                <h3 className="text-center mb-4">Listado de Productos</h3>

                {}
                <div className="d-flex justify-content-start mb-3">
                    <input 
                        type="text"
                        className="form-control"
                        placeholder="filtrar por codigo, nombre del producto"
                        value={filter}
                        onChange={handleFilterChange} 
                    />
                </div>

                {}
                <div className="d-flex justify-content-end mb-3">
                    <button className="btn btn-primary" onClick={nuevoProducto}>
                        <i className="bi bi-plus-circle"></i>
                            Nuevo producto
                    </button>
                </div>

                <table className="table table-bordered table-striped">
                    <thead>
                        <tr className="text-center" style={{textTransform:'uppercase'}}>
                            <th>Codigo</th>
                            <th>Producto</th>
                            <th>Descripcion</th>
                            <th>Precio Publico</th>
                            <th>Precio Proveedor</th>
                            <th>Existencias</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProductos.map((producto, index) => (
                            <tr key={index}>
                                <td>{producto.codigo}</td>
                                <td>{producto.nom_producto}</td>
                                <td>{producto.dase_producto}</td>
                                <td>{producto.pre_publico}</td>
                                <td>{producto.pre_proveedor}</td>
                                <td className={`text-center ${getEstadoExistenciasClass(producto.existencias)}`}>
                                    {producto.existencias}
                                </td>
                                <td className="text-center">
                                    <button className="btn btn-warning btn-sm me-2"
                                            onClick={() => editarProducto(producto)}
                                    >
                                        <i className="bi bi-pencil-square"></i>
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => borrarProducto(producto)}
                                    >
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {}
                {modalProducto &&(
                    <div className="modal show" style={{display: "block"}} onClick={() => setModalProducto(false)}>
                        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {prodSeleccionado.isEditing ? "Editar producto" : "Nuevo producto"}
                                    </h5>

                                    <button 
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setModalProducto(false)}
                                    >

                                    </button>
                                </div>
                                <div className="modal-body">
                                    {}
                                    <form>
                                        <div className="form-group mb-3">
                                            <label>Codigo</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                name="codigo"
                                                value={prodSeleccionado.codigo}
                                                onChange={handleChange}
                                                disabled={prodSeleccionado.isEditing} 
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label>Producto</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                name="nom_producto"
                                                value={prodSeleccionado.nom_producto}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label>Publico</label>
                                            <input 
                                                type="number"
                                                className="form-control"
                                                name="pre_publico"
                                                value={prodSeleccionado.pre_publico}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="form-group mb-3"> 
                                            <label htmlFor="dase_producto" className="form-label">Descripcion</label>
                                            <textarea 
                                                name="dase_producto" 
                                                id="dase_producto"
                                                className="form-control"
                                                value={prodSeleccionado.dase_producto}
                                                onChange={handleChange}
                                            ></textarea>
                                        </div>
                                        <div className="form-group mb-3">
                                            <label>Precio proveedor</label>
                                            <input 
                                                type="number"
                                                className="form-control"
                                                name="pre_proveedor"
                                                value={prodSeleccionado.pre_proveedor}
                                                onChange={handleChange} 
                                            />
                                        </div>
                                        <div className="form-group mb-3">
                                            <label>Existencias</label>
                                            <input 
                                                type="number"
                                                className="form-control"
                                                name="existencias"
                                                value={prodSeleccionado.existencias}
                                                onChange={handleChange} 
                                            />
                                        </div>

                                    </form>
                                </div>
                                
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setModalProducto(false)}>
                                        cancelar
                                    </button>

                                    <button type="button" className="btn btn-primary" onClick={guardarProducto}>
                                        {prodSeleccionado.isEditing ? "Guardar cambios" : "Guardar producto"}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
        </div>
    )

}
export default Almacen







