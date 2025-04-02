'use strict';

/**
 * Representa un Usuario del sistema.
 * IMPORTANTE: Almacenar contraseñas en texto plano (`contrasena`) es una vulnerabilidad
 * de seguridad grave. En una aplicación real, se debe almacenar un hash seguro de la contraseña.
 */
class Usuario {
    /**
     * Construye una instancia de Usuario.
     *
     * @param {string} id - Identificador único para el usuario.
     * @param {string} nombreCompleto - Nombre completo del usuario.
     * @param {string} correo - Dirección de correo electrónico del usuario (usualmente usado como login).
     * @param {string} contrasena - Contraseña del usuario. **¡ADVERTENCIA DE SEGURIDAD!** Debería ser un hash.
     * @param {string} rol - Rol del usuario en el sistema (ej. 'Administrador', 'Médico', 'Paciente'). Define permisos.
     */
    constructor(id, nombreCompleto, correo, contrasena, rol) {
        this.docType = 'usuario'; // Identificador del tipo de objeto
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.correo = correo; // Podría necesitar validación de formato email.
        this.contrasena = contrasena;
        this.rol = rol; // Podría validarse contra una lista de roles permitidos.

        // Validación básica
        if (!id || !nombreCompleto || !correo || !contrasena || !rol) {
            throw new Error('Todos los campos del usuario son obligatorios');
        }
    }
}

module.exports = Usuario;
