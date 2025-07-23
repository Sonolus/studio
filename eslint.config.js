import eslint from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tsEslint from 'typescript-eslint'

export default tsEslint.config(
    {
        ignores: ['**/*.*', '!src/**/*.*'],
    },

    eslint.configs.recommended,

    ...tsEslint.configs.strictTypeChecked,
    ...tsEslint.configs.stylisticTypeChecked,

    ...pluginVue.configs['flat/recommended'],

    {
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
            parserOptions: {
                parser: tsEslint.parser,
                extraFileExtensions: ['vue'],
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            'vue/block-lang': [
                'error',
                {
                    script: {
                        lang: 'ts',
                    },
                },
            ],
            '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
            '@typescript-eslint/switch-exhaustiveness-check': 'error',
            '@typescript-eslint/restrict-template-expressions': [
                'error',
                {
                    allowAny: false,
                    allowBoolean: false,
                    allowNever: true,
                    allowNullish: false,
                    allowNumber: true,
                    allowRegExp: false,
                },
            ],
            '@typescript-eslint/no-unnecessary-condition': [
                'error',
                {
                    allowConstantLoopConditions: true,
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    varsIgnorePattern: '^_',
                },
            ],
        },
    },

    eslintConfigPrettier,
)
