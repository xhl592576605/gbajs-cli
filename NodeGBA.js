/**
 * Node.js环境下的GBA模拟器核心类
 * 整合所有适配器模块，提供统一的接口
 */
const ARMCore = require('./adapters/NodeCore.js');
const GameBoyAdvanceMMU = require('./adapters/NodeMMU.js');
const GameBoyAdvanceInterruptHandler = require('./adapters/NodeInterruptHandler.js');  // 使用Node.js适配器
const GameBoyAdvanceIO = require('./adapters/NodeIO.js');  // 使用Node.js适配器
const GameBoyAdvanceAudio = require('./adapters/NodeAudio.js');
const GameBoyAdvanceVideo = require('./adapters/NodeVideo.js');
const GameBoyAdvanceKeypad = require('./adapters/NodeKeypad.js');
const GameBoyAdvanceSIO = require('./adapters/NodeSIO.js');  // 使用Node.js适配器
const PerformanceMonitor = require('./utils/performance.js');  // 性能监控工具

function GameBoyAdvance() {
	this.LOG_ERROR = 1;
	this.LOG_WARN = 2;
	this.LOG_STUB = 4;
	this.LOG_INFO = 8;
	this.LOG_DEBUG = 16;

	this.SYS_ID = 'com.endrift.gbajs';

	this.logLevel = this.LOG_ERROR | this.LOG_WARN;

	this.rom = null;

	// 初始化性能监控器
	this.performanceMonitor = new PerformanceMonitor();

	// 初始化所有模块，添加错误处理
	try {
		this.cpu = new ARMCore();
	} catch (e) {
		console.error('Failed to initialize ARMCore:', e);
		this.cpu = null;
	}

	try {
		this.mmu = new GameBoyAdvanceMMU();
	} catch (e) {
		console.error('Failed to initialize GameBoyAdvanceMMU:', e);
		this.mmu = null;
	}

	try {
		this.irq = new GameBoyAdvanceInterruptHandler();
	} catch (e) {
		console.error('Failed to initialize GameBoyAdvanceInterruptHandler:', e);
		this.irq = null;
	}

	try {
		this.io = new GameBoyAdvanceIO();
	} catch (e) {
		console.error('Failed to initialize GameBoyAdvanceIO:', e);
		this.io = null;
	}

	try {
		this.audio = new GameBoyAdvanceAudio();
	} catch (e) {
		console.error('Failed to initialize GameBoyAdvanceAudio:', e);
		this.audio = null;
	}

	try {
		this.video = new GameBoyAdvanceVideo();
	} catch (e) {
		console.error('Failed to initialize GameBoyAdvanceVideo:', e);
		this.video = null;
	}

	try {
		this.keypad = new GameBoyAdvanceKeypad();
	} catch (e) {
		console.error('Failed to initialize GameBoyAdvanceKeypad:', e);
		this.keypad = null;
	}

	try {
		this.sio = new GameBoyAdvanceSIO();
	} catch (e) {
		console.error('Failed to initialize GameBoyAdvanceSIO:', e);
		this.sio = null;
	}

	// 建立模块间的关系，添加错误处理
	if (this.cpu && this.mmu) {
		this.cpu.mmu = this.mmu;
		this.mmu.cpu = this.cpu;
		this.mmu.core = this;
	}

	if (this.cpu && this.irq) {
		this.cpu.irq = this.irq;
		this.irq.cpu = this.cpu;
	}

	if (this.irq) {
		this.irq.io = this.io;
		this.irq.audio = this.audio;
		this.irq.video = this.video;
		this.irq.core = this;
	}

	if (this.io) {
		this.io.cpu = this.cpu;
		this.io.audio = this.audio;
		this.io.video = this.video;
		this.io.keypad = this.keypad;
		this.io.sio = this.sio;
		this.io.core = this;
	}

	if (this.audio) {
		this.audio.cpu = this.cpu;
		this.audio.core = this;
	}

	if (this.video) {
		this.video.cpu = this.cpu;
		this.video.core = this;
	}

	if (this.keypad) {
		this.keypad.core = this;
	}

	if (this.sio) {
		this.sio.core = this;
	}

	// Remove browser-specific keypad registration
	// this.keypad.registerHandlers();
	this.doStep = this.waitFrame;
	this.paused = false;

	this.seenFrame = false;
	this.seenSave = false;
	this.lastVblank = 0;

	this.queue = null;
	this.reportFPS = null;
	this.throttle = 16; // This is rough, but the 2/3ms difference gives us a good overhead

	// Replace browser-specific queueFrame with Node.js implementation
	var self = this;
	this.queueFrame = function (f) {
		self.queue = setTimeout(f, self.throttle);
	};

	// Remove browser-specific URL object
	// window.URL = window.URL || window.webkitURL;

	if (this.video) {
		this.video.vblankCallback = function() {
			self.seenFrame = true;
		};
	}
}

