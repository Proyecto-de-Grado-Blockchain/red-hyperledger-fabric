'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class CrearUsuarioWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
    }

    async submitTransaction() {
        this.txIndex++;
        const userId = `user_${this.workerIndex}_${this.txIndex}`;
        const args = {
            contractId: 'blockchain_medicina_forense',
            contractFunction: 'crearUsuario',
            contractArguments: [
                userId,
                `Nombre Completo ${userId}`,
                `correo${userId}@ejemplo.com`,
                'contrasena123',
                'rolUsuario'
            ],
            readOnly: false
        };
        await this.sutAdapter.sendRequests(args);
    }
}

function createWorkloadModule() {
    return new CrearUsuarioWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
