/**
 * Node.js存档数据处理适配器
 * 适配GBA存档数据处理模块到Node.js环境
 */
const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

// SRAM存档数据类
function SRAMSavedata(size) {
  this.buffer = new ArrayBuffer(size);
  this.view = new DataView(this.buffer);
  this.writePending = false;
  this.savePath = null;
}

SRAMSavedata.prototype.load8 = function(offset) {
  return this.view.getInt8(offset);
};

SRAMSavedata.prototype.load16 = function(offset) {
  // Unaligned 16-bit loads are unpredictable...let's just pretend they work
  return this.view.getInt16(offset, true);
};

SRAMSavedata.prototype.loadU8 = function(offset) {
  return this.view.getUint8(offset);
};

SRAMSavedata.prototype.loadU16 = function(offset) {
  // Unaligned 16-bit loads are unpredictable...let's just pretend they work
  return this.view.getUint16(offset, true);
};

SRAMSavedata.prototype.load32 = function(offset) {
  // Unaligned 32-bit loads are "rotated" so they make some semblance of sense
  var rotate = (offset & 3) << 3;
  var mem = this.view.getInt32(offset & 0xFFFFFFFC, true);
  return (mem >>> rotate) | (mem << (32 - rotate));
};

SRAMSavedata.prototype.store8 = function(offset, value) {
  this.view.setInt8(offset, value);
  this.writePending = true;
};

SRAMSavedata.prototype.store16 = function(offset, value) {
  this.view.setInt16(offset, value, true);
  this.writePending = true;
};

SRAMSavedata.prototype.store32 = function(offset, value) {
  this.view.setInt32(offset, value, true);
  this.writePending = true;
};

/**
 * 设置存档文件路径
 * @param {string} savePath - 存档文件路径
 */
SRAMSavedata.prototype.setSavePath = function(savePath) {
  this.savePath = savePath;
};

/**
 * 从文件加载存档数据
 */
SRAMSavedata.prototype.loadFromFile = function() {
  if (this.savePath && fs.existsSync(this.savePath)) {
    try {
      const data = fs.readFileSync(this.savePath);
      const newBuffer = new ArrayBuffer(data.length);
      const newView = new DataView(newBuffer);
      for (let i = 0; i < data.length; i++) {
        newView.setUint8(i, data[i]);
      }
      this.buffer = newBuffer;
      this.view = newView;
      return true;
    } catch (e) {
      console.warn('Failed to load save data from file:', e);
      return false;
    }
  }
  return false;
};

/**
 * 保存存档数据到文件
 */
SRAMSavedata.prototype.saveToFile = function() {
  if (this.savePath && this.writePending) {
    try {
      const buffer = Buffer.from(this.buffer);
      fs.writeFileSync(this.savePath, buffer);
      this.writePending = false;
      return true;
    } catch (e) {
      console.warn('Failed to save save data to file:', e);
      return false;
    }
  }
  return false;
};

// Flash存档数据类
function FlashSavedata(size) {
  this.buffer = new ArrayBuffer(size);
  this.view = new DataView(this.buffer);

  this.COMMAND_WIPE = 0x10;
  this.COMMAND_ERASE_SECTOR = 0x30;
  this.COMMAND_ERASE = 0x80;
  this.COMMAND_ID = 0x90;
  this.COMMAND_WRITE = 0xA0;
  this.COMMAND_SWITCH_BANK = 0xB0;
  this.COMMAND_TERMINATE_ID = 0xF0;

  this.ID_PANASONIC = 0x1B32;
  this.ID_SANYO = 0x1362;

  this.bank0 = new DataView(this.buffer, 0, 0x00010000);
  if (size > 0x00010000) {
    this.id = this.ID_SANYO;
    this.bank1 = new DataView(this.buffer, 0x00010000);
  } else {
    this.id = this.ID_PANASONIC;
    this.bank1 = null;
  }
  this.bank = this.bank0;

  this.idMode = false;
  this.writePending = false;

  this.first = 0;
  this.second = 0;
  this.command = 0;
  this.pendingCommand = 0;

  this.savePath = null;
}

FlashSavedata.prototype.load8 = function(offset) {
  if (this.idMode && offset < 2) {
    return (this.id >> (offset << 3)) & 0xFF;
  } else if (offset < 0x10000) {
    return this.bank.getInt8(offset);
  } else {
    return 0;
  }
};

FlashSavedata.prototype.load16 = function(offset) {
  return (this.load8(offset) & 0xFF) | (this.load8(offset + 1) << 8);
};

