'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class CreateCasesWorkload extends WorkloadModuleBase {

    constructor() {
        super();
    }

    /**
     * Método de inicialización
     */
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    }

    /**
     * Método para ejecutar la transacción
     */
    async submitTransaction() {
        const args = this.roundArguments.contractArguments.map(arg => arg.replace('{n}', this.getNextId()));
        const response = await this.sutAdapter.sendRequests({
            contractId: this.roundArguments.contract,
            contractVersion: this.roundArguments.contractVersion,
            contractFunction: this.roundArguments.contractFunction,
            contractArguments: args,
            readOnly: false
        });
        return response;
    }

    /**
     * Método de limpieza
     */
    async cleanupWorkloadModule() {
        await super.cleanupWorkloadModule();
    }

    /**
     * Método para generar un ID único (puedes personalizar según tus necesidades)
     */
    getNextId() {
        return Math.floor(Math.random() * 1000000);
    }
}

function createWorkloadModule() {
    return new CreateCasesWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;