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
}

module.exports = MockStub;
