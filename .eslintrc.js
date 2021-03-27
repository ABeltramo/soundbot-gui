module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        "indent": "off",
        "@typescript-eslint/indent": ["warn"],
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/ban-ts-comment": "off"
    },
    env: {
        browser: true,
        node: true
    },
    settings: {
        react: {
            "version": "17.0.1"
        }
    }
};