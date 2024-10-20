'use strict';

const MockStub = require('../test/mockstub');
const BlockchainMedicinaForenseChaincode = require('../index');
const { expect } = require('chai');

describe('Blockchain Medicina Forense Chaincode', () => {
    let chaincode;
    let stub;
    let ctx;

    beforeEach(() => {
        chaincode = new BlockchainMedicinaForenseChaincode();
        stub = new MockStub();
        
        ctx = {
            stub: stub
        };
    });

    // Prueba para crear y consultar un usuario utilizando los métodos del chaincode
    it('debería crear y consultar un usuario correctamente', async () => {
        const usuario = {
            id: 'user1',
            nombreCompleto: 'Dr. Juan Pérez',
            correo: 'juan.perez@unbosque.edu.co',
            contrasena: 'hashed_password',
            rol: 'Medico Forense'
        };

        await chaincode.crearUsuario(ctx, usuario.id, usuario.nombreCompleto, usuario.correo, usuario.contrasena, usuario.rol);

        const consultarResponse = await chaincode.consultarUsuario(ctx, usuario.id);
        const result = JSON.parse(consultarResponse);

        expect(result).to.deep.equal(usuario);
    });

    // Prueba para crear y consultar un caso utilizando los métodos del chaincode
    it('debería crear y consultar un caso correctamente', async () => {
        const caso = {
            id: 'caso1',
            numeroCaso: 'CASO001',
            nombrePaciente: 'Juan Paciente',
            fechaCreacion: '2024-09-22',
            estado: 'Abierto',
            idUsuario: 'user1'
        };

        await chaincode.crearCaso(ctx, caso.id, caso.numeroCaso, caso.nombrePaciente, caso.fechaCreacion, caso.estado, caso.idUsuario);

        const consultarResponse = await chaincode.consultarCaso(ctx, caso.id);
        const result = JSON.parse(consultarResponse);

        expect(result).to.deep.equal(caso);
    });

    it('debería agregar y consultar un historial correctamente', async () => {
        const historial = {
            id: 'historial1',
            idCaso: 'caso1',
            fecha: '2024-09-22',
            descripcion: 'Descripción del historial',
            notas: 'Notas adicionales',
            usuarioResponsable: 'user1'
        };
    
        await chaincode.agregarHistorial(ctx, historial.id, historial.idCaso, historial.fecha, historial.descripcion, historial.notas, historial.usuarioResponsable);
    
        const consultarResponse = await chaincode.consultarHistorial(ctx, historial.id);
        const result = JSON.parse(consultarResponse);
    
        expect(result).to.deep.equal([historial]);
    });
    
    // Prueba para agregar y consultar un documento utilizando los métodos del chaincode
    it('debería agregar y consultar un documento correctamente', async () => {
        const documento = {
            id: 'doc1',
            idCaso: 'CASO007',
            tipoDocumento: 'Informe Forense',
            nombreArchivo: 'informe_forense.pdf',
            fechaSubida: '2024-10-10',
            usuarioResponsable: '1',
            hashDocumento: '9bb655eb61af872587e52b84ee47a101796e2bc7bdfeb27f1bcedef26590902a'
        };
    
        await chaincode.agregarDocumento(ctx, documento.id, documento.idCaso, documento.tipoDocumento, documento.nombreArchivo, documento.fechaSubida, documento.usuarioResponsable, documento.hashDocumento);
    
        const consultarResponse = await chaincode.consultarDocumentosCaso(ctx, documento.idCaso);
        const result = JSON.parse(consultarResponse);
    
        expect(result).to.deep.equal([documento]);
    });

    // Nueva prueba para consultar documentos por ID de caso
    it('debería consultar documentos por ID de caso correctamente', async () => {
        // Crear un caso
        const caso = {
            id: 'caso2',
            numeroCaso: 'CASO002',
            nombrePaciente: 'Maria Paciente',
            fechaCreacion: '2024-10-01',
            estado: 'En Proceso',
            idUsuario: 'user2'
        };
        await chaincode.crearCaso(ctx, caso.id, caso.numeroCaso, caso.nombrePaciente, caso.fechaCreacion, caso.estado, caso.idUsuario);

        // Crear múltiples documentos asociados al caso
        const documentos = [
            {
                id: 'doc2',
                idCaso: 'caso2',
                tipoDocumento: 'Informe Médico',
                nombreArchivo: 'informe_medico.pdf',
                fechaSubida: '2024-10-05',
                usuarioResponsable: 'user2',
                hashDocumento: 'hash_documento_2'
            },
            {
                id: 'doc3',
                idCaso: 'caso2',
                tipoDocumento: 'Informe Forense',
                nombreArchivo: 'informe_forense_caso2.pdf',
                fechaSubida: '2024-10-06',
                usuarioResponsable: 'user2',
                hashDocumento: 'hash_documento_3'
            },
            {
                id: 'doc4',
                idCaso: 'caso2',
                tipoDocumento: 'Análisis de Laboratorio',
                nombreArchivo: 'analisis_laboratorio.pdf',
                fechaSubida: '2024-10-07',
                usuarioResponsable: 'user2',
                hashDocumento: 'hash_documento_4'
            }
        ];

        // Agregar los documentos al ledger
        for (const doc of documentos) {
            await chaincode.agregarDocumento(ctx, doc.id, doc.idCaso, doc.tipoDocumento, doc.nombreArchivo, doc.fechaSubida, doc.usuarioResponsable, doc.hashDocumento);
        }

        // Consultar los documentos por ID de caso
        const consultarResponse = await chaincode.consultarDocumentosPorCaso(ctx, caso.id);
        const result = JSON.parse(consultarResponse);

        // Verificar que la lista de documentos coincida con los documentos creados
        expect(result).to.have.lengthOf(documentos.length);
        expect(result).to.deep.have.members(documentos);
    });

    
});
