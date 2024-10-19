// test/mockstub.js
'use strict';

class MockIterator {
    constructor(keys, state, startKey, endKey) {
        this.keys = keys;
        this.state = state;
        this.index = 0;
    }

    async next() {
        if (this.index < this.keys.length) {
            const key = this.keys[this.index];
            const value = this.state[key];
            this.index++;
            return {
                value: {
                    key: key,
                    value: Buffer.from(this.state[key])
                },
                done: false
            };
        } else {
            return { done: true };
        }
    }

    async close() {
        // No se necesita implementar nada para el mock
    }
}

class MockStub {
    constructor() {
        this.state = {};
    }

    async putState(key, value) {
        this.state[key] = value.toString();
    }

    async getState(key) {
        if (this.state.hasOwnProperty(key)) {
            return Buffer.from(this.state[key]);
        }
        return null;
    }

    async getStateByRange(startKey, endKey) {
        let keys = Object.keys(this.state).sort();

        if (startKey !== '' && endKey !== '') {
            keys = keys.filter(key => key >= startKey && key <= endKey);
        } else if (startKey === '' && endKey !== '') {
            keys = keys.filter(key => key <= endKey);
        } else if (startKey !== '' && endKey === '') {
            keys = keys.filter(key => key >= startKey);
        }
        // Si ambos startKey y endKey son '', se mantienen todas las claves

        return new MockIterator(keys, this.state);
    }

    // Puedes agregar más métodos si es necesario
}

module.exports = MockStub;
