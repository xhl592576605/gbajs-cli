/**
 * Node.js视频处理适配器
 * 适配GBA视频渲染模块到Node.js环境
 */
const GameBoyAdvanceSoftwareRenderer = require('./../js/video/software.js');
const NodeRenderer = require('./NodeRenderer.js');

function GameBoyAdvanceVideo() {
  // 创建一个默认的渲染路径，避免构造函数错误
  this.renderPath = {
    clear: function() {},
    freeze: function() { return {}; },
    defrost: function() {},
    setBacking: function() {},
    finishDraw: function() {},
    startDraw: function() {},
    drawScanline: function() {}
  };

  // 尝试初始化实际的渲染器
  try {
    this.renderPath = new GameBoyAdvanceSoftwareRenderer();
  } catch (e) {
    console.warn('Failed to initialize GameBoyAdvanceSoftwareRenderer:', e);
  }

  this.CYCLES_PER_PIXEL = 4;

  this.HORIZONTAL_PIXELS = 240;
  this.HBLANK_PIXELS = 68;
  this.HDRAW_LENGTH = 1006;
  this.HBLANK_LENGTH = 226;
  this.HORIZONTAL_LENGTH = 1232;

  this.VERTICAL_PIXELS = 160;
  this.VBLANK_PIXELS = 68;
  this.VERTICAL_TOTAL_PIXELS = 228;

  this.TOTAL_LENGTH = 280896;

  this.drawCallback = function() {};
  this.vblankCallback = function() {};

  // Node.js环境特有属性
  this.renderer = null;
  this.frameBuffer = null;
}

GameBoyAdvanceVideo.prototype.clear = function() {
  if (this.renderPath && typeof this.renderPath.clear === 'function') {
    try {
      this.renderPath.clear(this.cpu.mmu);
    } catch (e) {
      console.warn('Error clearing render path:', e);
    }
  }

  // DISPSTAT
  this.DISPSTAT_MASK = 0xFF38;
  this.inHblank = false;
  this.inVblank = false;
  this.vcounter = 0;
  this.vblankIRQ = 0;
  this.hblankIRQ = 0;
  this.vcounterIRQ = 0;
  this.vcountSetting = 0;

  // VCOUNT
  this.vcount = -1;

  this.lastHblank = 0;
  this.nextHblank = this.HDRAW_LENGTH;
  this.nextEvent = this.nextHblank;

  this.nextHblankIRQ = 0;
  this.nextVblankIRQ = 0;
  this.nextVcounterIRQ = 0;
};

GameBoyAdvanceVideo.prototype.freeze = function() {
  let renderPathData = {};
  if (this.renderPath && typeof this.renderPath.freeze === 'function') {
    try {
      renderPathData = this.renderPath.freeze(this.core.encodeBase64);
    } catch (e) {
      console.warn('Error freezing render path:', e);
    }
  }
  
  return {
    'inHblank': this.inHblank,
    'inVblank': this.inVblank,
    'vcounter': this.vcounter,
    'vblankIRQ': this.vblankIRQ,
    'hblankIRQ': this.hblankIRQ,
    'vcounterIRQ': this.vcounterIRQ,
    'vcountSetting': this.vcountSetting,
    'vcount': this.vcount,
    'lastHblank': this.lastHblank,
    'nextHblank': this.nextHblank,
    'nextEvent': this.nextEvent,
    'nextHblankIRQ': this.nextHblankIRQ,
    'nextVblankIRQ': this.nextVblankIRQ,
    'nextVcounterIRQ': this.nextVcounterIRQ,
    'renderPath': renderPathData
  };
};

GameBoyAdvanceVideo.prototype.defrost = function(frost) {
  this.inHblank = frost.inHblank;
  this.inVblank = frost.inVblank;
  this.vcounter = frost.vcounter;
  this.vblankIRQ = frost.vblankIRQ;
  this.hblankIRQ = frost.hblankIRQ;
  this.vcounterIRQ = frost.vcounterIRQ;
  this.vcountSetting = frost.vcountSetting;
  this.vcount = frost.vcount;
  this.lastHblank = frost.lastHblank;
  this.nextHblank = frost.nextHblank;
  this.nextEvent = frost.nextEvent;
  this.nextHblankIRQ = frost.nextHblankIRQ;
  this.nextVblankIRQ = frost.nextVblankIRQ;
  this.nextVcounterIRQ = frost.nextVcounterIRQ;
  
  if (this.renderPath && typeof this.renderPath.defrost === 'function') {
    try {
      this.renderPath.defrost(frost.renderPath, this.core.decodeBase64);
    } catch (e) {
      console.warn('Error defrosting render path:', e);
    }
  }
};

/**
 * 设置Node.js渲染器
 * @param {NodeRenderer} renderer - Node.js渲染器实例
 */
GameBoyAdvanceVideo.prototype.setRenderer = function(renderer) {
  this.renderer = renderer;

  // 初始化渲染器
  if (this.renderer) {
    this.renderer.initialize(this.HORIZONTAL_PIXELS, this.VERTICAL_PIXELS);
  }
};

/**
 * 设置后备渲染目标
 * @param {Object} backing - 渲染目标对象
 */
