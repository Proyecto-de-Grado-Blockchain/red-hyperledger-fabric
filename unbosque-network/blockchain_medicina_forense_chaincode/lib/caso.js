'use strict';

class Caso {
    constructor(id, numeroCaso, nombrePaciente, fechaCreacion, estado, idUsuario) {
        this.id = id;
        this.numeroCaso = numeroCaso;
        this.nombrePaciente = nombrePaciente;
        this.fechaCreacion = fechaCreacion;
        this.estado = estado;
        this.idUsuario = idUsuario;
    }
}

module.exports = Caso;
