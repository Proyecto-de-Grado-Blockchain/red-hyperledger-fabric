// benchmarks/workloads/benchmark.js

'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        // Inicialización antes de que comience el benchmark
        this.txType = roundArguments.txType;
        this.workerIndex = workerIndex;
    }

    async submitTransaction() {
        if (this.txType === 'crearUsuario') {
            const id = `user_${this.workerIndex}_${Date.now()}`;
            const nombreCompleto = 'Nombre Apellido';
            const correo = `correo_${id}@example.com`;
            const contrasena = 'password';
            const rol = 'usuario';

            const args = [id, nombreCompleto, correo, contrasena, rol];

            await this.sutAdapter.sendRequests({
                contract: 'blockchainmedicinaforense',
                contractFunction: 'crearUsuario',
                contractArguments: args,
                invokerIdentity: 'Admin',
                readOnly: false
            });
        } else if (this.txType === 'consultarUsuario') {
            const id = `user_${this.workerIndex}_${Date.now()}`;

            const args = [id];

            await this.sutAdapter.sendRequests({
                contract: 'blockchainmedicinaforense',
                contractFunction: 'consultarUsuario',
                contractArguments: args,
                invokerIdentity: 'Admin',
                readOnly: true
            });
        }
        // Agrega más condiciones para otros tipos de transacciones si es necesario
    }

    async cleanupWorkloadModule() {
        // Limpieza después de que finalice el benchmark
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;