GameBoyAdvanceVideo.prototype.setBacking = function(backing) {
  // 在Node.js环境中，我们不需要创建ImageData对象
  // 而是直接使用渲染器
  if (this.renderPath && typeof this.renderPath.setBacking === 'function') {
    try {
      this.renderPath.setBacking(backing);
    } catch (e) {
      console.warn('Error setting backing:', e);
    }
  }
};

GameBoyAdvanceVideo.prototype.updateTimers = function(cpu) {
  var cycles = cpu.cycles;

  if (this.nextEvent <= cycles) {
    if (this.inHblank) {
      // End Hblank
      this.inHblank = false;
      this.nextEvent = this.nextHblank;

      ++this.vcount;

      switch (this.vcount) {
      case this.VERTICAL_PIXELS:
        this.inVblank = true;
        if (this.renderPath && typeof this.renderPath.finishDraw === 'function') {
          try {
            this.renderPath.finishDraw(this);
          } catch (e) {
            console.warn('Error finishing draw:', e);
          }
        }
        this.nextVblankIRQ = this.nextEvent + this.TOTAL_LENGTH;
        if (this.cpu && this.cpu.mmu && typeof this.cpu.mmu.runVblankDmas === 'function') {
          try {
            this.cpu.mmu.runVblankDmas();
          } catch (e) {
            console.warn('Error running VBlank DMAs:', e);
          }
        }
        if (this.vblankIRQ && this.cpu && this.cpu.irq && typeof this.cpu.irq.raiseIRQ === 'function') {
          try {
            this.cpu.irq.raiseIRQ(this.cpu.irq.IRQ_VBLANK);
          } catch (e) {
            console.warn('Error raising VBlank IRQ:', e);
          }
        }
        this.vblankCallback();
        break;
      case this.VERTICAL_TOTAL_PIXELS - 1:
        this.inVblank = false;
        break;
      case this.VERTICAL_TOTAL_PIXELS:
        this.vcount = 0;
        if (this.renderPath && typeof this.renderPath.startDraw === 'function') {
          try {
            this.renderPath.startDraw();
          } catch (e) {
            console.warn('Error starting draw:', e);
          }
        }
        break;
      }

      this.vcounter = this.vcount == this.vcountSetting;
      if (this.vcounter && this.vcounterIRQ && this.cpu && this.cpu.irq && typeof this.cpu.irq.raiseIRQ === 'function') {
        try {
          this.cpu.irq.raiseIRQ(this.cpu.irq.IRQ_VCOUNTER);
          this.nextVcounterIRQ += this.TOTAL_LENGTH;
        } catch (e) {
          console.warn('Error raising VCounter IRQ:', e);
        }
      }

      if (this.vcount < this.VERTICAL_PIXELS && this.renderPath && typeof this.renderPath.drawScanline === 'function') {
        try {
          this.renderPath.drawScanline(this.vcount);
        } catch (e) {
          console.warn('Error drawing scanline:', e);
        }
      }
    } else {
      // Begin Hblank
      this.inHblank = true;
      this.lastHblank = this.nextHblank;
      this.nextEvent = this.lastHblank + this.HBLANK_LENGTH;
      this.nextHblank = this.nextEvent + this.HDRAW_LENGTH;
      this.nextHblankIRQ = this.nextHblank;

      if (this.vcount < this.VERTICAL_PIXELS && this.cpu && this.cpu.mmu && typeof this.cpu.mmu.runHblankDmas === 'function') {
        try {
          this.cpu.mmu.runHblankDmas();
        } catch (e) {
          console.warn('Error running HBlank DMAs:', e);
        }
      }
      if (this.hblankIRQ && this.cpu && this.cpu.irq && typeof this.cpu.irq.raiseIRQ === 'function') {
        try {
          this.cpu.irq.raiseIRQ(this.cpu.irq.IRQ_HBLANK);
        } catch (e) {
          console.warn('Error raising HBlank IRQ:', e);
        }
      }
    }
  }
};

GameBoyAdvanceVideo.prototype.writeDisplayStat = function(value) {
  this.vblankIRQ = value & 0x0008;
  this.hblankIRQ = value & 0x0010;
  this.vcounterIRQ = value & 0x0020;
  this.vcountSetting = (value & 0xFF00) >> 8;

  if (this.vcounterIRQ) {
    // FIXME: this can be too late if we're in the middle of an Hblank
    this.nextVcounterIRQ = this.nextHblank + this.HBLANK_LENGTH + (this.vcountSetting - this.vcount) * this.HORIZONTAL_LENGTH;
    if (this.nextVcounterIRQ < this.nextEvent) {
      this.nextVcounterIRQ += this.TOTAL_LENGTH;
    }
  }
};

GameBoyAdvanceVideo.prototype.readDisplayStat = function() {
  return (this.inVblank) | (this.inHblank << 1) | (this.vcounter << 2);
};

/**
 * 完成绘制操作
 * @param {Object} pixelData - 像素数据
 */
GameBoyAdvanceVideo.prototype.finishDraw = function(pixelData) {
  // 在Node.js环境中，我们将像素数据传递给渲染器
  if (this.renderer) {
    // 渲染帧
    this.renderer.renderFrame(pixelData.data);
    
    // 保存帧到文件
    this.renderer.saveFrame();
  }
  
  // 调用绘制回调
  this.drawCallback();
};

module.exports = GameBoyAdvanceVideo;