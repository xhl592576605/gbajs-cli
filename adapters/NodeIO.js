/**
 * Node.js IO处理适配器
 * 适配GBA IO处理模块到Node.js环境
 */

function GameBoyAdvanceIO() {
  // Video
  this.DISPCNT = 0x000;
  this.GREENSWP = 0x002;
  this.DISPSTAT = 0x004;
  this.VCOUNT = 0x006;
  this.BG0CNT = 0x008;
  this.BG1CNT = 0x00A;
  this.BG2CNT = 0x00C;
  this.BG3CNT = 0x00E;
  this.BG0HOFS = 0x010;
  this.BG0VOFS = 0x012;
  this.BG1HOFS = 0x014;
  this.BG1VOFS = 0x016;
  this.BG2HOFS = 0x018;
  this.BG2VOFS = 0x01A;
  this.BG3HOFS = 0x01C;
  this.BG3VOFS = 0x01E;
  this.BG2PA = 0x020;
  this.BG2PB = 0x022;
  this.BG2PC = 0x024;
  this.BG2PD = 0x026;
  this.BG2X_LO = 0x028;
  this.BG2X_HI = 0x02A;
  this.BG2Y_LO = 0x02C;
  this.BG2Y_HI = 0x02E;
  this.BG3PA = 0x030;
  this.BG3PB = 0x032;
  this.BG3PC = 0x034;
  this.BG3PD = 0x036;
  this.BG3X_LO = 0x038;
  this.BG3X_HI = 0x03A;
  this.BG3Y_LO = 0x03C;
  this.BG3Y_HI = 0x03E;
  this.WIN0H = 0x040;
  this.WIN1H = 0x042;
  this.WIN0V = 0x044;
  this.WIN1V = 0x046;
  this.WININ = 0x048;
  this.WINOUT = 0x04A;
  this.MOSAIC = 0x04C;
  this.BLDCNT = 0x050;
  this.BLDALPHA = 0x052;
  this.BLDY = 0x054;

  // Sound
  this.SOUND1CNT_LO = 0x060;
  this.SOUND1CNT_HI = 0x062;
  this.SOUND1CNT_X = 0x064;
  this.SOUND2CNT_LO = 0x068;
  this.SOUND2CNT_HI = 0x06C;
  this.SOUND3CNT_LO = 0x070;
  this.SOUND3CNT_HI = 0x072;
  this.SOUND3CNT_X = 0x074;
  this.SOUND4CNT_LO = 0x078;
  this.SOUND4CNT_HI = 0x07C;
  this.SOUNDCNT_LO = 0x080;
  this.SOUNDCNT_HI = 0x082;
  this.SOUNDCNT_X = 0x084;
  this.SOUNDBIAS = 0x088;
  this.WAVE_RAM0_LO = 0x090;
  this.WAVE_RAM0_HI = 0x092;
  this.WAVE_RAM1_LO = 0x094;
  this.WAVE_RAM1_HI = 0x096;
  this.WAVE_RAM2_LO = 0x098;
  this.WAVE_RAM2_HI = 0x09A;
  this.WAVE_RAM3_LO = 0x09C;
  this.WAVE_RAM3_HI = 0x09E;
  this.FIFO_A_LO = 0x0A0;
  this.FIFO_A_HI = 0x0A2;
  this.FIFO_B_LO = 0x0A4;
  this.FIFO_B_HI = 0x0A6;

  // DMA
  this.DMA0SAD_LO = 0x0B0;
  this.DMA0SAD_HI = 0x0B2;
  this.DMA0DAD_LO = 0x0B4;
  this.DMA0DAD_HI = 0x0B6;
  this.DMA0CNT_LO = 0x0B8;
  this.DMA0CNT_HI = 0x0BA;
  this.DMA1SAD_LO = 0x0BC;
  this.DMA1SAD_HI = 0x0BE;
  this.DMA1DAD_LO = 0x0C0;
  this.DMA1DAD_HI = 0x0C2;
  this.DMA1CNT_LO = 0x0C4;
  this.DMA1CNT_HI = 0x0C6;
  this.DMA2SAD_LO = 0x0C8;
  this.DMA2SAD_HI = 0x0CA;
  this.DMA2DAD_LO = 0x0CC;
  this.DMA2DAD_HI = 0x0CE;
  this.DMA2CNT_LO = 0x0D0;
  this.DMA2CNT_HI = 0x0D2;
  this.DMA3SAD_LO = 0x0D4;
  this.DMA3SAD_HI = 0x0D6;
  this.DMA3DAD_LO = 0x0D8;
  this.DMA3DAD_HI = 0x0DA;
  this.DMA3CNT_LO = 0x0DC;
  this.DMA3CNT_HI = 0x0DE;

  // Timers
  this.TM0CNT_LO = 0x100;
  this.TM0CNT_HI = 0x102;
  this.TM1CNT_LO = 0x104;
  this.TM1CNT_HI = 0x106;
  this.TM2CNT_LO = 0x108;
  this.TM2CNT_HI = 0x10A;
  this.TM3CNT_LO = 0x10C;
  this.TM3CNT_HI = 0x10E;

  // SIO (note: some of these are repeated)
  this.SIODATA32_LO = 0x120;
  this.SIOMULTI0 = 0x120;
  this.SIODATA32_HI = 0x122;
  this.SIOMULTI1 = 0x122;
  this.SIOMULTI2 = 0x124;
  this.SIOMULTI3 = 0x126;
  this.SIOCNT = 0x128;
  this.SIOMLT_SEND = 0x12A;
  this.SIODATA8 = 0x12A;
  this.RCNT = 0x134;
  this.JOYCNT = 0x140;
  this.JOY_RECV = 0x150;
  this.JOY_TRANS = 0x154;
  this.JOYSTAT = 0x158;

  // Keypad
  this.KEYINPUT = 0x130;
  this.KEYCNT = 0x132;

  // Interrupts, etc
  this.IE = 0x200;
  this.IF = 0x202;
  this.WAITCNT = 0x204;
  this.IME = 0x208;

  this.POSTFLG = 0x300;
  this.HALTCNT = 0x301;

  this.DEFAULT_DISPCNT = 0x0080;
  this.DEFAULT_SOUNDBIAS = 0x200;
  this.DEFAULT_BGPA = 1;
  this.DEFAULT_BGPD = 1;
  this.DEFAULT_RCNT = 0x8000;

  // Node.js环境特有属性
  this.registers = null;
}

