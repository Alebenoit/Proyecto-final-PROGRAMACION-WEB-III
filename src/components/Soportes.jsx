import React, { useState, useEffect } from "react"
import axios from "axios"
import Swal from "sweetalert2"
import { API_ROUTES } from "../api/apiroutes"

const Soportes = ({ usuario }) => {
    const [mantenimientos, setMantenimiento] = useState([])
    const [totalRegistros, setTotalRegistros] = useState(0)
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedFalla, setSelectedFalla] = useState("")
    const [selectedNumSerie, setSelectedNumSerie] = useState("")
    const [selectedIdHistorial, setSelectedIdHistorial] = useState("")
    const [solucion, setSolucion] = useState("")

    const cargarMantenimientos = () => {
        axios.get(API_ROUTES.OBTENER_MANTENIMIENTOS)
            .then(response => {
                setMantenimiento(response.data)
                setTotalRegistros(response.data.length)
            })
            .catch(() => {
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron obtener los datos' })
            })
    }

    useEffect(() => {
        cargarMantenimientos()
    }, [])

    const handleOpenModal = (falla, idHistorial, num_serie) => {
        setSelectedFalla(falla)
        setSelectedIdHistorial(idHistorial)
        setSelectedNumSerie(num_serie)
        setModalVisible(true)
    }

    const handleCloseModal = () => {
        setModalVisible(false)
        setSolucion("")
    }

    const registrarSolucion = (e) => {
        e.preventDefault()
        if (!solucion.trim()) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Por favor, ingresa la solución' })
            return
        }

        axios.post(API_ROUTES.ACTUALIZAR_MANTENIMIENTOS, {
            num_serie: selectedNumSerie,
            id_historial: selectedIdHistorial,
            tecnico: usuario.nombre || usuario,
            solucion: solucion
        })
        .then(() => {
            Swal.fire({ icon: 'success', title: 'Éxito', text: 'Mantenimiento finalizado con éxito', timer: 1500, showConfirmButton: false })
            handleCloseModal()
            cargarMantenimientos()
        })
        .catch(() => {
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo registrar la solución' })
        })
    }

    return (
        <div className="container mt-4">
            <h5 className="text-center mb-4">Mantenimientos Pendientes: <span className="badge bg-danger">{totalRegistros}</span></h5>

            <div className="table-responsive shadow-sm">
                <table className="table table-hover table-bordered align-middle">
                    <thead className="table-light text-center">
                        <tr className="small fw-bold">
                            <th>ID HISTORIAL</th>
                            <th>NÚMERO SERIE</th>
                            <th>FECHA REPORTE</th>
                            <th>DESCRIPCIÓN FALLA</th>
                            <th>ACCIONES</th>
                        </tr>
                    </thead>

                    <tbody>
                        {mantenimientos.length > 0 ? (
                            mantenimientos.map((equipo, index) => (
                                <tr key={index} className="text-center">
                                    <td className="small">{equipo.id_historial}</td>
                                    <td className="fw-bold">{equipo.num_serie}</td>
                                    {}
                                    <td>{equipo.fecha_reporte ? equipo.fecha_reporte.toString().slice(0, 10) : "---"}</td>
                                    <td className="text-start">{equipo.falla || equipo.descripcion_falla}</td>
                                    <td>
                                        <button 
                                            className="btn btn-warning btn-sm fw-bold"
                                            onClick={() => handleOpenModal(equipo.falla || equipo.descripcion_falla, equipo.id_historial, equipo.num_serie)}
                                        >
                                            <i className="bi bi-pencil-square"></i> Responder
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center p-4 text-muted">No hay mantenimientos pendientes</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {modalVisible && (
                <>
                    <div className="modal-backdrop fade show"></div>
                    <div className="modal fade show d-block" tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title fw-bold">Registrar Solución</h5>
                                    <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                                </div>
                                <div className="modal-body">
                                    <p className="mb-1 text-muted small">Falla reportada:</p>
                                    <div className="p-2 bg-light rounded mb-3 border small">{selectedFalla}</div>
                                    
                                    <div className="row small mb-3">
                                        <div className="col-6"><strong>S/N:</strong> {selectedNumSerie}</div>
                                        <div className="col-6"><strong>Técnico:</strong> {usuario.nombre || usuario}</div>
                                    </div>

                                    <form onSubmit={registrarSolucion}>
                                        <div className="mb-3">
                                            <label className="form-label small fw-bold">Descripción de la Solución</label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                placeholder="Describe el trabajo realizado..."
                                                value={solucion}
                                                onChange={(e) => setSolucion(e.target.value)}
                                                required
                                            ></textarea>
                                        </div>
                                        <div className="modal-footer border-0 pt-0 justify-content-end">
                                            <button type="button" className="btn btn-secondary px-4 me-2" onClick={handleCloseModal}>Cancelar</button>
                                            <button className="btn btn-primary px-4" type="submit">Finalizar Soporte</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Soportes






