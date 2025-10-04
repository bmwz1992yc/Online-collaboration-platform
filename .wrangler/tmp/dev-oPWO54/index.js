var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var isWorkerdProcessV2 = globalThis.Cloudflare.compatibilityFlags.enable_nodejs_process_v2;
var unenvProcess = new Process({
  env: globalProcess.env,
  // `hrtime` is only available from workerd process v2
  hrtime: isWorkerdProcessV2 ? workerdProcess.hrtime : hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  // Always implemented by workerd
  env,
  // Only implemented in workerd v2
  hrtime: hrtime3,
  // Always implemented by workerd
  nextTick
} = unenvProcess;
var {
  _channel,
  _disconnect,
  _events,
  _eventsCount,
  _handleQueue,
  _maxListeners,
  _pendingMessage,
  _send,
  assert: assert2,
  disconnect,
  mainModule
} = unenvProcess;
var {
  // @ts-expect-error `_debugEnd` is missing typings
  _debugEnd,
  // @ts-expect-error `_debugProcess` is missing typings
  _debugProcess,
  // @ts-expect-error `_exiting` is missing typings
  _exiting,
  // @ts-expect-error `_fatalException` is missing typings
  _fatalException,
  // @ts-expect-error `_getActiveHandles` is missing typings
  _getActiveHandles,
  // @ts-expect-error `_getActiveRequests` is missing typings
  _getActiveRequests,
  // @ts-expect-error `_kill` is missing typings
  _kill,
  // @ts-expect-error `_linkedBinding` is missing typings
  _linkedBinding,
  // @ts-expect-error `_preload_modules` is missing typings
  _preload_modules,
  // @ts-expect-error `_rawDebug` is missing typings
  _rawDebug,
  // @ts-expect-error `_startProfilerIdleNotifier` is missing typings
  _startProfilerIdleNotifier,
  // @ts-expect-error `_stopProfilerIdleNotifier` is missing typings
  _stopProfilerIdleNotifier,
  // @ts-expect-error `_tickCallback` is missing typings
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  availableMemory,
  // @ts-expect-error `binding` is missing typings
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  // @ts-expect-error `domain` is missing typings
  domain,
  emit,
  emitWarning,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  // @ts-expect-error `initgroups` is missing typings
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  memoryUsage,
  // @ts-expect-error `moduleLoadList` is missing typings
  moduleLoadList,
  off,
  on,
  once,
  // @ts-expect-error `openStdin` is missing typings
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  // @ts-expect-error `reallyExit` is missing typings
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = isWorkerdProcessV2 ? workerdProcess : unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// index.js
var indexHtmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workers TaskFlow</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Workers TaskFlow</h1>
        <div id="user-info"></div>
    </header>

    <main>
        <section id="tasks-section">
            <h2>\u4EFB\u52A1\u7BA1\u7406</h2>
            <div id="task-form-container">
                <form id="task-form">
                    <input type="hidden" id="task-id">
                    <div>
                        <label for="task-title">\u6807\u9898:</label>
                        <input type="text" id="task-title" required>
                    </div>
                    <div>
                        <label for="task-description">\u63CF\u8FF0:</label>
                        <textarea id="task-description"></textarea>
                    </div>
                    <div>
                        <label for="task-status">\u72B6\u6001:</label>
                        <select id="task-status">
                            <option value="To Do">\u5F85\u529E</option>
                            <option value="In Progress">\u8FDB\u884C\u4E2D</option>
                            <option value="Completed">\u5DF2\u5B8C\u6210</option>
                        </select>
                    </div>
                    <div>
                        <label for="task-progress">\u8FDB\u5EA6:</label>
                        <input type="range" id="task-progress" min="0" max="100" value="0">
                        <span id="progress-value">0%</span>
                    </div>
                    <div>
                        <label for="task-due-date">\u622A\u6B62\u65E5\u671F:</label>
                        <input type="date" id="task-due-date">
                    </div>
                    <button type="submit">\u4FDD\u5B58\u4EFB\u52A1</button>
                    <button type="button" id="cancel-edit">\u53D6\u6D88</button>
                </form>
            </div>
            <div id="tasks-list"></div>
        </section>

        <section id="assets-section">
            <h2>\u8D44\u4EA7\u7BA1\u7406</h2>
            <div id="asset-form-container">
                <form id="asset-form">
                    <input type="hidden" id="asset-id">
                    <div>
                        <label for="asset-name">\u7269\u54C1\u540D\u79F0:</label>
                        <input type="text" id="asset-name" required>
                    </div>
                    <div>
                        <label for="asset-owner">\u5F53\u524D\u4FDD\u7BA1\u4EBA:</label>
                        <select id="asset-owner"></select>
                    </div>
                    <div>
                        <label for="asset-image">\u7269\u54C1\u56FE\u7247:</label>
                        <input type="file" id="asset-image" accept="image/*">
                        <input type="hidden" id="asset-image-key">
                    </div>
                    <button type="submit">\u767B\u8BB0\u7269\u54C1</button>
                    <button type="button" id="cancel-asset-edit">\u53D6\u6D88</button>
                </form>
            </div>
            <div id="assets-list"></div>
        </section>

        <section id="users-section" class="admin-only">
            <h2>\u7528\u6237\u7BA1\u7406</h2>
            <div id="user-form-container">
                <form id="user-form">
                    <div>
                        <label for="user-username">\u7528\u6237\u540D:</label>
                        <input type="text" id="user-username" required>
                    </div>
                    <div>
                        <label for="user-role">\u89D2\u8272:</label>
                        <select id="user-role">
                            <option value="member">\u6210\u5458</option>
                            <option value="admin">\u7BA1\u7406\u5458</option>
                        </select>
                    </div>
                    <button type="submit">\u6DFB\u52A0\u7528\u6237</button>
                </form>
            </div>
            <div id="users-list"></div>
        </section>
    </main>

    <script src="script.js"><\/script>
</body>
</html>`;
var stylesCssContent = `/* Global Styles */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f4f4f4;
}

.container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

header h1 {
    font-size: 1.8rem;
}

#user-info {
    font-size: 1rem;
}

