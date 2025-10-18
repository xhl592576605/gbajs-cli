const chai = require('chai');
const expect = chai.expect;
const NodeGBA = require('../NodeGBA.js');
const fs = require('fs');
const path = require('path');

describe('Integration Tests', function() {
  let gba;

  beforeEach(function() {
    gba = new NodeGBA();
  });

  it('should create a complete GBA instance with all modules', function() {
    expect(gba).to.be.an.instanceof(NodeGBA);
    expect(gba.cpu).to.exist;
    expect(gba.mmu).to.exist;
    expect(gba.audio).to.exist;
    expect(gba.video).to.exist;
    expect(gba.keypad).to.exist;
  });

  it('should establish correct relationships between modules', function() {
    // Check CPU relationships
    if (gba.cpu && gba.mmu) {
      expect(gba.cpu.mmu).to.equal(gba.mmu);
    }

    if (gba.cpu && gba.irq) {
      expect(gba.cpu.irq).to.equal(gba.irq);
    }

    // Check MMU relationships
    if (gba.mmu && gba.cpu) {
      expect(gba.mmu.cpu).to.equal(gba.cpu);
      expect(gba.mmu.core).to.equal(gba);
    }

    // Check other relationships
    if (gba.audio && gba.cpu) {
      expect(gba.audio.cpu).to.equal(gba.cpu);
    }

    if (gba.video && gba.cpu) {
      expect(gba.video.cpu).to.equal(gba.cpu);
    }
  });

  it('should be able to reset the system', function() {
    // Test that reset method exists and can be called
    expect(gba.reset).to.be.a('function');
    expect(() => gba.reset()).to.not.throw();
  });

  it('should be able to load ROM data', function() {
    // Test that setRom method exists
    expect(gba.setRom).to.be.a('function');
  });

  it('should be able to handle save data', function() {
    // Test that save data methods exist
    expect(gba.setSavedata).to.be.a('function');
    expect(gba.loadSavedataFromFile).to.be.a('function');
    expect(gba.saveSavedataToFile).to.be.a('function');
  });

  it('should have proper logging capabilities', function() {
    // Test that logging methods exist
    expect(gba.setLogger).to.be.a('function');
    expect(gba.log).to.be.a('function');
    expect(gba.ERROR).to.be.a('function');
    expect(gba.WARN).to.be.a('function');
    expect(gba.INFO).to.be.a('function');
    expect(gba.DEBUG).to.be.a('function');
  });

  // Note: These tests would require actual ROM files to be comprehensive
  // For now, we'll just test that the methods exist and can be called
  it('should have ROM loading capability', function() {
    expect(gba.loadRomFromFile).to.be.a('function');
  });

  it('should have save data handling capability', function() {
    expect(gba.loadSavedataFromFile).to.be.a('function');
    expect(gba.saveSavedataToFile).to.be.a('function');
  });
});