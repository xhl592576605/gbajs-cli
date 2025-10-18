/**
 * Node.js CPU核心处理适配器
 * 适配GBA CPU核心处理模块到Node.js环境
 */
const fs = require('fs');

function ARMCore() {
  this.SP = 13;
  this.LR = 14;
  this.PC = 15;

  this.MODE_ARM = 0;
  this.MODE_THUMB = 1;

  this.MODE_USER = 0x10;
  this.MODE_FIQ = 0x11;
  this.MODE_IRQ = 0x12;
  this.MODE_SUPERVISOR = 0x13;
  this.MODE_ABORT = 0x17;
  this.MODE_UNDEFINED = 0x1B;
  this.MODE_SYSTEM = 0x1F;

  this.BANK_NONE = 0
  this.BANK_FIQ = 1;
  this.BANK_IRQ = 2;
  this.BANK_SUPERVISOR = 3;
  this.BANK_ABORT = 4;
  this.BANK_UNDEFINED = 5;

  this.UNALLOC_MASK = 0x0FFFFF00;
  this.USER_MASK = 0xF0000000;
  this.PRIV_MASK = 0x000000CF; // This is out of spec, but it seems to be what's done in other implementations
  this.STATE_MASK = 0x00000020;

  this.WORD_SIZE_ARM = 4;
  this.WORD_SIZE_THUMB = 2;

  this.BASE_RESET = 0x00000000;
  this.BASE_UNDEF = 0x00000004;
  this.BASE_SWI = 0x00000008;
  this.BASE_PABT = 0x0000000C;
  this.BASE_DABT = 0x00000010;
  this.BASE_IRQ = 0x00000018;
  this.BASE_FIQ = 0x0000001C;

  // 在Node.js环境中，我们不需要浏览器特定的编译器
  // 可以使用简化版本或模拟版本
  this.armCompiler = {
    constructBX: function(rm, condOp) { return function() {}; },
    constructMSR: function(rm, r, instruction, immediate, condOp) { return function() {}; },
    constructMRS: function(rd, r, condOp) { return function() {}; },
    constructAddressingMode1Immediate: function(immediate) { return function() {}; },
    constructAddressingMode1ImmediateRotate: function(immediate, rotate) { return function() {}; },
    constructAddressingMode1LSL: function(rs, rm) { return function() {}; },
    constructAddressingMode1LSR: function(rs, rm) { return function() {}; },
    constructAddressingMode1ASR: function(rs, rm) { return function() {}; },
    constructAddressingMode1ROR: function(rs, rm) { return function() {}; },
    constructANDS: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructAND: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructEORS: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructEOR: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructSUBS: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructSUB: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructRSBS: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructRSB: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructADDS: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructADD: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructADCS: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructADC: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructSBCS: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructSBC: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructRSCS: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructRSC: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructTST: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructTEQ: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructCMP: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructCMN: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructORRS: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructORR: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructBICS: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructBIC: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructMVNS: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructMVN: function(rd, rn, shiftOp, condOp) { return function() {}; },
    constructSWPB: function(rd, rn, rm, condOp) { return function() {}; },
    constructSWP: function(rd, rn, rm, condOp) { return function() {}; },
    constructMUL: function(rd, rs, rm, condOp) { return function() {}; },
    constructMULS: function(rd, rs, rm, condOp) { return function() {}; },
    constructMLA: function(rd, rn, rs, rm, condOp) { return function() {}; },
    constructMLAS: function(rd, rn, rs, rm, condOp) { return function() {}; },
    constructUMULL: function(rd, rn, rs, rm, condOp) { return function() {}; },
    constructUMULLS: function(rd, rn, rs, rm, condOp) { return function() {}; },
    constructUMLAL: function(rd, rn, rs, rm, condOp) { return function() {}; },
    constructUMLALS: function(rd, rn, rs, rm, condOp) { return function() {}; },
    constructSMULL: function(rd, rn, rs, rm, condOp) { return function() {}; },
    constructSMULLS: function(rd, rn, rs, rm, condOp) { return function() {}; },
    constructSMLAL: function(rd, rn, rs, rm, condOp) { return function() {}; },
    constructSMLALS: function(rd, rn, rs, rm, condOp) { return function() {}; },
    constructLDRSH: function(rd, address, condOp) { return function() {}; },
    constructLDRH: function(rd, address, condOp) { return function() {}; },
    constructLDRSB: function(rd, address, condOp) { return function() {}; },
    constructSTRH: function(rd, address, condOp) { return function() {}; },
    constructLDRB: function(rd, address, condOp) { return function() {}; },
    constructLDR: function(rd, address, condOp) { return function() {}; },
    constructSTRB: function(rd, address, condOp) { return function() {}; },
    constructSTR: function(rd, address, condOp) { return function() {}; },
    constructAddressingMode23Register: function(instruction, rm, condOp) { return function() {}; },
    constructAddressingMode2RegisterShifted: function(instruction, shiftOp, condOp) { return function() {}; },
    constructAddressingMode23Immediate: function(instruction, offset, condOp) { return function() {}; }
  };

  this.thumbCompiler = {
    constructAND: function(rd, rm) { return function() {}; },
    constructEOR: function(rd, rm) { return function() {}; },
    constructLSL2: function(rd, rm) { return function() {}; },
    constructLSR2: function(rd, rm) { return function() {}; },
    constructASR2: function(rd, rm) { return function() {}; },
    constructADC: function(rd, rm) { return function() {}; },
    constructSBC: function(rd, rm) { return function() {}; },
    constructROR: function(rd, rm) { return function() {}; },
    constructTST: function(rd, rm) { return function() {}; },
    constructNEG: function(rd, rm) { return function() {}; },
    constructCMP2: function(rd, rm) { return function() {}; },
    constructCMN: function(rd, rm) { return function() {}; },
    constructORR: function(rd, rm) { return function() {}; },
    constructMUL: function(rd, rm) { return function() {}; },
    constructBIC: function(rd, rm) { return function() {}; },
    constructMVN: function(rd, rm) { return function() {}; },
    constructADD4: function(rd, rm) { return function() {}; },
    constructCMP3: function(rd, rm) { return function() {}; },
    constructMOV3: function(rd, rm) { return function() {}; },
    constructBX: function(rd, rm) { return function() {}; },
    constructADD3: function(rd, rn, rm) { return function() {}; },
    constructSUB3: function(rd, rn, rm) { return function() {}; },
    constructADD1: function(rd, rn, immediate) { return function() {}; },
    constructMOV2: function(rd, rn, rm) { return function() {}; },
    constructSUB1: function(rd, rn, immediate) { return function() {}; },
    constructLSL1: function(rd, rm, immediate) { return function() {}; },
    constructLSR1: function(rd, rm, immediate) { return function() {}; },
    constructASR1: function(rd, rm, immediate) { return function() {}; },
    constructMOV1: function(rn, immediate) { return function() {}; },
    constructCMP1: function(rn, immediate) { return function() {}; },
    constructADD2: function(rn, immediate) { return function() {}; },
    constructSUB2: function(rn, immediate) { return function() {}; },
    constructLDR3: function(rd, immediate) { return function() {}; },
    constructSTR2: function(rd, rn, rm) { return function() {}; },
    constructSTRH2: function(rd, rn, rm) { return function() {}; },
    constructSTRB2: function(rd, rn, rm) { return function() {}; },
    constructLDRSB: function(rd, rn, rm) { return function() {}; },
    constructLDR2: function(rd, rn, rm) { return function() {}; },
    constructLDRH2: function(rd, rn, rm) { return function() {}; },
    constructLDRB2: function(rd, rn, rm) { return function() {}; },
    constructLDRSH: function(rd, rn, rm) { return function() {}; },
    constructLDRB1: function(rd, rn, immediate) { return function() {}; },
    constructLDR1: function(rd, rn, immediate) { return function() {}; },
    constructSTRB1: function(rd, rn, immediate) { return function() {}; },
    constructSTR1: function(rd, rn, immediate) { return function() {}; },
    constructPOP: function(rs, r) { return function() {}; },
    constructPUSH: function(rs, r) { return function() {}; },
    constructLDRH1: function(rd, rn, immediate) { return function() {}; },
    constructSTRH1: function(rd, rn, immediate) { return function() {}; },
    constructLDR4: function(rd, immediate) { return function() {}; },
    constructSTR3: function(rd, immediate) { return function() {}; },
    constructADD6: function(rd, immediate) { return function() {}; },
    constructADD5: function(rd, immediate) { return function() {}; },
    constructADD7: function(immediate) { return function() {}; },
    constructLDMIA: function(rn, rs) { return function() {}; },
    constructSTMIA: function(rn, rs) { return function() {}; },
    constructSWI: function(immediate) { return function() {}; },
    constructB1: function(immediate, condOp) { return function() {}; },
    constructB2: function(immediate) { return function() {}; },
    constructBL1: function(immediate) { return function() {}; },
    constructBL2: function(immediate) { return function() {}; }
  };

  this.generateConds();

  this.gprs = new Int32Array(16);
  
  // 添加一个默认的irq对象，避免在resetCPU中报错
  this.irq = {
    clear: function() {}
  };
}

