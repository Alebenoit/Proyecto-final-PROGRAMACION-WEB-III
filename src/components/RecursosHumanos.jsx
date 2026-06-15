import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_ROUTES } from "../api/apiroutes";

const RecursosHumanos = ({ usuario }) => {
    const [ usuarios, setUsuarios] = useState([])
    const [ areas, setAreas] = useState([])
    const [ loading, setLoading] = useState(true)
    const [ error, setError] = useState(null)

    const [ modalUsuario, setModalUsuario] = useState(false)
    const [ filteredUsuarios, setfilteredUsuarios] = useState([])
    const [ usuarioSeleccionado, setUsuarioSeleccionado] = useState({
        nombre: '',
        usuario: '',
        contraseña: '',
        area: '',
        correo: '',
        estado: '',
        isEditing: false
    })

    const [ filter,setFilter] = useState('')
    useEffect(() => {
        axios.get(API_ROUTES.OBTENER_USUARIOS)
        .then(response =>{
            setUsuarios(response.data)
            setfilteredUsuarios(response.data)
            setLoading(false)
        })
        .catch(err => {
            setError('Hubo un error al obtener los usuarios ')
            setLoading(false)
        })
    },[])

    useEffect(() =>{
        axios.get(API_ROUTES.OBTENER_AREAS)
        .then(response =>{
            setAreas(response.data)
        })
        .catch(err => {
            setError('Hubo un error al obtener las areas')
        })
    }, [])

    const handleFilterChange = (e) =>{
        const value = e.target.value.toLowerCase();
        setFilter(value);

        const filtered = usuarios.filter(usuario => {
            const nombre = (usuario.nombre || "").toLowerCase();
            const user = (usuario.usuario || "").toLowerCase();
            const area = (usuario.area || "").toLowerCase();
            const estado = (usuario.estado || "").toLowerCase();
            const busqueda = value.toLowerCase();

            return nombre.includes(busqueda) ||
                user.includes(busqueda) ||
                area.includes(busqueda) ||
                estado.includes(busqueda);
        });

        setfilteredUsuarios(filtered)
    }

    
    const nuevoUsuario = () => {
        setUsuarioSeleccionado({
            nombre:'',
            usuario:'',
            contraseña:'',
            area:'',
            correo:'',
            estado:'',
            isEditing: false
        })

        setModalUsuario(true)
    }
    

    
    const editarUsuario = (usuario) =>{
        setUsuarioSeleccionado({
            ...usuario,
            isEditing:true
        })

        setModalUsuario(true)
    }

    const handleChange = (e) =>{
        const { name, value } = e.target
        setUsuarioSeleccionado({
            ...usuarioSeleccionado,
            [name]: value
        })
    }

    const guardarUsuario =() => {
        if(usuarioSeleccionado.isEditing){
          
            axios.put(API_ROUTES.ACTUALIZAR_USUARIO(usuarioSeleccionado.usuario),{
                nombre: usuarioSeleccionado.nombre,
                contraseña: usuarioSeleccionado.contraseña,
                area: usuarioSeleccionado.area,
                correo: usuarioSeleccionado.correo,
                estado: usuarioSeleccionado.estado,
            })
            .then(response =>{
                
                const updateUsuarios = usuarios.map(usuario =>
                    usuario.usuario === usuarioSeleccionado.usuario ? {...usuarioSeleccionado, ...response.data}:usuario
                )

                setUsuarios(updateUsuarios)
                setfilteredUsuarios(updateUsuarios)
                setModalUsuario(false)

                Swal.fire({
                    icon:'success',
                    title:'Usuario actualizado correctamente',
                    showConfirmButton: false,
                    timer: 1500
                })
            })
            .catch(err => {
                setError('error al altualizar el usuario')

                Swal.fire({
                    icon:'success',
                    title:'Error al actualizar el usuario',
                    text: 'hubo un problema al actualizar los datos',
                    timer: 1500
                })

            })
        }else{
            if (usuarioSeleccionado.contraseña.length < 5) {
            Swal.fire({
               icon: 'warning',
              title: 'Contraseña muy corta',
               text: 'Debe tener al menos 5 caracteres'
              });
             return;
                }
            axios.post(API_ROUTES.CREAR_USUARIO, usuarioSeleccionado)
                .then(() => {
                    
                    return axios.get(API_ROUTES.OBTENER_USUARIOS);
                })
                .then(response => {
                    
                    setUsuarios(response.data);
                    setfilteredUsuarios(response.data);
                    setModalUsuario(false);

                    Swal.fire({
                        icon: 'success',
                        title: 'usuario creado correctamente',
                        showConfirmButton: false,
                        timer: 1500
                    });
                })
                .catch(err => {
                    console.error(err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al crear el usuario',
                        text: 'Hubo un problema al crear al usuario nuevo'
                    });
                });
            }
        
    }
    const getPasswordStrength = (password) => {
    if (!password) return { text: "", class: "" };

    if (password.length < 5) {
        return { text: "Débil (mínimo 5 caracteres)", class: "text-danger" };
    } else if (password.length >= 5 && password.length <= 8) {
        return { text: "Intermedia", class: "text-warning" };
    } else {
        return { text: "Segura", class: "text-success" };
    }
};

    const borrarUsuario = (usuario) =>{
        Swal.fire({
            icon: `warning`,
            title: `¿Estas seguro?`,
            text: `No podras revertir la eliminacion del ${usuario.nombre}`,
            showCancelButton: true,
            confirmButtonText:`Si, eliminar`,
            cancelButtonText:`Cancelar`
        })
        .then((result) =>{
            if(result.isConfirmed){
                axios.delete(API_ROUTES.ELIMINAR_USUARIO(usuario.usuario))
                .then(()=> {
                    const updateUsuarios = usuarios.filter(u => u.usuario !== usuario.usuario)
                    setUsuarios(updateUsuarios)
                    setfilteredUsuarios(updateUsuarios)

                    Swal.fire({
                        icon: 'success',
                        title: 'usuario eliminado',
                        showConfirmButton: false,
                        timer: 1500
                })
            })
            .catch(err =>{
                Swal.fire({
                    icon: 'error',
                    title: 'Error al eliminar el usuario',
                    text: 'Hubo un problema al eliminar el usuario'
                })
            })
            }
            
        })
    }

    const getEstadoClass = (estado) => {
        switch(estado.toLowerCase()){
            case 'inactivo': return 'bg-danger text-white'
            case 'activo': return 'bg-success text-white'
            default: return ''
        }
    }

    
    if(loading){
        return <div className="text-center">Cargando...</div>
    }

    if(error){
        return <div className="text-center">{error}</div>
    }

    return(
        <div className="container mt-4">
            <h3 className="text-center mb-4">Listado de Asociados</h3>

            {}
            <div className="d-flex justify-content-start mb-3">
                <input 
                    type="text"
                    className="form-control" 
                    placeholder="filtrar por nombre, usuario, area o estado"
                    value={filter}
                    onChange={handleFilterChange}
                />
            </div>

            {}
            <div className="d-flex justify-content-end mb-3">
                <button className="btn btn-primary" onClick={nuevoUsuario}>
                    <i className="bi bi-plus-circle"></i> Nuevo Usuario
                </button>
            </div>

            <table className="table table-bordered table-striped">
                <thead>
                    <tr className="text-center" style={{ textTransform: 'uppercase'}}>
                        <th>Nombre</th>
                        <th>Usuario</th>
                        <th>Area</th>
                        <th>Correo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredUsuarios.map((usuario, index) => (
                        <tr key={index}>
                            <td>{usuario.nombre}</td>
                            <td>{usuario.usuario}</td>
                            <td>{usuario.area}</td>
                            <td>{usuario.correo}</td>
                            <td className={`text-center ${getEstadoClass(usuario.estado)}`}>
                                {usuario.estado}
                            </td>
                            <td className="text-center">
                                <button className="btn btn-warning btn-sm me-2" onClick={() =>editarUsuario(usuario)}>
                                <i className="bi bi-pencil-square"></i>
                                
                                </button>

                                <button className="btn btn-danger btn-sm" onClick={() => borrarUsuario(usuario)}>
                                    <i className="bi bi-trash"></i>
                                </button>
                            </td>
                            
                        </tr>
                    ))}
                </tbody>
            </table>

            {}
            {modalUsuario && (
                <div className="modal show" style={{display: 'block'}} onClick={() => setModalUsuario(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {usuarioSeleccionado.isEditing ? "Editar Usuario" : "nuevo Usuario"}
                                </h5>

                                <button 
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setModalUsuario(false)}
                                >
                                </button>
                            </div>

                            <div className="modal-body">
                                {}
                                <form>
                                    <div className="form-group mb-3">
                                        <label>Nombre</label>
                                        <input type="text"
                                            className="form-control"
                                            name="nombre"
                                            value={usuarioSeleccionado.nombre}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>Usuario</label>
                                        <input 
                                            type="text"
                                            autoComplete="username"
                                            className="form-control"
                                            name="usuario"
                                            value={usuarioSeleccionado.usuario || ""}
                                            onChange={handleChange}
                                            disabled={usuarioSeleccionado.isEditing}
                                        />
                                    </div>
                                    
                                   <div className="form-group mb-3">
                                           <label>Contraseña</label>
                                           <input 
                                            type="password"
                                            autoComplete={usuarioSeleccionado.isEditing ? "current-password": "new-password"}
                                            className="form-control"
                                            name="contraseña"
                                            value={usuarioSeleccionado.contraseña || ""}
                                            onChange={handleChange}
                                           />
                                                      {}
                                                     {usuarioSeleccionado.contraseña && (
                                                      <small className={getPasswordStrength(usuarioSeleccionado.contraseña).class}>
                                                      {getPasswordStrength(usuarioSeleccionado.contraseña).text}
                                                   </small>
                                               )}
                                           </div>
                                    <div className="form-group mb-3">
                                        <label>Area</label>
                                        <select 
                                            className="form-control"
                                            name="area"
                                            value={usuarioSeleccionado.area}
                                            onChange={handleChange}
                                            >
                                                <option value="">Seleccionar Area</option>
                                                {areas.map((area, index) =>(
                                                    <option key={index} value={area.area}>
                                                        {area.area}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div className="form-group mb-3">
                                        <label>Correo</label>
                                        <input 
                                            type="email"
                                            className="form-control"
                                            name="correo"
                                            value={usuarioSeleccionado.correo}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {}
                                    <div className="form-group mb-3">
                                        <label>Estado</label>
                                        <select
                                            className="form-control"
                                            name="estado"
                                            value={usuarioSeleccionado.estado}
                                            onChange={handleChange}
                                        >
                                            <option value="activo">activo</option>
                                            <option value="inactivo">inactivo</option>
                                        </select>
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={()=> setModalUsuario(false)}>
                                    cancelar
                                </button>
                                <button type="button" className="btn btn-primary" onClick={guardarUsuario}>
                                    {usuarioSeleccionado.isEditing ? "Guardar cambios" : "Guardar usuarios"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RecursosHumanos








