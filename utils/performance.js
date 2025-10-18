/**
 * 性能监控工具
 * 用于监控和优化GBA模拟器的性能
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      frameTime: [],
      cpuTime: [],
      memoryUsage: [],
      audioProcessingTime: [],
      videoProcessingTime: []
    };
    this.startTime = null;
    this.frameCount = 0;
  }

  /**
   * 开始性能监控
   */
  start() {
    this.startTime = process.hrtime.bigint();
    this.frameCount = 0;
  }

  /**
   * 记录帧时间
   */
  recordFrame() {
    if (this.startTime) {
      const endTime = process.hrtime.bigint();
      const frameTime = Number(endTime - this.startTime) / 1000000; // 转换为毫秒
      this.metrics.frameTime.push(frameTime);
      this.frameCount++;

      // 保持最近100帧的数据
      if (this.metrics.frameTime.length > 100) {
        this.metrics.frameTime.shift();
      }

      this.startTime = endTime;
    }
  }

  /**
   * 记录CPU执行时间
   * @param {number} time - CPU执行时间(毫秒)
   */
  recordCPUTime(time) {
    this.metrics.cpuTime.push(time);

    // 保持最近100个数据点
    if (this.metrics.cpuTime.length > 100) {
      this.metrics.cpuTime.shift();
    }
  }

  /**
   * 记录内存使用情况
   */
  recordMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    this.metrics.memoryUsage.push({
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external
    });

    // 保持最近100个数据点
    if (this.metrics.memoryUsage.length > 100) {
      this.metrics.memoryUsage.shift();
    }
  }

  /**
   * 记录音频处理时间
   * @param {number} time - 音频处理时间(毫秒)
   */
  recordAudioProcessingTime(time) {
    this.metrics.audioProcessingTime.push(time);

    // 保持最近100个数据点
    if (this.metrics.audioProcessingTime.length > 100) {
      this.metrics.audioProcessingTime.shift();
    }
  }

  /**
   * 记录视频处理时间
   * @param {number} time - 视频处理时间(毫秒)
   */
  recordVideoProcessingTime(time) {
    this.metrics.videoProcessingTime.push(time);

    // 保持最近100个数据点
    if (this.metrics.videoProcessingTime.length > 100) {
      this.metrics.videoProcessingTime.shift();
    }
  }

  /**
   * 获取平均帧时间
   * @returns {number} 平均帧时间(毫秒)
   */
  getAverageFrameTime() {
    if (this.metrics.frameTime.length === 0) return 0;
    const sum = this.metrics.frameTime.reduce((a, b) => a + b, 0);
    return sum / this.metrics.frameTime.length;
  }

  /**
   * 获取平均CPU时间
   * @returns {number} 平均CPU时间(毫秒)
   */
  getAverageCPUTime() {
    if (this.metrics.cpuTime.length === 0) return 0;
    const sum = this.metrics.cpuTime.reduce((a, b) => a + b, 0);
    return sum / this.metrics.cpuTime.length;
  }

  /**
   * 获取FPS
   * @returns {number} FPS
   */
  getFPS() {
    const avgFrameTime = this.getAverageFrameTime();
    if (avgFrameTime === 0) return 0;
    return 1000 / avgFrameTime;
  }

  /**
   * 获取内存使用情况
   * @returns {object} 内存使用情况
   */
  getMemoryUsage() {
    if (this.metrics.memoryUsage.length === 0) return null;
    const latest = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
    return {
      rss: this._formatBytes(latest.rss),
      heapTotal: this._formatBytes(latest.heapTotal),
      heapUsed: this._formatBytes(latest.heapUsed),
      external: this._formatBytes(latest.external)
    };
  }

  /**
   * 格式化字节数
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的字符串
   */
  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * 生成性能报告
   * @returns {string} 性能报告
   */
  generateReport() {
    return `
Performance Report:
==================
FPS: ${this.getFPS().toFixed(2)}
Average Frame Time: ${this.getAverageFrameTime().toFixed(2)}ms
Average CPU Time: ${this.getAverageCPUTime().toFixed(2)}ms
Memory Usage: ${JSON.stringify(this.getMemoryUsage(), null, 2)}
Frames Processed: ${this.frameCount}
    `;
  }

  /**
   * 重置监控数据
   */
  reset() {
    this.metrics = {
      frameTime: [],
      cpuTime: [],
      memoryUsage: [],
      audioProcessingTime: [],
      videoProcessingTime: []
    };
    this.startTime = null;
    this.frameCount = 0;
  }
}

module.exports = PerformanceMonitor;