main {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    margin: 20px 0;
}

section {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

section h2 {
    margin-bottom: 15px;
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 5px;
}

/* Form Styles */
form {
    background-color: #ecf0f1;
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 20px;
}

form div {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

input, select, textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

input[type="range"] {
    width: 80%;
}

button {
    background-color: #3498db;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin-right: 10px;
}

button:hover {
    background-color: #2980b9;
}

button[type="button"] {
    background-color: #95a5a6;
}

button[type="button"]:hover {
    background-color: #7f8c8d;
}

#progress-value {
    display: inline-block;
    width: 20%;
    text-align: center;
    font-weight: bold;
}

/* List Styles */
.task-item, .asset-item, .user-item {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 10px;
}

.task-item h3, .asset-item h3, .user-item h3 {
    margin-bottom: 10px;
    color: #2c3e50;
}

.task-item p, .asset-item p, .user-item p {
    margin-bottom: 8px;
}

.task-actions, .asset-actions, .user-actions {
    margin-top: 10px;
}

.task-actions button, .asset-actions button, .user-actions button {
    padding: 5px 10px;
    font-size: 12px;
    margin-right: 5px;
}

.delete-btn {
    background-color: #e74c3c;
}

.delete-btn:hover {
    background-color: #c0392b;
}

.edit-btn {
    background-color: #f39c12;
}

.edit-btn:hover {
    background-color: #d35400;
}

.transfer-btn {
    background-color: #9b59b6;
}

.transfer-btn:hover {
    background-color: #8e44ad;
}

/* Progress Bar */
.progress-container {
    width: 100%;
    background-color: #ecf0f1;
    border-radius: 5px;
    margin: 10px 0;
}

.progress-bar {
    height: 20px;
    background-color: #3498db;
    border-radius: 5px;
    text-align: center;
    line-height: 20px;
    color: white;
    font-size: 12px;
}

/* Asset Image */
.asset-image {
    max-width: 200px;
    max-height: 200px;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 5px;
}

/* Admin Only Section */
.admin-only {
    display: none;
}

.admin-only.visible {
    display: block;
}

/* Responsive Design */
@media (min-width: 768px) {
    main {
        grid-template-columns: 1fr 1fr;
    }
    
    #users-section {
        grid-column: span 2;
    }
}
`;
var scriptJsContent = `// Client-side JavaScript for Workers TaskFlow
// Handle API interactions and UI updates