ARMCore.prototype.resetCPU = function(startOffset) {
  for (var i = 0; i < this.PC; ++i) {
    this.gprs[i] = 0;
  }
  this.gprs[this.PC] = startOffset + this.WORD_SIZE_ARM;

  this.loadInstruction = this.loadInstructionArm;
  this.execMode = this.MODE_ARM;
  this.instructionWidth = this.WORD_SIZE_ARM;

  this.mode = this.MODE_SYSTEM;

  this.cpsrI = false;
  this.cpsrF = false;

  this.cpsrV = false;
  this.cpsrC = false;
  this.cpsrZ = false;
  this.cpsrN = false;

  this.bankedRegisters = [
    new Int32Array(7),
    new Int32Array(7),
    new Int32Array(2),
    new Int32Array(2),
    new Int32Array(2),
    new Int32Array(2)
  ];
  this.spsr = 0;
  this.bankedSPSRs = new Int32Array(6);

  this.cycles = 0;

  this.shifterOperand = 0;
  this.shifterCarryOut = 0;

  this.page = null;
  this.pageId = 0;
  this.pageRegion = -1;

  this.instruction = null;

  // 确保irq对象存在
  if (this.irq && typeof this.irq.clear === 'function') {
    this.irq.clear();
  }

  var gprs = this.gprs;
  var mmu = this.mmu;
  this.step = function() {
    var instruction = this.instruction || (this.instruction = this.loadInstruction(gprs[this.PC] - this.instructionWidth));
    gprs[this.PC] += this.instructionWidth;
    this.conditionPassed = true;
    instruction();

    if (!instruction.writesPC) {
      if (this.instruction != null) { // We might have gotten an interrupt from the instruction
        if (instruction.next == null || instruction.next.page.invalid) {
          instruction.next = this.loadInstruction(gprs[this.PC] - this.instructionWidth);
        }
        this.instruction = instruction.next;
      }
    } else {
      if (this.conditionPassed) {
        var pc = gprs[this.PC] &= 0xFFFFFFFE;
        if (this.execMode == this.MODE_ARM) {
          mmu.wait32(pc);
          mmu.waitPrefetch32(pc);
        } else {
          mmu.wait(pc);
          mmu.waitPrefetch(pc);
        }
        gprs[this.PC] += this.instructionWidth;
        if (!instruction.fixedJump) {
          this.instruction = null;
        } else if  (this.instruction != null) {
          if (instruction.next == null || instruction.next.page.invalid) {
            instruction.next = this.loadInstruction(gprs[this.PC] - this.instructionWidth);
          }
          this.instruction = instruction.next;
        }
      } else {
        this.instruction = null;
      }
    }
    // 确保irq对象存在
    if (this.irq && typeof this.irq.updateTimers === 'function') {
      this.irq.updateTimers();
    }
  };
};

