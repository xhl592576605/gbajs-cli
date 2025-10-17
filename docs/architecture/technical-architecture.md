# GBA.js Node.js技术架构文档

## 1. 架构概述

GBA.js Node.js版本采用分层架构设计，将核心模拟逻辑与平台特定实现分离，通过适配器模式支持不同运行环境。

```
┌─────────────────────────────────────────────────────────────┐
│                    应用层 (Application)                      │
│  CLI界面  │  Web界面  │  桌面应用  │  服务端应用              │
├─────────────────────────────────────────────────────────────┤
│                    接口层 (Interfaces)                      │
│      渲染接口      │      音频接口      │      输入接口        │
├─────────────────────────────────────────────────────────────┤
│                    适配器层 (Adapters)                      │
│  浏览器适配器  │  Node.js适配器  │  桌面适配器  │  服务端适配器   │
├─────────────────────────────────────────────────────────────┤
│                    核心层 (Core)                           │
│   CPU模拟   │   内存管理   │   中断处理   │   I/O处理         │
├─────────────────────────────────────────────────────────────┤
│                    硬件层 (Hardware)                        │
│   视频处理   │   音频处理   │   输入处理   │   存储管理         │
└─────────────────────────────────────────────────────────────┘
```

## 2. 核心模块设计

### 2.1 CPU模拟模块 (ARMCore)

负责ARM7TDMI处理器指令集的模拟执行：

```javascript
// js/core.js
class ARMCore {
  constructor() {
    // 寄存器组
    this.gprs = new Int32Array(16); // 通用寄存器 R0-R15
    
    // 程序状态寄存器
    this.cpsrN = false; // 负数标志
    this.cpsrZ = false; // 零标志
    this.cpsrC = false; // 进位标志
    this.cpsrV = false; // 溢出标志
    
    // 处理器模式
    this.mode = this.MODE_SYSTEM;
    
    // 中断标志
    this.cpsrI = false; // IRQ禁用
    this.cpsrF = false; // FIQ禁用
  }
  
  // 指令执行
  step() {
    // 获取当前指令
    const instruction = this.loadInstruction(this.gprs[this.PC]);
    
    // 执行指令
    instruction();
    
    // 更新程序计数器
    this.gprs[this.PC] += this.instructionWidth;
  }
  
  // 指令编译
  compileArm(instruction) {
    // ARM指令编译逻辑
  }
  
  // 指令编译
  compileThumb(instruction) {
    // Thumb指令编译逻辑
  }
}
```

### 2.2 内存管理模块 (MMU)

负责内存映射和访问控制：

```javascript
// js/mmu.js
class GameBoyAdvanceMMU {
  constructor() {
    // 内存区域定义
    this.REGION_BIOS = 0x0;
    this.REGION_WORKING_RAM = 0x2;
    this.REGION_WORKING_IRAM = 0x3;
    this.REGION_IO = 0x4;
    this.REGION_PALETTE_RAM = 0x5;
    this.REGION_VRAM = 0x6;
    this.REGION_OAM = 0x7;
    this.REGION_CART0 = 0x8;
    
    // 内存映射
    this.memory = new Array(256);
  }
  
  // 内存读取
  load32(offset) {
    return this.memory[offset >>> this.BASE_OFFSET].load32(offset & 0x00FFFFFF);
  }
  
  // 内存写入
  store32(offset, value) {
    const maskedOffset = offset & 0x00FFFFFC;
    const memory = this.memory[offset >>> this.BASE_OFFSET];
    memory.store32(maskedOffset, value);
    memory.invalidatePage(maskedOffset);
    memory.invalidatePage(maskedOffset + 2);
  }
}
```

### 2.3 视频处理模块 (Video)

负责视频渲染和显示：

```javascript
// js/video.js
class GameBoyAdvanceVideo {
  constructor() {
    // 渲染路径
    this.renderPath = new GameBoyAdvanceSoftwareRenderer();
    
    // 显示参数
    this.HORIZONTAL_PIXELS = 240;
    this.VERTICAL_PIXELS = 160;
    
    // 时序控制
    this.inHblank = false;
    this.inVblank = false;
  }
  
  // 更新定时器
  updateTimers(cpu) {
    // HBlank和VBlank处理
  }
  
  // 设置后备渲染目标
  setBacking(backing) {
    // 设置Canvas上下文或Node.js Canvas
  }
}
```

### 2.4 音频处理模块 (Audio)

负责音频生成和输出：

