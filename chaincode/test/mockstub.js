// test/mockstub.js
'use strict';

/**
 * Simula el iterador de resultados devuelto por Fabric para getStateByRange y getQueryResult.
 * Itera sobre una lista predefinida de claves y recupera sus valores del estado del MockStub.
 */
class MockIterator {
    /**
     * Constructor para el iterador simulado.
     * @param {string[]} keys - Un array de claves sobre las que iterar.
     * @param {Object.<string, string>} state - Referencia al objeto de estado del MockStub.
     * @param {string} [startKey] - Clave inicial del rango (informativo, la lógica de filtrado está en MockStub).
     * @param {string} [endKey] - Clave final del rango (informativo, la lógica de filtrado está en MockStub).
     */
    constructor(keys, state, startKey, endKey) {
        this.keys = keys || []; // Asegurar que keys sea un array
        this.state = state;
        this.index = 0;
    }

    /**
     * Devuelve el siguiente elemento {value: {key, value}, done: boolean} en la secuencia.
     * Simula el comportamiento del iterador de Fabric.
     * @returns {Promise<Object>} Un objeto que representa el siguiente resultado o indica el fin de la iteración.
     */
    async next() {
        if (this.index < this.keys.length) {
            const key = this.keys[this.index];
            // Recuperar el valor (almacenado como string) y convertirlo a Buffer
            const valueBuffer = Buffer.from(this.state[key] || ''); // Usar '' si la clave desapareció? O asumir que existe? Asumir que existe.
            this.index++;
            return {
                value: {
                    key: key,
                    value: valueBuffer // Devolver como Buffer, como haría Fabric
                },
                done: false
            };
        } else {
            // Fin de la iteración
            return { done: true };
        }
    }

    /**
     * Cierra el iterador. En este mock, no realiza ninguna acción real.
     * @returns {Promise<void>}
     */
    async close() {
        // No se necesita limpieza específica en este mock.
    }
}


/**
 * Simula el objeto `stub` de Fabric-shim para pruebas unitarias del chaincode.
 * Proporciona implementaciones en memoria de `putState`, `getState`, `getStateByRange`, y `getQueryResult`.
 */
class MockStub {
    /**
     * Constructor del MockStub. Inicializa el estado en memoria.
     */
    constructor() {
        this.state = {}; // Almacena el estado del ledger como un objeto clave-valor (clave: string, valor: string)
        this.invocations = 0; // Contador simple para rastrear llamadas (opcional)
    }

    /**
     * Simula la escritura de un estado en el ledger.
     * @param {string} key - La clave del estado.
     * @param {Buffer} value - El valor del estado (como Buffer).
     * @returns {Promise<void>}
     */
    async putState(key, value) {
        if (!key) {
            throw new Error("La clave (key) no puede estar vacía en putState");
        }
        if (value === undefined || value === null) {
            throw new Error("El valor (value) no puede ser undefined o null en putState");
        }
        // Almacenar el valor como string (como en el código original)
        this.state[key] = value.toString();
    }

    /**
     * Simula la lectura de un estado del ledger.
     * @param {string} key - La clave del estado a leer.
     * @returns {Promise<Buffer|null>} El valor del estado como Buffer, o null si la clave no existe.
     */
    async getState(key) {
        if (this.state.hasOwnProperty(key)) {
            // Devolver el valor almacenado (string) como Buffer para simular Fabric
            return Buffer.from(this.state[key]);
        }
        return null; // O Buffer.alloc(0)? null es más fácil de chequear en tests (if (!result))
    }

