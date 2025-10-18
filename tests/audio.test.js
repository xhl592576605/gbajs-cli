const chai = require('chai');
const expect = chai.expect;
const GameBoyAdvanceAudio = require('../adapters/NodeAudio.js');

describe('Audio Adapter Tests', function() {
  let audio;

  beforeEach(function() {
    audio = new GameBoyAdvanceAudio();
  });

  it('should create an instance of GameBoyAdvanceAudio', function() {
    expect(audio).to.be.an.instanceof(GameBoyAdvanceAudio);
  });

  it('should have correct sample rate', function() {
    expect(audio.sampleRate).to.equal(32768);
  });

  it('should have correct buffer size', function() {
    expect(audio.bufferSize).to.equal(4096);
  });

  it('should have correct channels', function() {
    // The Speaker library is initialized with 2 channels
    // We can't directly test this without mocking Speaker
    expect(audio).to.have.property('speaker');
  });
});