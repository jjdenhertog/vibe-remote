module.exports = {
    extends: [
        '../../config/eslint/base.js'
    ],
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
    }
};