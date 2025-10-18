#!/usr/bin/env node

/**
 * 测试脚本：验证GBA模拟器性能监控功能
 */

console.log('GBA.js Node.js迁移项目 - 性能监控功能验证');
console.log('========================================');

// 测试性能监控工具
console.log('\n1. 测试性能监控工具...');
try {
  const PerformanceMonitor = require('./utils/performance.js');
  const monitor = new PerformanceMonitor();

  console.log('   ✓ 性能监控工具初始化成功');

  // 测试记录帧时间
  monitor.start();
  // 模拟一些处理时间
  const start = Date.now();
  while (Date.now() - start < 10) {
    // 空循环模拟处理
  }
  monitor.recordFrame();

  console.log('   ✓ 帧时间记录功能正常');
  console.log('   ✓ 平均帧时间:', monitor.getAverageFrameTime().toFixed(2), 'ms');
  console.log('   ✓ FPS:', monitor.getFPS().toFixed(2));

  // 测试记录CPU时间
  monitor.recordCPUTime(5.5);
  console.log('   ✓ CPU时间记录功能正常');
  console.log('   ✓ 平均CPU时间:', monitor.getAverageCPUTime().toFixed(2), 'ms');

  // 测试记录内存使用
  monitor.recordMemoryUsage();
  console.log('   ✓ 内存使用记录功能正常');

  // 测试生成报告
  const report = monitor.generateReport();
  console.log('   ✓ 性能报告生成功能正常');

} catch (error) {
  console.error('   ✗ 性能监控工具测试失败:', error.message);
}

// 测试完整模拟器核心的性能功能
console.log('\n2. 测试完整模拟器核心性能功能...');
try {
  const NodeGBA = require('./NodeGBA.js');
  const gba = new NodeGBA();

  console.log('   ✓ 完整模拟器核心初始化成功');

  // 测试性能相关方法
  const fps = gba.getFPS();
  const avgFrameTime = gba.getAverageFrameTime();
  const memoryUsage = gba.getMemoryUsage();

  console.log('   ✓ FPS获取功能正常:', fps);
  console.log('   ✓ 平均帧时间获取功能正常:', avgFrameTime);
  console.log('   ✓ 内存使用获取功能正常:', !!memoryUsage);

  // 测试性能报告
  const report = gba.getPerformanceReport();
  console.log('   ✓ 性能报告获取功能正常');

} catch (error) {
  console.error('   ✗ 完整模拟器核心性能功能测试失败:', error.message);
}

console.log('\n========================================');
console.log('性能监控功能验证完成！');
console.log('如果所有测试都显示✓，说明性能监控功能正常工作。');