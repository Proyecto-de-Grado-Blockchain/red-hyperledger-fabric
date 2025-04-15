'use strict';

// Importaciones necesarias de fabric-shim y las clases de modelo
const { Contract, Context } = require('fabric-contract-api');
const Usuario = require('./lib/usuario'); // Asegúrate que la ruta sea correcta
const Caso = require('./lib/caso');       // Asegúrate que la ruta sea correcta
const Historial = require('./lib/historial'); // Asegúrate que la ruta sea correcta
const Documento = require('./lib/documento'); // Asegúrate que la ruta sea correcta

/**
 * Contexto personalizado para el chaincode de Medicina Forense.
 * Puede extenderse en el futuro para añadir lógica específica del contexto.
 */
class BlockchainMedicinaForenseContext extends Context {
    constructor() {
        super();
        // Aquí se podrían añadir propiedades o métodos específicos del contexto si fueran necesarios.
        // Ejemplo: this.myCustomLogic = new MyCustomLogic(this);
    }
}

/**
 * Chaincode principal para la gestión de casos de Medicina Forense en Blockchain.
 * Define las transacciones que pueden ser invocadas en el ledger.
 */
class BlockchainMedicinaForenseChaincode extends Contract {

    /**
     * Constructor del Chaincode.
     * Establece un nombre único para este smart contract en la red.
     */
    constructor() {
        // El namespace identifica unívocamente a este chaincode
        super('org.unbosque.blockchainmedicinaforense');
    }

    /**
     * Crea una instancia del contexto personalizado para cada invocación de transacción.
     * @returns {BlockchainMedicinaForenseContext} El contexto personalizado.
     */
    createContext() {
        return new BlockchainMedicinaForenseContext();
    }

