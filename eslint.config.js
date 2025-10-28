import antfu from '@antfu/eslint-config';

export default antfu({
  unocss: true,
  formatters: true,
  stylistic: true,
  rules: {
    'n/prefer-global/process': 'off',
    'no-undef': 'error',
    'no-console': 'warn',
    'no-fallthrough': 'off',
    'vue/block-order': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    'prefer-promise-reject-errors': 'off',
    'style/semi': ['error', 'always'], // 强制分号
    'curly': ['error', 'all'], // 强制所有控制语句使用大括号
    'style/brace-style': ['error', '1tbs'], // 大括号风格
    'style/comma-dangle': ['error', 'always-multiline'], // 尾随逗号
    'vue/object-property-newline': ['error', { allowAllPropertiesOnSameLine: false }], // 修复配置错误
    // Vue 模板属性换行规则
    'vue/max-attributes-per-line': ['error', {
      singleline: {
        max: 3, // 单行最多 3 个属性
      },
      multiline: {
        max: 1, // 多行时每行最多 1 个属性
      },
    }],
    'vue/first-attribute-linebreak': ['error', {
      singleline: 'ignore', // 单行时忽略第一个属性的换行
      multiline: 'below', // 多行时第一个属性在下一行
    }],
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never', // 单行时闭合标签不换行
      multiline: 'always', // 多行时闭合标签换行
    }],
    'unused-imports/no-unused-vars': ['error', {
      argsIgnorePattern: '^_', // 忽略以 _ 开头的参数
      varsIgnorePattern: '^_', // 忽略以 _ 开头的变量
      caughtErrorsIgnorePattern: '^_', // 忽略以 _ 开头的 catch 参数
    }], // 忽略下划线开头的未使用变量
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_', // 忽略以 _ 开头的参数
        varsIgnorePattern: '^_', // 忽略以 _ 开头的变量
        caughtErrorsIgnorePattern: '^_', // 忽略以 _ 开头的 catch 参数
      },
    ],
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
      $notification: 'readonly',
      $modal: 'readonly',
    },
  },
});
