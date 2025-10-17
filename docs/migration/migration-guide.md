# GBA.js Node.js迁移指南

## 1. 概述

本文档详细说明了如何将GBA.js浏览器端模拟器迁移到Node.js环境。迁移过程涉及替换浏览器特定API，实现新的I/O处理机制，并保持核心模拟逻辑不变。

## 2. 环境准备

### 2.1 系统要求
- Node.js 14.0或更高版本
- npm包管理器
- 支持Canvas的系统环境（可能需要额外的系统库）

### 2.2 依赖安装
```bash
npm install
```

主要依赖包括：
- `canvas`: Node.js Canvas实现
- `commander`: 命令行参数解析
- `speaker`: 音频输出（可选）

## 3. 核心模块迁移

### 3.1 渲染模块迁移

#### 浏览器实现
在浏览器中，渲染通过HTML Canvas元素完成：
```javascript
// browser implementation
this.context = canvas.getContext('2d');
this.context.putImageData(pixelData, 0, 0);
```

#### Node.js实现
在Node.js中，使用[node-canvas](https://github.com/Automattic/node-canvas)库：
```javascript
// node.js implementation
const { createCanvas } = require('canvas');
const canvas = createCanvas(240, 160);
const ctx = canvas.getContext('2d');
// ... rendering code ...
// Save as image file
const fs = require('fs');
const out = fs.createWriteStream(__dirname + '/frame.png');
const stream = canvas.createPNGStream();
stream.pipe(out);
```

### 3.2 音频模块迁移

#### 浏览器实现
浏览器中使用Web Audio API：
```javascript
// browser implementation
window.AudioContext = window.AudioContext || window.webkitAudioContext;
this.context = new AudioContext();
```

#### Node.js实现
Node.js中可以使用多种音频库：
```javascript
// node.js implementation option 1: Using speaker
const Speaker = require('speaker');

// node.js implementation option 2: Save to file
const fs = require('fs');
// ... audio processing code ...
```

### 3.3 文件操作迁移

#### 浏览器实现
浏览器中使用File API：
```javascript
// browser implementation
var reader = new FileReader();
reader.onload = function(e) {
  // process file data
};
reader.readAsArrayBuffer(file);
```

#### Node.js实现
Node.js中使用fs模块：
```javascript
// node.js implementation
const fs = require('fs');
const data = fs.readFileSync(filePath);
// process file data
```

### 3.4 输入处理迁移

#### 浏览器实现
浏览器中使用DOM事件：
```javascript
// browser implementation
window.addEventListener("keydown", this.keyboardHandler.bind(this), true);
window.addEventListener("keyup", this.keyboardHandler.bind(this), true);
```

#### Node.js实现
Node.js中使用stdin处理：
```javascript
// node.js implementation
process.stdin.setRawMode(true);
process.stdin.setEncoding('utf8');
process.stdin.on('data', (key) => {
  // handle key presses
});
```

## 4. 接口适配层实现

### 4.1 抽象渲染接口

创建统一的渲染接口，支持不同环境：

```javascript
// interfaces/renderer.js
class Renderer {
  initialize(width, height) {
    throw new Error('Not implemented');
  }
  
  drawPixel(x, y, color) {
    throw new Error('Not implemented');
  }
  
  renderFrame(buffer) {
    throw new Error('Not implemented');
  }
  
  saveFrame(filename) {
    throw new Error('Not implemented');
  }
}

module.exports = Renderer;
```

### 4.2 浏览器渲染实现

```javascript
// adapters/browser-renderer.js
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
  
  // ... other methods
}
```

### 4.3 Node.js渲染实现

```javascript
// adapters/node-renderer.js
const { createCanvas } = require('canvas');

class NodeRenderer extends Renderer {
  initialize(width, height) {
    this.canvas = createCanvas(width, height);
    this.context = this.canvas.getContext('2d');
  }
  
  renderFrame(buffer) {
    // Convert buffer to ImageData and render
    // ... implementation ...
  }
  
  saveFrame(filename) {
    const fs = require('fs');
    const out = fs.createWriteStream(filename);
    const stream = this.canvas.createPNGStream();
    stream.pipe(out);
  }
  
  // ... other methods
}
```

## 5. 模块解耦与重构

### 5.1 核心逻辑与I/O分离

将核心模拟逻辑与I/O操作分离，通过事件或回调机制通信：

```javascript
// core/gba-core.js
class GBACore {
  constructor() {
    this.cpu = new ARMCore();
    this.mmu = new GameBoyAdvanceMMU();
    // ... other components
    
    // Use events for communication
    this.events = {
      frameReady: [],
      audioSample: [],
      saveRequested: []
    };
  }
  
  // Register event handlers
  on(event, handler) {
    if (this.events[event]) {
      this.events[event].push(handler);
    }
  }
  
  // Emit events
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(handler => handler(data));
    }
  }
}
```

### 5.2 环境适配器

创建环境适配器来处理不同环境的特定实现：

```javascript
// adapters/environment-adapter.js
class EnvironmentAdapter {
  static createRenderer() {
    if (typeof window !== 'undefined') {
      return new BrowserRenderer();
    } else {
      return new NodeRenderer();
    }
  }
  
  static createAudioHandler() {
    if (typeof window !== 'undefined') {
      return new BrowserAudioHandler();
    } else {
      return new NodeAudioHandler();
    }
  }
  
  static createFileManager() {
    if (typeof window !== 'undefined') {
      return new BrowserFileManager();
    } else {
      return new NodeFileManager();
    }
  }
}
```

## 6. 性能优化策略

### 6.1 内存管理
- 重用缓冲区避免频繁内存分配
- 使用对象池减少垃圾回收压力
- 优化数据结构减少内存占用

### 6.2 渲染优化
- 批量处理像素操作
- 使用Web Workers或Node.js worker_threads进行并行处理
- 实现脏矩形渲染减少不必要的绘制

### 6.3 音频优化
- 使用适当的缓冲区大小平衡延迟和性能
- 实现音频数据的压缩和流式处理
- 优化音频合成算法

## 7. 测试策略

### 7.1 单元测试
为每个模块编写单元测试，确保功能正确性：

```javascript
// tests/core/cpu.test.js
const { expect } = require('chai');
const ARMCore = require('../../js/core.js');

describe('ARMCore', function() {
  let cpu;
  
  beforeEach(function() {
    cpu = new ARMCore();
  });
  
  describe('resetCPU', function() {
    it('should initialize registers correctly', function() {
      cpu.resetCPU(0);
      expect(cpu.gprs[cpu.PC]).to.equal(4); // PC should be at startOffset + 4
    });
  });
  
  // ... more tests
});
```

### 7.2 集成测试
测试模块间的协作：

```javascript
// tests/integration/gba-integration.test.js
describe('GBA Integration', function() {
  it('should load ROM and run first frame', function(done) {
    // ... test implementation
  });
});
```

### 7.3 性能测试
监控关键性能指标：

```javascript
// tests/performance/performance.test.js
describe('Performance', function() {
  it('should maintain target frame rate', function() {
    // ... performance test implementation
  });
});
```

## 8. 部署与分发

### 8.1 NPM包发布
配置package.json以支持NPM发布：

```json
{
  "name": "gbajs-node",
  "version": "1.0.0",
  "description": "Game Boy Advance emulator for Node.js",
  "main": "lib/index.js",
  "bin": {
    "gbajs": "./bin/gbajs.js"
  },
  "files": [
    "lib/",
    "bin/",
    "docs/"
  ],
  // ... other configuration
}
```

### 8.2 Docker支持
创建Dockerfile以支持容器化部署：

```dockerfile
# Dockerfile
FROM node:14

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "bin/gbajs.js"]
```

## 9. 故障排除

### 9.1 常见问题

1. **Canvas库安装失败**
   - 确保系统已安装必要的依赖（如Cairo）
   - 在Linux系统上可能需要安装额外的库

2. **音频无法播放**
   - 检查系统音频配置
   - 确保安装了正确的音频库

3. **性能问题**
   - 监控CPU和内存使用情况
   - 调整缓冲区大小和帧率设置

### 9.2 调试技巧

1. **启用详细日志**
   ```javascript
   gba.logLevel = gba.LOG_ERROR | gba.LOG_WARN | gba.LOG_INFO | gba.LOG_DEBUG;
   ```

2. **使用性能分析工具**
   ```bash
   node --inspect bin/gbajs.js
   ```

3. **内存泄漏检测**
   使用Node.js内置的内存分析工具或第三方工具如clinic.js

## 10. 未来扩展

### 10.1 功能扩展
- 实现网络多人游戏支持
- 添加作弊码支持
- 实现游戏录制和回放功能

### 10.2 性能优化
- 使用WebAssembly优化核心模拟代码
- 实现GPU加速渲染
- 添加多线程支持

### 10.3 平台支持
- 扩展到其他JavaScript运行环境
- 实现移动平台支持
- 添加WebAssembly版本