ARMCore.prototype.freeze = function() {
  return {
    'gprs': [
      this.gprs[0],
      this.gprs[1],
      this.gprs[2],
      this.gprs[3],
      this.gprs[4],
      this.gprs[5],
      this.gprs[6],
      this.gprs[7],
      this.gprs[8],
      this.gprs[9],
      this.gprs[10],
      this.gprs[11],
      this.gprs[12],
      this.gprs[13],
      this.gprs[14],
      this.gprs[15],
    ],
    'mode': this.mode,
    'cpsrI': this.cpsrI,
    'cpsrF': this.cpsrF,
    'cpsrV': this.cpsrV,
    'cpsrC': this.cpsrC,
    'cpsrZ': this.cpsrZ,
    'cpsrN': this.cpsrN,
    'bankedRegisters': [
      [
        this.bankedRegisters[0][0],
        this.bankedRegisters[0][1],
        this.bankedRegisters[0][2],
        this.bankedRegisters[0][3],
        this.bankedRegisters[0][4],
        this.bankedRegisters[0][5],
        this.bankedRegisters[0][6]
      ],
      [
        this.bankedRegisters[1][0],
        this.bankedRegisters[1][1],
        this.bankedRegisters[1][2],
        this.bankedRegisters[1][3],
        this.bankedRegisters[1][4],
        this.bankedRegisters[1][5],
        this.bankedRegisters[1][6]
      ],
      [
        this.bankedRegisters[2][0],
        this.bankedRegisters[2][1]
      ],
      [
        this.bankedRegisters[3][0],
        this.bankedRegisters[3][1]
      ],
      [
        this.bankedRegisters[4][0],
        this.bankedRegisters[4][1]
      ],
      [
        this.bankedRegisters[5][0],
        this.bankedRegisters[5][1]
      ]
    ],
    'spsr': this.spsr,
    'bankedSPSRs': [
      this.bankedSPSRs[0],
      this.bankedSPSRs[1],
      this.bankedSPSRs[2],
      this.bankedSPSRs[3],
      this.bankedSPSRs[4],
      this.bankedSPSRs[5]
    ],
    'cycles': this.cycles
  };
};

