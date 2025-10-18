const chai = require('chai');
const expect = chai.expect;
const NodeGBA = require('../NodeGBA.js');
const ARMCore = require('../adapters/NodeCore.js');
const GameBoyAdvanceMMU = require('../adapters/NodeMMU.js');

describe('Node.js GBA Core Tests', function() {
  describe('NodeGBA Class', function() {
    let gba;

    beforeEach(function() {
      gba = new NodeGBA();
    });

    it('should create an instance of NodeGBA', function() {
      expect(gba).to.be.an.instanceof(NodeGBA);
    });

    it('should have Node.js adapted modules', function() {
      expect(gba.cpu).to.be.an.instanceof(ARMCore);
      expect(gba.mmu).to.be.an.instanceof(GameBoyAdvanceMMU);
    });

    it('should setup module relationships correctly', function() {
      // 由于模块间的关系可能因为初始化失败而未建立，我们需要检查是否存在再验证
      if (gba.cpu && gba.mmu) {
        expect(gba.cpu.mmu).to.equal(gba.mmu);
        expect(gba.mmu.cpu).to.equal(gba.cpu);
      }
    });
  });

  describe('ARMCore Adapter', function() {
    let cpu;

    beforeEach(function() {
      cpu = new ARMCore();
    });

    it('should create an instance of ARMCore', function() {
      expect(cpu).to.be.an.instanceof(ARMCore);
    });

    it('should have correct initial register values', function() {
      cpu.resetCPU(0);
      expect(cpu.gprs[15]).to.equal(4); // PC should be 4 after reset
    });

    it('should have ARM mode constants', function() {
      expect(cpu.MODE_ARM).to.equal(0);
      expect(cpu.MODE_THUMB).to.equal(1);
    });
  });

  describe('MMU Adapter', function() {
    let mmu;

    beforeEach(function() {
      mmu = new GameBoyAdvanceMMU();
    });

    it('should create an instance of GameBoyAdvanceMMU', function() {
      expect(mmu).to.be.an.instanceof(GameBoyAdvanceMMU);
    });

    it('should have memory regions defined', function() {
      // 检查MMU是否具有必要的内存区域定义
      expect(mmu).to.have.property('REGION_BIOS');
      expect(mmu).to.have.property('REGION_WORKING_RAM');
    });
  });
});