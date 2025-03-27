'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class CrearDocumentoWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 0;
    }

    generateDocumentoId() {
        const docNumber = this.txIndex + 1;
        return `doc_${docNumber}`;
    }

    generateHashDocumento() {
        return `hash_${Math.random().toString(36).substring(2, 15)}`;
    }

    async submitTransaction() {
        this.txIndex++;
        const documentoId = this.generateDocumentoId();
        const casoId = `case_${Math.floor(Math.random() * 10)}`; 
        const tipoDocumento = `tipo_${Math.floor(Math.random() * 5)}`;
        const nombreArchivo = `archivo_${documentoId}.pdf`;
        const fechaSubida = new Date().toISOString();
        const usuarioResponsable = `user_${Math.floor(Math.random() * 100)}`; 
        const hashDocumento = this.generateHashDocumento();

        const args = {
            contractId: 'blockchain_medicina_forense', 
            contractFunction: 'agregarDocumento',      
            contractArguments: [
                documentoId,
                casoId,
                tipoDocumento,
                nombreArchivo,
                fechaSubida,
                usuarioResponsable,
                hashDocumento
            ],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(args);

    }
}

function createWorkloadModule() {
    return new CrearDocumentoWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