FlashSavedata.prototype.load32 = function(offset) {
  return (this.load8(offset) & 0xFF) | (this.load8(offset + 1) << 8) | (this.load8(offset + 2) << 16) | (this.load8(offset + 3) << 24);
};

FlashSavedata.prototype.loadU8 = function(offset) {
  return this.load8(offset) & 0xFF;
};

FlashSavedata.prototype.loadU16 = function(offset) {
  return (this.loadU8(offset) & 0xFF) | (this.loadU8(offset + 1) << 8);
};

FlashSavedata.prototype.store8 = function(offset, value) {
  switch (this.command) {
  case 0:
    if (offset == 0x5555) {
      if (this.second == 0x55) {
        switch (value) {
        case this.COMMAND_ERASE:
          this.pendingCommand = value;
          break;
        case this.COMMAND_ID:
          this.idMode = true;
          break;
        case this.COMMAND_TERMINATE_ID:
          this.idMode = false;
          break;
        default:
          this.command = value;
          break;
        }
        this.second = 0;
        this.first = 0;
      } else {
        this.command = 0;
        this.first = value;
        this.idMode = false;
      }
    } else if (offset == 0x2AAA && this.first == 0xAA) {
      this.first = 0;
      if (this.pendingCommand) {
        this.command = this.pendingCommand;
      } else {
        this.second = value;
      }
    }
    break;
  case this.COMMAND_ERASE:
    switch (value) {
    case this.COMMAND_WIPE:
      if (offset == 0x5555) {
        for (var i = 0; i < this.view.byteLength; i += 4) {
          this.view.setInt32(i, -1);
        }
      }
      break;
    case this.COMMAND_ERASE_SECTOR:
      if ((offset & 0x0FFF) == 0) {
        for (var i = offset; i < offset + 0x1000; i += 4) {
          this.bank.setInt32(i, -1);
        }
      }
      break;
    }
    this.pendingCommand = 0;
    this.command = 0;
    break;
  case this.COMMAND_WRITE:
    this.bank.setInt8(offset, value);
    this.command = 0;

    this.writePending = true;
    break;
  case this.COMMAND_SWITCH_BANK:
    if (this.bank1 && offset == 0) {
      if (value == 1) {
        this.bank = this.bank1;
      } else {
        this.bank = this.bank0;
      }
    }
    this.command = 0;
    break;
  }
};

FlashSavedata.prototype.store16 = function(offset, value) {
  throw new Error("Unaligned save to flash!");
};

FlashSavedata.prototype.store32 = function(offset, value) {
  throw new Error("Unaligned save to flash!");
};

/**
 * 设置存档文件路径
 * @param {string} savePath - 存档文件路径
 */
FlashSavedata.prototype.setSavePath = function(savePath) {
  this.savePath = savePath;
};

/**
 * 从文件加载存档数据
 */
FlashSavedata.prototype.loadFromFile = function() {
  if (this.savePath && fs.existsSync(this.savePath)) {
    try {
      const data = fs.readFileSync(this.savePath);
      const newBuffer = new ArrayBuffer(data.length);
      const newView = new DataView(newBuffer);
      for (let i = 0; i < data.length; i++) {
        newView.setUint8(i, data[i]);
      }

      // 更新bank引用
      this.buffer = newBuffer;
      this.view = newView;
      this.bank0 = new DataView(this.buffer, 0, 0x00010000);
      if (data.length > 0x00010000) {
        this.bank1 = new DataView(this.buffer, 0x00010000);
      } else {
        this.bank1 = null;
      }
      this.bank = this.bank0;

      return true;
    } catch (e) {
      console.warn('Failed to load save data from file:', e);
      return false;
    }
  }
  return false;
};

/**
 * 保存存档数据到文件
 */
FlashSavedata.prototype.saveToFile = function() {
  if (this.savePath && this.writePending) {
    try {
      const buffer = Buffer.from(this.buffer);
      fs.writeFileSync(this.savePath, buffer);
      this.writePending = false;
      return true;
    } catch (e) {
      console.warn('Failed to save save data to file:', e);
      return false;
    }
  }
  return false;
};

// EEPROM存档数据类
function EEPROMSavedata(size, mmu) {
  this.buffer = new ArrayBuffer(size);
  this.view = new DataView(this.buffer);

  this.writeAddress = 0;
  this.readBitsRemaining = 0;
  this.readAddress = 0;

  this.command = 0;
  this.commandBitsRemaining = 0;

  this.realSize = 0;
  this.addressBits = 0;
  this.writePending = false;

  this.dma = mmu.core.irq.dma[3];

  this.COMMAND_NULL = 0;
  this.COMMAND_PENDING = 1;
  this.COMMAND_WRITE = 2;
  this.COMMAND_READ_PENDING = 3;
  this.COMMAND_READ = 4;

  this.savePath = null;
}

