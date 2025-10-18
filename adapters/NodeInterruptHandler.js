/**
 * Node.js中断处理适配器
 * 适配GBA中断处理模块到Node.js环境
 */

function GameBoyAdvanceInterruptHandler() {
  this.FREQUENCY = 0x1000000;

  this.cpu = null;
  this.enable = false;

  this.IRQ_VBLANK = 0x0;
  this.IRQ_HBLANK = 0x1;
  this.IRQ_VCOUNTER = 0x2;
  this.IRQ_TIMER0 = 0x3;
  this.IRQ_TIMER1 = 0x4;
  this.IRQ_TIMER2 = 0x5;
  this.IRQ_TIMER3 = 0x6;
  this.IRQ_SIO = 0x7;
  this.IRQ_DMA0 = 0x8;
  this.IRQ_DMA1 = 0x9;
  this.IRQ_DMA2 = 0xA;
  this.IRQ_DMA3 = 0xB;
  this.IRQ_KEYPAD = 0xC;
  this.IRQ_GAMEPAK = 0xD;

  this.MASK_VBLANK = 0x0001;
  this.MASK_HBLANK = 0x0002;
  this.MASK_VCOUNTER = 0x0004;
  this.MASK_TIMER0 = 0x0008;
  this.MASK_TIMER1 = 0x0010;
  this.MASK_TIMER2 = 0x0020;
  this.MASK_TIMER3 = 0x0040;
  this.MASK_SIO = 0x0080;
  this.MASK_DMA0 = 0x0100;
  this.MASK_DMA1 = 0x0200;
  this.MASK_DMA2 = 0x0400;
  this.MASK_DMA3 = 0x0800;
  this.MASK_KEYPAD = 0x1000;
  this.MASK_GAMEPAK = 0x2000;
}

GameBoyAdvanceInterruptHandler.prototype.clear = function() {
  this.enable = false;
  this.enabledIRQs = 0;
  this.interruptFlags = 0;

  this.dma = new Array();
  for (var i = 0; i < 4; ++i) {
    this.dma.push({
      source: 0,
      dest: 0,
      count: 0,
      nextSource: 0,
      nextDest: 0,
      nextCount: 0,
      srcControl: 0,
      dstControl: 0,
      repeat: false,
      width: 0,
      drq: false,
      timing: 0,
      doIrq: false,
      enable: false,
      nextIRQ: 0
    });
  }

  this.timersEnabled = 0;
  this.timers = new Array();
  for (var i = 0; i < 4; ++i) {
    this.timers.push({
      reload: 0,
      oldReload: 0,
      prescaleBits: 0,
      countUp: false,
      doIrq: false,
      enable: false,
      lastEvent: 0,
      nextEvent: 0,
      overflowInterval: 1
    });
  }

  this.nextEvent = 0;
  this.springIRQ = false;
  this.resetSP();
};

GameBoyAdvanceInterruptHandler.prototype.freeze = function() {
  return {
    'enable': this.enable,
    'enabledIRQs': this.enabledIRQs,
    'interruptFlags': this.interruptFlags,
    'dma': this.dma,
    'timers': this.timers,
    'nextEvent': this.nextEvent,
    'springIRQ': this.springIRQ
  };
};

GameBoyAdvanceInterruptHandler.prototype.defrost = function(frost) {
  this.enable = frost.enable;
  this.enabledIRQs = frost.enabledIRQs;
  this.interruptFlags = frost.interruptFlags;
  this.dma = frost.dma;
  this.timers = frost.timers;
  this.timersEnabled = 0;
  if (this.timers[0].enable) {
    ++this.timersEnabled;
  }
  if (this.timers[1].enable) {
    ++this.timersEnabled;
  }
  if (this.timers[2].enable) {
    ++this.timersEnabled;
  }
  if (this.timers[3].enable) {
    ++this.timersEnabled;
  }
  this.nextEvent = frost.nextEvent;
  this.springIRQ = frost.springIRQ;
};

GameBoyAdvanceInterruptHandler.prototype.updateTimers = function() {
  if (!this.cpu || this.nextEvent > this.cpu.cycles) {
    return;
  }

  if (this.springIRQ) {
    this.cpu.raiseIRQ();
    this.springIRQ = false;
  }

  if (this.video) {
    this.video.updateTimers(this.cpu);
  }

  if (this.audio) {
    this.audio.updateTimers();
  }

  if (this.timersEnabled) {
    var timer = this.timers[0];
    if (timer.enable) {
      if (this.cpu.cycles >= timer.nextEvent) {
        timer.lastEvent = timer.nextEvent;
        timer.nextEvent += timer.overflowInterval;
        if (this.io && this.io.registers) {
          this.io.registers[this.io.TM0CNT_LO >> 1] = timer.reload;
        }
        timer.oldReload = timer.reload;

        if (timer.doIrq) {
          this.raiseIRQ(this.IRQ_TIMER0);
        }

        if (this.audio && this.audio.enabled) {
          if (this.audio.enableChannelA && !this.audio.soundTimerA && this.audio.dmaA >= 0) {
            this.audio.sampleFifoA();
          }

          if (this.audio.enableChannelB && !this.audio.soundTimerB && this.audio.dmaB >= 0) {
            this.audio.sampleFifoB();
          }
        }

        timer = this.timers[1];
        if (timer.countUp) {
          if (this.io && this.io.registers && ++this.io.registers[this.io.TM1CNT_LO >> 1] == 0x10000) {
            timer.nextEvent = this.cpu.cycles;
          }
        }
      }
    }

    timer = this.timers[1];
    if (timer.enable) {
      if (this.cpu.cycles >= timer.nextEvent) {
        timer.lastEvent = timer.nextEvent;
        timer.nextEvent += timer.overflowInterval;
        if (this.io && this.io.registers && (!timer.countUp || this.io.registers[this.io.TM1CNT_LO >> 1] == 0x10000)) {
          this.io.registers[this.io.TM1CNT_LO >> 1] = timer.reload;
        }
        timer.oldReload = timer.reload;

        if (timer.doIrq) {
          this.raiseIRQ(this.IRQ_TIMER1);
        }

        if (timer.countUp) {
          timer.nextEvent = 0;
        }

        if (this.audio && this.audio.enabled) {
          if (this.audio.enableChannelA && this.audio.soundTimerA && this.audio.dmaA >= 0) {
            this.audio.sampleFifoA();
          }

          if (this.audio.enableChannelB && this.audio.soundTimerB && this.audio.dmaB >= 0) {
            this.audio.sampleFifoB();
          }
        }

        timer = this.timers[2];
        if (timer.countUp) {
          if (this.io && this.io.registers && ++this.io.registers[this.io.TM2CNT_LO >> 1] == 0x10000) {
            timer.nextEvent = this.cpu.cycles;
          }
        }
      }
    }
  }
};

GameBoyAdvanceInterruptHandler.prototype.raiseIRQ = function(irqType) {
  // 中断处理逻辑
  if (this.cpu) {
    this.cpu.raiseIRQ();
  }
};

GameBoyAdvanceInterruptHandler.prototype.testIRQ = function() {
  // 测试中断逻辑
};

GameBoyAdvanceInterruptHandler.prototype.resetSP = function() {
  // 重置SP逻辑
};

module.exports = GameBoyAdvanceInterruptHandler;