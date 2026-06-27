import { defineConfig } from 'vite-plus';

export default defineConfig(({ mode }) => ({
    staged: {
        '*': 'vp check --fix',
    },
    fmt: {
        ignorePatterns: [
            'node_modules/**',
            'out/**',
            '.vite/**',
            '.vscode/**',
            '*.vsix',
            'jandan-vscode-*.vsix',
        ],
        semi: true,
        singleQuote: true,
        indentStyle: 'space',
        indentWidth: 4,
    },
    lint: {
        plugins: ['typescript', 'unicorn', 'oxc'],
        categories: {
            correctness: 'error',
        },
        env: {
            builtin: true,
            node: true,
        },
        ignorePatterns: ['out/**'],
        rules: {
            'no-array-constructor': 'error',
            'typescript/no-require-imports': 'error',
            'typescript/no-useless-default-assignment': 'off',
            'typescript/no-wrapper-object-types': 'error',
            'vite-plus/prefer-vite-plus-imports': 'error',
        },
        overrides: [
            {
                files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
                rules: {
                    'constructor-super': 'off',
                    'getter-return': 'off',
                    'no-class-assign': 'off',
                    'no-const-assign': 'off',
                    'no-dupe-class-members': 'off',
                    'no-dupe-keys': 'off',
                    'no-func-assign': 'off',
                    'no-import-assign': 'off',
                    'no-new-native-nonconstructor': 'off',
                    'no-obj-calls': 'off',
                    'no-redeclare': 'off',
                    'no-setter-return': 'off',
                    'no-this-before-super': 'off',
                    'no-undef': 'off',
                    'no-unreachable': 'off',
                    'no-unsafe-negation': 'off',
                    'no-var': 'error',
                    'no-with': 'off',
                    'prefer-const': 'error',
                    'prefer-rest-params': 'error',
                    'prefer-spread': 'error',
                },
            },
        ],
        options: {
            typeAware: true,
            typeCheck: true,
        },
        jsPlugins: [
            {
                name: 'vite-plus',
                specifier: 'vite-plus/oxlint-plugin',
            },
        ],
    },
    build: {
        emptyOutDir: true,
        minify: mode === 'production',
        outDir: 'out',
        sourcemap: mode !== 'production',
        ssr: 'src/extension.ts',
        target: 'node24',
        rollupOptions: {
            external: ['vscode'],
            output: {
                entryFileNames: 'extension.js',
                format: 'cjs',
            },
        },
    },
}));
