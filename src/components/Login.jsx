import React, { useState, useEffect } from "react";
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import {API_ROUTES} from '../api/apiroutes'


const Login = () => {
    const [usuario, setUsuario] = useState('')
    const [contraseña, setContraseña] = useState('')
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [captcha, setCaptcha] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");

    const navigate = useNavigate()

    const generarCaptcha = () => {
    const caracteres =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let resultado = "";

    for (let i = 0; i < 6; i++) {
        resultado += caracteres.charAt(
            Math.floor(Math.random() * caracteres.length)
        );
    }

    setCaptcha(resultado);
    };
    
    useEffect(() => {
    generarCaptcha();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault()

        setError("")
        setMensaje("")

        if(!usuario || !contraseña){
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Usuario y contraseña son requeridos',
            })
            return
        }

        const loginData = {
            usuario,
            contraseña
        }
        if (captchaInput.trim().toLowerCase() !== captcha.toLowerCase()) {
        Swal.fire({
            icon: "error",
            title: "Captcha incorrecto",
            text: "Las letras ingresadas no coinciden"
          });

         generarCaptcha();
         setCaptchaInput("");
         return;
        }

        try{
            const response = await axios.post(API_ROUTES.LOGIN, loginData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if(response.status === 200){
                if(response.data.usuario.estado.toLowerCase() === 'inactivo'){
                    Swal.fire({
                        icon: 'error',
                        title: 'Cuenta inactiva',
                        text: 'Tu cuenta está inactiva. Contacta al administrador',
                    })
                    return
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Bienvenido!',
                        text: 'Inicio de sesion exitoso',
                    })
                    generarCaptcha();
                    setCaptchaInput("");
                    navigate('/Dashboard', {state: {usuario: response.data.usuario}})
                }
            }
        }catch(err){
            if(err.response){
                if(err.response.status === 400){
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Usuario y contraseña son requeridos',
                    })
                }else if(err.response.status === 401){
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de autenticacion',
                        text: err.response.data
                    })
                }else if(err.response.status === 402){
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de autenticacion',
                        text: err.response.data
                    })
                }
            
            }else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error en la conexion',
                    text: 'error en la conexion al servidor'
                })
            }
        }
            
    } 

    return(
        <div className= "container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-lg p-4"style={{width:'100%',maxWidth:'400px'}}>
                <h2 className='text-center mb-4'>Iniciar Sesión</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="usuario">Usuario: </label>
                        <input 
                            type="text" 
                            autoComplete='username'
                            className='form-control'
                            id='usuario'
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            placeholder='Usuario'
                        />
                    
                    </div>

                    <div className='form-group'>
                        <label htmlFor="contrasena">Contraseña</label>
                        <input 
                            type="password" 
                            autoComplete='current-password'
                            className='form-control'
                            id='contrasena'
                            value={contraseña}
                            onChange={(e) => setContraseña(e.target.value)}
                            placeholder='Password'
                        />
                    </div>
                    <div className='mt-3'>
                        <div 
                        style={{
                            background: "#F1F1F1",
                            padding: "10px",
                            fontSize: "24px",
                            fontWeight: "bold",
                            letterSpacing: "5px",
                            textAlign: "center",
                            userSelect: "none"
                        }}
                        >
                            {captcha}               
                        </div>
                        <input
                          type="text" 
                          className="form-control mt-2"
                          placeholder='Ingresa el Codigo de Seguridad'
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                        />
                        <button
                        type='button'
                        className="btn btn-secondary mt-2"
                        onClick={generarCaptcha}
                        >
                            Generar otro Codigo de Seguridad
                        </button>
                    </div> 
                    
                    <button type="submit" className='btn btn-primary btn-block mt-3' >
                        Iniciar sesion
                    </button>
    
                </form>

                {error && <div className='alert alert-danger mt-3'>{error}</div>}
                {mensaje && <div className='alert alert-success mt-3'>{mensaje}</div>}
            </div>
        </div>
    )
}
export default Login






