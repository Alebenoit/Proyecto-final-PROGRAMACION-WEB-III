
import React, { useState, useEffect } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import { API_ROUTES } from "../api/apiroutes"

const Equipos = () => {
    const [equipos, setEquipos] = useState([])
    const [filteredEquipos, setFilteredEquipos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [modalAsignado, setModalAsignado] = useState(false)
    const [modalFalla, setModalFalla] = useState(false)
    const [equipoSeleccionado, setEquipoSeleccionado] = useState({})
    const [usuario, setUsuario] = useState('')
    const [falla, setFalla] = useState('')
    const [filter, setFilter] = useState('')

    const [modalNuevo, setModalNuevo] = useState(false)
    const [nuevoEquipo, setNuevoEquipo] = useState({
        num_serie: '',
        equipo: '',
        responsable: '',
        area: '',
        estado: 'Activo'
    })

    useEffect(() => {
        obtenerEquipos();
    }, [])

    const obtenerEquipos = () => {
        axios.get(API_ROUTES.EQUIPOS)
            .then(response => {
                setEquipos(response.data)
                setFilteredEquipos(response.data)
                setLoading(false)
            })
            .catch(() => {
                setError('Hubo un error al obtener los equipos')
                setLoading(false)
            })
    }

    const handleFilterChange = (e) => {
        const value = e.target.value
        setFilter(value)
        const filtered = equipos.filter(equipo =>
            equipo.num_serie.toLowerCase().includes(value.toLowerCase()) ||
            (equipo.responsable && equipo.responsable.toLowerCase().includes(value.toLowerCase()))
        )
        setFilteredEquipos(filtered)
    }

    const abrirModalAsignar = (equipo) => {
        setEquipoSeleccionado(equipo);
        setUsuario(equipo.responsable || '');
        setModalAsignado(true);
    }

    const asignarResponsable = () => {
        axios.post(API_ROUTES.ASIGNAR_USUARIOS, {
            num_serie: equipoSeleccionado.num_serie,
            usuario: usuario
        }).then(() => {
            Swal.fire({ icon: 'success', title: 'Asignado', timer: 1500, showConfirmButton: false });
            setModalAsignado(false);
            obtenerEquipos();
        });
    }

    const abrirModalFalla = (equipo) => {
        setEquipoSeleccionado(equipo);
        setFalla('');
        setModalFalla(true);
    }

    const enviarReporteFalla = () => {
        if (!falla.trim()) return Swal.fire('Error', 'Describe la falla', 'error');
        
        axios.post(API_ROUTES.REPORTE_FALLAS, {
            num_serie: equipoSeleccionado.num_serie,
            falla: falla
        }).then(() => {
            Swal.fire({ icon: 'success', title: 'Reporte Enviado', timer: 1500, showConfirmButton: false });
            setModalFalla(false);
            obtenerEquipos();
        }).catch(() => {
            Swal.fire('Error', 'No se pudo enviar el reporte', 'error');
        });
    }

    const handleNuevoEquipoChange = (e) => {
        const { name, value } = e.target;
        setNuevoEquipo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const guardarNuevoEquipo = (e) => {
        e.preventDefault();
        if (!nuevoEquipo.num_serie.trim() || !nuevoEquipo.equipo.trim()) {
            return Swal.fire('Error', 'El Número de Serie y el Nombre del Equipo son obligatorios', 'error');
        }

        axios.post(API_ROUTES.EQUIPOS, nuevoEquipo)
            .then(() => {
                Swal.fire({ icon: 'success', title: 'Equipo Registrado', timer: 1500, showConfirmButton: false });
                setModalNuevo(false);
                setNuevoEquipo({ num_serie: '', equipo: '', responsable: '', area: '', estado: 'Activo' });
                obtenerEquipos();
            })
            .catch(() => {
                Swal.fire('Error', 'No se pudo registrar el equipo', 'error');
            });
    };

    const getEstadoClass = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'baja': return 'bg-danger text-white'
            case 'activo': return 'bg-success text-white'
            case 'mantenimiento': return 'bg-warning text-dark'
            default: return 'bg-secondary text-white'
        }
    }

    if (loading) return <div className="text-center mt-5">Cargando...</div>
    if (error) return <div className="alert alert-danger text-center mt-5">{error}</div>

    return (
        <div className="container mt-4">
            <h3 className="text-center mb-4">Listado de Equipos</h3>

            <div className="row g-3 mb-4 align-items-center">
                <div className="col-md-9">
                    <input type="text" className="form-control" placeholder="Buscar..." value={filter} onChange={handleFilterChange} />
                </div>
                <div className="col-md-3 text-end">
                    <button className="btn btn-success w-100 fw-bold shadow-sm" onClick={() => setModalNuevo(true)}>
                        <i className="bi bi-plus-lg me-2"></i>Agregar Equipo
                    </button>
                </div>
            </div>

            <div className="table-responsive shadow-sm">
                <table className="table table-hover table-bordered align-middle">
                    <thead className="table-light text-center">
                        <tr>
                            <th>NÚMERO SERIE</th>
                            <th>EQUIPO</th>
                            <th>RESPONSABLE</th>
                            <th>ÁREA</th>
                            <th>ESTADO</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEquipos.map((equipo, index) => (
                            <tr key={index}>
                                <td className="text-center fw-bold">{equipo.num_serie}</td>
                                <td>{equipo.equipo}</td>
                                <td>{equipo.responsable || 'Sin asignar'}</td>
                                <td className="text-center">{equipo.area}</td>
                                <td className={`text-center fw-bold ${getEstadoClass(equipo.estado)}`}>{equipo.estado}</td>
                                <td className="text-center">
                                    <button className="btn btn-primary btn-sm me-2" onClick={() => abrirModalAsignar(equipo)}>
                                        <i className="bi bi-person-plus"></i>
                                    </button>
                                    <button className="btn btn-warning btn-sm" onClick={() => abrirModalFalla(equipo)}>
                                        <i className="bi bi-pencil-square"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {}
            {modalAsignado && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">Asignar Usuario</h5>
                                    <button type="button" className="btn-close" onClick={() => setModalAsignado(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Número de Serie</label>
                                        <input type="text" className="form-control bg-light border-0" value={equipoSeleccionado.num_serie} readOnly />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small text-muted">Usuario</label>
                                        <input type="text" className="form-control" value={usuario} onChange={(e) => setUsuario(e.target.value)} autoFocus />
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button className="btn btn-secondary px-4 me-2" onClick={() => setModalAsignado(false)}>Cancelar</button>
                                    <button className="btn btn-primary px-4" onClick={asignarResponsable}>Asignar Usuario</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {}
            {modalFalla && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">Reportar Falla</h5>
                                    <button type="button" className="btn-close" onClick={() => setModalFalla(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Equipo</label>
                                        <input type="text" className="form-control bg-light border-0" value={equipoSeleccionado.num_serie} readOnly />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small text-muted">Descripción de la falla</label>
                                        <textarea className="form-control" rows="3" value={falla} onChange={(e) => setFalla(e.target.value)} autoFocus></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button className="btn btn-secondary px-4 me-2" onClick={() => setModalFalla(false)}>Cancelar</button>
                                    <button className="btn btn-warning px-4 fw-bold" onClick={enviarReporteFalla}>Enviar Reporte</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {}
            {modalNuevo && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <form className="modal-content border-0 shadow-lg" onSubmit={guardarNuevoEquipo}>
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">Registrar Nuevo Equipo</h5>
                                    <button type="button" className="btn-close" onClick={() => setModalNuevo(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Número de Serie *</label>
                                        <input type="text" className="form-control" name="num_serie" value={nuevoEquipo.num_serie} onChange={handleNuevoEquipoChange} required autoFocus />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Equipo *</label>
                                        <input type="text" className="form-control" name="equipo" value={nuevoEquipo.equipo} onChange={handleNuevoEquipoChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Responsable</label>
                                        <input type="text" className="form-control" name="responsable" value={nuevoEquipo.responsable} onChange={handleNuevoEquipoChange} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small text-muted">Área</label>
                                        <input type="text" className="form-control" name="area" value={nuevoEquipo.area} onChange={handleNuevoEquipoChange} />
                                    </div>
                                    <div className="mb-2">
                                        <label className="form-label small text-muted">Estado</label>
                                        <select className="form-select" name="estado" value={nuevoEquipo.estado} onChange={handleNuevoEquipoChange}>
                                            <option value="Activo">Activo</option>
                                            <option value="Mantenimiento">Mantenimiento</option>
                                            <option value="Baja">Baja</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button type="button" className="btn btn-secondary px-4 me-2" onClick={() => setModalNuevo(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-success px-4 fw-bold">Guardar Equipo</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Equipos














