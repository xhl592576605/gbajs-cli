#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Import GBA core modules
const GameBoyAdvance = require('../js/gba.js');
const ARMCore = require('../js/core.js');
const GameBoyAdvanceMMU = require('../js/mmu.js');
const GameBoyAdvanceInterruptHandler = require('../js/irq.js');
const GameBoyAdvanceIO = require('../js/io.js');
const GameBoyAdvanceAudio = require('../js/audio.js');
const GameBoyAdvanceVideo = require('../js/video.js');
const GameBoyAdvanceKeypad = require('../js/keypad.js');
const GameBoyAdvanceSIO = require('../js/sio.js');

// Create program
const program = new Command();

program
  .name('gbajs')
  .description('Game Boy Advance emulator for Node.js')
  .version('1.0.0')
  .argument('<rom>', 'path to GBA ROM file')
  .option('-s, --save <file>', 'save file path')
  .option('-o, --output <dir>', 'output directory for frames', './frames')
  .option('-f, --fps <rate>', 'frames per second', '60')
  .option('-v, --volume <level>', 'volume level (0-100)', '50')
  .option('--no-audio', 'disable audio output')
  .option('--no-video', 'disable video output')
  .option('--headless', 'run in headless mode')
  .action((rom, options) => {
    runEmulator(rom, options);
  });

program.parse();

function runEmulator(romPath, options) {
  console.log('Game Boy Advance Emulator for Node.js');
  console.log('=====================================');

  // Check if ROM file exists
  if (!fs.existsSync(romPath)) {
    console.error(`Error: ROM file not found: ${romPath}`);
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(options.output)) {
    fs.mkdirSync(options.output, { recursive: true });
  }

  // Initialize emulator
  const gba = new GameBoyAdvance();

  // Set up logging
  gba.setLogger(function(level, message) {
    switch (level) {
      case gba.LOG_ERROR:
        console.error('[ERROR] ' + message);
        break;
      case gba.LOG_WARN:
        console.warn('[WARN] ' + message);
        break;
      case gba.LOG_STUB:
        console.log('[STUB] ' + message);
        break;
      case gba.LOG_INFO:
        console.info('[INFO] ' + message);
        break;
      case gba.LOG_DEBUG:
        console.debug('[DEBUG] ' + message);
        break;
    }
  });

  // Load BIOS (if available)
  // Note: In a real implementation, you would need to provide a GBA BIOS file
  // const biosPath = path.join(__dirname, '../bios.bin');
  // if (fs.existsSync(biosPath)) {
  //   const biosBuffer = fs.readFileSync(biosPath);
  //   gba.setBios(biosBuffer.buffer, true);
  // }

  // Load ROM
  try {
    const romBuffer = fs.readFileSync(romPath);
    if (!gba.setRom(romBuffer.buffer)) {
      console.error('Failed to load ROM');
      process.exit(1);
    }
    console.log(`Loaded ROM: ${romPath}`);
  } catch (e) {
    console.error(`Error loading ROM: ${e.message}`);
    process.exit(1);
  }

  // Load save data if provided
  if (options.save) {
    if (fs.existsSync(options.save)) {
      try {
        const saveBuffer = fs.readFileSync(options.save);
        gba.setSavedata(saveBuffer.buffer);
        console.log(`Loaded save data: ${options.save}`);
      } catch (e) {
        console.error(`Error loading save data: ${e.message}`);
      }
    }
  }

  // Set up video output
  if (options.video) {
    // Create canvas for rendering
    const canvas = createCanvas(240, 160);
    gba.setCanvasDirect(canvas);

    // Override drawCallback to save frames as images
    gba.video.drawCallback = function() {
      // In a real implementation, you would save the frame here
      // For now, we'll just log that a frame was rendered
      console.log('Frame rendered');
    };
  }

  // Set up audio output
  if (options.audio) {
    // Audio implementation would go here
    console.log('Audio enabled');
  }

  // Set up input handling
  setupInputHandling(gba, options);

  // Start emulation
  console.log('Starting emulation...');
  gba.runStable();
}

function setupInputHandling(gba, options) {
  // In a real implementation, you would set up stdin handling here
  // For now, we'll just log that input handling is set up
  console.log('Input handling enabled');

  // Example key mapping (this would need to be implemented with actual stdin handling):
  // process.stdin.setRawMode(true);
  // process.stdin.setEncoding('utf8');
  // process.stdin.on('data', (key) => {
  //   // Handle key presses
  // });
}

console.log('GBA.js CLI - Game Boy Advance Emulator for Node.js');