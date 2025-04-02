'use strict';

/**
 * Representa una entrada en el historial de eventos o acciones realizadas sobre un Caso.
 */
class Historial {
    /**
     * Construye una instancia de Historial.
     *
     * @param {string} id - Identificador único para esta entrada de historial.
     * @param {string} idCaso - ID del Caso al que pertenece esta entrada de historial.
     * @param {string} fecha - Marca de tiempo o fecha ISO8601 del evento.
     * @param {string} descripcion - Breve descripción de la acción o evento ocurrido (ej. 'Caso Creado', 'Documento Añadido', 'Estado Cambiado a Cerrado').
     * @param {string} notas - Notas adicionales o detalles sobre el evento (opcional, podría ser '').
     * @param {string} usuarioResponsable - ID del usuario que realizó la acción o está asociado al evento.
     */
    constructor(id, idCaso, fecha, descripcion, notas, usuarioResponsable) {
        this.docType = 'historial'; // Identificador del tipo de objeto
        this.id = id;
        this.idCaso = idCaso;
        this.fecha = fecha;
        this.descripcion = descripcion;
        this.notas = notas; // Puede ser un campo opcional o requerir '' si no hay notas.
        this.usuarioResponsable = usuarioResponsable;

        // Validación básica
        if (!id || !idCaso || !fecha || !descripcion || !usuarioResponsable) {
             // Se asume que 'notas' puede ser opcional o vacío
            throw new Error('Los campos id, idCaso, fecha, descripcion y usuarioResponsable del historial son obligatorios');
        }
    }
}

module.exports = Historial;
