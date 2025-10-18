/**
 * Node.js按键处理适配器
 * 适配GBA按键处理模块到Node.js环境
 */
const InputHandler = require('../interfaces/InputHandler');

function GameBoyAdvanceKeypad() {
  // GBA按键映射
  this.A = 0;
  this.B = 1;
  this.SELECT = 2;
  this.START = 3;
  this.RIGHT = 4;
  this.LEFT = 5;
  this.UP = 6;
  this.DOWN = 7;
  this.R = 8;
  this.L = 9;

  // 当前按键状态 (低10位表示按键状态，0表示按下，1表示释放)
  this.currentDown = 0x03FF;

  // Node.js环境特有属性
  this.inputHandler = null;
  this.keyMapping = {
    'z': this.A,
    'x': this.B,
    'a': this.L,
    's': this.R,
    'space': this.SELECT,
    'enter': this.START,
    'up': this.UP,
    'down': this.DOWN,
    'left': this.LEFT,
    'right': this.RIGHT
  };

  // 按键事件回调
  this.keyPressCallbacks = [];
  this.keyReleaseCallbacks = [];
}

/**
 * 设置Node.js输入处理器
 * @param {InputHandler} inputHandler - Node.js输入处理器实例
 */
GameBoyAdvanceKeypad.prototype.setInputHandler = function(inputHandler) {
  this.inputHandler = inputHandler;

  // 初始化输入处理器
  if (this.inputHandler) {
    this.inputHandler.initialize();
    this.inputHandler.setKeyMapping(this.keyMapping);

    // 注册按键事件处理
    this.inputHandler.onKeyPress(this.handleKeyPress.bind(this));
    this.inputHandler.onKeyRelease(this.handleKeyRelease.bind(this));
  }
};

/**
 * 处理按键按下事件
 * @param {string} key - 按键字符
 */
GameBoyAdvanceKeypad.prototype.handleKeyPress = function(key) {
  const gbaKey = this.keyMapping[key.toLowerCase()];
  if (gbaKey !== undefined) {
    const toggle = 1 << gbaKey;
    this.currentDown &= ~toggle;

    // 调用按键按下回调
    this.keyPressCallbacks.forEach(callback => callback(gbaKey));
  }
};

/**
 * 处理按键释放事件
 * @param {string} key - 按键字符
 */
GameBoyAdvanceKeypad.prototype.handleKeyRelease = function(key) {
  const gbaKey = this.keyMapping[key.toLowerCase()];
  if (gbaKey !== undefined) {
    const toggle = 1 << gbaKey;
    this.currentDown |= toggle;

    // 调用按键释放回调
    this.keyReleaseCallbacks.forEach(callback => callback(gbaKey));
  }
};

/**
 * 注册按键按下事件回调
 * @param {Function} callback - 回调函数
 */
GameBoyAdvanceKeypad.prototype.onKeyPress = function(callback) {
  this.keyPressCallbacks.push(callback);
};

/**
 * 注册按键释放事件回调
 * @param {Function} callback - 回调函数
 */
GameBoyAdvanceKeypad.prototype.onKeyRelease = function(callback) {
  this.keyReleaseCallbacks.push(callback);
};

/**
 * 开始监听输入事件
 */
GameBoyAdvanceKeypad.prototype.startListening = function() {
  if (this.inputHandler) {
    this.inputHandler.startListening();
  }
};

/**
 * 停止监听输入事件
 */
GameBoyAdvanceKeypad.prototype.stopListening = function() {
  if (this.inputHandler) {
    this.inputHandler.stopListening();
  }
};

/**
 * 设置按键映射
 * @param {Object} mapping - 按键映射表
 */
GameBoyAdvanceKeypad.prototype.setKeyMapping = function(mapping) {
  this.keyMapping = mapping;
  if (this.inputHandler) {
    this.inputHandler.setKeyMapping(mapping);
  }
};

/**
 * 获取当前按键状态
 * @returns {number} 按键状态
 */
GameBoyAdvanceKeypad.prototype.getCurrentState = function() {
  return this.currentDown;
};

/**
 * 检查特定按键是否按下
 * @param {number} key - 按键代码
 * @returns {boolean} 是否按下
 */
GameBoyAdvanceKeypad.prototype.isPressed = function(key) {
  return !(this.currentDown & (1 << key));
};

/**
 * 重置按键状态
 */
GameBoyAdvanceKeypad.prototype.reset = function() {
  this.currentDown = 0x03FF;
};

// 以下方法在Node.js环境中不需要实现，因为它们依赖浏览器API
GameBoyAdvanceKeypad.prototype.keyboardHandler = function(e) {
  // Node.js环境中不使用
};

GameBoyAdvanceKeypad.prototype.gamepadHandler = function(gamepad) {
  // Node.js环境中不使用
};

GameBoyAdvanceKeypad.prototype.gamepadConnectHandler = function(gamepad) {
  // Node.js环境中不使用
};

GameBoyAdvanceKeypad.prototype.gamepadDisconnectHandler = function(gamepad) {
  // Node.js环境中不使用
};

GameBoyAdvanceKeypad.prototype.pollGamepads = function() {
  // Node.js环境中不使用
};

GameBoyAdvanceKeypad.prototype.registerHandlers = function() {
  // Node.js环境中不使用浏览器事件监听器
  // 输入处理由inputHandler负责
};

module.exports = GameBoyAdvanceKeypad;