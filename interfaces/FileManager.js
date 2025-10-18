/**
 * 统一文件接口规范
 * 为不同环境(浏览器/Node.js)提供统一的文件处理接口
 */

class FileManager {
  /**
   * 初始化文件管理器
   */
  initialize() {
    throw new Error('initialize method must be implemented');
  }

  /**
   * 读取文件
   * @param {string} filePath - 文件路径
   * @returns {Promise<ArrayBuffer>} 文件数据
   */
  async readFile(filePath) {
    throw new Error('readFile method must be implemented');
  }

  /**
   * 写入文件
   * @param {string} filePath - 文件路径
   * @param {ArrayBuffer} data - 文件数据
   * @returns {Promise<void>}
   */
  async writeFile(filePath, data) {
    throw new Error('writeFile method must be implemented');
  }

  /**
   * 检查文件是否存在
   * @param {string} filePath - 文件路径
   * @returns {Promise<boolean>}
   */
  async fileExists(filePath) {
    throw new Error('fileExists method must be implemented');
  }

  /**
   * 创建目录
   * @param {string} dirPath - 目录路径
   * @returns {Promise<void>}
   */
  async createDirectory(dirPath) {
    throw new Error('createDirectory method must be implemented');
  }
}

module.exports = FileManager;