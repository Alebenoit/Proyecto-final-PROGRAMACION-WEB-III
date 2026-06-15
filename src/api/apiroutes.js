const BASE_URL = 'http://localhost:3000/api'
export const API_ROUTES = {
    LOGIN: `${BASE_URL}/login`,
    EQUIPOS: `${BASE_URL}/equipos`,
    CREAR_EQUIPO: `${BASE_URL}/equipos`,     
    ASIGNAR_USUARIOS: `${BASE_URL}/equipos/asignar`,
    REPORTE_FALLAS: `${BASE_URL}/equipos/reporte`,
    OBTENER_PRODUCTOS: `${BASE_URL}/productos`,
    OBTENER_PRODUCTO_POR_CODIGO: (codigo) =>`${BASE_URL}/productos/${codigo}`,
    CREAR_PRODUCTOS: `${BASE_URL}/productos`,
    ACTUALIZAR_PRODUCTO: (codigo) => `${BASE_URL}/productos/${codigo}`,
    ELIMINAR_PRODUCTO: (codigo) => `${BASE_URL}/productos/${codigo}`,
    OBTENER_VENTAS: `${BASE_URL}/ventas`,
    MANTENIMIENTO_FIND: `${BASE_URL}/equipos/mantenimientos/search`,
    OBTENER_USUARIOS: `${BASE_URL}/usuarios`,
    OBTENER_AREAS: `${BASE_URL}/areas`,
    ACTUALIZAR_USUARIO: (usuario) => `${BASE_URL}/usuarios/${usuario}`,
    CREAR_USUARIO: `${BASE_URL}/usuarios`,
    ELIMINAR_USUARIO: (usuario) => `${BASE_URL}/usuarios/${usuario}`,
    OBTENER_MANTENIMIENTOS: `${BASE_URL}/equipos/mantenimientos`,
    ACTUALIZAR_MANTENIMIENTOS: `${BASE_URL}/equipos/mantenimientos/update`, 
    REGISTRAR_VENTA: `${BASE_URL}/ventas`,
};















