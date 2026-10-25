/**
 * Vitest 配置文件
 * 微信小程序前端单元测试配置
 */
var { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    // 全局启用 describe/it/expect/beforeEach 等
    globals: true,

    // 使用 node 环境（微信小程序 JS 逻辑层不需要 DOM）
    environment: 'node',

    // 测试文件匹配模式
    include: [
      '__tests__/**/*.test.js',
      '__tests__/**/*.spec.js'
    ],

    // 模块目录
    moduleDirectories: [
      'node_modules',
      '.'
    ],

    // setup 文件——在测试运行前加载
    setupFiles: [
      './__tests__/setup.js'
    ],

    // 覆盖率收集
    coverage: {
      provider: 'v8',
      include: [
        'api/**/*.js',
        'utils/**/*.js',
        'app.js'
      ],
      thresholds: {
        branches: 40,
        functions: 50,
        lines: 40,
        statements: 40
      }
    }
  }
});