// Global variables
let currentUser = null;
let users = [];

// DOM Elements
const taskForm = document.getElementById('task-form');
const assetForm = document.getElementById('asset-form');
const userForm = document.getElementById('user-form');
const tasksList = document.getElementById('tasks-list');
const assetsList = document.getElementById('assets-list');
const usersList = document.getElementById('users-list');
const userInfo = document.getElementById('user-info');
const usersSection = document.getElementById('users-section');

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    // Extract token from URL
    const pathParts = window.location.pathname.split('/');
    const token = pathParts[2];
    // The role is no longer directly used in the fetch path, but derived from the path for initial auth check
    const initialRoleCheck = pathParts[1]; 
    
    if (!token) {
        alert('\u7F3A\u5C11\u8BBF\u95EE\u4EE4\u724C\uFF0C\u8BF7\u901A\u8FC7\u6B63\u786E\u7684URL\u8BBF\u95EE\u7CFB\u7EDF');
        return;
    }
    
    // Authenticate user
    try {
        // Workers now return JSON for auth routes, not static files.
        // The frontend will make an API call to authenticate.
        const response = await fetch(\`/api/users/auth?token=\${token}&role=\${initialRoleCheck}\`);
        if (!response.ok) {
            throw new Error('\u8BA4\u8BC1\u5931\u8D25');
        }
        
        const userData = await response.json();
        currentUser = userData;
        
        // Update UI with user info
        userInfo.textContent = \`\u6B22\u8FCE, \${currentUser.username} (\${currentUser.role})\`;
        
        // Show admin section if user is admin
        if (currentUser.role === 'admin') {
            usersSection.classList.add('visible');
        }
        
        // Load initial data
        await loadTasks();
        await loadAssets();
        if (currentUser.role === 'admin') {
            await loadUsers();
        }
    } catch (error) {
        console.error('\u8BA4\u8BC1\u9519\u8BEF:', error);
        alert('\u8BA4\u8BC1\u5931\u8D25: ' + error.message);
    }
    
    // Set up event listeners
    setupEventListeners();
});

// Set up event listeners
function setupEventListeners() {
    // Task form submission
    taskForm.addEventListener('submit', handleTaskSubmit);
    
    // Asset form submission
    assetForm.addEventListener('submit', handleAssetSubmit);
    
    // User form submission
    userForm.addEventListener('submit', handleUserSubmit);
    
    // Cancel buttons
    document.getElementById('cancel-edit').addEventListener('click', clearTaskForm);
    document.getElementById('cancel-asset-edit').addEventListener('click', clearAssetForm);
    
    // Progress slider
    document.getElementById('task-progress').addEventListener('input', function() {
        document.getElementById('progress-value').textContent = this.value + '%';
    });
}

// Task Management Functions
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');
        if (!response.ok) throw new Error('\u83B7\u53D6\u4EFB\u52A1\u5931\u8D25');
        
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('\u52A0\u8F7D\u4EFB\u52A1\u9519\u8BEF:', error);
        alert('\u52A0\u8F7D\u4EFB\u52A1\u5931\u8D25: ' + error.message);
    }
}

function renderTasks(tasks) {
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p>\u6682\u65E0\u4EFB\u52A1</p>';
        return;
    }
    
    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = \`
            <h3>\${task.title}</h3>
            <p><strong>\u63CF\u8FF0:</strong> \${task.description || '\u65E0'}</p>
            <p><strong>\u72B6\u6001:</strong> \${task.status}</p>
            <p><strong>\u8FDB\u5EA6:</strong></p>
            <div class="progress-container">
                <div class="progress-bar" style="width: \${task.progress}%">\${task.progress}%</div>
            </div>
            <p><strong>\u6307\u6D3E\u4EBA:</strong> \${task.assignee_id}</p>
            <p><strong>\u521B\u5EFA\u4EBA:</strong> \${task.creator_id}</p>
            <p><strong>\u622A\u6B62\u65E5\u671F:</strong> \${task.due_date || '\u672A\u8BBE\u7F6E'}</p>
            <div class="task-actions">
                <button class="edit-btn" onclick="editTask('\${task.id}')">\u7F16\u8F91</button>
                <button class="delete-btn" onclick="deleteTask('\${task.id}')">\u5220\u9664</button>
            </div>
        \`;
        tasksList.appendChild(taskElement);
    });
}

async function handleTaskSubmit(event) {
    event.preventDefault();
    
    const taskData = {
        id: document.getElementById('task-id').value || crypto.randomUUID(),
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        status: document.getElementById('task-status').value,
        progress: parseInt(document.getElementById('task-progress').value),
        assignee_id: currentUser.username,
        creator_id: currentUser.username,
        due_date: document.getElementById('task-due-date').value
    };
    
    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });
        
        if (!response.ok) throw new Error('\u4FDD\u5B58\u4EFB\u52A1\u5931\u8D25');
        
        const savedTask = await response.json();
        console.log('\u4EFB\u52A1\u5DF2\u4FDD\u5B58:', savedTask);
        
        // Clear form and reload tasks
        clearTaskForm();
        await loadTasks();
    } catch (error) {
        console.error('\u4FDD\u5B58\u4EFB\u52A1\u9519\u8BEF:', error);
        alert('\u4FDD\u5B58\u4EFB\u52A1\u5931\u8D25: ' + error.message);
    }
}

function editTask(taskId) {
    // Find the task in the DOM and populate the form
    // In a real implementation, we would fetch the task details from the API
    alert('\u7F16\u8F91\u529F\u80FD\u5C06\u5728\u540E\u7EED\u5B9E\u73B0');
}

async function deleteTask(taskId) {
    if (!confirm('\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u4EFB\u52A1\u5417?')) return;
    
    try {
        const response = await fetch(\`/api/tasks/\${taskId}\`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('\u5220\u9664\u4EFB\u52A1\u5931\u8D25');
        
        await loadTasks();
    } catch (error) {
        console.error('\u5220\u9664\u4EFB\u52A1\u9519\u8BEF:', error);
        alert('\u5220\u9664\u4EFB\u52A1\u5931\u8D25: ' + error.message);
    }
}

function clearTaskForm() {
    taskForm.reset();
    document.getElementById('task-id').value = '';
    document.getElementById('progress-value').textContent = '0%';
}

// Asset Management Functions
async function loadAssets() {
    try {
        const response = await fetch('/api/assets');
        if (!response.ok) throw new Error('\u83B7\u53D6\u8D44\u4EA7\u5931\u8D25');
        
        const assets = await response.json();
        renderAssets(assets);
        updateAssetOwnerDropdown(assets);
    } catch (error) {
        console.error('\u52A0\u8F7D\u8D44\u4EA7\u9519\u8BEF:', error);
        alert('\u52A0\u8F7D\u8D44\u4EA7\u5931\u8D25: ' + error.message);
    }
}

function renderAssets(assets) {
    assetsList.innerHTML = '';
    
    if (assets.length === 0) {
        assetsList.innerHTML = '<p>\u6682\u65E0\u8D44\u4EA7</p>';
        return;
    }
    
    assets.forEach(asset => {
        const assetElement = document.createElement('div');
        assetElement.className = 'asset-item';
        assetElement.innerHTML = \`
            <h3>\${asset.name}</h3>
            <p><strong>\u5F53\u524D\u4FDD\u7BA1\u4EBA:</strong> \${asset.current_owner_id}</p>
            \${asset.image_r2_key ? \`<img src="/api/files/\${asset.image_r2_key}" alt="\${asset.name}" class="asset-image">\` : ''}
            <p><strong>\u4EA4\u63A5\u5386\u53F2:</strong></p>
            <ul>
                \${(asset.transfer_history || []).map(transfer => 
                    \`<li>\${transfer.from_owner_id} \u2192 \${transfer.to_owner_id} (\${new Date(transfer.transfer_time).toLocaleString()})</li>\`
                ).join('')}
            </ul>
            <div class="asset-actions">
                <button class="transfer-btn" onclick="transferAsset('\${asset.id}')">\u4EA4\u63A5</button>
            </div>
        \`;
        assetsList.appendChild(assetElement);
    });
}

function updateAssetOwnerDropdown(assets) {
    const ownerSelect = document.getElementById('asset-owner');
    ownerSelect.innerHTML = '';
    
    // Get unique owners from assets and users
    const owners = [...new Set([
        ...assets.map(a => a.current_owner_id),
        ...users.map(u => u.username)
    ])];
    
    owners.forEach(owner => {
        const option = document.createElement('option');
        option.value = owner;
        option.textContent = owner;
        ownerSelect.appendChild(option);
    });
}

async function handleAssetSubmit(event) {
    event.preventDefault();
    
    // Handle image upload if a file is selected
    let imageKey = document.getElementById('asset-image-key').value;
    const imageFile = document.getElementById('asset-image').files[0];
    
    if (imageFile) {
        try {
            // Get presigned URL for upload
            const presignResponse = await fetch(\`/api/files/presign-upload?filename=\${encodeURIComponent(imageFile.name)}\`);
            if (!presignResponse.ok) throw new Error('\u83B7\u53D6\u4E0A\u4F20URL\u5931\u8D25');
            
            const { uploadUrl, fileKey } = await presignResponse.json();
            imageKey = fileKey;
            
            // Upload file directly to R2
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                body: imageFile,
                headers: {
                    'Content-Type': imageFile.type
                }
            });
            
            if (!uploadResponse.ok) throw new Error('\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25');
        } catch (error) {
            console.error('\u6587\u4EF6\u4E0A\u4F20\u9519\u8BEF:', error);
            alert('\u6587\u4EF6\u4E0A\u4F20\u5931\u8D25: ' + error.message);
            return;
        }
    }
    
    const assetData = {
        id: document.getElementById('asset-id').value || crypto.randomUUID(),
        name: document.getElementById('asset-name').value,
        current_owner_id: document.getElementById('asset-owner').value,
        image_r2_key: imageKey,
        transfer_history: []
    };
    
    try {
        const response = await fetch('/api/assets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assetData)
        });
        
        if (!response.ok) throw new Error('\u4FDD\u5B58\u8D44\u4EA7\u5931\u8D25');
        
        const savedAsset = await response.json();
        console.log('\u8D44\u4EA7\u5DF2\u4FDD\u5B58:', savedAsset);
        
        // Clear form and reload assets
        clearAssetForm();
        await loadAssets();
    } catch (error) {
        console.error('\u4FDD\u5B58\u8D44\u4EA7\u9519\u8BEF:', error);
        alert('\u4FDD\u5B58\u8D44\u4EA7\u5931\u8D25: ' + error.message);
    }
}

async function transferAsset(assetId) {
    const newOwnerId = prompt('\u8BF7\u8F93\u5165\u65B0\u7684\u4FDD\u7BA1\u4EBA\u7528\u6237\u540D:');
    if (!newOwnerId) return;

    try {
        const response = await fetch('/api/assets/transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ assetId, newOwnerId })
        });

        if (!response.ok) throw new Error('\u8D44\u4EA7\u4EA4\u63A5\u5931\u8D25');

        const updatedAsset = await response.json();
        console.log('\u8D44\u4EA7\u5DF2\u4EA4\u63A5:', updatedAsset);
        await loadAssets();
    } catch (error) {
        console.error('\u8D44\u4EA7\u4EA4\u63A5\u9519\u8BEF:', error);
        alert('\u8D44\u4EA7\u4EA4\u63A5\u5931\u8D25: ' + error.message);
    }
}

function clearAssetForm() {
    assetForm.reset();
    document.getElementById('asset-id').value = '';
    document.getElementById('asset-image-key').value = '';
}

// User Management Functions
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('\u83B7\u53D6\u7528\u6237\u5931\u8D25');
        
        users = await response.json();
        renderUsers(users);
        updateAssetOwnerDropdown([]); // Update dropdown with new users
    } catch (error) {
        console.error('\u52A0\u8F7D\u7528\u6237\u9519\u8BEF:', error);
        alert('\u52A0\u8F7D\u7528\u6237\u5931\u8D25: ' + error.message);
    }
}

function renderUsers(users) {
    usersList.innerHTML = '';
    
    if (users.length === 0) {
        usersList.innerHTML = '<p>\u6682\u65E0\u7528\u6237</p>';
        return;
    }
    
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.innerHTML = \`
            <h3>\${user.username}</h3>
            <p><strong>\u89D2\u8272:</strong> \${user.role}</p>
            <p><strong>Token:</strong> \${user.token}</p>
        \`;
        usersList.appendChild(userElement);
    });
}

async function handleUserSubmit(event) {
    event.preventDefault();
    
    const userData = {
        username: document.getElementById('user-username').value,
        role: document.getElementById('user-role').value,
        token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    };
    
    try {
        const response = await fetch('/api/users/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) throw new Error('\u6DFB\u52A0\u7528\u6237\u5931\u8D25');
        
        const savedUser = await response.json();
        console.log('\u7528\u6237\u5DF2\u6DFB\u52A0:', savedUser);
        
        // Clear form and reload users
        userForm.reset();
        await loadUsers();
    } catch (error) {
        console.error('\u6DFB\u52A0\u7528\u6237\u9519\u8BEF:', error);
        alert('\u6DFB\u52A0\u7528\u6237\u5931\u8D25: ' + error.message);
    }
}
`;
var index_default = {
  async fetch(request, env2) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/") {
      return new Response(indexHtmlContent, {
        headers: { "Content-Type": "text/html" }
      });
    }
    if (path === "/styles.css") {
      return new Response(stylesCssContent, {
        headers: { "Content-Type": "text/css" }
      });
    }
    if (path === "/script.js") {
      return new Response(scriptJsContent, {
        headers: { "Content-Type": "application/javascript" }
      });
    }
    if (request.method === "GET") {
      if (path.startsWith("/api/")) {
        return handleApiGetRequest(path, request, env2);
      }
    } else if (request.method === "POST") {
      if (path.startsWith("/api/")) {
        return handleApiPostRequest(path, request, env2);
      }
    } else if (request.method === "DELETE") {
      if (path.startsWith("/api/tasks/")) {
        return handleApiDeleteRequest(path, request, env2);
      }
    }
    return new Response("Not Found", { status: 404 });
  }
};
async function handleApiGetRequest(path, request, env2) {
  if (path === "/api/tasks") {
    return getAllTasks(env2);
  } else if (path === "/api/assets") {
    return getAllAssets(env2);
  } else if (path === "/api/users") {
    return getAllUsers(env2);
  } else if (path === "/api/users/auth") {
    return authenticateUser(request, env2);
  } else if (path === "/api/files/presign-upload") {
    return presignUploadUrl(request, env2);
  } else if (path.startsWith("/api/files/")) {
    const key = path.substring(11);
    return serveFileFromR2(key, env2);
  }
  return new Response("Not Found", { status: 404 });
}
__name(handleApiGetRequest, "handleApiGetRequest");
async function handleApiPostRequest(path, request, env2) {
  if (path === "/api/tasks") {
    return createOrUpdateTask(request, env2);
  } else if (path === "/api/assets") {
    return registerAsset(request, env2);
  } else if (path === "/api/assets/transfer") {
    return transferAsset(request, env2);
  } else if (path === "/api/users/add") {
    return addUser(request, env2);
  }
  return new Response("Not Found", { status: 404 });
}
__name(handleApiPostRequest, "handleApiPostRequest");
async function handleApiDeleteRequest(path, request, env2) {
  const taskId = path.split("/")[3];
  if (taskId) {
    return deleteTask(taskId, env2);
  }
  return new Response("Bad Request", { status: 400 });
}
__name(handleApiDeleteRequest, "handleApiDeleteRequest");
async function getAllTasks(env2) {
  try {
    const tasksObject = await env2.R2_BUCKET.get("data:tasks");
    let tasks = [];
    if (tasksObject !== null) {
      const tasksData = await tasksObject.text();
      tasks = JSON.parse(tasksData);
    }
    return new Response(JSON.stringify(tasks), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response("Error fetching tasks: " + error3.message, { status: 500 });
  }
}
__name(getAllTasks, "getAllTasks");
async function getAllAssets(env2) {
  try {
    const assetsObject = await env2.R2_BUCKET.get("data:assets");
    let assets = [];
    if (assetsObject !== null) {
      const assetsData = await assetsObject.text();
      assets = JSON.parse(assetsData);
    }
    return new Response(JSON.stringify(assets), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response("Error fetching assets: " + error3.message, { status: 500 });
  }
}
__name(getAllAssets, "getAllAssets");
async function getAllUsers(env2) {
  try {
    const usersObject = await env2.R2_BUCKET.get("config:share_links");
    let users = {};
    if (usersObject !== null) {
      const usersData = await usersObject.text();
      users = JSON.parse(usersData);
    }
    const usersArray = Object.values(users);
    return new Response(JSON.stringify(usersArray), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response("Error fetching users: " + error3.message, { status: 500 });
  }
}
__name(getAllUsers, "getAllUsers");
async function authenticateUser(request, env2) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const role = url.searchParams.get("role");
    if (!token) {
      return new Response("Missing token parameter", { status: 400 });
    }
    const userConfig = await env2.R2_BUCKET.get("config:share_links");
    let users = {};
    if (userConfig !== null) {
      const userData = await userConfig.text();
      users = JSON.parse(userData);
    }
    const user = Object.values(users).find((u) => u.token === token);
    if (!user || user.role !== (role === "admin" ? "admin" : "member")) {
      return new Response("Authentication failed", { status: 401 });
    }
    return new Response(JSON.stringify(user), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response("Error authenticating user: " + error3.message, { status: 500 });
  }
}
__name(authenticateUser, "authenticateUser");
async function createOrUpdateTask(request, env2) {
  try {
    const taskData = await request.json();
    const tasksObject = await env2.R2_BUCKET.get("data:tasks");
    let tasks = [];
    if (tasksObject !== null) {
      const tasksData = await tasksObject.text();
      tasks = JSON.parse(tasksData);
    }
    const existingIndex = tasks.findIndex((t) => t.id === taskData.id);
    if (existingIndex >= 0) {
      tasks[existingIndex] = { ...tasks[existingIndex], ...taskData };
    } else {
      tasks.push(taskData);
    }
    await env2.R2_BUCKET.put("data:tasks", JSON.stringify(tasks));
    return new Response(JSON.stringify(taskData), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response("Error creating/updating task: " + error3.message, { status: 500 });
  }
}
__name(createOrUpdateTask, "createOrUpdateTask");
async function deleteTask(taskId, env2) {
  try {
    const tasksObject = await env2.R2_BUCKET.get("data:tasks");
    let tasks = [];
    if (tasksObject !== null) {
      const tasksData = await tasksObject.text();
      tasks = JSON.parse(tasksData);
    }
    tasks = tasks.filter((t) => t.id !== taskId);
    await env2.R2_BUCKET.put("data:tasks", JSON.stringify(tasks));
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response("Error deleting task: " + error3.message, { status: 500 });
  }
}
__name(deleteTask, "deleteTask");
async function registerAsset(request, env2) {
  try {
    const assetData = await request.json();
    const assetsObject = await env2.R2_BUCKET.get("data:assets");
    let assets = [];
    if (assetsObject !== null) {
      const assetsData = await assetsObject.text();
      assets = JSON.parse(assetsData);
    }
    assets.push(assetData);
    await env2.R2_BUCKET.put("data:assets", JSON.stringify(assets));
    return new Response(JSON.stringify(assetData), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response("Error registering asset: " + error3.message, { status: 500 });
  }
}
__name(registerAsset, "registerAsset");
async function transferAsset(request, env2) {
  try {
    const { assetId, newOwnerId } = await request.json();
    const assetsObject = await env2.R2_BUCKET.get("data:assets");
    let assets = [];
    if (assetsObject !== null) {
      const assetsData = await assetsObject.text();
      assets = JSON.parse(assetsData);
    }
    const assetIndex = assets.findIndex((a) => a.id === assetId);
    if (assetIndex < 0) {
      return new Response("Asset not found", { status: 404 });
    }
    const transferRecord = {
      from_owner_id: assets[assetIndex].current_owner_id,
      to_owner_id: newOwnerId,
      transfer_time: (/* @__PURE__ */ new Date()).toISOString()
    };
    assets[assetIndex].current_owner_id = newOwnerId;
    assets[assetIndex].transfer_history = [
      ...assets[assetIndex].transfer_history || [],
      transferRecord
    ];
    await env2.R2_BUCKET.put("data:assets", JSON.stringify(assets));
    return new Response(JSON.stringify(assets[assetIndex]), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response("Error transferring asset: " + error3.message, { status: 500 });
  }
}
__name(transferAsset, "transferAsset");
async function addUser(request, env2) {
  try {
    const userData = await request.json();
    const usersObject = await env2.R2_BUCKET.get("config:share_links");
    let users = {};
    if (usersObject !== null) {
      const usersData = await usersObject.text();
      users = JSON.parse(userData);
    }
    users[userData.username] = userData;
    await env2.R2_BUCKET.put("config:share_links", JSON.stringify(users));
    return new Response(JSON.stringify(userData), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response("Error adding user: " + error3.message, { status: 500 });
  }
}
__name(addUser, "addUser");
async function presignUploadUrl(request, env2) {
  try {
    const url = new URL(request.url);
    const filename = url.searchParams.get("filename");
    if (!filename) {
      return new Response("Missing filename parameter", { status: 400 });
    }
    const uuid = crypto.randomUUID();
    const key = `files:images/${uuid}-${filename}`;
    const signedUrl = await env2.R2_BUCKET.createSignedUrl(key, 3600, {
      method: "PUT"
    });
    return new Response(JSON.stringify({
      uploadUrl: signedUrl,
      fileKey: key
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error3) {
    return new Response("Error creating presigned URL: " + error3.message, { status: 500 });
  }
}
__name(presignUploadUrl, "presignUploadUrl");
async function serveFileFromR2(key, env2) {
  try {
    const object = await env2.R2_BUCKET.get(key);
    if (object === null) {
      return new Response("File not found", { status: 404 });
    }
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    return new Response(object.body, {
      headers
    });
  } catch (error3) {
    return new Response("Error serving file: " + error3.message, { status: 500 });
  }
}
__name(serveFileFromR2, "serveFileFromR2");

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env2, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env2);
  } catch (e) {
    const error3 = reduceError(e);
    return Response.json(error3, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-bGuQyL/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = index_default;

// ../../../../../AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env2, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env2, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env2, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env2, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-bGuQyL/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env2, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env2, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env2, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env2, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env2, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env2, ctx) => {
      this.env = env2;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
