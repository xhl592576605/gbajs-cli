/**
 * 统一渲染接口规范
 * 为不同环境(浏览器/Node.js)提供统一的渲染接口
 */

class Renderer {
  /**
   * 初始化渲染器
   * @param {number} width - 渲染宽度
   * @param {number} height - 渲染高度
   */
  initialize(width, height) {
    throw new Error('initialize method must be implemented');
  }

  /**
   * 渲染帧数据
   * @param {Uint8ClampedArray} pixelData - 像素数据
   */
  renderFrame(pixelData) {
    throw new Error('renderFrame method must be implemented');
  }

  /**
   * 保存帧到文件
   */
  saveFrame() {
    throw new Error('saveFrame method must be implemented');
  }

  /**
   * 清除渲染内容
   */
  clear() {
    throw new Error('clear method must be implemented');
  }
}

module.exports = Renderer;