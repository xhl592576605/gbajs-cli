#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Import Node.js GBA core
const NodeGBA = require('../NodeGBA.js');

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
  .option('-c, --config <file>', 'configuration file path')
  .option('--log-level <level>', 'log level (error, warn, info, debug)', 'info')
  .option('--log-file <file>', 'log file path')
  .option('--performance', 'enable performance monitoring')
  .option('--performance-interval <ms>', 'performance reporting interval in milliseconds', '5000')
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

  // Load configuration file if specified
  let config = {};
  if (options.config) {
    try {
      if (fs.existsSync(options.config)) {
        const configContent = fs.readFileSync(options.config, 'utf8');
        config = JSON.parse(configContent);
        console.log(`Loaded configuration from: ${options.config}`);
      } else {
        console.warn(`Configuration file not found: ${options.config}`);
      }
    } catch (e) {
      console.error(`Error loading configuration file: ${e.message}`);
    }
  }

  // Merge config with options (options take precedence)
  const mergedOptions = { ...config, ...options };

  // Set up logging
  setupLogging(mergedOptions);

  // Check if ROM file exists
  if (!fs.existsSync(romPath)) {
    console.error(`Error: ROM file not found: ${romPath}`);
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(mergedOptions.output)) {
    fs.mkdirSync(mergedOptions.output, { recursive: true });
  }

  // Initialize emulator
  const gba = new NodeGBA();

  // Set up logging for the emulator
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
    if (!gba.loadRomFromFile(romPath)) {
      console.error('Failed to load ROM');
      process.exit(1);
    }
    console.log(`Loaded ROM: ${romPath}`);
  } catch (e) {
    console.error(`Error loading ROM: ${e.message}`);
    process.exit(1);
  }

  // Load save data if provided
  if (mergedOptions.save) {
    if (fs.existsSync(mergedOptions.save)) {
      try {
        gba.loadSavedataFromFile(mergedOptions.save);
        console.log(`Loaded save data: ${mergedOptions.save}`);
      } catch (e) {
        console.error(`Error loading save data: ${e.message}`);
      }
    }
  }

  // Set up video output
  if (mergedOptions.video) {
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
  if (mergedOptions.audio) {
    // Audio implementation would go here
    console.log('Audio enabled');
  }

  // Set up performance monitoring
  let performanceInterval = null;
  if (mergedOptions.performance) {
    console.log('Performance monitoring enabled');
    performanceInterval = setInterval(() => {
      console.log(gba.getPerformanceReport());
    }, parseInt(mergedOptions.performanceInterval));
  }

  // Set up input handling
  setupInputHandling(gba, mergedOptions);

  // Handle exit events to clean up
  process.on('exit', () => {
    if (performanceInterval) {
      clearInterval(performanceInterval);
    }
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\nGracefully shutting down...');
    if (performanceInterval) {
      clearInterval(performanceInterval);
    }
    process.exit(0);
  });

  // Start emulation
  console.log('Starting emulation...');
  gba.runStable();
}

function setupLogging(options) {
  // Set log level based on options
  const logLevels = {
    'error': 1,
    'warn': 2,
    'info': 8,
    'debug': 16
  };

  const logLevel = logLevels[options.logLevel] || logLevels.info;
  console.log(`Log level set to: ${options.logLevel} (${logLevel})`);

  // If log file is specified, redirect logs to file
  if (options.logFile) {
    const logStream = fs.createWriteStream(options.logFile, { flags: 'a' });
    console.log(`Logs will be written to: ${options.logFile}`);

    // Override console methods to write to file
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    const originalDebug = console.debug;

    console.log = function(...args) {
      originalLog.apply(console, args);
      logStream.write(`[LOG] ${args.join(' ')}\n`);
    };

    console.error = function(...args) {
      originalError.apply(console, args);
      logStream.write(`[ERROR] ${args.join(' ')}\n`);
    };

    console.warn = function(...args) {
      originalWarn.apply(console, args);
      logStream.write(`[WARN] ${args.join(' ')}\n`);
    };

    console.info = function(...args) {
      originalInfo.apply(console, args);
      logStream.write(`[INFO] ${args.join(' ')}\n`);
    };

    console.debug = function(...args) {
      originalDebug.apply(console, args);
      logStream.write(`[DEBUG] ${args.join(' ')}\n`);
    };
  }
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