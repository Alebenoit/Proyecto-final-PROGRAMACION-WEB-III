import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Tecnologia from "./Tecnologia";
import RecursosHumanos from "./RecursosHumanos";
import Almacen from"./Almacen";
import Ventas from"./Ventas"
import Finanzas from "./Finanzas"; 
import Soportes from "./Soportes";

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { usuario } = location.state || {};

    const handleLogout = () => {
        Swal.fire({
            icon: 'warning',
            title: '¿Cerrar sesión?',
            text: '¿Estás seguro de que deseas cerrar sesión?',
            showCancelButton: true,
            confirmButtonText: 'Sí, cerrar sesión',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Hasta luego',
                    text: 'Gracias por usar la aplicación',
                    timer: 2000,
                    showConfirmButton: false,
                }).then(() => {
                    navigate('/login');
                });
            }
        });
    };

const renderAreaContent = () => {
    if (!usuario?.area) return <div className="text-center mt-5">Área no definida</div>;

    const areaLimpia = usuario.area
        .toLowerCase()
        .trim() 
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ' '); 

    if (areaLimpia.includes("recursos") || areaLimpia.includes("humanos")) {
        return <RecursosHumanos usuario={usuario} />;
    }

    if (areaLimpia.includes("soporte")) {
    return <Soportes usuario={usuario} />;
}

    if (areaLimpia.includes("tecnologia") || areaLimpia.includes("tegnologia")) {
        return <Tecnologia usuario={usuario} />;
    }

    if (areaLimpia.includes("administracion")) {
        return <RecursosHumanos usuario={usuario} />;
    }
    if (areaLimpia.includes("almacen")) {
        return <Almacen usuario={usuario} />;
    }
    else if (areaLimpia.includes("venta")) {
        return <Ventas usuario={usuario} />;
    } 
    else if (areaLimpia.includes("finanzas")) {
        return <Finanzas usuario={usuario} />; 
    }


    return (
        <div className="text-center mt-5 alert alert-warning">
            <h5>Área no reconocida</h5>
            <p>Procesada: "<strong>{areaLimpia}</strong>"</p>
            <p className="small">Longitud: {areaLimpia.length} caracteres</p>
        </div>
    );
};
    return (
        <div>
            {}
            <div className="d-flex justify-content-between align-items-center p-3 bg-dark text-white">
                {}
                <div className="text-center w-100">
                    <p className="m-0 h5">{usuario?.nombre || "Cargando..."}</p>
                    <p className="m-0 small text-secondary">{usuario?.area || "Sin Área"}</p>
                </div>
                <button className="btn btn-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i>
                </button>
            </div>

            {}
            <div className="container mt-4">
                {renderAreaContent()}
            </div>
        </div>
    );
};

export default Dashboard;












