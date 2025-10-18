/**
 * Node.js渲染适配器
 * 实现Renderer接口的Node.js版本
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');
const Renderer = require('../interfaces/Renderer');

class NodeRenderer extends Renderer {
  /**
   * 构造函数
   */
  constructor() {
    super();
    this.canvas = null;
    this.context = null;
    this.width = 240;
    this.height = 160;
    this.fps = 60;
    this.frameCount = 0;
    this.outputDir = './frames';
  }

  /**
   * 初始化渲染器
   * @param {number} width - 渲染宽度
   * @param {number} height - 渲染高度
   * @param {string} outputDir - 输出目录
   */
  initialize(width, height, outputDir) {
    this.width = width || this.width;
    this.height = height || this.height;
    this.outputDir = outputDir || this.outputDir;

    // 创建输出目录
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // 创建canvas
    this.canvas = createCanvas(this.width, this.height);
    this.context = this.canvas.getContext('2d');
  }

  /**
   * 绘制单个像素
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {number} color - 颜色值 (RGBA格式)
   */
  drawPixel(x, y, color) {
    if (!this.context) {
      throw new Error('Renderer not initialized');
    }

    // 将RGBA颜色值分解为RGBA分量
    const r = (color >> 24) & 0xFF;
    const g = (color >> 16) & 0xFF;
    const b = (color >> 8) & 0xFF;
    const a = color & 0xFF;

    // 设置像素颜色
    this.context.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    this.context.fillRect(x, y, 1, 1);
  }

  /**
   * 渲染完整帧
   * @param {Buffer} buffer - 帧数据 (RGBA格式)
   */
  renderFrame(buffer) {
    if (!this.context) {
      throw new Error('Renderer not initialized');
    }

    // 创建ImageData对象
    const imageData = this.context.createImageData(this.width, this.height);

    // 将buffer数据复制到imageData
    for (let i = 0; i < buffer.length; i++) {
      imageData.data[i] = buffer[i];
    }

    // 渲染到canvas
    this.context.putImageData(imageData, 0, 0);
  }

  /**
   * 保存帧到文件
   * @param {string} filename - 文件名(可选)
   */
  saveFrame(filename) {
    if (!this.canvas) {
      throw new Error('Renderer not initialized');
    }

    // 生成文件名
    const name = filename || `frame_${this.frameCount.toString().padStart(6, '0')}.png`;
    const filePath = path.join(this.outputDir, name);

    // 保存为PNG文件
    const out = fs.createWriteStream(filePath);
    const stream = this.canvas.createPNGStream();
    stream.pipe(out);

    this.frameCount++;

    return new Promise((resolve, reject) => {
      out.on('finish', () => resolve(filePath));
      out.on('error', reject);
    });
  }

  /**
   * 设置帧率
   * @param {number} fps - 帧率
   */
  setFPS(fps) {
    this.fps = fps;
  }

  /**
   * 清空画布
   */
  clear() {
    if (!this.context) {
      throw new Error('Renderer not initialized');
    }

    this.context.clearRect(0, 0, this.width, this.height);
  }
}

module.exports = NodeRenderer;