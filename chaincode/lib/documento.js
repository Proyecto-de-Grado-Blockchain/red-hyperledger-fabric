'use strict';

class Documento {
    constructor(id, idCaso, tipoDocumento, nombreArchivo, fechaSubida, usuarioResponsable) {
        this.id = id;
        this.idCaso = idCaso;
        this.tipoDocumento = tipoDocumento;
        this.nombreArchivo = nombreArchivo;
        this.fechaSubida = fechaSubida;
        this.usuarioResponsable = usuarioResponsable;
    }
}

module.exports = Documento;