// Copy all prototype methods from the original GameBoyAdvance class
// We'll need to import and extend the original class properly

// For now, let's add the essential methods
GameBoyAdvance.prototype.setCanvasDirect = function(canvas) {
	if (this.video) {
		this.context = canvas.getContext('2d');
		this.video.setBacking(this.context);
	}
};

GameBoyAdvance.prototype.setBios = function(bios, real) {
	if (this.mmu) {
		this.mmu.loadBios(bios, real);
	}
};

GameBoyAdvance.prototype.setRom = function(rom) {
	this.reset();

	if (this.mmu) {
		this.rom = this.mmu.loadRom(rom, true);
		if (!this.rom) {
			return false;
		}
		this.retrieveSavedata();
		return true;
	}
	return false;
};

GameBoyAdvance.prototype.hasRom = function() {
	return !!this.rom;
};

GameBoyAdvance.prototype.reset = function() {
	if (this.audio) {
		this.audio.pause(true);
	}

	if (this.mmu) {
		this.mmu.clear();
	}

	if (this.io) {
		this.io.clear();
	}

	if (this.audio) {
		this.audio.clear();
	}

	if (this.video) {
		this.video.clear();
	}

	if (this.sio) {
		this.sio.clear();
	}

	if (this.mmu && this.io && this.video && this.video.renderPath) {
		try {
			this.mmu.mmap(this.mmu.REGION_IO, this.io);
			if (this.video.renderPath.palette) {
				this.mmu.mmap(this.mmu.REGION_PALETTE_RAM, this.video.renderPath.palette);
			}
			if (this.video.renderPath.vram) {
				this.mmu.mmap(this.mmu.REGION_VRAM, this.video.renderPath.vram);
			}
			if (this.video.renderPath.oam) {
				this.mmu.mmap(this.mmu.REGION_OAM, this.video.renderPath.oam);
			}
		} catch (e) {
			console.warn('Error mapping memory regions:', e);
		}
	}

	if (this.cpu) {
		this.cpu.resetCPU(0);
	}

	// 重置性能监控器
	this.performanceMonitor.reset();
};

GameBoyAdvance.prototype.step = function() {
	if (!this.doStep || !this.cpu) return;

	// 记录CPU执行开始时间
	const cpuStartTime = process.hrtime.bigint();

	while (this.doStep()) {
		this.cpu.step();
	}

	// 记录CPU执行时间
	const cpuEndTime = process.hrtime.bigint();
	const cpuTime = Number(cpuEndTime - cpuStartTime) / 1000000; // 转换为毫秒
	this.performanceMonitor.recordCPUTime(cpuTime);
};

GameBoyAdvance.prototype.waitFrame = function() {
	var seen = this.seenFrame;
	this.seenFrame = false;
	return !seen;
};

GameBoyAdvance.prototype.pause = function() {
	this.paused = true;
	if (this.audio) {
		this.audio.pause(true);
	}
	if (this.queue) {
		clearTimeout(this.queue);
		this.queue = null;
	}
};

GameBoyAdvance.prototype.advanceFrame = function() {
	// 记录帧开始时间
	this.performanceMonitor.start();

	this.step();
	if (this.seenSave) {
		if (this.mmu && !this.mmu.saveNeedsFlush()) {
			this.storeSavedata();
			this.seenSave = false;
		} else if (this.mmu) {
			this.mmu.flushSave();
		}
	} else if (this.mmu && this.mmu.saveNeedsFlush()) {
		this.seenSave = true;
		this.mmu.flushSave();
	}

	// 记录帧时间
	this.performanceMonitor.recordFrame();

	// 记录内存使用情况
	this.performanceMonitor.recordMemoryUsage();
};

