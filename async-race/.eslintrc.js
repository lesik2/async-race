module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['prettier', 'import', '@typescript-eslint'],
    extends: ['plugin:prettier/recommended', 'prettier', 'eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parserOptions: {
        sourceType: 'module',
        ecmaVersion: 2020,
    },
    env: {
        es6: true,
        browser: true,
        node: true,
    },
    rules: {
        'no-debugger': 'off',
        'no-console': 0,
        'class-methods-use-this': 'off',
        '@typescript-eslint/no-explicit-any': 2,
        '@typescript-eslint/no-var-requires': 0,
    },
    ignorePatterns: ['webpack.config.js'],
};
