'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class ConsultarUsuarioWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
    }

    async submitTransaction() {
        this.txIndex++;
        const userId = `user_${this.workerIndex}_${this.txIndex}`;
        const args = {
            contractId: 'blockchain_medicina_forense',
            contractFunction: 'consultarUsuario',
            contractArguments: [userId],
            readOnly: true
        };
        await this.sutAdapter.sendRequests(args);
    }
}

function createWorkloadModule() {
    return new ConsultarUsuarioWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
