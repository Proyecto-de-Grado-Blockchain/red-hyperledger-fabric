'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class ConsultarDocumentoWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
        this.maxDocumentos = 100; 
    }

    generateDocumentoId() {
        const docNumber = Math.floor(Math.random() * this.maxDocumentos) + 1; 
        return `doc_${docNumber}`;
    }

    async submitTransaction() {
        this.txIndex++;
        const documentoId = this.generateDocumentoId();

        const args = {
            contractId: 'blockchain_medicina_forense', 
            contractFunction: 'consultarDocumentos',   
            contractArguments: [documentoId],          
            readOnly: true                             
        };

        await this.sutAdapter.sendRequests(args);
    }
}

function createWorkloadModule() {
    return new ConsultarDocumentoWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