    /**
     * Función de inicialización del ledger.
     * Se llama durante la instanciación o actualización del chaincode.
     * Puede usarse para poblar el ledger con datos iniciales si es necesario.
     * @param {BlockchainMedicinaForenseContext} ctx El contexto de la transacción.
     */
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        // Actualmente no se inicializa con datos, solo se registra el log.
        // Aquí se podrían añadir usuarios iniciales, configuraciones, etc.
        // Ejemplo: await this.crearUsuario(ctx, 'admin', 'Admin User', 'admin@example.com', 'adminpass', 'Administrador');
        console.info('============= END : Initialize Ledger ===========');
    }

    // =========================================================================================
    // Métodos para la gestión de Usuarios
    // =========================================================================================

    /**
     * Crea un nuevo usuario en el ledger.
     * @param {BlockchainMedicinaForenseContext} ctx El contexto de la transacción.
     * @param {string} id ID único del usuario.
     * @param {string} nombreCompleto Nombre completo del usuario.
     * @param {string} correo Correo electrónico del usuario.
     * @param {string} contrasena Contraseña (¡Advertencia! Ver modelo Usuario sobre seguridad).
     * @param {string} rol Rol del usuario en el sistema.
     * @returns {string} El objeto Usuario creado, en formato JSON string.
     * @throws {Error} Si el número de argumentos es incorrecto.
     * @todo Considerar usar `new Usuario(...)` para consistencia con otros métodos y para incluir `docType`.
     */
    async crearUsuario(ctx, id, nombreCompleto, correo, contrasena, rol) {

        // Validación básica de argumentos (alternativa si no se desestructuran)
        // if (arguments.length !== 6) { // ctx es el primer argumento implícito
        //     throw new Error('Número incorrecto de argumentos. Se esperan 5: id, nombreCompleto, correo, contrasena, rol');
        // }

        // Crear objeto plano (como en el código original)
        // Nota: Esto NO incluye `docType` automáticamente. Para queries por tipo, sería mejor usar la clase.
        const usuario = {
            docType: 'usuario', // Añadido manualmente para consistencia en queries
            id: id,
            nombreCompleto: nombreCompleto,
            correo: correo,
            contrasena: contrasena, // Recordar advertencia de seguridad
            rol: rol
        };

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(usuario)));
        return JSON.stringify(usuario);
    }

    /**
     * Consulta un usuario existente por su ID.
     * @param {BlockchainMedicinaForenseContext} ctx El contexto de la transacción.
     * @param {string} id ID del usuario a consultar.
     * @returns {string} El objeto Usuario encontrado, en formato JSON string.
     * @throws {Error} Si el usuario con el ID especificado no existe.
     */
    async consultarUsuario(ctx, id) {
        if (!id) {
            throw new Error('El ID del usuario no puede estar vacío.');
        }

        const usuarioJSON = await ctx.stub.getState(id);
        if (!usuarioJSON || usuarioJSON.length === 0) {
            throw new Error(`El usuario con ID ${id} no existe.`);
        }
        return usuarioJSON.toString();
    }

    // =========================================================================================
    // Métodos para la gestión de Casos
    // =========================================================================================

    /**
     * Crea un nuevo caso en el ledger.
     * @param {BlockchainMedicinaForenseContext} ctx El contexto de la transacción.
     * @param {string} id ID único del caso.
     * @param {string} numeroCaso Número o código legible del caso.
     * @param {string} nombrePaciente Nombre del paciente asociado.
     * @param {string} fechaCreacion Fecha/timestamp de creación.
     * @param {string} estado Estado inicial del caso (e.g., 'Abierto').
     * @param {string} idUsuario ID del usuario que crea el caso.
     * @returns {string} El objeto Caso creado, en formato JSON string.
     * @throws {Error} Si ya existe un caso con el mismo ID.
     */
    async crearCaso(ctx, id, numeroCaso, nombrePaciente, fechaCreacion, estado, idUsuario) {
        
        const casoExistente = await ctx.stub.getState(id);
        if (casoExistente && casoExistente.length > 0) {
            throw new Error(`El caso con ID ${id} ya existe.`);
        }

        // Usar la clase Modelo para crear la instancia (incluye docType)
        const caso = new Caso(id, numeroCaso, nombrePaciente, fechaCreacion, estado, idUsuario);

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(caso)));
        return JSON.stringify(caso);
    }

    async actualizarCaso(ctx, id, estado, newValue) {
        /*
        const exists = await this.documentExists(ctx, id);
        if (!exists) {
            throw new Error(`El caso ${id} no existe`);
        }*/
    
        const data = await ctx.stub.getState(id);
        const document = JSON.parse(data.toString());
    
        if (!document.hasOwnProperty(estado)) {
            throw new Error(`El campo '${estado}' no existe en el documento`);
        }
    
        document[estado] = newValue;
    
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(document)));
    
        return JSON.stringify(document);
    }

    /**
     * Consulta un caso existente por su ID.
     * @param {BlockchainMedicinaForenseContext} ctx El contexto de la transacción.
     * @param {string} id ID del caso a consultar.
     * @returns {string} El objeto Caso encontrado, en formato JSON string.
     * @throws {Error} Si el caso con el ID especificado no existe.
     */
    async consultarCaso(ctx, id) {
        if (!id) {
            throw new Error('El ID del caso no puede estar vacío.');
        }

        const casoJSON = await ctx.stub.getState(id);
        if (!casoJSON || casoJSON.length === 0) {
            throw new Error(`El caso con ID ${id} no existe.`);
        }
        return casoJSON.toString();
    }

    /**
     * Consulta casos filtrando por su estado.
     * @param {BlockchainMedicinaForenseContext} ctx El contexto de la transacción.
     * @param {string} estado El estado por el cual filtrar los casos (e.g., 'Abierto', 'Cerrado').
     * @returns {string} Un array de objetos Caso que coinciden con el estado, en formato JSON string.
     * @throws {Error} Si el estado no se proporciona.
     */
    async consultarCasosPorEstado(ctx, estado) {
        if (!estado) {
            throw new Error('El estado para la consulta no puede estar vacío');
        }

        // Query usando el docType y el estado para precisión
        const queryString = JSON.stringify({
            selector: {
                docType: 'caso', // Asegura que solo se obtengan objetos de tipo Caso
                estado: estado
            }
        });
        const resultados = await this.consultarPorQuery(ctx, queryString)
        return resultados; // consultarPorQuery ya retorna un string JSON
    }       

    // =========================================================================================
    // Métodos para la gestión del Historial de Casos
    // =========================================================================================

    /**
     * Agrega una nueva entrada al historial de un caso.
     * @param {BlockchainMedicinaForenseContext} ctx El contexto de la transacción.
     * @param {string} id ID único para esta entrada de historial.
     * @param {string} idCaso ID del caso al que pertenece la entrada.
     * @param {string} fecha Fecha/timestamp del evento.
     * @param {string} descripcion Descripción del evento.
     * @param {string} notas Notas adicionales (puede ser vacío).
     * @param {string} usuarioResponsable ID del usuario responsable del evento.
     * @returns {string} El objeto Historial creado, en formato JSON string.
      * @throws {Error} Si ya existe una entrada de historial con el mismo ID.
     */
    async agregarHistorial(ctx, id, idCaso, fecha, descripcion, notas, usuarioResponsable) {

        const historialExistente = await ctx.stub.getState(id);
        if (historialExistente && historialExistente.length > 0) {
            throw new Error(`La entrada de historial con ID ${id} ya existe.`);
        }

        // Usar la clase Modelo para crear la instancia (incluye docType)
        const historial = new Historial(id, idCaso, fecha, descripcion, notas, usuarioResponsable);

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(historial)));
        return JSON.stringify(historial);
    }

    /**
     * Consulta una entrada específica del historial por su ID.
     * @param {BlockchainMedicinaForenseContext} ctx El contexto de la transacción.
     * @param {string} idHistorial ID de la entrada de historial a consultar.
     * @returns {string} Un array JSON string conteniendo la entrada de historial encontrada.
     * @throws {Error} Si la entrada de historial no existe.
     */
    async consultarHistorial(ctx, idHistorial) {
        if (!idHistorial) {
            throw new Error('El ID del historial no puede estar vacío.');
        }

        const historialJSON = await ctx.stub.getState(idHistorial);
        if (!historialJSON || historialJSON.length === 0) {
            throw new Error(`La entrada de historial con ID ${idHistorial} no existe.`);
        }

        // Devuelve como array para mantener consistencia con queries, aunque sea un solo elemento
        return JSON.stringify([JSON.parse(historialJSON.toString())]);
    }

    /**
     * Consulta todos las historias asociadas a un caso específico.
     * @param {BlockchainMedicinaForenseContext} ctx El contexto de la transacción.
     * @param {string} idCaso ID del caso cuya historia se quiere consultar.
     * @returns {string} Un array de objetos historias asociadas al caso, en formato JSON string.
     * @throws {Error} Si el idCaso no se proporciona.
     */
    async consultarHistorialCaso(ctx, idCaso) {
        if (!idCaso) {
            throw new Error('El ID del caso no puede estar vacío.');
        }

        // Query usando docType y idCaso para obtener solo las historias de ese caso
        const queryString = JSON.stringify({
            selector: {
                docType: 'historial', // Asegura que solo se obtengan objetos de tipo Historial
                idCaso: idCaso
            }
            // Opcional: Añadir sort si se desea un orden específico, ej:
            // sort: [{ 'fechaSubida': 'asc' }]
        });
        const resultados = await this.consultarPorQuery(ctx, queryString);
        return resultados; // consultarPorQuery ya retorna un string JSON
    }

    // =========================================================================================
    // Métodos para la gestión de Documentos asociados a Casos
    // =========================================================================================

    /**
     * Agrega un nuevo documento asociado a un caso.
     * @param {BlockchainMedicinaForenseContext} ctx El contexto de la transacción.
     * @param {string} id ID único del documento.
     * @param {string} idCaso ID del caso al que se asocia el documento.
     * @param {string} tipoDocumento Tipo o categoría del documento.
     * @param {string} nombreArchivo Nombre del archivo.
     * @param {string} fechaSubida Fecha/timestamp de subida.
     * @param {string} usuarioResponsable ID del usuario que sube el documento.
     * @param {string} hashDocumento Hash criptográfico del contenido del documento.
     * @returns {string} El objeto Documento creado, en formato JSON string.
     * @throws {Error} Si ya existe un documento con el mismo ID.
     */
    async agregarDocumento(ctx, id, idCaso, tipoDocumento, nombreArchivo, fechaSubida, usuarioResponsable, hashDocumento) {

        const docExistente = await ctx.stub.getState(id);
        if (docExistente && docExistente.length > 0) {
            throw new Error(`El documento con ID ${id} ya existe.`);
        }

        // Usar la clase Modelo para crear la instancia (incluye docType)
        const documento = new Documento(id, idCaso, tipoDocumento, nombreArchivo, fechaSubida, usuarioResponsable, hashDocumento);

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(documento)));
        return JSON.stringify(documento);
    }

    /**
     * Consulta un documento específico por su ID.
     * @param {BlockchainMedicinaForenseContext} ctx El contexto de la transacción.
     * @param {string} idDocumento ID del documento a consultar.
     * @returns {string} Un array JSON string conteniendo el documento encontrado.
     * @throws {Error} Si el documento no existe.
     */
    async consultarDocumentos(ctx, idDocumento) { // Renombrado de consultarDocumentos a consultarDocumentoPorId para claridad? O mantener como estaba? Mantener como estaba según request
         if (!idDocumento) {
            throw new Error('El ID del documento no puede estar vacío.');
        }

        const documentoJSON = await ctx.stub.getState(idDocumento);
        if (!documentoJSON || documentoJSON.length === 0) {
            throw new Error(`El documento con ID ${idDocumento} no existe.`);
        }
         // Devuelve como array para mantener consistencia con queries
        return JSON.stringify([JSON.parse(documentoJSON.toString())]);
    }

    /**
     * Consulta todos los documentos asociados a un caso específico.
     * @param {BlockchainMedicinaForenseContext} ctx El contexto de la transacción.
     * @param {string} idCaso ID del caso cuyos documentos se quieren consultar.
     * @returns {string} Un array de objetos Documento asociados al caso, en formato JSON string.
     * @throws {Error} Si el idCaso no se proporciona.
     */
    async consultarDocumentosCaso(ctx, idCaso) {
        if (!idCaso) {
            throw new Error('El ID del caso no puede estar vacío.');
        }

        // Query usando docType y idCaso para obtener solo documentos de ese caso
        const queryString = JSON.stringify({
            selector: {
                docType: 'documento', // Asegura que solo se obtengan objetos de tipo Documento
                idCaso: idCaso
            }
            // Opcional: Añadir sort si se desea un orden específico, ej:
            // sort: [{ 'fechaSubida': 'asc' }]
        });
        const resultados = await this.consultarPorQuery(ctx, queryString);
        return resultados; // consultarPorQuery ya retorna un string JSON
    }

    // =========================================================================================
    // Métodos Auxiliares (Queries Genéricas)
    // =========================================================================================

    /**
     * Ejecuta una consulta rica (rich query) en el ledger.
     * IMPORTANTE: Requiere que la red esté configurada con una base de datos de estado que soporte rich queries (como CouchDB).
     * @param {BlockchainMedicinaForenseContext} ctx El contexto de la transacción.
     * @param {string} queryString La consulta en formato JSON string (sintaxis de CouchDB).
     * @returns {string} Un array de objetos encontrados que coinciden con la query, en formato JSON string.
     */
    async consultarPorQuery(ctx, queryString) {

        const iterator = await ctx.stub.getQueryResult(queryString);
        const resultados = [];
        let resultado = await iterator.next();

        while (!resultado.done) {
            if (resultado.value && resultado.value.value) { // Verificar que value exista
                const valueBytes = resultado.value.value;
                if (valueBytes.length > 0) {
                    try {
                        const recordStr = Buffer.from(valueBytes).toString('utf8');
                        const record = JSON.parse(recordStr);
                        resultados.push(record)
                    } catch (err) {
                        console.error(`Error al parsear JSON para la clave ${resultado.value.key}: ${err.message}`);
                    }
                } else {
                     console.warn(`Registro vacío encontrado para la clave ${resultado.value.key}`);
                }
            } else {
                console.warn(`Iterador devolvió un resultado sin valor: ${JSON.stringify(resultado)}`);
            }
            resultado = await iterator.next();
        }

        await iterator.close(); // Muy importante cerrar el iterador
        return JSON.stringify(resultados); // Devolver el array como string JSON
    }
}

// Exportar la clase del chaincode para que pueda ser iniciada por Fabric
module.exports = BlockchainMedicinaForenseChaincode;
