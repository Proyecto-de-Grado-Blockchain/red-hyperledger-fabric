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
            idCaso: 'caso1',
            tipoDocumento: 'Informe',
            nombreArchivo: 'informe.pdf',
            fechaSubida: '2024-09-22',
            usuarioResponsable: 'user1'
        };
    
        await chaincode.agregarDocumento(ctx, documento.id, documento.idCaso, documento.tipoDocumento, documento.nombreArchivo, documento.fechaSubida, documento.usuarioResponsable);
    
        const consultarResponse = await chaincode.consultarDocumentos(ctx, documento.id);
        const result = JSON.parse(consultarResponse);
    
        expect(result).to.deep.equal([documento]);
    });
});
