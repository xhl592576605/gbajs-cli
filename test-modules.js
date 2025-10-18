#!/usr/bin/env node

/**
 * 测试脚本：验证GBA模拟器核心功能模块在Node.js环境中的正常运行
 */

console.log('GBA.js Node.js迁移项目 - 核心模块功能验证');
console.log('========================================');

// 测试1：CPU模块功能验证
console.log('\n1. 测试CPU模块...');
try {
  const ARMCore = require('./adapters/NodeCore.js');
  const cpu = new ARMCore();
  cpu.resetCPU(0);
  console.log('   ✓ CPU模块初始化成功');
  console.log('   ✓ PC寄存器值:', cpu.gprs[15]);
} catch (error) {
  console.error('   ✗ CPU模块测试失败:', error.message);
}

// 测试2：MMU模块功能验证
console.log('\n2. 测试MMU模块...');
try {
  const GameBoyAdvanceMMU = require('./adapters/NodeMMU.js');
  const mmu = new GameBoyAdvanceMMU();
  console.log('   ✓ MMU模块初始化成功');
  console.log('   ✓ 内存区域定义存在:', !!mmu.REGION_BIOS, !!mmu.REGION_WORKING_RAM);
} catch (error) {
  console.error('   ✗ MMU模块测试失败:', error.message);
}

// 测试3：视频模块功能验证
console.log('\n3. 测试视频模块...');
try {
  const GameBoyAdvanceVideo = require('./adapters/NodeVideo.js');
  const video = new GameBoyAdvanceVideo();
  console.log('   ✓ 视频模块初始化成功');
  console.log('   ✓ 屏幕尺寸:', video.HORIZONTAL_PIXELS, 'x', video.VERTICAL_PIXELS);
} catch (error) {
  console.error('   ✗ 视频模块测试失败:', error.message);
}

// 测试4：音频模块功能验证
console.log('\n4. 测试音频模块...');
try {
  const GameBoyAdvanceAudio = require('./adapters/NodeAudio.js');
  const audio = new GameBoyAdvanceAudio();
  console.log('   ✓ 音频模块初始化成功');
  console.log('   ✓ 采样率:', audio.sampleRate);
  console.log('   ✓ 缓冲区大小:', audio.bufferSize);
} catch (error) {
  console.error('   ✗ 音频模块测试失败:', error.message);
}

// 测试5：完整模拟器核心功能验证
console.log('\n5. 测试完整模拟器核心...');
try {
  const NodeGBA = require('./NodeGBA.js');
  const gba = new NodeGBA();
  console.log('   ✓ 完整模拟器核心初始化成功');
  console.log('   ✓ CPU模块存在:', !!gba.cpu);
  console.log('   ✓ MMU模块存在:', !!gba.mmu);
  console.log('   ✓ 音频模块存在:', !!gba.audio);
  console.log('   ✓ 视频模块存在:', !!gba.video);

  // 测试模块间关系
  if (gba.cpu && gba.mmu) {
    console.log('   ✓ CPU与MMU关系建立:', gba.cpu.mmu === gba.mmu);
  }
} catch (error) {
  console.error('   ✗ 完整模拟器核心测试失败:', error.message);
}

// 测试6：中断处理模块功能验证
console.log('\n6. 测试中断处理模块...');
try {
  const GameBoyAdvanceInterruptHandler = require('./adapters/NodeInterruptHandler.js');
  const irq = new GameBoyAdvanceInterruptHandler();
  console.log('   ✓ 中断处理模块初始化成功');
  console.log('   ✓ IRQ常量存在:', !!irq.IRQ_VBLANK, !!irq.IRQ_TIMER0);
} catch (error) {
  console.error('   ✗ 中断处理模块测试失败:', error.message);
}

// 测试7：IO模块功能验证
console.log('\n7. 测试IO模块...');
try {
  const GameBoyAdvanceIO = require('./adapters/NodeIO.js');
  const io = new GameBoyAdvanceIO();
  console.log('   ✓ IO模块初始化成功');
  console.log('   ✓ IO寄存器定义存在:', !!io.DISPCNT, !!io.SOUND1CNT_LO);
} catch (error) {
  console.error('   ✗ IO模块测试失败:', error.message);
}

// 测试8：SIO模块功能验证
console.log('\n8. 测试SIO模块...');
try {
  const GameBoyAdvanceSIO = require('./adapters/NodeSIO.js');
  const sio = new GameBoyAdvanceSIO();
  console.log('   ✓ SIO模块初始化成功');
  console.log('   ✓ SIO模式定义存在:', !!sio.SIO_NORMAL_8, !!sio.SIO_MULTI);
} catch (error) {
  console.error('   ✗ SIO模块测试失败:', error.message);
}

console.log('\n========================================');
console.log('所有核心模块功能验证完成！');
console.log('如果所有测试都显示✓，说明核心功能模块在Node.js环境中能够正常运行。');