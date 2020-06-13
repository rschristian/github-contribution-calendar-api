module.exports = {
    env: {
        node: true,
        es6: true,
    },
    parserOptions: {
        ecmaVersion: 8,
    },
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    rules: {
        strict: 0,
    },
};