ARMCore.prototype.defrost = function(frost) {
  this.instruction = null;

  this.page = null;
  this.pageId = 0;
  this.pageRegion = -1;

  this.gprs[0] = frost.gprs[0];
  this.gprs[1] = frost.gprs[1];
  this.gprs[2] = frost.gprs[2];
  this.gprs[3] = frost.gprs[3];
  this.gprs[4] = frost.gprs[4];
  this.gprs[5] = frost.gprs[5];
  this.gprs[6] = frost.gprs[6];
  this.gprs[7] = frost.gprs[7];
  this.gprs[8] = frost.gprs[8];
  this.gprs[9] = frost.gprs[9];
  this.gprs[10] = frost.gprs[10];
  this.gprs[11] = frost.gprs[11];
  this.gprs[12] = frost.gprs[12];
  this.gprs[13] = frost.gprs[13];
  this.gprs[14] = frost.gprs[14];
  this.gprs[15] = frost.gprs[15];

  this.mode = frost.mode;
  this.cpsrI = frost.cpsrI;
  this.cpsrF = frost.cpsrF;
  this.cpsrV = frost.cpsrV;
  this.cpsrC = frost.cpsrC;
  this.cpsrZ = frost.cpsrZ;
  this.cpsrN = frost.cpsrN;

  this.bankedRegisters[0][0] = frost.bankedRegisters[0][0];
  this.bankedRegisters[0][1] = frost.bankedRegisters[0][1];
  this.bankedRegisters[0][2] = frost.bankedRegisters[0][2];
  this.bankedRegisters[0][3] = frost.bankedRegisters[0][3];
  this.bankedRegisters[0][4] = frost.bankedRegisters[0][4];
  this.bankedRegisters[0][5] = frost.bankedRegisters[0][5];
  this.bankedRegisters[0][6] = frost.bankedRegisters[0][6];

  this.bankedRegisters[1][0] = frost.bankedRegisters[1][0];
  this.bankedRegisters[1][1] = frost.bankedRegisters[1][1];
  this.bankedRegisters[1][2] = frost.bankedRegisters[1][2];
  this.bankedRegisters[1][3] = frost.bankedRegisters[1][3];
  this.bankedRegisters[1][4] = frost.bankedRegisters[1][4];
  this.bankedRegisters[1][5] = frost.bankedRegisters[1][5];
  this.bankedRegisters[1][6] = frost.bankedRegisters[1][6];

  this.bankedRegisters[2][0] = frost.bankedRegisters[2][0];
  this.bankedRegisters[2][1] = frost.bankedRegisters[2][1];

  this.bankedRegisters[3][0] = frost.bankedRegisters[3][0];
  this.bankedRegisters[3][1] = frost.bankedRegisters[3][1];

  this.bankedRegisters[4][0] = frost.bankedRegisters[4][0];
  this.bankedRegisters[4][1] = frost.bankedRegisters[4][1];

  this.bankedRegisters[5][0] = frost.bankedRegisters[5][0];
  this.bankedRegisters[5][1] = frost.bankedRegisters[5][1];

  this.spsr = frost.spsr;
  this.bankedSPSRs[0] = frost.bankedSPSRs[0];
  this.bankedSPSRs[1] = frost.bankedSPSRs[1];
  this.bankedSPSRs[2] = frost.bankedSPSRs[2];
  this.bankedSPSRs[3] = frost.bankedSPSRs[3];
  this.bankedSPSRs[4] = frost.bankedSPSRs[4];
  this.bankedSPSRs[5] = frost.bankedSPSRs[5];

  this.cycles = frost.cycles;
};