```javascript
// js/audio.js
class GameBoyAdvanceAudio {
  constructor() {
    // 音频上下文
    if (typeof window !== 'undefined') {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.context = new AudioContext();
    }
    
    // 音频缓冲区
    this.buffers = [new Float32Array(this.maxSamples), new Float32Array(this.maxSamples)];
  }
  
  // 音频处理
  audioProcess(audioProcessingEvent) {
    // 音频数据处理和输出
  }
  
  // 采样
  sample() {
    // 生成音频样本
  }
}
```

## 3. 接口层设计

### 3.1 渲染接口

```javascript
// interfaces/Renderer.js
class Renderer {
  constructor() {}
  
  // 初始化渲染器
  initialize(width, height) {}
  
  // 绘制像素
  drawPixel(x, y, color) {}
  
  // 渲染帧
  renderFrame(buffer) {}
  
  // 保存帧
  saveFrame(filename) {}
  
  // 设置帧率
  setFPS(fps) {}
}
```

### 3.2 音频接口

```javascript
// interfaces/AudioHandler.js
class AudioHandler {
  constructor() {}
  
  // 初始化音频处理器
  initialize(sampleRate) {}
  
  // 推送音频样本
  pushSample(left, right) {}
  
  // 播放音频
  play() {}
  
  // 暂停音频
  pause() {}
  
  // 设置音量
  setVolume(volume) {}
}
```

### 3.3 输入接口

```javascript
// interfaces/InputHandler.js
class InputHandler {
  constructor() {}
  
  // 开始监听输入
  startListening() {}
  
  // 停止监听输入
  stopListening() {}
  
  // 按键按下事件
  onKeyPress(callback) {}
  
  // 按键释放事件
  onKeyRelease(callback) {}
}
```

## 4. 适配器层实现

### 4.1 浏览器适配器

```javascript
// adapters/BrowserRenderer.js
class BrowserRenderer extends Renderer {
  initialize(width, height) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d');
  }
  
  renderFrame(buffer) {
    this.context.putImageData(buffer, 0, 0);
  }
}

// adapters/BrowserAudioHandler.js
class BrowserAudioHandler extends AudioHandler {
  initialize(sampleRate) {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.sampleRate = sampleRate;
  }
  
  pushSample(left, right) {
    // 使用Web Audio API处理音频
  }
}
```

### 4.2 Node.js适配器

```javascript
// adapters/NodeRenderer.js
const { createCanvas } = require('canvas');

class NodeRenderer extends Renderer {
  initialize(width, height) {
    this.canvas = createCanvas(width, height);
    this.context = this.canvas.getContext('2d');
  }
  
  renderFrame(buffer) {
    // 转换并渲染帧数据
  }
  
  saveFrame(filename) {
    const fs = require('fs');
    const out = fs.createWriteStream(filename);
    const stream = this.canvas.createPNGStream();
    stream.pipe(out);
  }
}

// adapters/NodeAudioHandler.js
class NodeAudioHandler extends AudioHandler {
  initialize(sampleRate) {
    // 使用Node.js音频库初始化
  }
  
  pushSample(left, right) {
    // 处理音频样本
  }
}
```

## 5. 数据流设计

### 5.1 指令执行流

```
1. CPU获取指令 → 2. 指令解码 → 3. 执行指令 → 4. 更新寄存器 → 5. 检查中断
     ↑                                                    ↓
     └────────────────────── 循环执行 ←─────────────────────┘
```

### 5.2 视频渲染流

```
1. CPU执行 → 2. 视频寄存器更新 → 3. 扫描线渲染 → 4. 帧完成 → 5. 输出显示
     ↓              ↓                ↓              ↓           ↓
   指令执行      内存访问        软件渲染       VBlank中断    渲染接口
```

### 5.3 音频处理流

```
1. CPU执行 → 2. 音频寄存器更新 → 3. 声音通道处理 → 4. 音频采样 → 5. 输出播放
     ↓              ↓                 ↓               ↓            ↓
   指令执行      内存访问         波形生成        缓冲区填充      音频接口
```

## 6. 性能优化策略

### 6.1 指令缓存

```javascript
// js/mmu.js
class MemoryBlock {
  constructor(size, cacheBits) {
    this.ICACHE_PAGE_BITS = cacheBits;
    this.PAGE_MASK = (2 << this.ICACHE_PAGE_BITS) - 1;
    this.icache = new Array(size >> (this.ICACHE_PAGE_BITS + 1));
  }
  
  invalidatePage(address) {
    const page = this.icache[(address & this.mask) >> this.ICACHE_PAGE_BITS];
    if (page) {
      page.invalid = true;
    }
  }
}
```

### 6.2 批量处理

```javascript
// js/video.js
class GameBoyAdvanceVideo {
  updateTimers(cpu) {
    // 批量处理多个扫描线
    if (this.vcount < this.VERTICAL_PIXELS) {
      this.renderPath.drawScanline(this.vcount);
    }
  }
}
```

