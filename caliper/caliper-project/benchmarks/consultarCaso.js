'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class ConsultarCasoWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
        this.maxCasos = 100;
    }

    generateCasoId() {
        const casoNumber = Math.floor(Math.random() * this.maxCasos) + 1; 
        return `case_${casoNumber}`;
    }

    async submitTransaction() {
        this.txIndex++;
        const casoId = this.generateCasoId();

        const args = {
            contractId: 'blockchain_medicina_forense',
            contractFunction: 'consultarCaso',        
            contractArguments: [casoId],              
            readOnly: true                            
        };

        await this.sutAdapter.sendRequests(args);
    }
}

function createWorkloadModule() {
    return new ConsultarCasoWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