    /**
     * Simula la obtención de estados dentro de un rango de claves.
     * @param {string} startKey - La clave inicial del rango (inclusive). '' para empezar desde el principio.
     * @param {string} endKey - La clave final del rango (exclusive). '' para ir hasta el final.
     * @returns {Promise<MockIterator>} Un iterador para los resultados dentro del rango.
     */
    async getStateByRange(startKey, endKey) {
        // Obtener todas las claves y ordenarlas lexicográficamente
        let keys = Object.keys(this.state).sort();

        // Aplicar el filtrado basado en startKey y endKey
        const startIndex = (startKey === '') ? 0 : keys.findIndex(k => k >= startKey);
        const endIndex = (endKey === '') ? keys.length : keys.findIndex(k => k >= endKey); // endKey es exclusivo

        if (startIndex === -1) {
            // Si no se encuentra startKey (y no es ''), no hay claves en el rango
            keys = [];
        } else {
            // Calcular el slice correcto
            const effectiveEndIndex = (endIndex === -1) ? keys.length : endIndex; // Si endKey no se encuentra, ir hasta el final
             keys = keys.slice(startIndex, effectiveEndIndex);
        }
        // Devolver un iterador con las claves filtradas
        return new MockIterator(keys, this.state, startKey, endKey);
    }

    /**
     * Simula la ejecución de una consulta rica (rich query) usando un selector CouchDB.
     * IMPORTANTE: Esta es una simulación básica y solo soporta igualdad directa en los campos del selector.
     * No soporta operadores complejos ($gt, $lt, $or, etc.) ni índices.
     * @param {string} queryString - La consulta en formato JSON string (e.g., '{"selector":{"docType":"caso", "estado":"Abierto"}}').
     * @returns {Promise<MockIterator>} Un iterador para los resultados que coinciden con el selector.
     * @throws {Error} Si el queryString no es JSON válido o no contiene un objeto 'selector'.
     */
    async getQueryResult(queryString) {
        this.invocations++;
        let query;

        // 1. Parsear el queryString
        try {
            query = JSON.parse(queryString);
        } catch (e) {
            throw new Error(`Error al parsear queryString en MockStub: ${queryString} - ${e.message}`);
        }

        // 2. Validar que exista el selector
        if (!query || typeof query.selector !== 'object' || query.selector === null) {
             throw new Error(`MockStub: queryString debe contener un objeto 'selector': ${queryString}`);
        }
        const selector = query.selector;

        const results = []; // Array para almacenar las coincidencias {key, value}

        // 3. Iterar sobre todo el estado simulad
        for (const key in this.state) {
            if (this.state.hasOwnProperty(key)) {
                let record;
                // 3a. Intentar parsear el valor del estado (asume que es JSON)
                try {
                    record = JSON.parse(this.state[key]);
                } catch (e) {
                    // Si un valor no es JSON, no puede coincidir con un selector JSON. Ignorar
                    continue;
                }

                // 3b. Comparar el registro con TODOS los campos del selector
                let match = true;
                for (const field in selector) {
                    if (selector.hasOwnProperty(field)) {
                        // Verificar si el campo existe en el registro y si el valor coincide
                        // Nota: Comparación simple de igualdad. No maneja objetos anidados complejos en el selector.
                        if (!record.hasOwnProperty(field) || record[field] !== selector[field]) {
                            match = false;
                            break; // Si un campo no coincide, el registro no es un match.
                        }
                    }
                }

                // 3c. Si todos los campos coincidieron, añadir al resultado
                if (match) {
                    results.push({
                        key: key,
                        // El iterador necesita el valor como Buffer
                        value: Buffer.from(this.state[key])
                    });
                }
            }
        }


        // 4. Devolver un iterador con las claves de los resultados encontrados
        // Se necesita pasar las claves al iterador para que funcione correctamente
        const resultKeys = results.map(r => r.key);
        return new MockIterator(resultKeys, this.state); // El iterador usará this.state para obtener los valores por clave
    }

     /**
      * Limpia el estado en memoria del MockStub.
      * Muy útil para llamar en un `beforeEach` o `afterEach` en los tests
      * para asegurar el aislamiento entre pruebas.
      * @returns {Promise<void>}
      */
     async clearState() {
        this.state = {};
        this.invocations = 0; // Resetear contador si se usa
     }
}

// Exportar la clase MockStub para ser usada en los archivos de prueba
module.exports = MockStub;