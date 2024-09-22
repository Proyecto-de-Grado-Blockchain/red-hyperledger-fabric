'use strict';

class Usuario {
    constructor(id, nombreCompleto, correo, contrasena, rol) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.correo = correo;
        this.contrasena = contrasena; 
        this.rol = rol;
    }
}

module.exports = Usuario;
