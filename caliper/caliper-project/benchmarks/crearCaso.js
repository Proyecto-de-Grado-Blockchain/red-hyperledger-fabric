'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class CrearCasoWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
        this.maxCasos = 100; 
    }

    generateCasoId() {
        this.txIndex += 1;
        return `case_${this.txIndex}`;
    }

    generateNumeroCaso() {
        const numero = 1000 + this.txIndex; 
        return `NC-${numero}`;
    }

    generateFechaCreacion() {
        return new Date().toISOString();
    }

    generateEstado() {
        const estados = ['Abierto', 'En Progreso', 'Cerrado'];
        return estados[Math.floor(Math.random() * estados.length)];
    }

    generateIdUsuario() {
        const userNumber = Math.floor(Math.random() * 10) + 1; 
        return `user_${userNumber}`;
    }

    async submitTransaction() {
        if (this.txIndex >= this.maxCasos) {
            // Evita crear más casos de los definidos
            return;
        }

        const casoId = this.generateCasoId();
        const numeroCaso = this.generateNumeroCaso();
        const nombrePaciente = `Paciente_${casoId}`;
        const fechaCreacion = this.generateFechaCreacion();
        const estado = this.generateEstado();
        const idUsuario = this.generateIdUsuario();

        const args = {
            contractId: 'blockchain_medicina_forense', 
            contractFunction: 'crearCaso',          
            contractArguments: [
                casoId,
                numeroCaso,
                nombrePaciente,
                fechaCreacion,
                estado,
                idUsuario
            ],
            readOnly: false
        };
        
        await this.sutAdapter.sendRequests(args);

    }
}

function createWorkloadModule() {
    return new CrearCasoWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