GameBoyAdvance.prototype.runStable = function() {
	if (this.interval) {
		return; // Already running
	}
	var self = this;
	var timer = 0;
	var frames = 0;
	var runFunc;
	var start = Date.now();
	this.paused = false;
	if (this.audio) {
		this.audio.pause(false);
	}

	if (this.reportFPS) {
		runFunc = function() {
			try {
				timer += Date.now() - start;
				if (self.paused) {
					return;
				} else {
					self.queueFrame(runFunc);
				}
				start = Date.now();
				self.advanceFrame();
				++frames;
				if (frames == 60) {
					self.reportFPS((frames * 1000) / timer);
					frames = 0;
					timer = 0;
				}
			} catch(exception) {
				self.ERROR(exception);
				if (exception.stack) {
					self.logStackTrace(exception.stack.split('\n'));
				}
				throw exception;
			}
		};
	} else {
		runFunc = function() {
			try {
				if (self.paused) {
					return;
				} else {
					self.queueFrame(runFunc);
				}
				self.advanceFrame();
			} catch(exception) {
				self.ERROR(exception);
				if (exception.stack) {
					self.logStackTrace(exception.stack.split('\n'));
				}
				throw exception;
			}
		};
	}
	self.queueFrame(runFunc);
};

GameBoyAdvance.prototype.setSavedata = function(data) {
	if (this.mmu) {
		this.mmu.loadSavedata(data);
	}
};

GameBoyAdvance.prototype.loadSavedataFromFile = function(saveFile) {
	// Node.js implementation would read from file system
	const fs = require('fs');
	try {
		const data = fs.readFileSync(saveFile);
		this.setSavedata(data.buffer);
	} catch (e) {
		this.WARN('Could not load savedata from file: ' + e);
	}
};

GameBoyAdvance.prototype.decodeSavedata = function(string) {
	this.setSavedata(this.decodeBase64(string));
};

GameBoyAdvance.prototype.decodeBase64 = function(string) {
	var length = (string.length * 3 / 4);
	if (string[string.length - 2] == '=') {
		length -= 2;
	} else if (string[string.length - 1] == '=') {
		length -= 1;
	}
	var buffer = new ArrayBuffer(length);
	var view = new Uint8Array(buffer);
	var bits = string.match(/..../g);
	for (var i = 0; i + 2 < length; i += 3) {
		var s = atob(bits.shift());
		view[i] = s.charCodeAt(0);
		view[i + 1] = s.charCodeAt(1);
		view[i + 2] = s.charCodeAt(2);
	}
	if (i < length) {
		var s = atob(bits.shift());
		view[i++] = s.charCodeAt(0);
		if (s.length > 1) {
			view[i++] = s.charCodeAt(1);
		}
	}

	return buffer;
};

GameBoyAdvance.prototype.encodeBase64 = function(view) {
	var data = [];
	var b;
	var wordstring = [];
	var triplet;
	for (var i = 0; i < view.byteLength; ++i) {
		b = view.getUint8(i, true);
		wordstring.push(String.fromCharCode(b));
		while (wordstring.length >= 3) {
			triplet = wordstring.splice(0, 3);
			data.push(btoa(triplet.join('')));
		}
	};
	if (wordstring.length) {
		data.push(btoa(wordstring.join('')));
	}
	return data.join('');
};

GameBoyAdvance.prototype.downloadSavedata = function() {
	// In Node.js, we would save to file instead of downloading
	if (this.mmu && this.mmu.save) {
		var sram = this.mmu.save;
		if (!sram) {
			this.WARN("No save data available");
			return null;
		}
		// Return the save data buffer for Node.js to handle
		return sram.buffer;
	}
	return null;
};

GameBoyAdvance.prototype.storeSavedata = function() {
	if (this.mmu && this.mmu.save) {
		var sram = this.mmu.save;
		try {
			// In Node.js, we would save to file system
			// This is a simplified implementation
			this.WARN('storeSavedata not fully implemented for Node.js');
		} catch (e) {
			this.WARN('Could not store savedata! ' + e);
		}
	}
};

