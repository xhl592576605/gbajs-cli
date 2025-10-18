# GBA.js CLI - Game Boy Advance Emulator for Node.js

GBA.js CLI是将原始的GBA.js浏览器端Game Boy Advance模拟器迁移到Node.js环境的项目。该项目允许在命令行界面中运行GBA游戏，无需浏览器即可体验经典游戏。

## 项目状态

目前项目已完成核心功能模块的Node.js适配器实现，包括：
- CPU核心处理模块
- 内存管理模块
- 视频渲染模块
- 音频处理模块
- 输入处理模块
- 存储管理模块

所有模块都已通过单元测试和集成测试验证。

## 功能特性

- [x] GBA游戏ROM加载和执行
- [x] 音频输出（通过speaker库）
- [x] 视频渲染（通过node-canvas库）
- [x] 输入处理（键盘映射）
- [x] 存档数据读写
- [x] 配置文件支持
- [x] 日志系统
- [x] 性能监控

## 安装

```bash
npm install
```

## 使用方法

### 基本用法

```bash
node bin/gbajs.js <rom-file>
```

### 带参数运行

```bash
node bin/gbajs.js <rom-file> [options]
```

### 选项

- `-s, --save <file>`: 存档文件路径
- `-o, --output <dir>`: 帧输出目录 (默认: ./frames)
- `-f, --fps <rate>`: 帧率 (默认: 60)
- `-v, --volume <level>`: 音量级别 0-100 (默认: 50)
- `-c, --config <file>`: 配置文件路径
- `--log-level <level>`: 日志级别 (error, warn, info, debug) (默认: info)
- `--log-file <file>`: 日志文件路径
- `--performance`: 启用性能监控
- `--performance-interval <ms>`: 性能报告间隔毫秒数 (默认: 5000)
- `--no-audio`: 禁用音频输出
- `--no-video`: 禁用视频输出
- `--headless`: 无头模式运行

### 配置文件

可以使用JSON格式的配置文件来设置运行参数。示例配置文件请参考 `config.example.json`。

## 开发

### 运行测试

```bash
npm test
```

### 项目结构

```
gbajs-cli/
├── adapters/           # Node.js适配器实现
├── bin/                # 命令行工具
├── docs/               # 文档
├── interfaces/         # 抽象接口定义
├── js/                 # 原始浏览器端代码
├── tests/              # 测试文件
├── utils/              # 工具类
├── package.json        # 项目配置
└── README.md           # 项目说明
```

## 技术架构

项目采用适配器模式将原始浏览器端API迁移到Node.js环境：

- **CPU核心**: 使用简化版本的ARM核心处理
- **内存管理**: Node.js环境适配的MMU实现
- **视频渲染**: 通过node-canvas库实现Canvas API
- **音频处理**: 通过speaker库实现音频输出
- **输入处理**: Node.js readline接口处理键盘输入
- **存储管理**: Node.js文件系统API处理存档

## 性能监控

启用性能监控后，系统会定期输出性能报告，包括：
- FPS (帧率)
- 平均帧时间
- 平均CPU时间
- 内存使用情况

## 许可证

原始项目使用BSD-2-Clause许可证，本项目同样遵循该许可证。

## 贡献

欢迎提交Issue和Pull Request来改进项目。