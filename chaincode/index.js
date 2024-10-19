'use strict';

const { Contract, Context } = require('fabric-contract-api');
const Usuario = require('./lib/usuario');
const Caso = require('./lib/caso');
const Historial = require('./lib/historial');
const Documento = require('./lib/documento');

class BlockchainMedicinaForenseContext extends Context {
    constructor() {
        super();
    }
}

class BlockchainMedicinaForenseChaincode extends Contract {

    constructor() {
        super('org.unbosque.blockchainmedicinaforense');
    }

    createContext() {
        return new BlockchainMedicinaForenseContext();
    }

    async initLedger(ctx) {
        console.log('Ledger initialized');
    }

    async crearUsuario(ctx, id, nombreCompleto, correo, contrasena, rol) {
        const usuario = { id, nombreCompleto, correo, contrasena, rol };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(usuario)));
        return JSON.stringify(usuario);
    }

    async consultarUsuario(ctx, id) {
        const usuarioJSON = await ctx.stub.getState(id);
        if (!usuarioJSON || usuarioJSON.length === 0) {
            throw new Error(`Usuario con ID ${id} no existe`);
        }
        return usuarioJSON.toString();
    }

    async crearCaso(ctx, id, numeroCaso, nombrePaciente, fechaCreacion, estado, idUsuario) {
        const caso = new Caso(id, numeroCaso, nombrePaciente, fechaCreacion, estado, idUsuario);
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(caso)));
        return JSON.stringify(caso);
    }

    async consultarCaso(ctx, id) {
        const casoJSON = await ctx.stub.getState(id);
        if (!casoJSON || casoJSON.length === 0) {
            throw new Error(`Caso con ID ${id} no existe`);
        }
        return casoJSON.toString();
    }

    async agregarHistorial(ctx, id, idCaso, fecha, descripcion, notas, usuarioResponsable) {
        const historial = new Historial(id, idCaso, fecha, descripcion, notas, usuarioResponsable);
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(historial)));
        return JSON.stringify(historial);
    }

    async consultarHistorial(ctx, idHistorial) {
        const historialJSON = await ctx.stub.getState(idHistorial); // Buscar por el id del historial
        if (!historialJSON || historialJSON.length === 0) {
            throw new Error(`Historial con ID ${idHistorial} no existe`);
        }
        return JSON.stringify([JSON.parse(historialJSON.toString())]);  // Devolver como un array de un solo elemento
    }    

    async agregarDocumento(ctx, id, idCaso, tipoDocumento, nombreArchivo, fechaSubida, usuarioResponsable, hashDocumento) {
        const documento = new Documento(id, idCaso, tipoDocumento, nombreArchivo, fechaSubida, usuarioResponsable, hashDocumento);
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(documento)));
        return JSON.stringify(documento);
    }

    async consultarDocumentos(ctx, idDocumento) {
        const documentoJSON = await ctx.stub.getState(idDocumento);  // Buscar por el id del documento
        if (!documentoJSON || documentoJSON.length === 0) {
            throw new Error(`Documento con ID ${idDocumento} no existe`);
        }
        return JSON.stringify([JSON.parse(documentoJSON.toString())]);  // Devolver como un array de un solo elemento
    }

    async consultarDocumentosPorCaso(ctx, idCaso) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();

        while (!result.done) {
            if (result.value && result.value.value.toString()) {
                const obj = JSON.parse(result.value.value.toString());
                // Verificar si el objeto es un Documento y si el idCaso coincide
                // Asumimos que los documentos tienen la propiedad 'tipoDocumento'
                if (obj.tipoDocumento && obj.idCaso === idCaso) {
                    allResults.push(obj);
                }
            }
            result = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(allResults);
    }


    
}

module.exports = BlockchainMedicinaForenseChaincode;
