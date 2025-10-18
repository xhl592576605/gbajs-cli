/**
 * 统一音频接口规范
 * 为不同环境(浏览器/Node.js)提供统一的音频处理接口
 */

class AudioHandler {
  /**
   * 初始化音频处理器
   * @param {number} sampleRate - 采样率
   */
  initialize(sampleRate) {
    throw new Error('initialize method must be implemented');
  }

  /**
   * 推送音频样本
   * @param {number} leftSample - 左声道样本
   * @param {number} rightSample - 右声道样本
   */
  pushSample(leftSample, rightSample) {
    throw new Error('pushSample method must be implemented');
  }

  /**
   * 暂停音频输出
   * @param {boolean} paused - 是否暂停
   */
  pause(paused) {
    throw new Error('pause method must be implemented');
  }

  /**
   * 设置音量
   * @param {number} volume - 音量(0-1)
   */
  setVolume(volume) {
    throw new Error('setVolume method must be implemented');
  }
}

module.exports = AudioHandler;