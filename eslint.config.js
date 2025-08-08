import antfu from '@antfu/eslint-config';

export default antfu({
  unocss: true,
  formatters: true,
  stylistic: true,
  rules: {
    'n/prefer-global/process': 'off',
    'no-undef': 'error',
    'no-fallthrough': 'off',
    'vue/block-order': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    'prefer-promise-reject-errors': 'off',
    'style/semi': ['error', 'always'], // 强制分号
    'curly': ['error', 'all'], // 强制所有控制语句使用大括号
    'style/brace-style': ['error', '1tbs'], // 大括号风格
    'style/comma-dangle': ['error', 'always-multiline'], // 尾随逗号
  },
  languageOptions: {
    globals: {
      h: 'readonly',
      unref: 'readonly',
      provide: 'readonly',
      inject: 'readonly',
      markRaw: 'readonly',
      defineAsyncComponent: 'readonly',
      nextTick: 'readonly',
      useRoute: 'readonly',
      useRouter: 'readonly',
      Message: 'readonly',
      $loadingBar: 'readonly',
      $message: 'readonly',
      $dialog: 'readonly',
      $notification: 'readonly',
      $modal: 'readonly',
    },
  },
});
