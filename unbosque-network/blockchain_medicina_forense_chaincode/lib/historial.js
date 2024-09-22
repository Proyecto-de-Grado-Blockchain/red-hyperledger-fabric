'use strict';

class Historial {
    constructor(id, idCaso, fecha, descripcion, notas, usuarioResponsable) {
        this.id = id;
        this.idCaso = idCaso;
        this.fecha = fecha;
        this.descripcion = descripcion;
        this.notas = notas;
        this.usuarioResponsable = usuarioResponsable;
    }
}

module.exports = Historial;
