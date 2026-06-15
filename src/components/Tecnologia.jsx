import React, {useState} from "react"

import Equipos from "./Equipos"
import Soportes from "./Soportes"
import Historiales from "./Historiales"

const Tecnologia = ({usuario}) => {    
    const [vista, setVista] = useState('equipos')
    const mostrarEquipos = () => setVista('equipos')
    const mostrarSoportes = () => setVista('soportes')
    const mostrarHistoriales = () => setVista('historial')

    return(
        <div className="container nt-4">
            <div className="text-center mb-4">
                <button className="btn btn-primary me-2" onClick={mostrarEquipos}>
                    Equipos
                </button>

                <button className="btn btn-secondary me-2" onClick={mostrarSoportes}>
                    Soporte
                </button>

                <button className="btn btn-dark me-2" onClick={mostrarHistoriales}>
                    historiales
                </button>
            </div>

            { }

            <div>
                {vista === 'equipos' && <Equipos/>}
                {vista === 'soportes' && <Soportes usuario={usuario}/>}
                {vista === 'historial' && <Historiales usuario={usuario}/>}
            </div>
        </div>
    )
}
export default Tecnologia