GameBoyAdvanceIO.prototype.clear = function() {
  if (this.cpu && this.cpu.mmu && this.cpu.mmu.SIZE_IO) {
    this.registers = new Uint16Array(this.cpu.mmu.SIZE_IO);
    this.registers[this.DISPCNT >> 1] = this.DEFAULT_DISPCNT;
    this.registers[this.SOUNDBIAS >> 1] = this.DEFAULT_SOUNDBIAS;
    this.registers[this.BG2PA >> 1] = this.DEFAULT_BGPA;
    this.registers[this.BG2PD >> 1] = this.DEFAULT_BGPD;
    this.registers[this.BG3PA >> 1] = this.DEFAULT_BGPA;
    this.registers[this.BG3PD >> 1] = this.DEFAULT_BGPD;
    this.registers[this.RCNT >> 1] = this.DEFAULT_RCNT;
  }
};

GameBoyAdvanceIO.prototype.freeze = function() {
  // 简化的冻结实现
  return {
    'registers': this.registers ? Array.from(this.registers) : []
  };
};

GameBoyAdvanceIO.prototype.defrost = function(frost) {
  if (frost.registers) {
    this.registers = new Uint16Array(frost.registers);
  }
};

GameBoyAdvanceIO.prototype.load8 = function(offset) {
  // 简化的8位加载实现
  return 0;
};

GameBoyAdvanceIO.prototype.load16 = function(offset) {
  // 简化的16位加载实现
  return 0;
};

GameBoyAdvanceIO.prototype.load32 = function(offset) {
  // 简化的32位加载实现
  return 0;
};

GameBoyAdvanceIO.prototype.loadU8 = function(offset) {
  // 简化的无符号8位加载实现
  return 0;
};

GameBoyAdvanceIO.prototype.loadU16 = function(offset) {
  // 简化的无符号16位加载实现
  if (this.registers) {
    return this.registers[offset >> 1];
  }
  return 0;
};

GameBoyAdvanceIO.prototype.store16 = function(offset, value) {
  // 简化的16位存储实现
  if (this.registers) {
    this.registers[offset >> 1] = value;
  }
};

GameBoyAdvanceIO.prototype.store32 = function(offset, value) {
  // 简化的32位存储实现
  if (this.registers) {
    this.registers[offset >> 1] = value & 0xFFFF;
    this.registers[(offset >> 1) + 1] = value >> 16;
  }
};

module.exports = GameBoyAdvanceIO;