GameBoyAdvance.prototype.retrieveSavedata = function() {
	try {
		// In Node.js, we would load from file system
		// This is a simplified implementation
		this.WARN('retrieveSavedata not fully implemented for Node.js');
		return false;
	} catch (e) {
		this.WARN('Could not retrieve savedata! ' + e);
	}
	return false;
};

GameBoyAdvance.prototype.freeze = function() {
	return {
		'cpu': this.cpu ? this.cpu.freeze() : null,
		'mmu': this.mmu ? this.mmu.freeze() : null,
		'irq': this.irq ? this.irq.freeze() : null,
		'io': this.io ? this.io.freeze() : null,
		'audio': this.audio ? this.audio.freeze() : null,
		'video': this.video ? this.video.freeze() : null
	}
};

GameBoyAdvance.prototype.defrost = function(frost) {
	if (this.cpu && frost.cpu) {
		this.cpu.defrost(frost.cpu);
	}
	if (this.mmu && frost.mmu) {
		this.mmu.defrost(frost.mmu);
	}
	if (this.audio && frost.audio) {
		this.audio.defrost(frost.audio);
	}
	if (this.video && frost.video) {
		this.video.defrost(frost.video);
	}
	if (this.irq && frost.irq) {
		this.irq.defrost(frost.irq);
	}
	if (this.io && frost.io) {
		this.io.defrost(frost.io);
	}
};

GameBoyAdvance.prototype.log = function(level, message) {};

GameBoyAdvance.prototype.setLogger = function(logger) {
	this.log = logger;
};

GameBoyAdvance.prototype.logStackTrace = function(stack) {
	var overflow = stack.length - 32;
	this.ERROR('Stack trace follows:');
	if (overflow > 0) {
		this.log(-1, '> (Too many frames)');
	}
	for (var i = Math.max(overflow, 0); i < stack.length; ++i) {
		this.log(-1, '> ' + stack[i]);
	}
};

GameBoyAdvance.prototype.ERROR = function(error) {
	if (this.logLevel & this.LOG_ERROR) {
		this.log(this.LOG_ERROR, error);
	}
};

GameBoyAdvance.prototype.WARN = function(warn) {
	if (this.logLevel & this.LOG_WARN) {
		this.log(this.LOG_WARN, warn);
	}
};

GameBoyAdvance.prototype.STUB = function(func) {
	if (this.logLevel & this.LOG_STUB) {
		this.log(this.LOG_STUB, func);
	}
};

GameBoyAdvance.prototype.INFO = function(info) {
	if (this.logLevel & this.LOG_INFO) {
		this.log(this.LOG_INFO, info);
	}
};

GameBoyAdvance.prototype.DEBUG = function(info) {
	if (this.logLevel & this.LOG_DEBUG) {
		this.log(this.LOG_DEBUG, info);
	}
};

GameBoyAdvance.prototype.ASSERT_UNREACHED = function(err) {
	throw new Error("Should be unreached: " + err);
};

GameBoyAdvance.prototype.ASSERT = function(test, err) {
	if (!test) {
		throw new Error("Assertion failed: " + err);
	}
};

// Add Node.js specific methods
GameBoyAdvance.prototype.loadRomFromFile = function(romPath) {
	try {
		const fs = require('fs');
		const romBuffer = fs.readFileSync(romPath);
		return this.setRom(romBuffer.buffer);
	} catch (e) {
		this.ERROR(`Error loading ROM: ${e.message}`);
		return false;
	}
};

GameBoyAdvance.prototype.saveSavedataToFile = function(savePath) {
	try {
		const fs = require('fs');
		if (this.mmu && this.mmu.save) {
			const sram = this.mmu.save;
			if (sram) {
				fs.writeFileSync(savePath, Buffer.from(sram.buffer));
			}
		}
	} catch (e) {
		this.ERROR(`Error saving save data: ${e.message}`);
	}
};

// 性能监控相关方法
GameBoyAdvance.prototype.getPerformanceReport = function() {
	return this.performanceMonitor.generateReport();
};

GameBoyAdvance.prototype.getFPS = function() {
	return this.performanceMonitor.getFPS();
};

GameBoyAdvance.prototype.getAverageFrameTime = function() {
	return this.performanceMonitor.getAverageFrameTime();
};

GameBoyAdvance.prototype.getMemoryUsage = function() {
	return this.performanceMonitor.getMemoryUsage();
};

module.exports = GameBoyAdvance;