ARMCore.prototype.fetchPage = function(address) {
  var region = address >> this.mmu.BASE_OFFSET;
  var pageId = this.mmu.addressToPage(region, address & this.mmu.OFFSET_MASK);
  if (region == this.pageRegion) {
    if (pageId == this.pageId && !this.page.invalid) {
      return;
    }
    this.pageId = pageId;
  } else {
    this.pageMask = this.mmu.memory[region].PAGE_MASK;
    this.pageRegion = region;
    this.pageId = pageId;
  }

  this.page = this.mmu.accessPage(region, pageId);
};

ARMCore.prototype.loadInstructionArm = function(address) {
  var next = null;
  this.fetchPage(address);
  var offset = (address & this.pageMask) >> 2;
  next = this.page.arm[offset];
  if (next) {
    return next;
  }
  var instruction = this.mmu.load32(address) >>> 0;
  next = this.compileArm(instruction);
  next.next = null;
  next.page = this.page;
  next.address = address;
  next.opcode = instruction;
  this.page.arm[offset] = next;
  return next;
};

ARMCore.prototype.loadInstructionThumb = function(address) {
  var next = null;
  this.fetchPage(address);
  var offset = (address & this.pageMask) >> 1;
  next = this.page.thumb[offset];
  if (next) {
    return next;
  }
  var instruction = this.mmu.load16(address);
  next = this.compileThumb(instruction);
  next.next = null;
  next.page = this.page;
  next.address = address;
  next.opcode = instruction;
  this.page.thumb[offset] = next;
  return next;
};

ARMCore.prototype.selectBank = function(mode) {
  switch (mode) {
  case this.MODE_USER:
  case this.MODE_SYSTEM:
    // No banked registers
    return this.BANK_NONE;
  case this.MODE_FIQ:
    return this.BANK_FIQ;
  case this.MODE_IRQ:
    return this.BANK_IRQ;
  case this.MODE_SUPERVISOR:
    return this.BANK_SUPERVISOR;
  case this.MODE_ABORT:
    return this.BANK_ABORT;
  case this.MODE_UNDEFINED:
    return this.BANK_UNDEFINED;
  default:
    throw "Invalid user mode passed to selectBank";
  }
};

ARMCore.prototype.switchExecMode = function(newMode) {
  if (this.execMode != newMode) {
    this.execMode = newMode;
    if (newMode == this.MODE_ARM) {
      this.instructionWidth = this.WORD_SIZE_ARM;
      this.loadInstruction = this.loadInstructionArm;
    } else {
      this.instructionWidth = this.WORD_SIZE_THUMB;
      this.loadInstruction = this.loadInstructionThumb;
    }
  }

};