### 6.3 内存优化

```javascript
// js/core.js
class ARMCore {
  fetchPage(address) {
    // 页面缓存减少内存访问
    const region = address >> this.mmu.BASE_OFFSET;
    const pageId = this.mmu.addressToPage(region, address & this.mmu.OFFSET_MASK);
    
    if (region == this.pageRegion && pageId == this.pageId && !this.page.invalid) {
      return; // 使用缓存页面
    }
    
    // 加载新页面
    this.page = this.mmu.accessPage(region, pageId);
  }
}
```

## 7. 错误处理与日志

### 7.1 错误处理机制

```javascript
// js/gba.js
class GameBoyAdvance {
  ERROR(error) {
    if (this.logLevel & this.LOG_ERROR) {
      this.log(this.LOG_ERROR, error);
    }
  }
  
  WARN(warn) {
    if (this.logLevel & this.LOG_WARN) {
      this.log(this.LOG_WARN, warn);
    }
  }
  
  ASSERT(test, err) {
    if (!test) {
      throw new Error("Assertion failed: " + err);
    }
  }
}
```

### 7.2 日志系统

```javascript
// js/gba.js
class GameBoyAdvance {
  constructor() {
    this.LOG_ERROR = 1;
    this.LOG_WARN = 2;
    this.LOG_STUB = 4;
    this.LOG_INFO = 8;
    this.LOG_DEBUG = 16;
    
    this.logLevel = this.LOG_ERROR | this.LOG_WARN;
  }
  
  setLogger(logger) {
    this.log = logger;
  }
  
  log(level, message) {
    // 默认空实现，可被外部logger替换
  }
}
```

## 8. 测试架构

### 8.1 单元测试结构

```
tests/
├── core/
│   ├── cpu.test.js
│   ├── mmu.test.js
│   └── irq.test.js
├── hardware/
│   ├── video.test.js
│   ├── audio.test.js
│   └── keypad.test.js
├── interfaces/
│   ├── renderer.test.js
│   └── audio-handler.test.js
└── integration/
    ├── gba-core.test.js
    └── performance.test.js
```

### 8.2 测试工具

```javascript
// tests/core/cpu.test.js
const { expect } = require('chai');
const sinon = require('sinon');
const ARMCore = require('../../js/core.js');

describe('ARMCore', function() {
  let cpu;
  let mockMMU;
  
  beforeEach(function() {
    cpu = new ARMCore();
    mockMMU = sinon.mock(cpu.mmu);
  });
  
  afterEach(function() {
    sinon.restore();
  });
  
  describe('instruction execution', function() {
    it('should correctly execute MOV instruction', function() {
      // 测试MOV指令执行
    });
  });
});
```

## 9. 部署架构

### 9.1 模块组织

```
gbajs-node/
├── bin/
│   └── gbajs.js          # CLI入口
├── lib/
│   ├── core/             # 核心模拟模块
│   ├── interfaces/       # 接口定义
│   ├── adapters/         # 环境适配器
│   └── hardware/         # 硬件模拟模块
├── tests/                # 测试文件
├── docs/                 # 文档
├── examples/             # 示例代码
├── package.json          # 包配置
└── README.md             # 项目说明
```

### 9.2 构建流程

```javascript
// package.json
{
  "scripts": {
    "build": "babel src -d lib",
    "test": "mocha tests/**/*.test.js",
    "test:coverage": "nyc npm test",
    "start": "node bin/gbajs.js"
  }
}
```

## 10. 扩展性设计

### 10.1 插件系统

```javascript
// lib/plugin-manager.js
class PluginManager {
  constructor() {
    this.plugins = [];
  }
  
  register(plugin) {
    this.plugins.push(plugin);
    plugin.initialize();
  }
  
  executeHook(hookName, data) {
    this.plugins.forEach(plugin => {
      if (plugin[hookName]) {
        plugin[hookName](data);
      }
    });
  }
}
```

### 10.2 配置系统

```javascript
// lib/config-manager.js
class ConfigManager {
  constructor() {
    this.config = {
      video: {
        fps: 60,
        scale: 1
      },
      audio: {
        enabled: true,
        volume: 0.5
      },
      input: {
        bindings: {}
      }
    };
  }
  
  loadFromFile(path) {
    // 从文件加载配置
  }
  
  saveToFile(path) {
    // 保存配置到文件
  }
}
```

通过以上架构设计，GBA.js Node.js版本能够保持与浏览器版本相同的功能和性能，同时具备更好的可维护性和扩展性。