import oclif from 'eslint-config-oclif'

export default [
  {ignores: ['lib/**']},
  ...oclif,
  {
    files: ['src/**/*.ts'],
    rules: {
      // TypeScript already enforces these; the import plugin's resolver
      // has a CJS/ESM incompatibility in this project setup.
      'import/default': 'off',
      'import/namespace': 'off',
      'import/no-duplicates': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
    },
  },
]