ARMCore.prototype.switchMode = function(newMode) {
  if (newMode == this.mode) {
    // Not switching modes after all
    return;
  }
  if (newMode != this.MODE_USER || newMode != this.MODE_SYSTEM) {
    // Switch banked registers
    var newBank = this.selectBank(newMode);
    var oldBank = this.selectBank(this.mode);
    if (newBank != oldBank) {
      // TODO: support FIQ
      if (newMode == this.MODE_FIQ || this.mode == this.MODE_FIQ) {
        var oldFiqBank = (oldBank == this.BANK_FIQ) + 0;
        var newFiqBank = (newBank == this.BANK_FIQ) + 0;
        this.bankedRegisters[oldFiqBank][2] = this.gprs[8];
        this.bankedRegisters[oldFiqBank][3] = this.gprs[9];
        this.bankedRegisters[oldFiqBank][4] = this.gprs[10];
        this.bankedRegisters[oldFiqBank][5] = this.gprs[11];
        this.bankedRegisters[oldFiqBank][6] = this.gprs[12];
        this.gprs[8] = this.bankedRegisters[newFiqBank][2];
        this.gprs[9] = this.bankedRegisters[newFiqBank][3];
        this.gprs[10] = this.bankedRegisters[newFiqBank][4];
        this.gprs[11] = this.bankedRegisters[newFiqBank][5];
        this.gprs[12] = this.bankedRegisters[newFiqBank][6];
      }
      this.bankedRegisters[oldBank][0] = this.gprs[this.SP];
      this.bankedRegisters[oldBank][1] = this.gprs[this.LR];
      this.gprs[this.SP] = this.bankedRegisters[newBank][0];
      this.gprs[this.LR] = this.bankedRegisters[newBank][1];

      this.bankedSPSRs[oldBank] = this.spsr;
      this.spsr = this.bankedSPSRs[newBank];
    }
  }
  this.mode = newMode;
};

ARMCore.prototype.packCPSR = function() {
  return this.mode | (!!this.execMode << 5) | (!!this.cpsrF << 6) | (!!this.cpsrI << 7) |
         (!!this.cpsrN << 31) | (!!this.cpsrZ << 30) | (!!this.cpsrC << 29) | (!!this.cpsrV << 28);
};

ARMCore.prototype.unpackCPSR = function(spsr) {
  this.switchMode(spsr & 0x0000001F);
  this.switchExecMode(!!(spsr & 0x00000020));
  this.cpsrF = spsr & 0x00000040;
  this.cpsrI = spsr & 0x00000080;
  this.cpsrN = spsr & 0x80000000;
  this.cpsrZ = spsr & 0x40000000;
  this.cpsrC = spsr & 0x20000000;
  this.cpsrV = spsr & 0x10000000;

  this.irq.testIRQ();
};

ARMCore.prototype.hasSPSR = function() {
  return this.mode != this.MODE_SYSTEM && this.mode != this.MODE_USER;
};

ARMCore.prototype.raiseIRQ = function() {
  if (this.cpsrI) {
    return;
  }
  var cpsr = this.packCPSR();
  var instructionWidth = this.instructionWidth;
  this.switchMode(this.MODE_IRQ);
  this.spsr = cpsr;
  this.gprs[this.LR] = this.gprs[this.PC] - instructionWidth + 4;
  this.gprs[this.PC] = this.BASE_IRQ + this.WORD_SIZE_ARM;
  this.instruction = null;
  this.switchExecMode(this.MODE_ARM);
  this.cpsrI = true;
};

ARMCore.prototype.raiseTrap = function() {
  var cpsr = this.packCPSR();
  var instructionWidth = this.instructionWidth;
  this.switchMode(this.MODE_SUPERVISOR);
  this.spsr = cpsr;
  this.gprs[this.LR] = this.gprs[this.PC] - instructionWidth;
  this.gprs[this.PC] = this.BASE_SWI + this.WORD_SIZE_ARM;
  this.instruction = null;
  this.switchExecMode(this.MODE_ARM);
  this.cpsrI = true;
};

ARMCore.prototype.badOp = function(instruction) {
  var func = function() {
    throw "Illegal instruction: 0x" + instruction.toString(16);
  };
  func.writesPC = true;
  func.fixedJump = false;
  return func;
};

