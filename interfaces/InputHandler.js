/**
 * 统一输入接口规范
 * 为不同环境(浏览器/Node.js)提供统一的输入处理接口
 */

class InputHandler {
  /**
   * 初始化输入处理器
   */
  initialize() {
    throw new Error('initialize method must be implemented');
  }

  /**
   * 处理按键按下事件
   * @param {string} key - 按键名称
   */
  onKeyDown(key) {
    throw new Error('onKeyDown method must be implemented');
  }

  /**
   * 处理按键释放事件
   * @param {string} key - 按键名称
   */
  onKeyUp(key) {
    throw new Error('onKeyUp method must be implemented');
  }

  /**
   * 映射按键到GBA按键
   * @param {string} key - 按键名称
   * @returns {number|null} GBA按键代码
   */
  mapKeyToGBA(key) {
    throw new Error('mapKeyToGBA method must be implemented');
  }

  /**
   * 设置按键事件回调
   * @param {function} callback - 回调函数
   */
  setKeyCallback(callback) {
    throw new Error('setKeyCallback method must be implemented');
  }
}

module.exports = InputHandler;