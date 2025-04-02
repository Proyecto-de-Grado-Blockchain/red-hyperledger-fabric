'use strict';

/**
 * Representa un Caso en el ledger.
 * Cada instancia de Caso es un activo distinto rastreado por el chaincode.
 */
class Caso {
    /**
     * Construye una instancia de Caso.
     *
     * @param {string} id - Identificador único para el caso (usualmente UUID o similar).
     * @param {string} numeroCaso - Número o código de identificación legible del caso.
     * @param {string} nombrePaciente - Nombre del paciente asociado al caso.
     * @param {string} fechaCreacion - Marca de tiempo o fecha ISO8601 de cuándo se creó el caso.
     * @param {string} estado - Estado actual del caso (ej. 'Abierto', 'En Proceso', 'Cerrado'). Es importante mantener la consistencia.
     * @param {string} idUsuario - ID del usuario (registrado en el sistema) que creó o está asignado al caso.
     */
    constructor(id, numeroCaso, nombrePaciente, fechaCreacion, estado, idUsuario) {
        // docType ayuda a distinguir tipos de objetos en consultas complejas (rich queries)
        this.docType = 'caso';
        this.id = id;
        this.numeroCaso = numeroCaso;
        this.nombrePaciente = nombrePaciente;
        this.fechaCreacion = fechaCreacion;
        this.estado = estado;
        this.idUsuario = idUsuario;

        // Validación básica (opcional pero recomendada)
        if (!id || !numeroCaso || !nombrePaciente || !fechaCreacion || !estado || !idUsuario) {
            throw new Error('Todos los campos del caso son obligatorios');
        }
    }
}

module.exports = Caso;
