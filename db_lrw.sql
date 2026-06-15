CREATE DATABASE db_lrw;
USE db_lrw;

CREATE TABLE areas(
    area VARCHAR(100) PRIMARY KEY
);

CREATE TABLE estados_equipos(
    estado VARCHAR(50) PRIMARY KEY
);

CREATE TABLE usuarios(
    usuario VARCHAR(20) PRIMARY KEY,
    contraseña VARCHAR(255) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    correo VARCHAR(50) NULL,
    estado VARCHAR(15) NOT NULL 
);

CREATE TABLE equipos(
    num_serie VARCHAR(50) PRIMARY KEY,
    equipo VARCHAR(100) NOT NULL,
    area VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(50) NOT NULL,
    responsable VARCHAR(20) NULL,
    fecha_adquisicion DATE NOT NULL,
    fecha_asignacion DATE NOT NULL,
    fecha_baja DATE NULL 
);

CREATE TABLE historial_mantenimiento(
    id_historial VARCHAR(100) PRIMARY KEY,
    num_serie VARCHAR(50) NOT NULL,
    fecha_reporte DATE NOT NULL,
    fecha_solucion DATE NULL,
    usuario_tecnico VARCHAR(20) NULL,
    falla TEXT NOT NULL,
    solucion TEXT NULL
);

CREATE TABLE productos(
    codigo VARCHAR(50) PRIMARY KEY,
    nom_producto VARCHAR(100) NOT NULL,
    dase_producto TEXT NOT NULL,
    pre_publico DOUBLE NOT NULL,
    pre_proveedor DOUBLE NOT NULL,
    existencias INT NOT NULL
);

CREATE TABLE ventas(
    id_venta VARCHAR(150) PRIMARY KEY,
    productos TEXT NOT NULL,
    total_venta DOUBLE NOT NULL,
    fecha_venta DATE NOT NULL,
    vendedor VARCHAR(20) NOT NULL
);


INSERT INTO areas (area) VALUES
('Administración'),
('Recursos Humanos'),
('Tecnología'),
('Almacén'),
('Ventas'),
('Finanzas'),
('Soporte');

INSERT INTO productos (codigo, nom_producto, dase_producto, pre_publico, pre_proveedor, existencias) VALUES
('P001', 'Laptop Dell XPS 13', 'Laptop de alta gama', 1200.00, 1000.00, 10),
('P002', 'Smartphone Galaxy S21', 'Smartphone AMOLED', 800.00, 650.00, 20),
('P003', 'Monitor LG 4K', 'Monitor 27 pulgadas', 500.00, 400.00, 15);

INSERT INTO estados_equipos (estado) VALUES
('activo'),
('mantenimiento'),
('baja'),
('reservado'),
('inactivo');

INSERT INTO equipos (num_serie, equipo, area, descripcion, estado, responsable, fecha_adquisicion, fecha_asignacion) VALUES
('SN001', 'Laptop Dell XPS 13', 'Tecnología', 'Core i7', 'activo', 'usuario1', '2023-01-15', '2023-01-20'),
('SN002', 'Smartphone Galaxy S21', 'Tecnología', 'Cámara alta res', 'mantenimiento', 'usuario2', '2023-02-10', '2023-02-15'),
('SN003', 'Monitor LG 4K', 'Tecnología', 'USB-C', 'activo', 'usuario3', '2023-03-05', '2023-03-10');

