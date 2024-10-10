'use strict';

class Documento {
    constructor(id, idCaso, tipoDocumento, nombreArchivo, fechaSubida, usuarioResponsable, hashDocumento) {
        this.id = id;
        this.idCaso = idCaso;
        this.tipoDocumento = tipoDocumento;
        this.nombreArchivo = nombreArchivo;
        this.fechaSubida = fechaSubida;
        this.usuarioResponsable = usuarioResponsable;
        this.hashDocumento = hashDocumento;
    }
}

module.exports = Documento;
