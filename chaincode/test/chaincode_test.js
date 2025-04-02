'use strict';

// --- Imports ---
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { Context } = require('fabric-contract-api');
// Asegúrate de que la ruta al chaincode principal sea correcta
const BlockchainMedicinaForenseChaincode = require('../index');
// Asegúrate de que la ruta al MockStub sea correcta
const MockStub = require('./mockstub');

// --- Chai Setup ---
chai.should();
chai.use(chaiAsPromised);
const expect = chai.expect;

/**
 * Suite de pruebas para el chaincode BlockchainMedicinaForenseChaincode.
 * Utiliza un MockStub para simular la interacción con el ledger.
 */
describe('Blockchain Medicina Forense Chaincode', () => {
    let ctx; // Contexto de la transacción simulado
    let chaincode; // Instancia del chaincode bajo prueba
    let mockStub; // Stub simulado para interactuar con el estado del ledger

    /**
     * Configuración que se ejecuta antes de cada prueba ('it' block).
     * Crea nuevas instancias del chaincode, contexto y mock stub para asegurar el aislamiento entre pruebas.
     * IMPORTANTE: Usamos 'function()' aquí para que Mocha pueda enlazar 'this'
     * y podamos acceder a 'this.currentTest.title'.
     */
    beforeEach(function() { // <--- CAMBIO AQUÍ: Usa function() en lugar de () =>
        chaincode = new BlockchainMedicinaForenseChaincode();
        ctx = new Context();
        mockStub = new MockStub();
        ctx.stub = mockStub;
        // Ahora 'this.currentTest' estará definido por Mocha
        console.log(`\n--- Iniciando Prueba: ${this.currentTest.title} ---`); // <--- CAMBIO AQUÍ: Usa this.currentTest
    });

    // =========================================================================================
    // Pruebas para la gestión de Usuarios
    // =========================================================================================

    it('debería crear y consultar un usuario correctamente', async () => {
        // Arrange: Definir los datos del usuario a crear
        // Nota: Incluimos docType aquí porque la función crearUsuario (aunque no usa la clase) lo añade manualmente.
        const usuarioTestData = {
            docType: 'usuario', // Importante para la comparación profunda
            id: 'user1',
            nombreCompleto: 'Dr. Juan Pérez',
            correo: 'juan.perez@unbosque.edu.co',
            contrasena: 'hashed_password', // Recordar la advertencia de seguridad sobre esto
            rol: 'Medico Forense'
        };

        // Act: Llamar a la función crearUsuario del chaincode
        await chaincode.crearUsuario(ctx, usuarioTestData.id, usuarioTestData.nombreCompleto, usuarioTestData.correo, usuarioTestData.contrasena, usuarioTestData.rol);

        // Act: Llamar a la función consultarUsuario del chaincode
        const responseString = await chaincode.consultarUsuario(ctx, usuarioTestData.id);

        // Assert: Verificar que el usuario consultado coincide con los datos creados
        const result = JSON.parse(responseString);
        expect(result).to.deep.equal(usuarioTestData);
    });

    it('debería lanzar un error al consultar un usuario inexistente', async () => {
        // Arrange: ID de un usuario que no existe
        const nonExistentUserId = 'user_non_existent';

        // Act & Assert: Esperar que la consulta falle con un error específico
        await expect(chaincode.consultarUsuario(ctx, nonExistentUserId))
            .to.be.rejectedWith(Error, `El usuario con ID ${nonExistentUserId} no existe.`);
    });


    // =========================================================================================
    // Pruebas para la gestión de Casos
    // =========================================================================================

    it('debería crear y consultar un caso correctamente', async () => {
        // Arrange: Definir los datos del caso a crear. La clase Caso añadirá docType automáticamente.
        const casoTestData = {
            docType: 'caso', // La clase Caso lo añade, lo incluimos para la comparación
            id: 'caso1',
            numeroCaso: 'CASO001',
            nombrePaciente: 'Juan Paciente',
            fechaCreacion: '2024-09-22',
            estado: 'Abierto',
            idUsuario: 'user1'
        };

        // Act: Llamar a la función crearCaso del chaincode
        await chaincode.crearCaso(ctx, casoTestData.id, casoTestData.numeroCaso, casoTestData.nombrePaciente, casoTestData.fechaCreacion, casoTestData.estado, casoTestData.idUsuario);

        // Act: Llamar a la función consultarCaso del chaincode
        const responseString = await chaincode.consultarCaso(ctx, casoTestData.id);

        // Assert: Verificar que el caso consultado coincide con los datos creados
        const result = JSON.parse(responseString);
        expect(result).to.deep.equal(casoTestData);
    });

    it('debería lanzar un error al crear un caso con un ID existente', async () => {
        // Arrange: Crear un caso inicial
        const casoTestData = { id: 'caso_existente', numeroCaso: 'NC001', nombrePaciente: 'P1', fechaCreacion: 'F1', estado: 'E1', idUsuario: 'U1' };
        await chaincode.crearCaso(ctx, casoTestData.id, casoTestData.numeroCaso, casoTestData.nombrePaciente, casoTestData.fechaCreacion, casoTestData.estado, casoTestData.idUsuario);

        // Act & Assert: Intentar crear otro caso con el mismo ID y esperar un error
        await expect(chaincode.crearCaso(ctx, casoTestData.id, 'NC002', 'P2', 'F2', 'E2', 'U2'))
            .to.be.rejectedWith(Error, `El caso con ID ${casoTestData.id} ya existe.`);
    });

    it('debería lanzar un error al consultar un caso inexistente', async () => {
        // Arrange: ID de un caso que no existe
        const nonExistentCaseId = 'caso_non_existent';

        // Act & Assert: Esperar que la consulta falle con un error específico
        await expect(chaincode.consultarCaso(ctx, nonExistentCaseId))
            .to.be.rejectedWith(Error, `El caso con ID ${nonExistentCaseId} no existe.`);
    });

    // =========================================================================================
    // Pruebas para la gestión de Historial
    // =========================================================================================

    it('debería agregar y consultar un historial correctamente', async () => {
        // Arrange: Definir los datos de la entrada de historial. La clase Historial añadirá docType.
        const historialTestData = {
            docType: 'historial', // La clase Historial lo añade, lo incluimos para la comparación
            id: 'historial1',
            idCaso: 'caso1', // Asumimos que este caso podría existir o no, la prueba se centra en el historial
            fecha: '2024-09-22',
            descripcion: 'Descripción del historial',
            notas: 'Notas adicionales',
            usuarioResponsable: 'user1'
        };

        // Act: Llamar a la función agregarHistorial del chaincode
        await chaincode.agregarHistorial(ctx, historialTestData.id, historialTestData.idCaso, historialTestData.fecha, historialTestData.descripcion, historialTestData.notas, historialTestData.usuarioResponsable);

        // Act: Llamar a la función consultarHistorial del chaincode
        const responseString = await chaincode.consultarHistorial(ctx, historialTestData.id);

        // Assert: Verificar que el historial consultado (devuelto en un array) coincide
        const result = JSON.parse(responseString);
        expect(result).to.be.an('array').with.lengthOf(1);
        expect(result[0]).to.deep.equal(historialTestData);
    });

    it('debería lanzar un error al consultar un historial inexistente', async () => {
        // Arrange: ID de un historial que no existe
        const nonExistentHistorialId = 'historial_non_existent';

        // Act & Assert: Esperar que la consulta falle con un error específico
        await expect(chaincode.consultarHistorial(ctx, nonExistentHistorialId))
            .to.be.rejectedWith(Error, `La entrada de historial con ID ${nonExistentHistorialId} no existe.`);
    });


    // =========================================================================================
    // Pruebas para la gestión de Documentos
    // =========================================================================================

    it('debería agregar y consultar un documento por su ID correctamente', async () => {
        // Arrange: Definir los datos del documento. La clase Documento añadirá docType.
        const documentoTestData = {
            docType: 'documento', // La clase Documento lo añade, lo incluimos para la comparación
            id: 'doc1',
            idCaso: 'CASO007',
            tipoDocumento: 'Informe Forense',
            nombreArchivo: 'informe_forense.pdf',
            fechaSubida: '2024-10-10',
            usuarioResponsable: 'user_doc1',
            hashDocumento: 'hash_doc1'
        };

        // Act: Llamar a la función agregarDocumento del chaincode
        await chaincode.agregarDocumento(ctx, documentoTestData.id, documentoTestData.idCaso, documentoTestData.tipoDocumento, documentoTestData.nombreArchivo, documentoTestData.fechaSubida, documentoTestData.usuarioResponsable, documentoTestData.hashDocumento);

        // Act: Llamar a la función consultarDocumentos (que consulta por ID de documento)
        const responseString = await chaincode.consultarDocumentos(ctx, documentoTestData.id);

        // Assert: Verificar que el documento consultado (devuelto en un array) coincide
        const result = JSON.parse(responseString);
        expect(result).to.be.an('array').with.lengthOf(1);
        expect(result[0]).to.deep.equal(documentoTestData);
    });


    it('debería consultar documentos por ID de caso correctamente', async () => {
        // Arrange: Crear un caso para asociar documentos
        const casoTestData = { docType: 'caso', id: 'caso_docs', numeroCaso: 'NCD001', nombrePaciente: 'Paciente Docs', fechaCreacion: 'F_Docs', estado: 'E_Docs', idUsuario: 'U_Docs' };
        await chaincode.crearCaso(ctx, casoTestData.id, casoTestData.numeroCaso, casoTestData.nombrePaciente, casoTestData.fechaCreacion, casoTestData.estado, casoTestData.idUsuario);

        // Arrange: Definir múltiples documentos asociados al mismo caso.
        const documentosTestData = [
            { docType: 'documento', id: 'docA', idCaso: casoTestData.id, tipoDocumento: 'TD_A', nombreArchivo: 'NA_A', fechaSubida: 'FS_A', usuarioResponsable: 'UR_A', hashDocumento: 'H_A' },
            { docType: 'documento', id: 'docB', idCaso: casoTestData.id, tipoDocumento: 'TD_B', nombreArchivo: 'NA_B', fechaSubida: 'FS_B', usuarioResponsable: 'UR_B', hashDocumento: 'H_B' },
            { docType: 'documento', id: 'docC', idCaso: 'otro_caso', tipoDocumento: 'TD_C', nombreArchivo: 'NA_C', fechaSubida: 'FS_C', usuarioResponsable: 'UR_C', hashDocumento: 'H_C' } // Documento de otro caso
        ];

        // Arrange: Agregar los documentos al ledger
        for (const doc of documentosTestData) {
            await chaincode.agregarDocumento(ctx, doc.id, doc.idCaso, doc.tipoDocumento, doc.nombreArchivo, doc.fechaSubida, doc.usuarioResponsable, doc.hashDocumento);
        }

        // Act: Consultar documentos por el ID del caso específico ('caso_docs')
        const responseString = await chaincode.consultarDocumentosCaso(ctx, casoTestData.id);

        // Assert: Verificar que se devuelven solo los documentos asociados a 'caso_docs'
        const result = JSON.parse(responseString);
        expect(result).to.be.an('array').with.lengthOf(2); // Solo docA y docB
        // Usar deep.have.members para comparar arrays sin importar el orden
        expect(result).to.deep.have.members([documentosTestData[0], documentosTestData[1]]);
        // Asegurarse de que el documento del otro caso no está presente
        expect(result).to.not.deep.include(documentosTestData[2]);
    });

    it('debería devolver un array vacío al consultar documentos de un caso sin documentos', async () => {
        // Arrange: Crear un caso que no tendrá documentos asociados
        const casoSinDocsId = 'caso_sin_docs';
        await chaincode.crearCaso(ctx, casoSinDocsId, 'NCSD001', 'Paciente Sin Docs', 'F_SD', 'E_SD', 'U_SD');

        // Act: Consultar documentos para ese caso
        const responseString = await chaincode.consultarDocumentosCaso(ctx, casoSinDocsId);

        // Assert: Verificar que el resultado es un array vacío
        const result = JSON.parse(responseString);
        expect(result).to.be.an('array').that.is.empty;
    });


    // =========================================================================================
    // Pruebas para Consultas por Estado (Rich Queries)
    // =========================================================================================

    it('debería consultar casos por estado correctamente', async () => {
        // Arrange: Crear varios casos con diferentes estados y un objeto no-caso
        const casoActivo1 = { docType: 'caso', id: 'CASO_A1', numeroCaso: 'NCA001', nombrePaciente: 'Paciente Activo Uno', fechaCreacion: '2024-01-10', estado: 'Activo', idUsuario: 'user1' };
        const casoActivo2 = { docType: 'caso', id: 'CASO_A2', numeroCaso: 'NCA002', nombrePaciente: 'Paciente Activo Dos', fechaCreacion: '2024-01-15', estado: 'Activo', idUsuario: 'user2' };
        const casoCerrado1 = { docType: 'caso', id: 'CASO_C1', numeroCaso: 'NCC001', nombrePaciente: 'Paciente Cerrado Uno', fechaCreacion: '2024-01-05', estado: 'Cerrado', idUsuario: 'user1' };
        const casoPendiente1 = { docType: 'caso', id: 'CASO_P1', numeroCaso: 'NCP001', nombrePaciente: 'Paciente Pendiente Uno', fechaCreacion: '2024-01-20', estado: 'Pendiente', idUsuario: 'user3' };
        const objetoNoCaso = { docType: 'usuario', id: 'USER_TEST', nombreCompleto: 'Test User Query', correo: 't@q.com', contrasena: 'tp', rol: 'Tester' }; // Para asegurar que el filtro docType funciona

        await chaincode.crearCaso(ctx, casoActivo1.id, casoActivo1.numeroCaso, casoActivo1.nombrePaciente, casoActivo1.fechaCreacion, casoActivo1.estado, casoActivo1.idUsuario);
        await chaincode.crearCaso(ctx, casoActivo2.id, casoActivo2.numeroCaso, casoActivo2.nombrePaciente, casoActivo2.fechaCreacion, casoActivo2.estado, casoActivo2.idUsuario);
        await chaincode.crearCaso(ctx, casoCerrado1.id, casoCerrado1.numeroCaso, casoCerrado1.nombrePaciente, casoCerrado1.fechaCreacion, casoCerrado1.estado, casoCerrado1.idUsuario);
        await chaincode.crearCaso(ctx, casoPendiente1.id, casoPendiente1.numeroCaso, casoPendiente1.nombrePaciente, casoPendiente1.fechaCreacion, casoPendiente1.estado, casoPendiente1.idUsuario);
        // Usar crearUsuario para el objetoNoCaso (o putState directo si la prueba no necesita la lógica de crearUsuario)
        await chaincode.crearUsuario(ctx, objetoNoCaso.id, objetoNoCaso.nombreCompleto, objetoNoCaso.correo, objetoNoCaso.contrasena, objetoNoCaso.rol);
        // await ctx.stub.putState(objetoNoCaso.id, Buffer.from(JSON.stringify(objetoNoCaso))); // Alternativa si no se usa crearUsuario


        // Act 1: Consultar casos con estado 'Activo'
        const responseActivos = await chaincode.consultarCasosPorEstado(ctx, 'Activo');
        const resultActivos = JSON.parse(responseActivos);

        // Assert 1: Verificar resultados para 'Activo'
        expect(resultActivos).to.be.an('array').with.lengthOf(2);
        expect(resultActivos).to.deep.have.members([casoActivo1, casoActivo2]); // Orden no garantizado

        // Act 2: Consultar casos con estado 'Cerrado'
        const responseCerrados = await chaincode.consultarCasosPorEstado(ctx, 'Cerrado');
        const resultCerrados = JSON.parse(responseCerrados);

        // Assert 2: Verificar resultados para 'Cerrado'
        expect(resultCerrados).to.be.an('array').with.lengthOf(1);
        expect(resultCerrados).to.deep.have.members([casoCerrado1]);

        // Act 3: Consultar casos con estado 'Inexistente'
        const responseInexistente = await chaincode.consultarCasosPorEstado(ctx, 'EstadoInexistente');
        const resultInexistente = JSON.parse(responseInexistente);

        // Assert 3: Verificar resultados para 'Inexistente'
        expect(resultInexistente).to.be.an('array').that.is.empty;

        // Act 4 & Assert 4: Probar casos de error (estado vacío, null, undefined)
        await expect(chaincode.consultarCasosPorEstado(ctx, '')).to.be.rejectedWith(Error, 'El estado para la consulta no puede estar vacío');
        await expect(chaincode.consultarCasosPorEstado(ctx, null)).to.be.rejectedWith(Error, 'El estado para la consulta no puede estar vacío');
        await expect(chaincode.consultarCasosPorEstado(ctx, undefined)).to.be.rejectedWith(Error, 'El estado para la consulta no puede estar vacío');
    });

});