// benchmarks/callbacks/control/currency/mini.js

'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
    /**
     * Función que se ejecuta antes de que comience el benchmark.
     * Puedes utilizar esta función para realizar configuraciones iniciales,
     * limpiar datos previos, o cualquier otra tarea de preparación.
     */
    onBenchmarkStart: async function () {
        try {
            console.log('🚀 [Callback] El benchmark "currency-lifecycle" está iniciando...');
            // Lógica de inicialización
            // Por ejemplo, limpiar archivos de logs previos
            const logFile = path.resolve(__dirname, 'benchmark.log');
            if (fs.existsSync(logFile)) {
                fs.unlinkSync(logFile);
            }
            // O inicializar variables globales
            global.benchmarkData = {};
        } catch (error) {
            console.error(`Error en onBenchmarkStart: ${error.message}`);
            throw error;
        }
    },

    /**
     * Función que se ejecuta después de que finaliza el benchmark.
     * Útil para realizar tareas de limpieza, recopilar métricas adicionales,
     * o procesar los resultados obtenidos.
     */
    onBenchmarkEnd: async function () {
        try {
            console.log('🎉 [Callback] El benchmark "currency-lifecycle" ha finalizado.');
            // Lógica de limpieza o procesamiento de resultados
            // Por ejemplo, guardar datos acumulados durante el benchmark
            const resultsFile = path.resolve(__dirname, 'benchmark_results.json');
            fs.writeFileSync(resultsFile, JSON.stringify(global.benchmarkData, null, 2));
        } catch (error) {
            console.error(`Error en onBenchmarkEnd: ${error.message}`);
            throw error;
        }
    },

    /**
     * Función que se ejecuta antes de cada ronda de prueba.
     * Ideal para preparar el entorno específico de cada ronda,
     * como cargar datos específicos o configurar parámetros dinámicos.
     */
    onRoundStart: async function (roundIndex, roundSettings) {
        try {
            console.log(`🔄 [Callback] La ronda de benchmark ${roundIndex + 1} está comenzando.`);
            // Lógica antes de cada ronda
            // Por ejemplo, inicializar datos específicos de la ronda
            global.benchmarkData[`round_${roundIndex + 1}`] = {
                transactions: [],
                startTime: Date.now()
            };
        } catch (error) {
            console.error(`Error en onRoundStart: ${error.message}`);
            throw error;
        }
    },

    /**
     * Función que se ejecuta después de cada ronda de prueba.
     * Puedes utilizar esta función para recopilar métricas específicas de la ronda,
     * verificar estados intermedios, o cualquier otra tarea de post-ronda.
     */
    onRoundEnd: async function (roundIndex, roundResults) {
        try {
            console.log(`✅ [Callback] La ronda de benchmark ${roundIndex + 1} ha finalizado.`);
            // Lógica después de cada ronda
            // Por ejemplo, guardar resultados de la ronda
            global.benchmarkData[`round_${roundIndex + 1}`].endTime = Date.now();
            global.benchmarkData[`round_${roundIndex + 1}`].results = roundResults;
        } catch (error) {
            console.error(`Error en onRoundEnd: ${error.message}`);
            throw error;
        }
    },

    /**
     * Función que se ejecuta antes de que cada transacción sea enviada.
     * Útil para modificar argumentos de transacción dinámicamente,
     * registrar información adicional, o implementar lógica condicional.
     *
     * @param {Object} context - El contexto de la prueba.
     * @param {Object} args - Los argumentos de la transacción.
     * @param {Number} rateControl - Control de tasa de transacciones.
     */
    onTransactionSubmit: async function (context, args, rateControl) {
        try {
            // Modificar argumentos de la transacción si es necesario
            // Por ejemplo, agregar un identificador único
            const uniqueId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
            args.contractArguments = args.contractArguments.map(arg => arg.replace('<UNIQUE_ID>', uniqueId));

            console.log(`📤 [Callback] Enviando transacción: ${args.contractFunction} con argumentos ${args.contractArguments}`);
        } catch (error) {
            console.error(`Error en onTransactionSubmit: ${error.message}`);
            throw error;
        }
    },

    /**
     * Función que se ejecuta después de que cada transacción ha sido procesada.
     * Permite analizar el resultado de la transacción, manejar errores, o registrar datos.
     *
     * @param {Object} context - El contexto de la prueba.
     * @param {Object} args - Los argumentos de la transacción.
     * @param {Object} result - Resultado de la transacción.
     * @param {Number} latency - Latencia de la transacción.
     */
    onTransactionResult: async function (context, args, result, latency) {
        try {
            console.log(`📥 [Callback] Resultado de la transacción: ${args.contractFunction} -> ${JSON.stringify(result)}`);

            // Registrar resultados de la transacción
            const roundData = global.benchmarkData[`round_${context.roundIndex + 1}`];
            roundData.transactions.push({
                function: args.contractFunction,
                arguments: args.contractArguments,
                result: result,
                latency: latency
            });
        } catch (error) {
            console.error(`Error en onTransactionResult: ${error.message}`);
            throw error;
        }
    }
};
