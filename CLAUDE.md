# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

GBA.js 是一个用 HTML5 技术从零开始编写的 Game Boy Advance 模拟器，使用 Canvas 和 Web Audio，无需插件。该项目是基于浏览器的 GBA 模拟器，支持在现代 Web 浏览器中运行 GBA 游戏。

## 开发环境

由于这是一个纯 JavaScript 项目，没有传统的构建系统（无 package.json、无 npm 脚本）。开发主要通过以下方式进行：

- 直接在浏览器中打开 `index.html` 进行测试
- 使用 `debugger.html` 进行调试
- 通过 `console.html` 查看控制台输出

## 核心架构

### 主要组件结构

项目采用模块化的 JavaScript 架构，核心组件包括：

- **GameBoyAdvance (gba.js)**: 主控制器类，协调所有子系统
- **ARMCore (core.js, arm.js, thumb.js)**: CPU 模拟器，支持 ARM 和 Thumb 指令集
- **GameBoyAdvanceMMU (mmu.js)**: 内存管理单元，处理内存映射和访问
- **GameBoyAdvanceIO (io.js)**: 输入/输出系统
- **GameBoyAdvanceAudio (audio.js)**: 音频系统
- **GameBoyAdvanceVideo (video.js)**: 视频渲染系统
- **GameBoyAdvanceKeypad (keypad.js)**: 按键输入处理
- **GameBoyAdvanceIRQ (irq.js)**: 中断处理系统

### 内存映射架构

MMU 使用分区域内存映射：
- REGION_BIOS: 0x00000000 - BIOS 区域
- REGION_WORKING_RAM: 0x02000000 - 工作内存
- REGION_WORKING_IRAM: 0x03000000 - 内部内存
- REGION_IO: 0x04000000 - I/O 寄存器
- REGION_PALETTE_RAM: 0x05000000 - 调色板内存
- REGION_VRAM: 0x06000000 - 视频内存
- REGION_OAM: 0x07000000 - 对象属性内存
- REGION_CART0/1/2: 0x08000000/0x0A000000/0x0C000000 - 卡带内存区域

### 指令编译系统

ARMCore 使用动态重编译系统：
- 指令缓存分页机制减少编译开销
- 支持 ARM 和 Thumb 两种指令集
- 条件执行指令优化
- 内存访问对齐处理

### 存档系统

支持多种存档类型：
- SRAM: 静态随机存取存储器
- FLASH: 闪存存储器（512K/1M）
- EEPROM: 电可擦除可编程只读存储器

## 文件加载顺序

在 `index.html` 中，JavaScript 文件按特定顺序加载：
1. `util.js` - 工具函数
2. `core.js` - CPU 核心
3. `arm.js`, `thumb.js` - 指令集实现
4. `mmu.js` - 内存管理
5. `io.js` - I/O 系统
6. `audio.js` - 音频系统
7. `video.js` 及其子模块 - 视频系统
8. `irq.js` - 中断系统
9. `keypad.js` - 按键处理
10. `sio.js` - 串行 I/O
11. `savedata.js` - 存档管理
12. `gpio.js` - 通用 I/O
13. `gba.js` - 主控制器

## 关键功能实现

### ROM 加载和验证
- 检查 ROM 头部的 0x96 验证码
- 自动检测存档类型
- 解析游戏标题、代码和制造商信息

### BIOS 模拟
- 支持真实 BIOS 和模拟 BIOS
- 提供 BIOS 中断服务

### DMA 传输
- 支持 4 个 DMA 通道
- 多种传输时序（立即、VBlank、HBlank、自定义）
- 地址递增/递减/固定模式

### 音频处理
- Web Audio API 集成
- FIFO 音频流处理
- 音频采样率转换

## 调试功能

项目包含调试器支持：
- `debugger.html` 提供调试界面
- 支持断点、内存查看、寄存器检查
- 消息传递机制用于主窗口和调试器通信

## 兼容性注意事项

- 需要支持 File API 的现代浏览器
- Web Audio API 用于音频输出
- Canvas 用于视频渲染
- 不同浏览器有特定的兼容性处理

## 开发注意事项

- 代码使用传统的 JavaScript 原型继承
- 大量使用位操作和二进制数据处理
- 性能关键路径经过优化
- 错误处理和日志记录系统完善