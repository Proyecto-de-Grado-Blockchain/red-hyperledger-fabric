class MockStub {
    constructor() {
        this.state = {};
    }

    async putState(key, value) {
        this.state[key] = value;
    }

    async getState(key) {
        return this.state[key];
    }

    async getStateByPartialCompositeKey() {
        // Simular la búsqueda por claves compuestas
        return {
            done: false,
            next: async function() {
                return { done: true, value: { value: JSON.stringify({}) } };
            },
            close: async function() {}
        };
    }

    // Simular getQueryResult para realizar consultas ricas por un campo como idCaso
    async getQueryResult(queryString) {
        // Se espera que queryString sea una cadena JSON
        const query = JSON.parse(queryString);
        const idCaso = query.selector.idCaso;

        const results = [];
        for (const key in this.state) {
            const record = JSON.parse(this.state[key]);
            if (record.idCaso === idCaso) {
                results.push({
                    key: key,
                    value: this.state[key]
                });
            }
        }

        // Simular un iterador de resultados
        return {
            next: async () => {
                const result = results.shift();
                return result
                    ? { value: result, done: false }
                    : { done: true };
            },
            close: async () => {}
        };
    }
}

module.exports = MockStub;