ARMCore.prototype.generateConds = function() {
  var cpu = this;
  this.conds = [
    // EQ
    function() {
      return cpu.conditionPassed = cpu.cpsrZ;
    },
    // NE
    function() {
      return cpu.conditionPassed = !cpu.cpsrZ;
    },
    // CS
    function() {
      return cpu.conditionPassed = cpu.cpsrC;
    },
    // CC
    function() {
      return cpu.conditionPassed = !cpu.cpsrC;
    },
    // MI
    function() {
      return cpu.conditionPassed = cpu.cpsrN;
    },
    // PL
    function() {
      return cpu.conditionPassed = !cpu.cpsrN;
    },
    // VS
    function() {
      return cpu.conditionPassed = cpu.cpsrV;
    },
    // VC
    function() {
      return cpu.conditionPassed = !cpu.cpsrV;
    },
    // HI
    function () {
      return cpu.conditionPassed = cpu.cpsrC && !cpu.cpsrZ;
    },
    // LS
    function () {
      return cpu.conditionPassed = !cpu.cpsrC || cpu.cpsrZ;
    },
    // GE
    function () {
      return cpu.conditionPassed = !cpu.cpsrN == !cpu.cpsrV;
    },
    // LT
    function () {
      return cpu.conditionPassed = !cpu.cpsrN != !cpu.cpsrV;
    },
    // GT
    function () {
      return cpu.conditionPassed = !cpu.cpsrZ && !cpu.cpsrN == !cpu.cpsrV;
    },
    // LE
    function () {
      return cpu.conditionPassed = cpu.cpsrZ || !cpu.cpsrN != !cpu.cpsrV;
    },
    // AL
    null,
    null
  ]
}

ARMCore.prototype.barrelShiftImmediate = function(shiftType, immediate, rm) {
  var cpu = this;
  var gprs = this.gprs;
  var shiftOp = this.badOp;
  switch (shiftType) {
  case 0x00000000:
    // LSL
    if (immediate) {
      shiftOp = function() {
        cpu.shifterOperand = gprs[rm] << immediate;
        cpu.shifterCarryOut = gprs[rm] & (1 << (32 - immediate));
      };
    } else {
      // This boils down to no shift
      shiftOp = function() {
        cpu.shifterOperand = gprs[rm];
        cpu.shifterCarryOut = cpu.cpsrC;
      };
    }
    break;
  case 0x00000020:
    // LSR
    if (immediate) {
      shiftOp = function() {
        cpu.shifterOperand = gprs[rm] >>> immediate;
        cpu.shifterCarryOut = gprs[rm] & (1 << (immediate - 1));
      };
    } else {
      shiftOp = function() {
        cpu.shifterOperand = 0;
        cpu.shifterCarryOut = gprs[rm] & 0x80000000;
      };
    }
    break;
  case 0x00000040:
    // ASR
    if (immediate) {
      shiftOp = function() {
        cpu.shifterOperand = gprs[rm] >> immediate;
        cpu.shifterCarryOut = gprs[rm] & (1 << (immediate - 1));
      };
    } else {
      shiftOp = function() {
        cpu.shifterCarryOut = gprs[rm] & 0x80000000;
        if (cpu.shifterCarryOut) {
          cpu.shifterOperand = 0xFFFFFFFF;
        } else {
          cpu.shifterOperand = 0;
        }
      };
    }
    break;
  case 0x00000060:
    // ROR
    if (immediate) {
      shiftOp = function() {
        cpu.shifterOperand = (gprs[rm] >>> immediate) | (gprs[rm] << (32 - immediate));
        cpu.shifterCarryOut = gprs[rm] & (1 << (immediate - 1));
      };
    } else {
      // RRX
      shiftOp = function() {
        cpu.shifterOperand = (!!cpu.cpsrC << 31) | (gprs[rm] >>> 1);
        cpu.shifterCarryOut =  gprs[rm] & 0x00000001;
      };
    }
    break;
  }
  return shiftOp;
}

ARMCore.prototype.compileArm = function(instruction) {
  // 在Node.js环境中，我们可以简化指令编译过程
  // 或者使用预编译的指令集
  return this.badOp(instruction);
};

ARMCore.prototype.compileThumb = function(instruction) {
  // 在Node.js环境中，我们可以简化指令编译过程
  // 或者使用预编译的指令集
  return this.badOp(instruction & 0xFFFF);
};

module.exports = ARMCore;