EEPROMSavedata.prototype.load8 = function(offset) {
  throw new Error("Unsupported 8-bit access!");
};

EEPROMSavedata.prototype.load16 = function(offset) {
  return this.loadU16(offset);
};

EEPROMSavedata.prototype.loadU8 = function(offset) {
  throw new Error("Unsupported 8-bit access!");
};

EEPROMSavedata.prototype.loadU16 = function(offset) {
  if (this.command != this.COMMAND_READ || !this.dma.enable) {
    return 1;
  }
  --this.readBitsRemaining;
  if (this.readBitsRemaining < 64) {
    var step = 63 - this.readBitsRemaining;
    var data = this.view.getUint8((this.readAddress + step) >> 3, false) >> (0x7 - (step & 0x7));
    if (!this.readBitsRemaining) {
      this.command = this.COMMAND_NULL;
    }
    return data & 0x1;
  }
  return 0;
};

EEPROMSavedata.prototype.load32 = function(offset) {
  throw new Error("Unsupported 32-bit access!");
};

EEPROMSavedata.prototype.store8 = function(offset, value) {
  throw new Error("Unsupported 8-bit access!");
};

EEPROMSavedata.prototype.store16 = function(offset, value) {
  switch (this.command) {
  // Read header
  case this.COMMAND_NULL:
  default:
    this.command = value & 0x1;
    break;
  case this.COMMAND_PENDING:
    this.command <<= 1;
    this.command |= value & 0x1;
    if (this.command == this.COMMAND_WRITE) {
      if (!this.realSize) {
        var bits = this.dma.count - 67;
        this.realSize = 8 << bits;
        this.addressBits = bits;
      }
      this.commandBitsRemaining = this.addressBits + 64 + 1;
      this.writeAddress = 0;
    } else {
      if (!this.realSize) {
        var bits = this.dma.count - 3;
        this.realSize = 8 << bits;
        this.addressBits = bits;
      }
      this.commandBitsRemaining = this.addressBits + 1;
      this.readAddress = 0;
    }
    break;
  // Do commands
  case this.COMMAND_WRITE:
    // Write
    if (--this.commandBitsRemaining > 64) {
      this.writeAddress <<= 1;
      this.writeAddress |= (value & 0x1) << 6;
    } else if (this.commandBitsRemaining <= 0) {
      this.command = this.COMMAND_NULL;
      this.writePending = true;
    } else {
      var current = this.view.getUint8(this.writeAddress >> 3);
      current &= ~(1 << (0x7 - (this.writeAddress & 0x7)));
      current |= (value & 0x1) << (0x7 - (this.writeAddress & 0x7));
      this.view.setUint8(this.writeAddress >> 3, current);
      ++this.writeAddress;
    }
    break;
  case this.COMMAND_READ_PENDING:
    // Read
    if (--this.commandBitsRemaining > 0) {
      this.readAddress <<= 1;
      if (value & 0x1) {
        this.readAddress |= 0x40;
      }
    } else {
      this.readBitsRemaining = 68;
      this.command = this.COMMAND_READ;
    }
    break;
  }
};

EEPROMSavedata.prototype.store32 = function(offset, value) {
  throw new Error("Unsupported 32-bit access!");
};

/**
 * 设置存档文件路径
 * @param {string} savePath - 存档文件路径
 */
EEPROMSavedata.prototype.setSavePath = function(savePath) {
  this.savePath = savePath;
};

/**
 * 从文件加载存档数据
 */
EEPROMSavedata.prototype.loadFromFile = function() {
  if (this.savePath && fs.existsSync(this.savePath)) {
    try {
      const data = fs.readFileSync(this.savePath);
      const newBuffer = new ArrayBuffer(data.length);
      const newView = new DataView(newBuffer);
      for (let i = 0; i < data.length; i++) {
        newView.setUint8(i, data[i]);
      }
      this.buffer = newBuffer;
      this.view = newView;
      return true;
    } catch (e) {
      console.warn('Failed to load save data from file:', e);
      return false;
    }
  }
  return false;
};

/**
 * 保存存档数据到文件
 */
EEPROMSavedata.prototype.saveToFile = function() {
  if (this.savePath && this.writePending) {
    try {
      const buffer = Buffer.from(this.buffer);
      fs.writeFileSync(this.savePath, buffer);
      this.writePending = false;
      return true;
    } catch (e) {
      console.warn('Failed to save save data to file:', e);
      return false;
    }
  }
  return false;
};

module.exports = {
  SRAMSavedata,
  FlashSavedata,
  EEPROMSavedata
};