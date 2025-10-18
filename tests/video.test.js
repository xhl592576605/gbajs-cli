const chai = require('chai');
const expect = chai.expect;
const GameBoyAdvanceVideo = require('../adapters/NodeVideo.js');
const NodeRenderer = require('../adapters/NodeRenderer.js');

describe('Video Adapter Tests', function() {
  let video;

  beforeEach(function() {
    video = new GameBoyAdvanceVideo();
  });

  it('should create an instance of GameBoyAdvanceVideo', function() {
    expect(video).to.be.an.instanceof(GameBoyAdvanceVideo);
  });

  it('should have correct screen dimensions', function() {
    expect(video.HORIZONTAL_PIXELS).to.equal(240);
    expect(video.VERTICAL_PIXELS).to.equal(160);
  });

  it('should initialize render path', function() {
    // The renderPath is initialized with GameBoyAdvanceSoftwareRenderer
    expect(video.renderPath).to.exist;
  });

  it('should have Node.js specific properties', function() {
    expect(video).to.have.property('renderer');
    expect(video).to.have.property('frameBuffer');
  });
});