'use strict';

/**
 * Representa un Documento asociado a un Caso específico en el ledger.
 */
class Documento {
    /**
     * Construye una instancia de Documento.
     *
     * @param {string} id - Identificador único para el documento.
     * @param {string} idCaso - ID del Caso al que pertenece este documento. Establece la relación.
     * @param {string} tipoDocumento - Categoría o tipo del documento.
     * @param {string} nombreArchivo - Nombre original o descriptivo del archivo.
     * @param {string} fechaSubida - Marca de tiempo o fecha ISO8601 de cuándo se subió o registró el documento.
     * @param {string} usuarioResponsable - ID del usuario que subió o registró el documento.
     * @param {string} hashDocumento - Hash criptográfico (ej. SHA-256) del contenido del documento. Esencial para verificar la integridad.
     */
    constructor(id, idCaso, tipoDocumento, nombreArchivo, fechaSubida, usuarioResponsable, hashDocumento) {
        this.docType = 'documento'; // Identificador del tipo de objeto
        this.id = id;
        this.idCaso = idCaso;
        this.tipoDocumento = tipoDocumento;
        this.nombreArchivo = nombreArchivo;
        this.fechaSubida = fechaSubida;
        this.usuarioResponsable = usuarioResponsable;
        this.hashDocumento = hashDocumento; // Importante para la inmutabilidad y auditoría

        // Validación básica
        if (!id || !idCaso || !tipoDocumento || !nombreArchivo || !fechaSubida || !usuarioResponsable || !hashDocumento) {
            throw new Error('Todos los campos del documento son obligatorios');
        }
    }
}

module.exports = Documento;
