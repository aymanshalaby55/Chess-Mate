/*!
 * Stockfish copyright T. Romstad, M. Costalba, J. Kiiski, G. Linscott
 * and other contributors.
 *
 * Multi-variant support by Daniel Dugovic and contributors:
 * https://github.com/ddugovic/Stockfish
 *
 * Released under the GNU General Public License v3.
 *
 * Compiled to JavaScript and Webassembly by Niklas Fiekas
 * <niklas.fiekas@backscattering.de> using Emscripten and Binaryen.
 *
 * https://github.com/niklasf/stockfish.js
 */

var Module = void 0 !== Module ? Module : {};
Module = (function () {
    var r = [];
    return (
        (onmessage = function (e) {
            "quit" == e.data
                ? close()
                : null !== r
                  ? r.push(e.data)
                  : Module.ccall("uci_command", "number", ["string"], [e.data]);
        }),
        {
            locateFile: function (e) {
                return e;
            },
            print: function (e) {
                postMessage(e);
            },
            postRun: function () {
                for (var e = 0; e < r.length; e++)
                    Module.ccall("uci_command", "number", ["string"], [r[e]]);
                r = null;
            },
        }
    );
})();
var key,
    moduleOverrides = {};
for (key in Module)
    Module.hasOwnProperty(key) && (moduleOverrides[key] = Module[key]);
var arguments_ = [],
    thisProgram = "./this.program",
    quit_ = function (e, r) {
        throw r;
    },
    ENVIRONMENT_IS_WEB = !1,
    ENVIRONMENT_IS_WORKER = !1,
    ENVIRONMENT_IS_NODE = !1,
    ENVIRONMENT_HAS_NODE = !1,
    ENVIRONMENT_IS_SHELL = !1;
(ENVIRONMENT_IS_WEB = "object" == typeof window),
    (ENVIRONMENT_IS_WORKER = "function" == typeof importScripts),
    (ENVIRONMENT_HAS_NODE =
        "object" == typeof process &&
        "object" == typeof process.versions &&
        "string" == typeof process.versions.node),
    (ENVIRONMENT_IS_NODE =
        ENVIRONMENT_HAS_NODE && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER),
    (ENVIRONMENT_IS_SHELL =
        !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER);
var read_,
    readAsync,
    readBinary,
    setWindowTitle,
    nodeFS,
    nodePath,
    scriptDirectory = "";
function locateFile(e) {
    return Module.locateFile
        ? Module.locateFile(e, scriptDirectory)
        : scriptDirectory + e;
}
ENVIRONMENT_IS_NODE
    ? ((scriptDirectory = __dirname + "/"),
      (read_ = function (e, r) {
          var t;
          return (
              (nodeFS = nodeFS || require("fs")),
              (e = (nodePath = nodePath || require("path")).normalize(e)),
              (t = nodeFS.readFileSync(e)),
              r ? t : t.toString()
          );
      }),
      (readBinary = function (e) {
          var r = read_(e, !0);
          return r.buffer || (r = new Uint8Array(r)), assert(r.buffer), r;
      }),
      1 < process.argv.length &&
          (thisProgram = process.argv[1].replace(/\\/g, "/")),
      (arguments_ = process.argv.slice(2)),
      "undefined" != typeof module && (module.exports = Module),
      process.on("uncaughtException", function (e) {
          if (!(e instanceof ExitStatus)) throw e;
      }),
      process.on("unhandledRejection", abort),
      (quit_ = function (e) {
          process.exit(e);
      }),
      (Module.inspect = function () {
          return "[Emscripten Module object]";
      }))
    : ENVIRONMENT_IS_SHELL
      ? ("undefined" != typeof read &&
            (read_ = function (e) {
                return read(e);
            }),
        (readBinary = function (e) {
            var r;
            return "function" == typeof readbuffer
                ? new Uint8Array(readbuffer(e))
                : (assert("object" == typeof (r = read(e, "binary"))), r);
        }),
        "undefined" != typeof scriptArgs
            ? (arguments_ = scriptArgs)
            : "undefined" != typeof arguments && (arguments_ = arguments),
        "function" == typeof quit &&
            (quit_ = function (e) {
                quit(e);
            }),
        "undefined" != typeof print &&
            ("undefined" == typeof console && (console = {}),
            (console.log = print),
            (console.warn = console.error =
                "undefined" != typeof printErr ? printErr : print)))
      : (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) &&
        (ENVIRONMENT_IS_WORKER
            ? (scriptDirectory = self.location.href)
            : document.currentScript &&
              (scriptDirectory = document.currentScript.src),
        (scriptDirectory =
            0 !== scriptDirectory.indexOf("blob:")
                ? scriptDirectory.substr(
                      0,
                      scriptDirectory.lastIndexOf("/") + 1,
                  )
                : ""),
        (read_ = function (e) {
            var r = new XMLHttpRequest();
            return r.open("GET", e, !1), r.send(null), r.responseText;
        }),
        ENVIRONMENT_IS_WORKER &&
            (readBinary = function (e) {
                var r = new XMLHttpRequest();
                return (
                    r.open("GET", e, !1),
                    (r.responseType = "arraybuffer"),
                    r.send(null),
                    new Uint8Array(r.response)
                );
            }),
        (readAsync = function (e, r, t) {
            var n = new XMLHttpRequest();
            n.open("GET", e, !0),
                (n.responseType = "arraybuffer"),
                (n.onload = function () {
                    200 == n.status || (0 == n.status && n.response)
                        ? r(n.response)
                        : t();
                }),
                (n.onerror = t),
                n.send(null);
        }),
        (setWindowTitle = function (e) {
            document.title = e;
        }));
var out = Module.print || console.log.bind(console),
    err = Module.printErr || console.warn.bind(console);
for (key in moduleOverrides)
    moduleOverrides.hasOwnProperty(key) && (Module[key] = moduleOverrides[key]);
function dynamicAlloc(e) {
    var r = HEAP32[DYNAMICTOP_PTR >> 2],
        t = (r + e + 15) & -16;
    return (
        t > _emscripten_get_heap_size() && abort(),
        (HEAP32[DYNAMICTOP_PTR >> 2] = t),
        r
    );
}
function getNativeTypeSize(e) {
    switch (e) {
        case "i1":
        case "i8":
            return 1;
        case "i16":
            return 2;
        case "i32":
            return 4;
        case "i64":
            return 8;
        case "float":
            return 4;
        case "double":
            return 8;
        default:
            if ("*" === e[e.length - 1]) return 4;
            if ("i" !== e[0]) return 0;
            var r = parseInt(e.substr(1));
            return (
                assert(
                    r % 8 == 0,
                    "getNativeTypeSize invalid bits " + r + ", type " + e,
                ),
                r / 8
            );
    }
}
function warnOnce(e) {
    warnOnce.shown || (warnOnce.shown = {}),
        warnOnce.shown[e] || ((warnOnce.shown[e] = 1), err(e));
}
(moduleOverrides = null),
    Module.arguments && (arguments_ = Module.arguments),
    Module.thisProgram && (thisProgram = Module.thisProgram),
    Module.quit && (quit_ = Module.quit);
var asm2wasmImports = {
        "f64-rem": function (e, r) {
            return e % r;
        },
        debugger: function () {},
    },
    functionPointers = new Array(0),
    funcWrappers = {};
function getFuncWrapper(r, t) {
    if (r) {
        assert(t), funcWrappers[t] || (funcWrappers[t] = {});
        var e = funcWrappers[t];
        return (
            e[r] ||
                (1 === t.length
                    ? (e[r] = function () {
                          return dynCall(t, r);
                      })
                    : 2 === t.length
                      ? (e[r] = function (e) {
                            return dynCall(t, r, [e]);
                        })
                      : (e[r] = function () {
                            return dynCall(
                                t,
                                r,
                                Array.prototype.slice.call(arguments),
                            );
                        })),
            e[r]
        );
    }
}
function dynCall(e, r, t) {
    return t && t.length
        ? Module["dynCall_" + e].apply(null, [r].concat(t))
        : Module["dynCall_" + e].call(null, r);
}
var wasmBinary,
    wasmMemory,
    wasmTable,
    tempRet0 = 0,
    setTempRet0 = function (e) {
        tempRet0 = e;
    },
    getTempRet0 = function () {
        return tempRet0;
    };
function setValue(e, r, t, n) {
    switch (("*" === (t = t || "i8").charAt(t.length - 1) && (t = "i32"), t)) {
        case "i1":
        case "i8":
            HEAP8[e >> 0] = r;
            break;
        case "i16":
            HEAP16[e >> 1] = r;
            break;
        case "i32":
            HEAP32[e >> 2] = r;
            break;
        case "i64":
            (tempI64 = [
                r >>> 0,
                ((tempDouble = r),
                1 <= +Math_abs(tempDouble)
                    ? 0 < tempDouble
                        ? (0 |
                              Math_min(
                                  +Math_floor(tempDouble / 4294967296),
                                  4294967295,
                              )) >>>
                          0
                        : ~~+Math_ceil(
                              (tempDouble - +(~~tempDouble >>> 0)) / 4294967296,
                          ) >>> 0
                    : 0),
            ]),
                (HEAP32[e >> 2] = tempI64[0]),
                (HEAP32[(e + 4) >> 2] = tempI64[1]);
            break;
        case "float":
            HEAPF32[e >> 2] = r;
            break;
        case "double":
            HEAPF64[e >> 3] = r;
            break;
        default:
            abort("invalid type for setValue: " + t);
    }
}
Module.wasmBinary && (wasmBinary = Module.wasmBinary),
    "object" != typeof WebAssembly && err("no native wasm support detected");
var ABORT = !1,
    EXITSTATUS = 0;
function assert(e, r) {
    e || abort("Assertion failed: " + r);
}
function getCFunc(e) {
    var r = Module["_" + e];
    return (
        assert(
            r,
            "Cannot call unknown function " + e + ", make sure it is exported",
        ),
        r
    );
}
function ccall(e, r, t, n, o) {
    var i = {
        string: function (e) {
            var r = 0;
            if (null != e && 0 !== e) {
                var t = 1 + (e.length << 2);
                stringToUTF8(e, (r = stackAlloc(t)), t);
            }
            return r;
        },
        array: function (e) {
            var r = stackAlloc(e.length);
            return writeArrayToMemory(e, r), r;
        },
    };
    var a = getCFunc(e),
        s = [],
        u = 0;
    if (n)
        for (var l = 0; l < n.length; l++) {
            var c = i[t[l]];
            c
                ? (0 === u && (u = stackSave()), (s[l] = c(n[l])))
                : (s[l] = n[l]);
        }
    var d,
        f = a.apply(null, s);
    return (
        (d = f),
        (f =
            "string" === r
                ? UTF8ToString(d)
                : "boolean" === r
                  ? Boolean(d)
                  : d),
        0 !== u && stackRestore(u),
        f
    );
}
var ALLOC_NONE = 3;
function allocate(e, r, t, n) {
    var o, i;
    i = "number" == typeof e ? ((o = !0), e) : ((o = !1), e.length);
    var a,
        s = "string" == typeof r ? r : null;
    if (
        ((a =
            t == ALLOC_NONE
                ? n
                : [_malloc, stackAlloc, dynamicAlloc][t](
                      Math.max(i, s ? 1 : r.length),
                  )),
        o)
    ) {
        var u;
        for (assert(0 == (3 & (n = a))), u = a + (-4 & i); n < u; n += 4)
            HEAP32[n >> 2] = 0;
        for (u = a + i; n < u; ) HEAP8[n++ >> 0] = 0;
        return a;
    }
    if ("i8" === s)
        return (
            e.subarray || e.slice
                ? HEAPU8.set(e, a)
                : HEAPU8.set(new Uint8Array(e), a),
            a
        );
    for (var l, c, d, f = 0; f < i; ) {
        var m = e[f];
        0 !== (l = s || r[f])
            ? ("i64" == l && (l = "i32"),
              setValue(a + f, m, l),
              d !== l && ((c = getNativeTypeSize(l)), (d = l)),
              (f += c))
            : f++;
    }
    return a;
}
var UTF8Decoder =
    "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;
function UTF8ArrayToString(e, r, t) {
    for (var n = r + t, o = r; e[o] && !(n <= o); ) ++o;
    if (16 < o - r && e.subarray && UTF8Decoder)
        return UTF8Decoder.decode(e.subarray(r, o));
    for (var i = ""; r < o; ) {
        var a = e[r++];
        if (128 & a) {
            var s = 63 & e[r++];
            if (192 != (224 & a)) {
                var u = 63 & e[r++];
                if (
                    (a =
                        224 == (240 & a)
                            ? ((15 & a) << 12) | (s << 6) | u
                            : ((7 & a) << 18) |
                              (s << 12) |
                              (u << 6) |
                              (63 & e[r++])) < 65536
                )
                    i += String.fromCharCode(a);
                else {
                    var l = a - 65536;
                    i += String.fromCharCode(
                        55296 | (l >> 10),
                        56320 | (1023 & l),
                    );
                }
            } else i += String.fromCharCode(((31 & a) << 6) | s);
        } else i += String.fromCharCode(a);
    }
    return i;
}
function UTF8ToString(e, r) {
    return e ? UTF8ArrayToString(HEAPU8, e, r) : "";
}
function stringToUTF8Array(e, r, t, n) {
    if (!(0 < n)) return 0;
    for (var o = t, i = t + n - 1, a = 0; a < e.length; ++a) {
        var s = e.charCodeAt(a);
        if (55296 <= s && s <= 57343)
            s = (65536 + ((1023 & s) << 10)) | (1023 & e.charCodeAt(++a));
        if (s <= 127) {
            if (i <= t) break;
            r[t++] = s;
        } else if (s <= 2047) {
            if (i <= t + 1) break;
            (r[t++] = 192 | (s >> 6)), (r[t++] = 128 | (63 & s));
        } else if (s <= 65535) {
            if (i <= t + 2) break;
            (r[t++] = 224 | (s >> 12)),
                (r[t++] = 128 | ((s >> 6) & 63)),
                (r[t++] = 128 | (63 & s));
        } else {
            if (i <= t + 3) break;
            (r[t++] = 240 | (s >> 18)),
                (r[t++] = 128 | ((s >> 12) & 63)),
                (r[t++] = 128 | ((s >> 6) & 63)),
                (r[t++] = 128 | (63 & s));
        }
    }
    return (r[t] = 0), t - o;
}
function stringToUTF8(e, r, t) {
    return stringToUTF8Array(e, HEAPU8, r, t);
}
function lengthBytesUTF8(e) {
    for (var r = 0, t = 0; t < e.length; ++t) {
        var n = e.charCodeAt(t);
        55296 <= n &&
            n <= 57343 &&
            (n = (65536 + ((1023 & n) << 10)) | (1023 & e.charCodeAt(++t))),
            n <= 127 ? ++r : (r += n <= 2047 ? 2 : n <= 65535 ? 3 : 4);
    }
    return r;
}
var UTF16Decoder =
    "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0;
function allocateUTF8(e) {
    var r = lengthBytesUTF8(e) + 1,
        t = _malloc(r);
    return t && stringToUTF8Array(e, HEAP8, t, r), t;
}
function allocateUTF8OnStack(e) {
    var r = lengthBytesUTF8(e) + 1,
        t = stackAlloc(r);
    return stringToUTF8Array(e, HEAP8, t, r), t;
}
function writeArrayToMemory(e, r) {
    HEAP8.set(e, r);
}
var buffer,
    HEAP8,
    HEAPU8,
    HEAP16,
    HEAPU16,
    HEAP32,
    HEAPU32,
    HEAPF32,
    HEAPF64,
    WASM_PAGE_SIZE = 65536;
function updateGlobalBufferViews() {
    (Module.HEAP8 = HEAP8 = new Int8Array(buffer)),
        (Module.HEAP16 = HEAP16 = new Int16Array(buffer)),
        (Module.HEAP32 = HEAP32 = new Int32Array(buffer)),
        (Module.HEAPU8 = HEAPU8 = new Uint8Array(buffer)),
        (Module.HEAPU16 = HEAPU16 = new Uint16Array(buffer)),
        (Module.HEAPU32 = HEAPU32 = new Uint32Array(buffer)),
        (Module.HEAPF32 = HEAPF32 = new Float32Array(buffer)),
        (Module.HEAPF64 = HEAPF64 = new Float64Array(buffer));
}
var DYNAMIC_BASE = 6352512,
    DYNAMICTOP_PTR = 1109600,
    INITIAL_TOTAL_MEMORY = Module.TOTAL_MEMORY || 33554432;
function callRuntimeCallbacks(e) {
    for (; 0 < e.length; ) {
        var r = e.shift();
        if ("function" != typeof r) {
            var t = r.func;
            "number" == typeof t
                ? void 0 === r.arg
                    ? Module.dynCall_v(t)
                    : Module.dynCall_vi(t, r.arg)
                : t(void 0 === r.arg ? null : r.arg);
        } else r();
    }
}
(wasmMemory = Module.wasmMemory
    ? Module.wasmMemory
    : new WebAssembly.Memory({
          initial: INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE,
          maximum: INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE,
      })) && (buffer = wasmMemory.buffer),
    (INITIAL_TOTAL_MEMORY = buffer.byteLength),
    updateGlobalBufferViews(),
    (HEAP32[DYNAMICTOP_PTR >> 2] = DYNAMIC_BASE);
var __ATPRERUN__ = [],
    __ATINIT__ = [],
    __ATMAIN__ = [],
    __ATPOSTRUN__ = [],
    runtimeInitialized = !1,
    runtimeExited = !1;
function preRun() {
    if (Module.preRun)
        for (
            "function" == typeof Module.preRun &&
            (Module.preRun = [Module.preRun]);
            Module.preRun.length;
        )
            addOnPreRun(Module.preRun.shift());
    callRuntimeCallbacks(__ATPRERUN__);
}
function initRuntime() {
    (runtimeInitialized = !0),
        Module.noFSInit || FS.init.initialized || FS.init(),
        TTY.init(),
        callRuntimeCallbacks(__ATINIT__);
}
function preMain() {
    (FS.ignorePermissions = !1), callRuntimeCallbacks(__ATMAIN__);
}
function exitRuntime() {
    runtimeExited = !0;
}
function postRun() {
    if (Module.postRun)
        for (
            "function" == typeof Module.postRun &&
            (Module.postRun = [Module.postRun]);
            Module.postRun.length;
        )
            addOnPostRun(Module.postRun.shift());
    callRuntimeCallbacks(__ATPOSTRUN__);
}
function addOnPreRun(e) {
    __ATPRERUN__.unshift(e);
}
function addOnPostRun(e) {
    __ATPOSTRUN__.unshift(e);
}
var Math_abs = Math.abs,
    Math_ceil = Math.ceil,
    Math_floor = Math.floor,
    Math_min = Math.min,
    runDependencies = 0,
    runDependencyWatcher = null,
    dependenciesFulfilled = null;
function getUniqueRunDependency(e) {
    return e;
}
function addRunDependency(e) {
    runDependencies++,
        Module.monitorRunDependencies &&
            Module.monitorRunDependencies(runDependencies);
}
function removeRunDependency(e) {
    if (
        (runDependencies--,
        Module.monitorRunDependencies &&
            Module.monitorRunDependencies(runDependencies),
        0 == runDependencies &&
            (null !== runDependencyWatcher &&
                (clearInterval(runDependencyWatcher),
                (runDependencyWatcher = null)),
            dependenciesFulfilled))
    ) {
        var r = dependenciesFulfilled;
        (dependenciesFulfilled = null), r();
    }
}
(Module.preloadedImages = {}), (Module.preloadedAudios = {});
var dataURIPrefix = "data:application/octet-stream;base64,";
function isDataURI(e) {
    return String.prototype.startsWith
        ? e.startsWith(dataURIPrefix)
        : 0 === e.indexOf(dataURIPrefix);
}
var tempDouble,
    tempI64,
    wasmBinaryFile = "stockfish.wasm";
function getBinary() {
    try {
        if (wasmBinary) return new Uint8Array(wasmBinary);
        if (readBinary) return readBinary(wasmBinaryFile);
        throw "both async and sync fetching of the wasm failed";
    } catch (e) {
        abort(e);
    }
}
function getBinaryPromise() {
    return wasmBinary ||
        (!ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER) ||
        "function" != typeof fetch
        ? new Promise(function (e, r) {
              e(getBinary());
          })
        : fetch(wasmBinaryFile, { credentials: "same-origin" })
              .then(function (e) {
                  if (!e.ok)
                      throw (
                          "failed to load wasm binary file at '" +
                          wasmBinaryFile +
                          "'"
                      );
                  return e.arrayBuffer();
              })
              .catch(function () {
                  return getBinary();
              });
}
function createWasm(e) {
    var r = {
        env: e,
        global: { NaN: NaN, Infinity: 1 / 0 },
        "global.Math": Math,
        asm2wasm: asm2wasmImports,
    };
    function t(e, r) {
        var t = e.exports;
        (Module.asm = t), removeRunDependency("wasm-instantiate");
    }
    function n(e) {
        t(e.instance);
    }
    function o(e) {
        return getBinaryPromise()
            .then(function (e) {
                return WebAssembly.instantiate(e, r);
            })
            .then(e, function (e) {
                err("failed to asynchronously prepare wasm: " + e), abort(e);
            });
    }
    if ((addRunDependency("wasm-instantiate"), Module.instantiateWasm))
        try {
            return Module.instantiateWasm(r, t);
        } catch (e) {
            return (
                err("Module.instantiateWasm callback failed with error: " + e),
                !1
            );
        }
    return (
        (function () {
            if (
                wasmBinary ||
                "function" != typeof WebAssembly.instantiateStreaming ||
                isDataURI(wasmBinaryFile) ||
                "function" != typeof fetch
            )
                return o(n);
            fetch(wasmBinaryFile, { credentials: "same-origin" }).then(
                function (e) {
                    return WebAssembly.instantiateStreaming(e, r).then(
                        n,
                        function (e) {
                            err("wasm streaming compile failed: " + e),
                                err(
                                    "falling back to ArrayBuffer instantiation",
                                ),
                                o(n);
                        },
                    );
                },
            );
        })(),
        {}
    );
}
function demangle(e) {
    return e;
}
function demangleAll(e) {
    return e.replace(/__Z[\w\d_]+/g, function (e) {
        var r = demangle(e);
        return e === r ? e : r + " [" + e + "]";
    });
}
function jsStackTrace() {
    var r = new Error();
    if (!r.stack) {
        try {
            throw new Error(0);
        } catch (e) {
            r = e;
        }
        if (!r.stack) return "(no stack trace available)";
    }
    return r.stack.toString();
}
function stackTrace() {
    var e = jsStackTrace();
    return (
        Module.extraStackTrace && (e += "\n" + Module.extraStackTrace()),
        demangleAll(e)
    );
}
function ___atomic_fetch_add_8(e, r, t, n) {
    var o = HEAP32[e >> 2],
        i = HEAP32[(e + 4) >> 2];
    return (
        (HEAP32[e >> 2] = _i64Add(o, i, r, t)),
        (HEAP32[(e + 4) >> 2] = getTempRet0()),
        0 | (setTempRet0(i), o)
    );
}
function ___cxa_allocate_exception(e) {
    return _malloc(e);
}
isDataURI(wasmBinaryFile) || (wasmBinaryFile = locateFile(wasmBinaryFile)),
    (Module.asm = function (e, r, t) {
        return (
            (r.memory = wasmMemory),
            (r.table = wasmTable =
                new WebAssembly.Table({
                    initial: 733,
                    maximum: 733,
                    element: "anyfunc",
                })),
            (r.__memory_base = 1024),
            (r.__table_base = 0),
            createWasm(r)
        );
    }),
    __ATINIT__.push({
        func: function () {
            globalCtors();
        },
    });
var ___exception_infos = {},
    ___exception_last = 0;
function ___cxa_throw(e, r, t) {
    throw (
        ((___exception_infos[e] = {
            ptr: e,
            adjusted: [e],
            type: r,
            destructor: t,
            refcount: 0,
            caught: !1,
            rethrown: !1,
        }),
        (___exception_last = e),
        "uncaught_exception" in __ZSt18uncaught_exceptionv
            ? __ZSt18uncaught_exceptionv.uncaught_exceptions++
            : (__ZSt18uncaught_exceptionv.uncaught_exceptions = 1),
        e)
    );
}
function ___cxa_uncaught_exceptions() {
    return __ZSt18uncaught_exceptionv.uncaught_exceptions;
}
function ___lock() {}
function ___setErrNo(e) {
    return (
        Module.___errno_location &&
            (HEAP32[Module.___errno_location() >> 2] = e),
        e
    );
}
function ___map_file(e, r) {
    return ___setErrNo(1), -1;
}
var PATH = {
        splitPath: function (e) {
            return /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
                .exec(e)
                .slice(1);
        },
        normalizeArray: function (e, r) {
            for (var t = 0, n = e.length - 1; 0 <= n; n--) {
                var o = e[n];
                "." === o
                    ? e.splice(n, 1)
                    : ".." === o
                      ? (e.splice(n, 1), t++)
                      : t && (e.splice(n, 1), t--);
            }
            if (r) for (; t; t--) e.unshift("..");
            return e;
        },
        normalize: function (e) {
            var r = "/" === e.charAt(0),
                t = "/" === e.substr(-1);
            return (
                (e = PATH.normalizeArray(
                    e.split("/").filter(function (e) {
                        return !!e;
                    }),
                    !r,
                ).join("/")) ||
                    r ||
                    (e = "."),
                e && t && (e += "/"),
                (r ? "/" : "") + e
            );
        },
        dirname: function (e) {
            var r = PATH.splitPath(e),
                t = r[0],
                n = r[1];
            return t || n ? t + (n = n && n.substr(0, n.length - 1)) : ".";
        },
        basename: function (e) {
            if ("/" === e) return "/";
            var r = e.lastIndexOf("/");
            return -1 === r ? e : e.substr(r + 1);
        },
        extname: function (e) {
            return PATH.splitPath(e)[3];
        },
        join: function () {
            var e = Array.prototype.slice.call(arguments, 0);
            return PATH.normalize(e.join("/"));
        },
        join2: function (e, r) {
            return PATH.normalize(e + "/" + r);
        },
    },
    PATH_FS = {
        resolve: function () {
            for (
                var e = "", r = !1, t = arguments.length - 1;
                -1 <= t && !r;
                t--
            ) {
                var n = 0 <= t ? arguments[t] : FS.cwd();
                if ("string" != typeof n)
                    throw new TypeError(
                        "Arguments to path.resolve must be strings",
                    );
                if (!n) return "";
                (e = n + "/" + e), (r = "/" === n.charAt(0));
            }
            return (
                (r ? "/" : "") +
                    (e = PATH.normalizeArray(
                        e.split("/").filter(function (e) {
                            return !!e;
                        }),
                        !r,
                    ).join("/")) || "."
            );
        },
        relative: function (e, r) {
            function t(e) {
                for (var r = 0; r < e.length && "" === e[r]; r++);
                for (var t = e.length - 1; 0 <= t && "" === e[t]; t--);
                return t < r ? [] : e.slice(r, t - r + 1);
            }
            (e = PATH_FS.resolve(e).substr(1)),
                (r = PATH_FS.resolve(r).substr(1));
            for (
                var n = t(e.split("/")),
                    o = t(r.split("/")),
                    i = Math.min(n.length, o.length),
                    a = i,
                    s = 0;
                s < i;
                s++
            )
                if (n[s] !== o[s]) {
                    a = s;
                    break;
                }
            var u = [];
            for (s = a; s < n.length; s++) u.push("..");
            return (u = u.concat(o.slice(a))).join("/");
        },
    },
    TTY = {
        ttys: [],
        init: function () {},
        shutdown: function () {},
        register: function (e, r) {
            (TTY.ttys[e] = { input: [], output: [], ops: r }),
                FS.registerDevice(e, TTY.stream_ops);
        },
        stream_ops: {
            open: function (e) {
                var r = TTY.ttys[e.node.rdev];
                if (!r) throw new FS.ErrnoError(19);
                (e.tty = r), (e.seekable = !1);
            },
            close: function (e) {
                e.tty.ops.flush(e.tty);
            },
            flush: function (e) {
                e.tty.ops.flush(e.tty);
            },
            read: function (e, r, t, n, o) {
                if (!e.tty || !e.tty.ops.get_char) throw new FS.ErrnoError(6);
                for (var i = 0, a = 0; a < n; a++) {
                    var s;
                    try {
                        s = e.tty.ops.get_char(e.tty);
                    } catch (e) {
                        throw new FS.ErrnoError(5);
                    }
                    if (void 0 === s && 0 === i) throw new FS.ErrnoError(11);
                    if (null == s) break;
                    i++, (r[t + a] = s);
                }
                return i && (e.node.timestamp = Date.now()), i;
            },
            write: function (e, r, t, n, o) {
                if (!e.tty || !e.tty.ops.put_char) throw new FS.ErrnoError(6);
                try {
                    for (var i = 0; i < n; i++)
                        e.tty.ops.put_char(e.tty, r[t + i]);
                } catch (e) {
                    throw new FS.ErrnoError(5);
                }
                return n && (e.node.timestamp = Date.now()), i;
            },
        },
        default_tty_ops: {
            get_char: function (e) {
                if (!e.input.length) {
                    var r = null;
                    if (ENVIRONMENT_IS_NODE) {
                        var t = Buffer.alloc
                                ? Buffer.alloc(256)
                                : new Buffer(256),
                            n = 0,
                            o = "win32" != process.platform,
                            i = process.stdin.fd;
                        if (o) {
                            var a = !1;
                            try {
                                (i = fs.openSync("/dev/stdin", "r")), (a = !0);
                            } catch (e) {}
                        }
                        try {
                            n = fs.readSync(i, t, 0, 256, null);
                        } catch (e) {
                            if (-1 == e.toString().indexOf("EOF")) throw e;
                            n = 0;
                        }
                        a && fs.closeSync(i),
                            (r =
                                0 < n ? t.slice(0, n).toString("utf-8") : null);
                    } else
                        "undefined" != typeof window &&
                        "function" == typeof window.prompt
                            ? null !== (r = window.prompt("Input: ")) &&
                              (r += "\n")
                            : "function" == typeof readline &&
                              null !== (r = readline()) &&
                              (r += "\n");
                    if (!r) return null;
                    e.input = intArrayFromString(r, !0);
                }
                return e.input.shift();
            },
            put_char: function (e, r) {
                null === r || 10 === r
                    ? (out(UTF8ArrayToString(e.output, 0)), (e.output = []))
                    : 0 != r && e.output.push(r);
            },
            flush: function (e) {
                e.output &&
                    0 < e.output.length &&
                    (out(UTF8ArrayToString(e.output, 0)), (e.output = []));
            },
        },
        default_tty1_ops: {
            put_char: function (e, r) {
                null === r || 10 === r
                    ? (err(UTF8ArrayToString(e.output, 0)), (e.output = []))
                    : 0 != r && e.output.push(r);
            },
            flush: function (e) {
                e.output &&
                    0 < e.output.length &&
                    (err(UTF8ArrayToString(e.output, 0)), (e.output = []));
            },
        },
    },
    MEMFS = {
        ops_table: null,
        mount: function (e) {
            return MEMFS.createNode(null, "/", 16895, 0);
        },
        createNode: function (e, r, t, n) {
            if (FS.isBlkdev(t) || FS.isFIFO(t)) throw new FS.ErrnoError(1);
            MEMFS.ops_table ||
                (MEMFS.ops_table = {
                    dir: {
                        node: {
                            getattr: MEMFS.node_ops.getattr,
                            setattr: MEMFS.node_ops.setattr,
                            lookup: MEMFS.node_ops.lookup,
                            mknod: MEMFS.node_ops.mknod,
                            rename: MEMFS.node_ops.rename,
                            unlink: MEMFS.node_ops.unlink,
                            rmdir: MEMFS.node_ops.rmdir,
                            readdir: MEMFS.node_ops.readdir,
                            symlink: MEMFS.node_ops.symlink,
                        },
                        stream: { llseek: MEMFS.stream_ops.llseek },
                    },
                    file: {
                        node: {
                            getattr: MEMFS.node_ops.getattr,
                            setattr: MEMFS.node_ops.setattr,
                        },
                        stream: {
                            llseek: MEMFS.stream_ops.llseek,
                            read: MEMFS.stream_ops.read,
                            write: MEMFS.stream_ops.write,
                            allocate: MEMFS.stream_ops.allocate,
                            mmap: MEMFS.stream_ops.mmap,
                            msync: MEMFS.stream_ops.msync,
                        },
                    },
                    link: {
                        node: {
                            getattr: MEMFS.node_ops.getattr,
                            setattr: MEMFS.node_ops.setattr,
                            readlink: MEMFS.node_ops.readlink,
                        },
                        stream: {},
                    },
                    chrdev: {
                        node: {
                            getattr: MEMFS.node_ops.getattr,
                            setattr: MEMFS.node_ops.setattr,
                        },
                        stream: FS.chrdev_stream_ops,
                    },
                });
            var o = FS.createNode(e, r, t, n);
            return (
                FS.isDir(o.mode)
                    ? ((o.node_ops = MEMFS.ops_table.dir.node),
                      (o.stream_ops = MEMFS.ops_table.dir.stream),
                      (o.contents = {}))
                    : FS.isFile(o.mode)
                      ? ((o.node_ops = MEMFS.ops_table.file.node),
                        (o.stream_ops = MEMFS.ops_table.file.stream),
                        (o.usedBytes = 0),
                        (o.contents = null))
                      : FS.isLink(o.mode)
                        ? ((o.node_ops = MEMFS.ops_table.link.node),
                          (o.stream_ops = MEMFS.ops_table.link.stream))
                        : FS.isChrdev(o.mode) &&
                          ((o.node_ops = MEMFS.ops_table.chrdev.node),
                          (o.stream_ops = MEMFS.ops_table.chrdev.stream)),
                (o.timestamp = Date.now()),
                e && (e.contents[r] = o),
                o
            );
        },
        getFileDataAsRegularArray: function (e) {
            if (e.contents && e.contents.subarray) {
                for (var r = [], t = 0; t < e.usedBytes; ++t)
                    r.push(e.contents[t]);
                return r;
            }
            return e.contents;
        },
        getFileDataAsTypedArray: function (e) {
            return e.contents
                ? e.contents.subarray
                    ? e.contents.subarray(0, e.usedBytes)
                    : new Uint8Array(e.contents)
                : new Uint8Array();
        },
        expandFileStorage: function (e, r) {
            var t = e.contents ? e.contents.length : 0;
            if (!(r <= t)) {
                (r = Math.max(r, (t * (t < 1048576 ? 2 : 1.125)) | 0)),
                    0 != t && (r = Math.max(r, 256));
                var n = e.contents;
                (e.contents = new Uint8Array(r)),
                    0 < e.usedBytes &&
                        e.contents.set(n.subarray(0, e.usedBytes), 0);
            }
        },
        resizeFileStorage: function (e, r) {
            if (e.usedBytes != r) {
                if (0 == r) return (e.contents = null), void (e.usedBytes = 0);
                if (!e.contents || e.contents.subarray) {
                    var t = e.contents;
                    return (
                        (e.contents = new Uint8Array(new ArrayBuffer(r))),
                        t &&
                            e.contents.set(
                                t.subarray(0, Math.min(r, e.usedBytes)),
                            ),
                        void (e.usedBytes = r)
                    );
                }
                if ((e.contents || (e.contents = []), e.contents.length > r))
                    e.contents.length = r;
                else for (; e.contents.length < r; ) e.contents.push(0);
                e.usedBytes = r;
            }
        },
        node_ops: {
            getattr: function (e) {
                var r = {};
                return (
                    (r.dev = FS.isChrdev(e.mode) ? e.id : 1),
                    (r.ino = e.id),
                    (r.mode = e.mode),
                    (r.nlink = 1),
                    (r.uid = 0),
                    (r.gid = 0),
                    (r.rdev = e.rdev),
                    FS.isDir(e.mode)
                        ? (r.size = 4096)
                        : FS.isFile(e.mode)
                          ? (r.size = e.usedBytes)
                          : FS.isLink(e.mode)
                            ? (r.size = e.link.length)
                            : (r.size = 0),
                    (r.atime = new Date(e.timestamp)),
                    (r.mtime = new Date(e.timestamp)),
                    (r.ctime = new Date(e.timestamp)),
                    (r.blksize = 4096),
                    (r.blocks = Math.ceil(r.size / r.blksize)),
                    r
                );
            },
            setattr: function (e, r) {
                void 0 !== r.mode && (e.mode = r.mode),
                    void 0 !== r.timestamp && (e.timestamp = r.timestamp),
                    void 0 !== r.size && MEMFS.resizeFileStorage(e, r.size);
            },
            lookup: function (e, r) {
                throw FS.genericErrors[2];
            },
            mknod: function (e, r, t, n) {
                return MEMFS.createNode(e, r, t, n);
            },
            rename: function (e, r, t) {
                if (FS.isDir(e.mode)) {
                    var n;
                    try {
                        n = FS.lookupNode(r, t);
                    } catch (e) {}
                    if (n)
                        for (var o in n.contents) throw new FS.ErrnoError(39);
                }
                delete e.parent.contents[e.name],
                    (e.name = t),
                    ((r.contents[t] = e).parent = r);
            },
            unlink: function (e, r) {
                delete e.contents[r];
            },
            rmdir: function (e, r) {
                var t = FS.lookupNode(e, r);
                for (var n in t.contents) throw new FS.ErrnoError(39);
                delete e.contents[r];
            },
            readdir: function (e) {
                var r = [".", ".."];
                for (var t in e.contents)
                    e.contents.hasOwnProperty(t) && r.push(t);
                return r;
            },
            symlink: function (e, r, t) {
                var n = MEMFS.createNode(e, r, 41471, 0);
                return (n.link = t), n;
            },
            readlink: function (e) {
                if (!FS.isLink(e.mode)) throw new FS.ErrnoError(22);
                return e.link;
            },
        },
        stream_ops: {
            read: function (e, r, t, n, o) {
                var i = e.node.contents;
                if (o >= e.node.usedBytes) return 0;
                var a = Math.min(e.node.usedBytes - o, n);
                if (8 < a && i.subarray) r.set(i.subarray(o, o + a), t);
                else for (var s = 0; s < a; s++) r[t + s] = i[o + s];
                return a;
            },
            write: function (e, r, t, n, o, i) {
                if (!n) return 0;
                var a = e.node;
                if (
                    ((a.timestamp = Date.now()),
                    r.subarray && (!a.contents || a.contents.subarray))
                ) {
                    if (i)
                        return (
                            (a.contents = r.subarray(t, t + n)),
                            (a.usedBytes = n)
                        );
                    if (0 === a.usedBytes && 0 === o)
                        return (
                            (a.contents = new Uint8Array(r.subarray(t, t + n))),
                            (a.usedBytes = n)
                        );
                    if (o + n <= a.usedBytes)
                        return a.contents.set(r.subarray(t, t + n), o), n;
                }
                if (
                    (MEMFS.expandFileStorage(a, o + n),
                    a.contents.subarray && r.subarray)
                )
                    a.contents.set(r.subarray(t, t + n), o);
                else for (var s = 0; s < n; s++) a.contents[o + s] = r[t + s];
                return (a.usedBytes = Math.max(a.usedBytes, o + n)), n;
            },
            llseek: function (e, r, t) {
                var n = r;
                if (
                    (1 === t
                        ? (n += e.position)
                        : 2 === t &&
                          FS.isFile(e.node.mode) &&
                          (n += e.node.usedBytes),
                    n < 0)
                )
                    throw new FS.ErrnoError(22);
                return n;
            },
            allocate: function (e, r, t) {
                MEMFS.expandFileStorage(e.node, r + t),
                    (e.node.usedBytes = Math.max(e.node.usedBytes, r + t));
            },
            mmap: function (e, r, t, n, o, i, a) {
                if (!FS.isFile(e.node.mode)) throw new FS.ErrnoError(19);
                var s,
                    u,
                    l = e.node.contents;
                if (2 & a || (l.buffer !== r && l.buffer !== r.buffer)) {
                    (0 < o || o + n < e.node.usedBytes) &&
                        (l = l.subarray
                            ? l.subarray(o, o + n)
                            : Array.prototype.slice.call(l, o, o + n)),
                        (u = !0);
                    var c = r.buffer == HEAP8.buffer;
                    if (!(s = _malloc(n))) throw new FS.ErrnoError(12);
                    (c ? HEAP8 : r).set(l, s);
                } else (u = !1), (s = l.byteOffset);
                return { ptr: s, allocated: u };
            },
            msync: function (e, r, t, n, o) {
                if (!FS.isFile(e.node.mode)) throw new FS.ErrnoError(19);
                if (2 & o) return 0;
                MEMFS.stream_ops.write(e, r, 0, n, t, !1);
                return 0;
            },
        },
    },
    IDBFS = {
        dbs: {},
        indexedDB: function () {
            if ("undefined" != typeof indexedDB) return indexedDB;
            var e = null;
            return (
                "object" == typeof window &&
                    (e =
                        window.indexedDB ||
                        window.mozIndexedDB ||
                        window.webkitIndexedDB ||
                        window.msIndexedDB),
                assert(e, "IDBFS used, but indexedDB not supported"),
                e
            );
        },
        DB_VERSION: 21,
        DB_STORE_NAME: "FILE_DATA",
        mount: function (e) {
            return MEMFS.mount.apply(null, arguments);
        },
        syncfs: function (r, i, a) {
            IDBFS.getLocalSet(r, function (e, o) {
                if (e) return a(e);
                IDBFS.getRemoteSet(r, function (e, r) {
                    if (e) return a(e);
                    var t = i ? r : o,
                        n = i ? o : r;
                    IDBFS.reconcile(t, n, a);
                });
            });
        },
        getDB: function (e, r) {
            var t,
                n = IDBFS.dbs[e];
            if (n) return r(null, n);
            try {
                t = IDBFS.indexedDB().open(e, IDBFS.DB_VERSION);
            } catch (e) {
                return r(e);
            }
            if (!t) return r("Unable to connect to IndexedDB");
            (t.onupgradeneeded = function (e) {
                var r,
                    t = e.target.result,
                    n = e.target.transaction;
                (r = t.objectStoreNames.contains(IDBFS.DB_STORE_NAME)
                    ? n.objectStore(IDBFS.DB_STORE_NAME)
                    : t.createObjectStore(
                          IDBFS.DB_STORE_NAME,
                      )).indexNames.contains("timestamp") ||
                    r.createIndex("timestamp", "timestamp", { unique: !1 });
            }),
                (t.onsuccess = function () {
                    (n = t.result), (IDBFS.dbs[e] = n), r(null, n);
                }),
                (t.onerror = function (e) {
                    r(this.error), e.preventDefault();
                });
        },
        getLocalSet: function (e, r) {
            var t = {};
            function n(e) {
                return "." !== e && ".." !== e;
            }
            function o(r) {
                return function (e) {
                    return PATH.join2(r, e);
                };
            }
            for (
                var i = FS.readdir(e.mountpoint).filter(n).map(o(e.mountpoint));
                i.length;
            ) {
                var a,
                    s = i.pop();
                try {
                    a = FS.stat(s);
                } catch (e) {
                    return r(e);
                }
                FS.isDir(a.mode) &&
                    i.push.apply(i, FS.readdir(s).filter(n).map(o(s))),
                    (t[s] = { timestamp: a.mtime });
            }
            return r(null, { type: "local", entries: t });
        },
        getRemoteSet: function (e, n) {
            var o = {};
            IDBFS.getDB(e.mountpoint, function (e, t) {
                if (e) return n(e);
                try {
                    var r = t.transaction([IDBFS.DB_STORE_NAME], "readonly");
                    (r.onerror = function (e) {
                        n(this.error), e.preventDefault();
                    }),
                        (r
                            .objectStore(IDBFS.DB_STORE_NAME)
                            .index("timestamp")
                            .openKeyCursor().onsuccess = function (e) {
                            var r = e.target.result;
                            if (!r)
                                return n(null, {
                                    type: "remote",
                                    db: t,
                                    entries: o,
                                });
                            (o[r.primaryKey] = { timestamp: r.key }),
                                r.continue();
                        });
                } catch (e) {
                    return n(e);
                }
            });
        },
        loadLocalEntry: function (e, r) {
            var t, n;
            try {
                (n = FS.lookupPath(e).node), (t = FS.stat(e));
            } catch (e) {
                return r(e);
            }
            return FS.isDir(t.mode)
                ? r(null, { timestamp: t.mtime, mode: t.mode })
                : FS.isFile(t.mode)
                  ? ((n.contents = MEMFS.getFileDataAsTypedArray(n)),
                    r(null, {
                        timestamp: t.mtime,
                        mode: t.mode,
                        contents: n.contents,
                    }))
                  : r(new Error("node type not supported"));
        },
        storeLocalEntry: function (e, r, t) {
            try {
                if (FS.isDir(r.mode)) FS.mkdir(e, r.mode);
                else {
                    if (!FS.isFile(r.mode))
                        return t(new Error("node type not supported"));
                    FS.writeFile(e, r.contents, { canOwn: !0 });
                }
                FS.chmod(e, r.mode), FS.utime(e, r.timestamp, r.timestamp);
            } catch (e) {
                return t(e);
            }
            t(null);
        },
        removeLocalEntry: function (e, r) {
            try {
                FS.lookupPath(e);
                var t = FS.stat(e);
                FS.isDir(t.mode)
                    ? FS.rmdir(e)
                    : FS.isFile(t.mode) && FS.unlink(e);
            } catch (e) {
                return r(e);
            }
            r(null);
        },
        loadRemoteEntry: function (e, r, t) {
            var n = e.get(r);
            (n.onsuccess = function (e) {
                t(null, e.target.result);
            }),
                (n.onerror = function (e) {
                    t(this.error), e.preventDefault();
                });
        },
        storeRemoteEntry: function (e, r, t, n) {
            var o = e.put(t, r);
            (o.onsuccess = function () {
                n(null);
            }),
                (o.onerror = function (e) {
                    n(this.error), e.preventDefault();
                });
        },
        removeRemoteEntry: function (e, r, t) {
            var n = e.delete(r);
            (n.onsuccess = function () {
                t(null);
            }),
                (n.onerror = function (e) {
                    t(this.error), e.preventDefault();
                });
        },
        reconcile: function (n, o, r) {
            var i = 0,
                a = [];
            Object.keys(n.entries).forEach(function (e) {
                var r = n.entries[e],
                    t = o.entries[e];
                (!t || r.timestamp > t.timestamp) && (a.push(e), i++);
            });
            var t = [];
            if (
                (Object.keys(o.entries).forEach(function (e) {
                    o.entries[e];
                    n.entries[e] || (t.push(e), i++);
                }),
                !i)
            )
                return r(null);
            var s = !1,
                e = ("remote" === n.type ? n.db : o.db).transaction(
                    [IDBFS.DB_STORE_NAME],
                    "readwrite",
                ),
                u = e.objectStore(IDBFS.DB_STORE_NAME);
            function l(e) {
                if (e && !s) return (s = !0), r(e);
            }
            (e.onerror = function (e) {
                l(this.error), e.preventDefault();
            }),
                (e.oncomplete = function (e) {
                    s || r(null);
                }),
                a.sort().forEach(function (t) {
                    "local" === o.type
                        ? IDBFS.loadRemoteEntry(u, t, function (e, r) {
                              if (e) return l(e);
                              IDBFS.storeLocalEntry(t, r, l);
                          })
                        : IDBFS.loadLocalEntry(t, function (e, r) {
                              if (e) return l(e);
                              IDBFS.storeRemoteEntry(u, t, r, l);
                          });
                }),
                t
                    .sort()
                    .reverse()
                    .forEach(function (e) {
                        "local" === o.type
                            ? IDBFS.removeLocalEntry(e, l)
                            : IDBFS.removeRemoteEntry(u, e, l);
                    });
        },
    },
    NODEFS = {
        isWindows: !1,
        staticInit: function () {
            NODEFS.isWindows = !!process.platform.match(/^win/);
            var e = process.binding("constants");
            e.fs && (e = e.fs),
                (NODEFS.flagsForNodeMap = {
                    1024: e.O_APPEND,
                    64: e.O_CREAT,
                    128: e.O_EXCL,
                    0: e.O_RDONLY,
                    2: e.O_RDWR,
                    4096: e.O_SYNC,
                    512: e.O_TRUNC,
                    1: e.O_WRONLY,
                });
        },
        bufferFrom: function (e) {
            return Buffer.alloc ? Buffer.from(e) : new Buffer(e);
        },
        mount: function (e) {
            return (
                assert(ENVIRONMENT_HAS_NODE),
                NODEFS.createNode(null, "/", NODEFS.getMode(e.opts.root), 0)
            );
        },
        createNode: function (e, r, t, n) {
            if (!FS.isDir(t) && !FS.isFile(t) && !FS.isLink(t))
                throw new FS.ErrnoError(22);
            var o = FS.createNode(e, r, t);
            return (
                (o.node_ops = NODEFS.node_ops),
                (o.stream_ops = NODEFS.stream_ops),
                o
            );
        },
        getMode: function (e) {
            var r;
            try {
                (r = fs.lstatSync(e)),
                    NODEFS.isWindows &&
                        (r.mode = r.mode | ((292 & r.mode) >> 2));
            } catch (e) {
                if (!e.code) throw e;
                throw new FS.ErrnoError(-e.errno);
            }
            return r.mode;
        },
        realPath: function (e) {
            for (var r = []; e.parent !== e; ) r.push(e.name), (e = e.parent);
            return (
                r.push(e.mount.opts.root), r.reverse(), PATH.join.apply(null, r)
            );
        },
        flagsForNode: function (e) {
            (e &= -2097153), (e &= -2049), (e &= -32769), (e &= -524289);
            var r = 0;
            for (var t in NODEFS.flagsForNodeMap)
                e & t && ((r |= NODEFS.flagsForNodeMap[t]), (e ^= t));
            if (e) throw new FS.ErrnoError(22);
            return r;
        },
        node_ops: {
            getattr: function (e) {
                var r,
                    t = NODEFS.realPath(e);
                try {
                    r = fs.lstatSync(t);
                } catch (e) {
                    if (!e.code) throw e;
                    throw new FS.ErrnoError(-e.errno);
                }
                return (
                    NODEFS.isWindows && !r.blksize && (r.blksize = 4096),
                    NODEFS.isWindows &&
                        !r.blocks &&
                        (r.blocks = ((r.size + r.blksize - 1) / r.blksize) | 0),
                    {
                        dev: r.dev,
                        ino: r.ino,
                        mode: r.mode,
                        nlink: r.nlink,
                        uid: r.uid,
                        gid: r.gid,
                        rdev: r.rdev,
                        size: r.size,
                        atime: r.atime,
                        mtime: r.mtime,
                        ctime: r.ctime,
                        blksize: r.blksize,
                        blocks: r.blocks,
                    }
                );
            },
            setattr: function (e, r) {
                var t = NODEFS.realPath(e);
                try {
                    if (
                        (void 0 !== r.mode &&
                            (fs.chmodSync(t, r.mode), (e.mode = r.mode)),
                        void 0 !== r.timestamp)
                    ) {
                        var n = new Date(r.timestamp);
                        fs.utimesSync(t, n, n);
                    }
                    void 0 !== r.size && fs.truncateSync(t, r.size);
                } catch (e) {
                    if (!e.code) throw e;
                    throw new FS.ErrnoError(-e.errno);
                }
            },
            lookup: function (e, r) {
                var t = PATH.join2(NODEFS.realPath(e), r),
                    n = NODEFS.getMode(t);
                return NODEFS.createNode(e, r, n);
            },
            mknod: function (e, r, t, n) {
                var o = NODEFS.createNode(e, r, t, n),
                    i = NODEFS.realPath(o);
                try {
                    FS.isDir(o.mode)
                        ? fs.mkdirSync(i, o.mode)
                        : fs.writeFileSync(i, "", { mode: o.mode });
                } catch (e) {
                    if (!e.code) throw e;
                    throw new FS.ErrnoError(-e.errno);
                }
                return o;
            },
            rename: function (e, r, t) {
                var n = NODEFS.realPath(e),
                    o = PATH.join2(NODEFS.realPath(r), t);
                try {
                    fs.renameSync(n, o);
                } catch (e) {
                    if (!e.code) throw e;
                    throw new FS.ErrnoError(-e.errno);
                }
            },
            unlink: function (e, r) {
                var t = PATH.join2(NODEFS.realPath(e), r);
                try {
                    fs.unlinkSync(t);
                } catch (e) {
                    if (!e.code) throw e;
                    throw new FS.ErrnoError(-e.errno);
                }
            },
            rmdir: function (e, r) {
                var t = PATH.join2(NODEFS.realPath(e), r);
                try {
                    fs.rmdirSync(t);
                } catch (e) {
                    if (!e.code) throw e;
                    throw new FS.ErrnoError(-e.errno);
                }
            },
            readdir: function (e) {
                var r = NODEFS.realPath(e);
                try {
                    return fs.readdirSync(r);
                } catch (e) {
                    if (!e.code) throw e;
                    throw new FS.ErrnoError(-e.errno);
                }
            },
            symlink: function (e, r, t) {
                var n = PATH.join2(NODEFS.realPath(e), r);
                try {
                    fs.symlinkSync(t, n);
                } catch (e) {
                    if (!e.code) throw e;
                    throw new FS.ErrnoError(-e.errno);
                }
            },
            readlink: function (e) {
                var r = NODEFS.realPath(e);
                try {
                    return (
                        (r = fs.readlinkSync(r)),
                        (r = NODEJS_PATH.relative(
                            NODEJS_PATH.resolve(e.mount.opts.root),
                            r,
                        ))
                    );
                } catch (e) {
                    if (!e.code) throw e;
                    throw new FS.ErrnoError(-e.errno);
                }
            },
        },
        stream_ops: {
            open: function (e) {
                var r = NODEFS.realPath(e.node);
                try {
                    FS.isFile(e.node.mode) &&
                        (e.nfd = fs.openSync(r, NODEFS.flagsForNode(e.flags)));
                } catch (e) {
                    if (!e.code) throw e;
                    throw new FS.ErrnoError(-e.errno);
                }
            },
            close: function (e) {
                try {
                    FS.isFile(e.node.mode) && e.nfd && fs.closeSync(e.nfd);
                } catch (e) {
                    if (!e.code) throw e;
                    throw new FS.ErrnoError(-e.errno);
                }
            },
            read: function (e, r, t, n, o) {
                if (0 === n) return 0;
                try {
                    return fs.readSync(
                        e.nfd,
                        NODEFS.bufferFrom(r.buffer),
                        t,
                        n,
                        o,
                    );
                } catch (e) {
                    throw new FS.ErrnoError(-e.errno);
                }
            },
            write: function (e, r, t, n, o) {
                try {
                    return fs.writeSync(
                        e.nfd,
                        NODEFS.bufferFrom(r.buffer),
                        t,
                        n,
                        o,
                    );
                } catch (e) {
                    throw new FS.ErrnoError(-e.errno);
                }
            },
            llseek: function (e, r, t) {
                var n = r;
                if (1 === t) n += e.position;
                else if (2 === t && FS.isFile(e.node.mode))
                    try {
                        n += fs.fstatSync(e.nfd).size;
                    } catch (e) {
                        throw new FS.ErrnoError(-e.errno);
                    }
                if (n < 0) throw new FS.ErrnoError(22);
                return n;
            },
        },
    },
    WORKERFS = {
        DIR_MODE: 16895,
        FILE_MODE: 33279,
        reader: null,
        mount: function (e) {
            assert(ENVIRONMENT_IS_WORKER),
                WORKERFS.reader || (WORKERFS.reader = new FileReaderSync());
            var i = WORKERFS.createNode(null, "/", WORKERFS.DIR_MODE, 0),
                a = {};
            function n(e) {
                for (
                    var r = e.split("/"), t = i, n = 0;
                    n < r.length - 1;
                    n++
                ) {
                    var o = r.slice(0, n + 1).join("/");
                    a[o] ||
                        (a[o] = WORKERFS.createNode(
                            t,
                            r[n],
                            WORKERFS.DIR_MODE,
                            0,
                        )),
                        (t = a[o]);
                }
                return t;
            }
            function o(e) {
                var r = e.split("/");
                return r[r.length - 1];
            }
            return (
                Array.prototype.forEach.call(e.opts.files || [], function (e) {
                    WORKERFS.createNode(
                        n(e.name),
                        o(e.name),
                        WORKERFS.FILE_MODE,
                        0,
                        e,
                        e.lastModifiedDate,
                    );
                }),
                (e.opts.blobs || []).forEach(function (e) {
                    WORKERFS.createNode(
                        n(e.name),
                        o(e.name),
                        WORKERFS.FILE_MODE,
                        0,
                        e.data,
                    );
                }),
                (e.opts.packages || []).forEach(function (t) {
                    t.metadata.files.forEach(function (e) {
                        var r = e.filename.substr(1);
                        WORKERFS.createNode(
                            n(r),
                            o(r),
                            WORKERFS.FILE_MODE,
                            0,
                            t.blob.slice(e.start, e.end),
                        );
                    });
                }),
                i
            );
        },
        createNode: function (e, r, t, n, o, i) {
            var a = FS.createNode(e, r, t);
            return (
                (a.mode = t),
                (a.node_ops = WORKERFS.node_ops),
                (a.stream_ops = WORKERFS.stream_ops),
                (a.timestamp = (i || new Date()).getTime()),
                assert(WORKERFS.FILE_MODE !== WORKERFS.DIR_MODE),
                t === WORKERFS.FILE_MODE
                    ? ((a.size = o.size), (a.contents = o))
                    : ((a.size = 4096), (a.contents = {})),
                e && (e.contents[r] = a),
                a
            );
        },
        node_ops: {
            getattr: function (e) {
                return {
                    dev: 1,
                    ino: void 0,
                    mode: e.mode,
                    nlink: 1,
                    uid: 0,
                    gid: 0,
                    rdev: void 0,
                    size: e.size,
                    atime: new Date(e.timestamp),
                    mtime: new Date(e.timestamp),
                    ctime: new Date(e.timestamp),
                    blksize: 4096,
                    blocks: Math.ceil(e.size / 4096),
                };
            },
            setattr: function (e, r) {
                void 0 !== r.mode && (e.mode = r.mode),
                    void 0 !== r.timestamp && (e.timestamp = r.timestamp);
            },
            lookup: function (e, r) {
                throw new FS.ErrnoError(2);
            },
            mknod: function (e, r, t, n) {
                throw new FS.ErrnoError(1);
            },
            rename: function (e, r, t) {
                throw new FS.ErrnoError(1);
            },
            unlink: function (e, r) {
                throw new FS.ErrnoError(1);
            },
            rmdir: function (e, r) {
                throw new FS.ErrnoError(1);
            },
            readdir: function (e) {
                var r = [".", ".."];
                for (var t in e.contents)
                    e.contents.hasOwnProperty(t) && r.push(t);
                return r;
            },
            symlink: function (e, r, t) {
                throw new FS.ErrnoError(1);
            },
            readlink: function (e) {
                throw new FS.ErrnoError(1);
            },
        },
        stream_ops: {
            read: function (e, r, t, n, o) {
                if (o >= e.node.size) return 0;
                var i = e.node.contents.slice(o, o + n),
                    a = WORKERFS.reader.readAsArrayBuffer(i);
                return r.set(new Uint8Array(a), t), i.size;
            },
            write: function (e, r, t, n, o) {
                throw new FS.ErrnoError(5);
            },
            llseek: function (e, r, t) {
                var n = r;
                if (
                    (1 === t
                        ? (n += e.position)
                        : 2 === t &&
                          FS.isFile(e.node.mode) &&
                          (n += e.node.size),
                    n < 0)
                )
                    throw new FS.ErrnoError(22);
                return n;
            },
        },
    },
    FS = {
        root: null,
        mounts: [],
        devices: {},
        streams: [],
        nextInode: 1,
        nameTable: null,
        currentPath: "/",
        initialized: !1,
        ignorePermissions: !0,
        trackingDelegate: {},
        tracking: { openFlags: { READ: 1, WRITE: 2 } },
        ErrnoError: null,
        genericErrors: {},
        filesystems: null,
        syncFSRequests: 0,
        handleFSError: function (e) {
            if (!(e instanceof FS.ErrnoError)) throw e + " : " + stackTrace();
            return ___setErrNo(e.errno);
        },
        lookupPath: function (e, r) {
            if (((r = r || {}), !(e = PATH_FS.resolve(FS.cwd(), e))))
                return { path: "", node: null };
            var t = { follow_mount: !0, recurse_count: 0 };
            for (var n in t) void 0 === r[n] && (r[n] = t[n]);
            if (8 < r.recurse_count) throw new FS.ErrnoError(40);
            for (
                var o = PATH.normalizeArray(
                        e.split("/").filter(function (e) {
                            return !!e;
                        }),
                        !1,
                    ),
                    i = FS.root,
                    a = "/",
                    s = 0;
                s < o.length;
                s++
            ) {
                var u = s === o.length - 1;
                if (u && r.parent) break;
                if (
                    ((i = FS.lookupNode(i, o[s])),
                    (a = PATH.join2(a, o[s])),
                    FS.isMountpoint(i) &&
                        (!u || (u && r.follow_mount)) &&
                        (i = i.mounted.root),
                    !u || r.follow)
                )
                    for (var l = 0; FS.isLink(i.mode); ) {
                        var c = FS.readlink(a);
                        if (
                            ((a = PATH_FS.resolve(PATH.dirname(a), c)),
                            (i = FS.lookupPath(a, {
                                recurse_count: r.recurse_count,
                            }).node),
                            40 < l++)
                        )
                            throw new FS.ErrnoError(40);
                    }
            }
            return { path: a, node: i };
        },
        getPath: function (e) {
            for (var r; ; ) {
                if (FS.isRoot(e)) {
                    var t = e.mount.mountpoint;
                    return r
                        ? "/" !== t[t.length - 1]
                            ? t + "/" + r
                            : t + r
                        : t;
                }
                (r = r ? e.name + "/" + r : e.name), (e = e.parent);
            }
        },
        hashName: function (e, r) {
            for (var t = 0, n = 0; n < r.length; n++)
                t = ((t << 5) - t + r.charCodeAt(n)) | 0;
            return ((e + t) >>> 0) % FS.nameTable.length;
        },
        hashAddNode: function (e) {
            var r = FS.hashName(e.parent.id, e.name);
            (e.name_next = FS.nameTable[r]), (FS.nameTable[r] = e);
        },
        hashRemoveNode: function (e) {
            var r = FS.hashName(e.parent.id, e.name);
            if (FS.nameTable[r] === e) FS.nameTable[r] = e.name_next;
            else
                for (var t = FS.nameTable[r]; t; ) {
                    if (t.name_next === e) {
                        t.name_next = e.name_next;
                        break;
                    }
                    t = t.name_next;
                }
        },
        lookupNode: function (e, r) {
            var t = FS.mayLookup(e);
            if (t) throw new FS.ErrnoError(t, e);
            for (
                var n = FS.hashName(e.id, r), o = FS.nameTable[n];
                o;
                o = o.name_next
            ) {
                var i = o.name;
                if (o.parent.id === e.id && i === r) return o;
            }
            return FS.lookup(e, r);
        },
        createNode: function (e, r, t, n) {
            if (!FS.FSNode) {
                (FS.FSNode = function (e, r, t, n) {
                    (e = e || this),
                        (this.parent = e),
                        (this.mount = e.mount),
                        (this.mounted = null),
                        (this.id = FS.nextInode++),
                        (this.name = r),
                        (this.mode = t),
                        (this.node_ops = {}),
                        (this.stream_ops = {}),
                        (this.rdev = n);
                }),
                    (FS.FSNode.prototype = {});
                Object.defineProperties(FS.FSNode.prototype, {
                    read: {
                        get: function () {
                            return 365 == (365 & this.mode);
                        },
                        set: function (e) {
                            e ? (this.mode |= 365) : (this.mode &= -366);
                        },
                    },
                    write: {
                        get: function () {
                            return 146 == (146 & this.mode);
                        },
                        set: function (e) {
                            e ? (this.mode |= 146) : (this.mode &= -147);
                        },
                    },
                    isFolder: {
                        get: function () {
                            return FS.isDir(this.mode);
                        },
                    },
                    isDevice: {
                        get: function () {
                            return FS.isChrdev(this.mode);
                        },
                    },
                });
            }
            var o = new FS.FSNode(e, r, t, n);
            return FS.hashAddNode(o), o;
        },
        destroyNode: function (e) {
            FS.hashRemoveNode(e);
        },
        isRoot: function (e) {
            return e === e.parent;
        },
        isMountpoint: function (e) {
            return !!e.mounted;
        },
        isFile: function (e) {
            return 32768 == (61440 & e);
        },
        isDir: function (e) {
            return 16384 == (61440 & e);
        },
        isLink: function (e) {
            return 40960 == (61440 & e);
        },
        isChrdev: function (e) {
            return 8192 == (61440 & e);
        },
        isBlkdev: function (e) {
            return 24576 == (61440 & e);
        },
        isFIFO: function (e) {
            return 4096 == (61440 & e);
        },
        isSocket: function (e) {
            return 49152 == (49152 & e);
        },
        flagModes: {
            r: 0,
            rs: 1052672,
            "r+": 2,
            w: 577,
            wx: 705,
            xw: 705,
            "w+": 578,
            "wx+": 706,
            "xw+": 706,
            a: 1089,
            ax: 1217,
            xa: 1217,
            "a+": 1090,
            "ax+": 1218,
            "xa+": 1218,
        },
        modeStringToFlags: function (e) {
            var r = FS.flagModes[e];
            if (void 0 === r) throw new Error("Unknown file open mode: " + e);
            return r;
        },
        flagsToPermissionString: function (e) {
            var r = ["r", "w", "rw"][3 & e];
            return 512 & e && (r += "w"), r;
        },
        nodePermissions: function (e, r) {
            return FS.ignorePermissions
                ? 0
                : (-1 === r.indexOf("r") || 292 & e.mode) &&
                    (-1 === r.indexOf("w") || 146 & e.mode) &&
                    (-1 === r.indexOf("x") || 73 & e.mode)
                  ? 0
                  : 13;
        },
        mayLookup: function (e) {
            var r = FS.nodePermissions(e, "x");
            return r || (e.node_ops.lookup ? 0 : 13);
        },
        mayCreate: function (e, r) {
            try {
                FS.lookupNode(e, r);
                return 17;
            } catch (e) {}
            return FS.nodePermissions(e, "wx");
        },
        mayDelete: function (e, r, t) {
            var n;
            try {
                n = FS.lookupNode(e, r);
            } catch (e) {
                return e.errno;
            }
            var o = FS.nodePermissions(e, "wx");
            if (o) return o;
            if (t) {
                if (!FS.isDir(n.mode)) return 20;
                if (FS.isRoot(n) || FS.getPath(n) === FS.cwd()) return 16;
            } else if (FS.isDir(n.mode)) return 21;
            return 0;
        },
        mayOpen: function (e, r) {
            return e
                ? FS.isLink(e.mode)
                    ? 40
                    : FS.isDir(e.mode) &&
                        ("r" !== FS.flagsToPermissionString(r) || 512 & r)
                      ? 21
                      : FS.nodePermissions(e, FS.flagsToPermissionString(r))
                : 2;
        },
        MAX_OPEN_FDS: 4096,
        nextfd: function (e, r) {
            (e = e || 0), (r = r || FS.MAX_OPEN_FDS);
            for (var t = e; t <= r; t++) if (!FS.streams[t]) return t;
            throw new FS.ErrnoError(24);
        },
        getStream: function (e) {
            return FS.streams[e];
        },
        createStream: function (e, r, t) {
            FS.FSStream ||
                ((FS.FSStream = function () {}),
                (FS.FSStream.prototype = {}),
                Object.defineProperties(FS.FSStream.prototype, {
                    object: {
                        get: function () {
                            return this.node;
                        },
                        set: function (e) {
                            this.node = e;
                        },
                    },
                    isRead: {
                        get: function () {
                            return 1 != (2097155 & this.flags);
                        },
                    },
                    isWrite: {
                        get: function () {
                            return 0 != (2097155 & this.flags);
                        },
                    },
                    isAppend: {
                        get: function () {
                            return 1024 & this.flags;
                        },
                    },
                }));
            var n = new FS.FSStream();
            for (var o in e) n[o] = e[o];
            e = n;
            var i = FS.nextfd(r, t);
            return (e.fd = i), (FS.streams[i] = e);
        },
        closeStream: function (e) {
            FS.streams[e] = null;
        },
        chrdev_stream_ops: {
            open: function (e) {
                var r = FS.getDevice(e.node.rdev);
                (e.stream_ops = r.stream_ops),
                    e.stream_ops.open && e.stream_ops.open(e);
            },
            llseek: function () {
                throw new FS.ErrnoError(29);
            },
        },
        major: function (e) {
            return e >> 8;
        },
        minor: function (e) {
            return 255 & e;
        },
        makedev: function (e, r) {
            return (e << 8) | r;
        },
        registerDevice: function (e, r) {
            FS.devices[e] = { stream_ops: r };
        },
        getDevice: function (e) {
            return FS.devices[e];
        },
        getMounts: function (e) {
            for (var r = [], t = [e]; t.length; ) {
                var n = t.pop();
                r.push(n), t.push.apply(t, n.mounts);
            }
            return r;
        },
        syncfs: function (r, t) {
            "function" == typeof r && ((t = r), (r = !1)),
                FS.syncFSRequests++,
                1 < FS.syncFSRequests &&
                    console.log(
                        "warning: " +
                            FS.syncFSRequests +
                            " FS.syncfs operations in flight at once, probably just doing extra work",
                    );
            var n = FS.getMounts(FS.root.mount),
                o = 0;
            function i(e) {
                return FS.syncFSRequests--, t(e);
            }
            function a(e) {
                if (e) return a.errored ? void 0 : ((a.errored = !0), i(e));
                ++o >= n.length && i(null);
            }
            n.forEach(function (e) {
                if (!e.type.syncfs) return a(null);
                e.type.syncfs(e, r, a);
            });
        },
        mount: function (e, r, t) {
            var n,
                o = "/" === t,
                i = !t;
            if (o && FS.root) throw new FS.ErrnoError(16);
            if (!o && !i) {
                var a = FS.lookupPath(t, { follow_mount: !1 });
                if (((t = a.path), (n = a.node), FS.isMountpoint(n)))
                    throw new FS.ErrnoError(16);
                if (!FS.isDir(n.mode)) throw new FS.ErrnoError(20);
            }
            var s = { type: e, opts: r, mountpoint: t, mounts: [] },
                u = e.mount(s);
            return (
                ((u.mount = s).root = u),
                o
                    ? (FS.root = u)
                    : n && ((n.mounted = s), n.mount && n.mount.mounts.push(s)),
                u
            );
        },
        unmount: function (e) {
            var r = FS.lookupPath(e, { follow_mount: !1 });
            if (!FS.isMountpoint(r.node)) throw new FS.ErrnoError(22);
            var t = r.node,
                n = t.mounted,
                o = FS.getMounts(n);
            Object.keys(FS.nameTable).forEach(function (e) {
                for (var r = FS.nameTable[e]; r; ) {
                    var t = r.name_next;
                    -1 !== o.indexOf(r.mount) && FS.destroyNode(r), (r = t);
                }
            }),
                (t.mounted = null);
            var i = t.mount.mounts.indexOf(n);
            t.mount.mounts.splice(i, 1);
        },
        lookup: function (e, r) {
            return e.node_ops.lookup(e, r);
        },
        mknod: function (e, r, t) {
            var n = FS.lookupPath(e, { parent: !0 }).node,
                o = PATH.basename(e);
            if (!o || "." === o || ".." === o) throw new FS.ErrnoError(22);
            var i = FS.mayCreate(n, o);
            if (i) throw new FS.ErrnoError(i);
            if (!n.node_ops.mknod) throw new FS.ErrnoError(1);
            return n.node_ops.mknod(n, o, r, t);
        },
        create: function (e, r) {
            return (
                (r = void 0 !== r ? r : 438),
                (r &= 4095),
                (r |= 32768),
                FS.mknod(e, r, 0)
            );
        },
        mkdir: function (e, r) {
            return (
                (r = void 0 !== r ? r : 511),
                (r &= 1023),
                (r |= 16384),
                FS.mknod(e, r, 0)
            );
        },
        mkdirTree: function (e, r) {
            for (var t = e.split("/"), n = "", o = 0; o < t.length; ++o)
                if (t[o]) {
                    n += "/" + t[o];
                    try {
                        FS.mkdir(n, r);
                    } catch (e) {
                        if (17 != e.errno) throw e;
                    }
                }
        },
        mkdev: function (e, r, t) {
            return (
                void 0 === t && ((t = r), (r = 438)),
                (r |= 8192),
                FS.mknod(e, r, t)
            );
        },
        symlink: function (e, r) {
            if (!PATH_FS.resolve(e)) throw new FS.ErrnoError(2);
            var t = FS.lookupPath(r, { parent: !0 }).node;
            if (!t) throw new FS.ErrnoError(2);
            var n = PATH.basename(r),
                o = FS.mayCreate(t, n);
            if (o) throw new FS.ErrnoError(o);
            if (!t.node_ops.symlink) throw new FS.ErrnoError(1);
            return t.node_ops.symlink(t, n, e);
        },
        rename: function (r, t) {
            var e,
                n,
                o = PATH.dirname(r),
                i = PATH.dirname(t),
                a = PATH.basename(r),
                s = PATH.basename(t);
            try {
                (e = FS.lookupPath(r, { parent: !0 }).node),
                    (n = FS.lookupPath(t, { parent: !0 }).node);
            } catch (e) {
                throw new FS.ErrnoError(16);
            }
            if (!e || !n) throw new FS.ErrnoError(2);
            if (e.mount !== n.mount) throw new FS.ErrnoError(18);
            var u,
                l = FS.lookupNode(e, a),
                c = PATH_FS.relative(r, i);
            if ("." !== c.charAt(0)) throw new FS.ErrnoError(22);
            if ("." !== (c = PATH_FS.relative(t, o)).charAt(0))
                throw new FS.ErrnoError(39);
            try {
                u = FS.lookupNode(n, s);
            } catch (e) {}
            if (l !== u) {
                var d = FS.isDir(l.mode),
                    f = FS.mayDelete(e, a, d);
                if (f) throw new FS.ErrnoError(f);
                if ((f = u ? FS.mayDelete(n, s, d) : FS.mayCreate(n, s)))
                    throw new FS.ErrnoError(f);
                if (!e.node_ops.rename) throw new FS.ErrnoError(1);
                if (FS.isMountpoint(l) || (u && FS.isMountpoint(u)))
                    throw new FS.ErrnoError(16);
                if (n !== e && (f = FS.nodePermissions(e, "w")))
                    throw new FS.ErrnoError(f);
                try {
                    FS.trackingDelegate.willMovePath &&
                        FS.trackingDelegate.willMovePath(r, t);
                } catch (e) {
                    console.log(
                        "FS.trackingDelegate['willMovePath']('" +
                            r +
                            "', '" +
                            t +
                            "') threw an exception: " +
                            e.message,
                    );
                }
                FS.hashRemoveNode(l);
                try {
                    e.node_ops.rename(l, n, s);
                } catch (e) {
                    throw e;
                } finally {
                    FS.hashAddNode(l);
                }
                try {
                    FS.trackingDelegate.onMovePath &&
                        FS.trackingDelegate.onMovePath(r, t);
                } catch (e) {
                    console.log(
                        "FS.trackingDelegate['onMovePath']('" +
                            r +
                            "', '" +
                            t +
                            "') threw an exception: " +
                            e.message,
                    );
                }
            }
        },
        rmdir: function (r) {
            var e = FS.lookupPath(r, { parent: !0 }).node,
                t = PATH.basename(r),
                n = FS.lookupNode(e, t),
                o = FS.mayDelete(e, t, !0);
            if (o) throw new FS.ErrnoError(o);
            if (!e.node_ops.rmdir) throw new FS.ErrnoError(1);
            if (FS.isMountpoint(n)) throw new FS.ErrnoError(16);
            try {
                FS.trackingDelegate.willDeletePath &&
                    FS.trackingDelegate.willDeletePath(r);
            } catch (e) {
                console.log(
                    "FS.trackingDelegate['willDeletePath']('" +
                        r +
                        "') threw an exception: " +
                        e.message,
                );
            }
            e.node_ops.rmdir(e, t), FS.destroyNode(n);
            try {
                FS.trackingDelegate.onDeletePath &&
                    FS.trackingDelegate.onDeletePath(r);
            } catch (e) {
                console.log(
                    "FS.trackingDelegate['onDeletePath']('" +
                        r +
                        "') threw an exception: " +
                        e.message,
                );
            }
        },
        readdir: function (e) {
            var r = FS.lookupPath(e, { follow: !0 }).node;
            if (!r.node_ops.readdir) throw new FS.ErrnoError(20);
            return r.node_ops.readdir(r);
        },
        unlink: function (r) {
            var e = FS.lookupPath(r, { parent: !0 }).node,
                t = PATH.basename(r),
                n = FS.lookupNode(e, t),
                o = FS.mayDelete(e, t, !1);
            if (o) throw new FS.ErrnoError(o);
            if (!e.node_ops.unlink) throw new FS.ErrnoError(1);
            if (FS.isMountpoint(n)) throw new FS.ErrnoError(16);
            try {
                FS.trackingDelegate.willDeletePath &&
                    FS.trackingDelegate.willDeletePath(r);
            } catch (e) {
                console.log(
                    "FS.trackingDelegate['willDeletePath']('" +
                        r +
                        "') threw an exception: " +
                        e.message,
                );
            }
            e.node_ops.unlink(e, t), FS.destroyNode(n);
            try {
                FS.trackingDelegate.onDeletePath &&
                    FS.trackingDelegate.onDeletePath(r);
            } catch (e) {
                console.log(
                    "FS.trackingDelegate['onDeletePath']('" +
                        r +
                        "') threw an exception: " +
                        e.message,
                );
            }
        },
        readlink: function (e) {
            var r = FS.lookupPath(e).node;
            if (!r) throw new FS.ErrnoError(2);
            if (!r.node_ops.readlink) throw new FS.ErrnoError(22);
            return PATH_FS.resolve(
                FS.getPath(r.parent),
                r.node_ops.readlink(r),
            );
        },
        stat: function (e, r) {
            var t = FS.lookupPath(e, { follow: !r }).node;
            if (!t) throw new FS.ErrnoError(2);
            if (!t.node_ops.getattr) throw new FS.ErrnoError(1);
            return t.node_ops.getattr(t);
        },
        lstat: function (e) {
            return FS.stat(e, !0);
        },
        chmod: function (e, r, t) {
            var n;
            "string" == typeof e
                ? (n = FS.lookupPath(e, { follow: !t }).node)
                : (n = e);
            if (!n.node_ops.setattr) throw new FS.ErrnoError(1);
            n.node_ops.setattr(n, {
                mode: (4095 & r) | (-4096 & n.mode),
                timestamp: Date.now(),
            });
        },
        lchmod: function (e, r) {
            FS.chmod(e, r, !0);
        },
        fchmod: function (e, r) {
            var t = FS.getStream(e);
            if (!t) throw new FS.ErrnoError(9);
            FS.chmod(t.node, r);
        },
        chown: function (e, r, t, n) {
            var o;
            "string" == typeof e
                ? (o = FS.lookupPath(e, { follow: !n }).node)
                : (o = e);
            if (!o.node_ops.setattr) throw new FS.ErrnoError(1);
            o.node_ops.setattr(o, { timestamp: Date.now() });
        },
        lchown: function (e, r, t) {
            FS.chown(e, r, t, !0);
        },
        fchown: function (e, r, t) {
            var n = FS.getStream(e);
            if (!n) throw new FS.ErrnoError(9);
            FS.chown(n.node, r, t);
        },
        truncate: function (e, r) {
            if (r < 0) throw new FS.ErrnoError(22);
            var t;
            "string" == typeof e
                ? (t = FS.lookupPath(e, { follow: !0 }).node)
                : (t = e);
            if (!t.node_ops.setattr) throw new FS.ErrnoError(1);
            if (FS.isDir(t.mode)) throw new FS.ErrnoError(21);
            if (!FS.isFile(t.mode)) throw new FS.ErrnoError(22);
            var n = FS.nodePermissions(t, "w");
            if (n) throw new FS.ErrnoError(n);
            t.node_ops.setattr(t, { size: r, timestamp: Date.now() });
        },
        ftruncate: function (e, r) {
            var t = FS.getStream(e);
            if (!t) throw new FS.ErrnoError(9);
            if (0 == (2097155 & t.flags)) throw new FS.ErrnoError(22);
            FS.truncate(t.node, r);
        },
        utime: function (e, r, t) {
            var n = FS.lookupPath(e, { follow: !0 }).node;
            n.node_ops.setattr(n, { timestamp: Math.max(r, t) });
        },
        open: function (r, e, t, n, o) {
            if ("" === r) throw new FS.ErrnoError(2);
            var i;
            if (
                ((t = void 0 === t ? 438 : t),
                (t =
                    64 &
                    (e = "string" == typeof e ? FS.modeStringToFlags(e) : e)
                        ? (4095 & t) | 32768
                        : 0),
                "object" == typeof r)
            )
                i = r;
            else {
                r = PATH.normalize(r);
                try {
                    i = FS.lookupPath(r, { follow: !(131072 & e) }).node;
                } catch (e) {}
            }
            var a = !1;
            if (64 & e)
                if (i) {
                    if (128 & e) throw new FS.ErrnoError(17);
                } else (i = FS.mknod(r, t, 0)), (a = !0);
            if (!i) throw new FS.ErrnoError(2);
            if (
                (FS.isChrdev(i.mode) && (e &= -513),
                65536 & e && !FS.isDir(i.mode))
            )
                throw new FS.ErrnoError(20);
            if (!a) {
                var s = FS.mayOpen(i, e);
                if (s) throw new FS.ErrnoError(s);
            }
            512 & e && FS.truncate(i, 0), (e &= -641);
            var u = FS.createStream(
                {
                    node: i,
                    path: FS.getPath(i),
                    flags: e,
                    seekable: !0,
                    position: 0,
                    stream_ops: i.stream_ops,
                    ungotten: [],
                    error: !1,
                },
                n,
                o,
            );
            u.stream_ops.open && u.stream_ops.open(u),
                !Module.logReadFiles ||
                    1 & e ||
                    (FS.readFiles || (FS.readFiles = {}),
                    r in FS.readFiles ||
                        ((FS.readFiles[r] = 1),
                        console.log(
                            "FS.trackingDelegate error on read file: " + r,
                        )));
            try {
                if (FS.trackingDelegate.onOpenFile) {
                    var l = 0;
                    1 != (2097155 & e) && (l |= FS.tracking.openFlags.READ),
                        0 != (2097155 & e) &&
                            (l |= FS.tracking.openFlags.WRITE),
                        FS.trackingDelegate.onOpenFile(r, l);
                }
            } catch (e) {
                console.log(
                    "FS.trackingDelegate['onOpenFile']('" +
                        r +
                        "', flags) threw an exception: " +
                        e.message,
                );
            }
            return u;
        },
        close: function (e) {
            if (FS.isClosed(e)) throw new FS.ErrnoError(9);
            e.getdents && (e.getdents = null);
            try {
                e.stream_ops.close && e.stream_ops.close(e);
            } catch (e) {
                throw e;
            } finally {
                FS.closeStream(e.fd);
            }
            e.fd = null;
        },
        isClosed: function (e) {
            return null === e.fd;
        },
        llseek: function (e, r, t) {
            if (FS.isClosed(e)) throw new FS.ErrnoError(9);
            if (!e.seekable || !e.stream_ops.llseek)
                throw new FS.ErrnoError(29);
            if (0 != t && 1 != t && 2 != t) throw new FS.ErrnoError(22);
            return (
                (e.position = e.stream_ops.llseek(e, r, t)),
                (e.ungotten = []),
                e.position
            );
        },
        read: function (e, r, t, n, o) {
            if (n < 0 || o < 0) throw new FS.ErrnoError(22);
            if (FS.isClosed(e)) throw new FS.ErrnoError(9);
            if (1 == (2097155 & e.flags)) throw new FS.ErrnoError(9);
            if (FS.isDir(e.node.mode)) throw new FS.ErrnoError(21);
            if (!e.stream_ops.read) throw new FS.ErrnoError(22);
            var i = void 0 !== o;
            if (i) {
                if (!e.seekable) throw new FS.ErrnoError(29);
            } else o = e.position;
            var a = e.stream_ops.read(e, r, t, n, o);
            return i || (e.position += a), a;
        },
        write: function (r, e, t, n, o, i) {
            if (n < 0 || o < 0) throw new FS.ErrnoError(22);
            if (FS.isClosed(r)) throw new FS.ErrnoError(9);
            if (0 == (2097155 & r.flags)) throw new FS.ErrnoError(9);
            if (FS.isDir(r.node.mode)) throw new FS.ErrnoError(21);
            if (!r.stream_ops.write) throw new FS.ErrnoError(22);
            1024 & r.flags && FS.llseek(r, 0, 2);
            var a = void 0 !== o;
            if (a) {
                if (!r.seekable) throw new FS.ErrnoError(29);
            } else o = r.position;
            var s = r.stream_ops.write(r, e, t, n, o, i);
            a || (r.position += s);
            try {
                r.path &&
                    FS.trackingDelegate.onWriteToFile &&
                    FS.trackingDelegate.onWriteToFile(r.path);
            } catch (e) {
                console.log(
                    "FS.trackingDelegate['onWriteToFile']('" +
                        r.path +
                        "') threw an exception: " +
                        e.message,
                );
            }
            return s;
        },
        allocate: function (e, r, t) {
            if (FS.isClosed(e)) throw new FS.ErrnoError(9);
            if (r < 0 || t <= 0) throw new FS.ErrnoError(22);
            if (0 == (2097155 & e.flags)) throw new FS.ErrnoError(9);
            if (!FS.isFile(e.node.mode) && !FS.isDir(e.node.mode))
                throw new FS.ErrnoError(19);
            if (!e.stream_ops.allocate) throw new FS.ErrnoError(95);
            e.stream_ops.allocate(e, r, t);
        },
        mmap: function (e, r, t, n, o, i, a) {
            if (0 != (2 & i) && 0 == (2 & a) && 2 != (2097155 & e.flags))
                throw new FS.ErrnoError(13);
            if (1 == (2097155 & e.flags)) throw new FS.ErrnoError(13);
            if (!e.stream_ops.mmap) throw new FS.ErrnoError(19);
            return e.stream_ops.mmap(e, r, t, n, o, i, a);
        },
        msync: function (e, r, t, n, o) {
            return e && e.stream_ops.msync
                ? e.stream_ops.msync(e, r, t, n, o)
                : 0;
        },
        munmap: function (e) {
            return 0;
        },
        ioctl: function (e, r, t) {
            if (!e.stream_ops.ioctl) throw new FS.ErrnoError(25);
            return e.stream_ops.ioctl(e, r, t);
        },
        readFile: function (e, r) {
            if (
                (((r = r || {}).flags = r.flags || "r"),
                (r.encoding = r.encoding || "binary"),
                "utf8" !== r.encoding && "binary" !== r.encoding)
            )
                throw new Error('Invalid encoding type "' + r.encoding + '"');
            var t,
                n = FS.open(e, r.flags),
                o = FS.stat(e).size,
                i = new Uint8Array(o);
            return (
                FS.read(n, i, 0, o, 0),
                "utf8" === r.encoding
                    ? (t = UTF8ArrayToString(i, 0))
                    : "binary" === r.encoding && (t = i),
                FS.close(n),
                t
            );
        },
        writeFile: function (e, r, t) {
            (t = t || {}).flags = t.flags || "w";
            var n = FS.open(e, t.flags, t.mode);
            if ("string" == typeof r) {
                var o = new Uint8Array(lengthBytesUTF8(r) + 1),
                    i = stringToUTF8Array(r, o, 0, o.length);
                FS.write(n, o, 0, i, void 0, t.canOwn);
            } else {
                if (!ArrayBuffer.isView(r))
                    throw new Error("Unsupported data type");
                FS.write(n, r, 0, r.byteLength, void 0, t.canOwn);
            }
            FS.close(n);
        },
        cwd: function () {
            return FS.currentPath;
        },
        chdir: function (e) {
            var r = FS.lookupPath(e, { follow: !0 });
            if (null === r.node) throw new FS.ErrnoError(2);
            if (!FS.isDir(r.node.mode)) throw new FS.ErrnoError(20);
            var t = FS.nodePermissions(r.node, "x");
            if (t) throw new FS.ErrnoError(t);
            FS.currentPath = r.path;
        },
        createDefaultDirectories: function () {
            FS.mkdir("/tmp"), FS.mkdir("/home"), FS.mkdir("/home/web_user");
        },
        createDefaultDevices: function () {
            var e;
            if (
                (FS.mkdir("/dev"),
                FS.registerDevice(FS.makedev(1, 3), {
                    read: function () {
                        return 0;
                    },
                    write: function (e, r, t, n, o) {
                        return n;
                    },
                }),
                FS.mkdev("/dev/null", FS.makedev(1, 3)),
                TTY.register(FS.makedev(5, 0), TTY.default_tty_ops),
                TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops),
                FS.mkdev("/dev/tty", FS.makedev(5, 0)),
                FS.mkdev("/dev/tty1", FS.makedev(6, 0)),
                "object" == typeof crypto &&
                    "function" == typeof crypto.getRandomValues)
            ) {
                var r = new Uint8Array(1);
                e = function () {
                    return crypto.getRandomValues(r), r[0];
                };
            } else if (ENVIRONMENT_IS_NODE)
                try {
                    var t = require("crypto");
                    e = function () {
                        return t.randomBytes(1)[0];
                    };
                } catch (e) {}
            (e =
                e ||
                function () {
                    abort("random_device");
                }),
                FS.createDevice("/dev", "random", e),
                FS.createDevice("/dev", "urandom", e),
                FS.mkdir("/dev/shm"),
                FS.mkdir("/dev/shm/tmp");
        },
        createSpecialDirectories: function () {
            FS.mkdir("/proc"),
                FS.mkdir("/proc/self"),
                FS.mkdir("/proc/self/fd"),
                FS.mount(
                    {
                        mount: function () {
                            var e = FS.createNode(
                                "/proc/self",
                                "fd",
                                16895,
                                73,
                            );
                            return (
                                (e.node_ops = {
                                    lookup: function (e, r) {
                                        var t = +r,
                                            n = FS.getStream(t);
                                        if (!n) throw new FS.ErrnoError(9);
                                        var o = {
                                            parent: null,
                                            mount: { mountpoint: "fake" },
                                            node_ops: {
                                                readlink: function () {
                                                    return n.path;
                                                },
                                            },
                                        };
                                        return (o.parent = o);
                                    },
                                }),
                                e
                            );
                        },
                    },
                    {},
                    "/proc/self/fd",
                );
        },
        createStandardStreams: function () {
            Module.stdin
                ? FS.createDevice("/dev", "stdin", Module.stdin)
                : FS.symlink("/dev/tty", "/dev/stdin"),
                Module.stdout
                    ? FS.createDevice("/dev", "stdout", null, Module.stdout)
                    : FS.symlink("/dev/tty", "/dev/stdout"),
                Module.stderr
                    ? FS.createDevice("/dev", "stderr", null, Module.stderr)
                    : FS.symlink("/dev/tty1", "/dev/stderr");
            FS.open("/dev/stdin", "r"),
                FS.open("/dev/stdout", "w"),
                FS.open("/dev/stderr", "w");
        },
        ensureErrnoError: function () {
            FS.ErrnoError ||
                ((FS.ErrnoError = function (e, r) {
                    (this.node = r),
                        (this.setErrno = function (e) {
                            this.errno = e;
                        }),
                        this.setErrno(e),
                        (this.message = "FS error"),
                        this.stack &&
                            Object.defineProperty(this, "stack", {
                                value: new Error().stack,
                                writable: !0,
                            });
                }),
                (FS.ErrnoError.prototype = new Error()),
                (FS.ErrnoError.prototype.constructor = FS.ErrnoError),
                [2].forEach(function (e) {
                    (FS.genericErrors[e] = new FS.ErrnoError(e)),
                        (FS.genericErrors[e].stack =
                            "<generic error, no stack>");
                }));
        },
        staticInit: function () {
            FS.ensureErrnoError(),
                (FS.nameTable = new Array(4096)),
                FS.mount(MEMFS, {}, "/"),
                FS.createDefaultDirectories(),
                FS.createDefaultDevices(),
                FS.createSpecialDirectories(),
                (FS.filesystems = {
                    MEMFS: MEMFS,
                    IDBFS: IDBFS,
                    NODEFS: NODEFS,
                    WORKERFS: WORKERFS,
                });
        },
        init: function (e, r, t) {
            (FS.init.initialized = !0),
                FS.ensureErrnoError(),
                (Module.stdin = e || Module.stdin),
                (Module.stdout = r || Module.stdout),
                (Module.stderr = t || Module.stderr),
                FS.createStandardStreams();
        },
        quit: function () {
            FS.init.initialized = !1;
            var e = Module._fflush;
            e && e(0);
            for (var r = 0; r < FS.streams.length; r++) {
                var t = FS.streams[r];
                t && FS.close(t);
            }
        },
        getMode: function (e, r) {
            var t = 0;
            return e && (t |= 365), r && (t |= 146), t;
        },
        joinPath: function (e, r) {
            var t = PATH.join.apply(null, e);
            return r && "/" == t[0] && (t = t.substr(1)), t;
        },
        absolutePath: function (e, r) {
            return PATH_FS.resolve(r, e);
        },
        standardizePath: function (e) {
            return PATH.normalize(e);
        },
        findObject: function (e, r) {
            var t = FS.analyzePath(e, r);
            return t.exists ? t.object : (___setErrNo(t.error), null);
        },
        analyzePath: function (e, r) {
            try {
                e = (n = FS.lookupPath(e, { follow: !r })).path;
            } catch (e) {}
            var t = {
                isRoot: !1,
                exists: !1,
                error: 0,
                name: null,
                path: null,
                object: null,
                parentExists: !1,
                parentPath: null,
                parentObject: null,
            };
            try {
                var n = FS.lookupPath(e, { parent: !0 });
                (t.parentExists = !0),
                    (t.parentPath = n.path),
                    (t.parentObject = n.node),
                    (t.name = PATH.basename(e)),
                    (n = FS.lookupPath(e, { follow: !r })),
                    (t.exists = !0),
                    (t.path = n.path),
                    (t.object = n.node),
                    (t.name = n.node.name),
                    (t.isRoot = "/" === n.path);
            } catch (e) {
                t.error = e.errno;
            }
            return t;
        },
        createFolder: function (e, r, t, n) {
            var o = PATH.join2("string" == typeof e ? e : FS.getPath(e), r),
                i = FS.getMode(t, n);
            return FS.mkdir(o, i);
        },
        createPath: function (e, r, t, n) {
            e = "string" == typeof e ? e : FS.getPath(e);
            for (var o = r.split("/").reverse(); o.length; ) {
                var i = o.pop();
                if (i) {
                    var a = PATH.join2(e, i);
                    try {
                        FS.mkdir(a);
                    } catch (e) {}
                    e = a;
                }
            }
            return a;
        },
        createFile: function (e, r, t, n, o) {
            var i = PATH.join2("string" == typeof e ? e : FS.getPath(e), r),
                a = FS.getMode(n, o);
            return FS.create(i, a);
        },
        createDataFile: function (e, r, t, n, o, i) {
            var a = r
                    ? PATH.join2("string" == typeof e ? e : FS.getPath(e), r)
                    : e,
                s = FS.getMode(n, o),
                u = FS.create(a, s);
            if (t) {
                if ("string" == typeof t) {
                    for (
                        var l = new Array(t.length), c = 0, d = t.length;
                        c < d;
                        ++c
                    )
                        l[c] = t.charCodeAt(c);
                    t = l;
                }
                FS.chmod(u, 146 | s);
                var f = FS.open(u, "w");
                FS.write(f, t, 0, t.length, 0, i), FS.close(f), FS.chmod(u, s);
            }
            return u;
        },
        createDevice: function (e, r, u, a) {
            var t = PATH.join2("string" == typeof e ? e : FS.getPath(e), r),
                n = FS.getMode(!!u, !!a);
            FS.createDevice.major || (FS.createDevice.major = 64);
            var o = FS.makedev(FS.createDevice.major++, 0);
            return (
                FS.registerDevice(o, {
                    open: function (e) {
                        e.seekable = !1;
                    },
                    close: function (e) {
                        a && a.buffer && a.buffer.length && a(10);
                    },
                    read: function (e, r, t, n, o) {
                        for (var i = 0, a = 0; a < n; a++) {
                            var s;
                            try {
                                s = u();
                            } catch (e) {
                                throw new FS.ErrnoError(5);
                            }
                            if (void 0 === s && 0 === i)
                                throw new FS.ErrnoError(11);
                            if (null == s) break;
                            i++, (r[t + a] = s);
                        }
                        return i && (e.node.timestamp = Date.now()), i;
                    },
                    write: function (e, r, t, n, o) {
                        for (var i = 0; i < n; i++)
                            try {
                                a(r[t + i]);
                            } catch (e) {
                                throw new FS.ErrnoError(5);
                            }
                        return n && (e.node.timestamp = Date.now()), i;
                    },
                }),
                FS.mkdev(t, n, o)
            );
        },
        createLink: function (e, r, t, n, o) {
            var i = PATH.join2("string" == typeof e ? e : FS.getPath(e), r);
            return FS.symlink(t, i);
        },
        forceLoadFile: function (e) {
            if (e.isDevice || e.isFolder || e.link || e.contents) return !0;
            var r = !0;
            if ("undefined" != typeof XMLHttpRequest)
                throw new Error(
                    "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.",
                );
            if (!read_)
                throw new Error(
                    "Cannot load without read() or XMLHttpRequest.",
                );
            try {
                (e.contents = intArrayFromString(read_(e.url), !0)),
                    (e.usedBytes = e.contents.length);
            } catch (e) {
                r = !1;
            }
            return r || ___setErrNo(5), r;
        },
        createLazyFile: function (e, r, s, t, n) {
            function o() {
                (this.lengthKnown = !1), (this.chunks = []);
            }
            if (
                ((o.prototype.get = function (e) {
                    if (!(e > this.length - 1 || e < 0)) {
                        var r = e % this.chunkSize,
                            t = (e / this.chunkSize) | 0;
                        return this.getter(t)[r];
                    }
                }),
                (o.prototype.setDataGetter = function (e) {
                    this.getter = e;
                }),
                (o.prototype.cacheLength = function () {
                    var e = new XMLHttpRequest();
                    if (
                        (e.open("HEAD", s, !1),
                        e.send(null),
                        !(
                            (200 <= e.status && e.status < 300) ||
                            304 === e.status
                        ))
                    )
                        throw new Error(
                            "Couldn't load " + s + ". Status: " + e.status,
                        );
                    var r,
                        n = Number(e.getResponseHeader("Content-length")),
                        t =
                            (r = e.getResponseHeader("Accept-Ranges")) &&
                            "bytes" === r,
                        o =
                            (r = e.getResponseHeader("Content-Encoding")) &&
                            "gzip" === r,
                        i = 1048576;
                    t || (i = n);
                    var a = this;
                    a.setDataGetter(function (e) {
                        var r = e * i,
                            t = (e + 1) * i - 1;
                        if (
                            ((t = Math.min(t, n - 1)),
                            void 0 === a.chunks[e] &&
                                (a.chunks[e] = (function (e, r) {
                                    if (r < e)
                                        throw new Error(
                                            "invalid range (" +
                                                e +
                                                ", " +
                                                r +
                                                ") or no bytes requested!",
                                        );
                                    if (n - 1 < r)
                                        throw new Error(
                                            "only " +
                                                n +
                                                " bytes available! programmer error!",
                                        );
                                    var t = new XMLHttpRequest();
                                    if (
                                        (t.open("GET", s, !1),
                                        n !== i &&
                                            t.setRequestHeader(
                                                "Range",
                                                "bytes=" + e + "-" + r,
                                            ),
                                        "undefined" != typeof Uint8Array &&
                                            (t.responseType = "arraybuffer"),
                                        t.overrideMimeType &&
                                            t.overrideMimeType(
                                                "text/plain; charset=x-user-defined",
                                            ),
                                        t.send(null),
                                        !(
                                            (200 <= t.status &&
                                                t.status < 300) ||
                                            304 === t.status
                                        ))
                                    )
                                        throw new Error(
                                            "Couldn't load " +
                                                s +
                                                ". Status: " +
                                                t.status,
                                        );
                                    return void 0 !== t.response
                                        ? new Uint8Array(t.response || [])
                                        : intArrayFromString(
                                              t.responseText || "",
                                              !0,
                                          );
                                })(r, t)),
                            void 0 === a.chunks[e])
                        )
                            throw new Error("doXHR failed!");
                        return a.chunks[e];
                    }),
                        (!o && n) ||
                            ((i = n = 1),
                            (n = this.getter(0).length),
                            (i = n),
                            console.log(
                                "LazyFiles on gzip forces download of the whole file when length is accessed",
                            )),
                        (this._length = n),
                        (this._chunkSize = i),
                        (this.lengthKnown = !0);
                }),
                "undefined" != typeof XMLHttpRequest)
            ) {
                if (!ENVIRONMENT_IS_WORKER)
                    throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
                var i = new o();
                Object.defineProperties(i, {
                    length: {
                        get: function () {
                            return (
                                this.lengthKnown || this.cacheLength(),
                                this._length
                            );
                        },
                    },
                    chunkSize: {
                        get: function () {
                            return (
                                this.lengthKnown || this.cacheLength(),
                                this._chunkSize
                            );
                        },
                    },
                });
                var a = { isDevice: !1, contents: i };
            } else a = { isDevice: !1, url: s };
            var u = FS.createFile(e, r, a, t, n);
            a.contents
                ? (u.contents = a.contents)
                : a.url && ((u.contents = null), (u.url = a.url)),
                Object.defineProperties(u, {
                    usedBytes: {
                        get: function () {
                            return this.contents.length;
                        },
                    },
                });
            var l = {};
            return (
                Object.keys(u.stream_ops).forEach(function (e) {
                    var r = u.stream_ops[e];
                    l[e] = function () {
                        if (!FS.forceLoadFile(u)) throw new FS.ErrnoError(5);
                        return r.apply(null, arguments);
                    };
                }),
                (l.read = function (e, r, t, n, o) {
                    if (!FS.forceLoadFile(u)) throw new FS.ErrnoError(5);
                    var i = e.node.contents;
                    if (o >= i.length) return 0;
                    var a = Math.min(i.length - o, n);
                    if (i.slice)
                        for (var s = 0; s < a; s++) r[t + s] = i[o + s];
                    else for (s = 0; s < a; s++) r[t + s] = i.get(o + s);
                    return a;
                }),
                (u.stream_ops = l),
                u
            );
        },
        createPreloadedFile: function (o, i, e, a, s, u, l, c, d, f) {
            Browser.init();
            var m = i ? PATH_FS.resolve(PATH.join2(o, i)) : o,
                p = getUniqueRunDependency("cp " + m);
            function r(r) {
                function t(e) {
                    f && f(),
                        c || FS.createDataFile(o, i, e, a, s, d),
                        u && u(),
                        removeRunDependency(p);
                }
                var n = !1;
                Module.preloadPlugins.forEach(function (e) {
                    n ||
                        (e.canHandle(m) &&
                            (e.handle(r, m, t, function () {
                                l && l(), removeRunDependency(p);
                            }),
                            (n = !0)));
                }),
                    n || t(r);
            }
            addRunDependency(p),
                "string" == typeof e
                    ? Browser.asyncLoad(
                          e,
                          function (e) {
                              r(e);
                          },
                          l,
                      )
                    : r(e);
        },
        indexedDB: function () {
            return (
                window.indexedDB ||
                window.mozIndexedDB ||
                window.webkitIndexedDB ||
                window.msIndexedDB
            );
        },
        DB_NAME: function () {
            return "EM_FS_" + window.location.pathname;
        },
        DB_VERSION: 20,
        DB_STORE_NAME: "FILE_DATA",
        saveFilesToDB: function (r, s, u) {
            (s = s || function () {}), (u = u || function () {});
            var e = FS.indexedDB();
            try {
                var l = e.open(FS.DB_NAME(), FS.DB_VERSION);
            } catch (e) {
                return u(e);
            }
            (l.onupgradeneeded = function () {
                console.log("creating db"),
                    l.result.createObjectStore(FS.DB_STORE_NAME);
            }),
                (l.onsuccess = function () {
                    var e = l.result.transaction(
                            [FS.DB_STORE_NAME],
                            "readwrite",
                        ),
                        t = e.objectStore(FS.DB_STORE_NAME),
                        n = 0,
                        o = 0,
                        i = r.length;
                    function a() {
                        0 == o ? s() : u();
                    }
                    r.forEach(function (e) {
                        var r = t.put(FS.analyzePath(e).object.contents, e);
                        (r.onsuccess = function () {
                            ++n + o == i && a();
                        }),
                            (r.onerror = function () {
                                n + ++o == i && a();
                            });
                    }),
                        (e.onerror = u);
                }),
                (l.onerror = u);
        },
        loadFilesFromDB: function (s, u, l) {
            (u = u || function () {}), (l = l || function () {});
            var e = FS.indexedDB();
            try {
                var c = e.open(FS.DB_NAME(), FS.DB_VERSION);
            } catch (e) {
                return l(e);
            }
            (c.onupgradeneeded = l),
                (c.onsuccess = function () {
                    var e = c.result;
                    try {
                        var r = e.transaction([FS.DB_STORE_NAME], "readonly");
                    } catch (e) {
                        return void l(e);
                    }
                    var t = r.objectStore(FS.DB_STORE_NAME),
                        n = 0,
                        o = 0,
                        i = s.length;
                    function a() {
                        0 == o ? u() : l();
                    }
                    s.forEach(function (e) {
                        var r = t.get(e);
                        (r.onsuccess = function () {
                            FS.analyzePath(e).exists && FS.unlink(e),
                                FS.createDataFile(
                                    PATH.dirname(e),
                                    PATH.basename(e),
                                    r.result,
                                    !0,
                                    !0,
                                    !0,
                                ),
                                ++n + o == i && a();
                        }),
                            (r.onerror = function () {
                                n + ++o == i && a();
                            });
                    }),
                        (r.onerror = l);
                }),
                (c.onerror = l);
        },
    },
    SYSCALLS = {
        DEFAULT_POLLMASK: 5,
        mappings: {},
        umask: 511,
        calculateAt: function (e, r) {
            if ("/" !== r[0]) {
                var t;
                if (-100 === e) t = FS.cwd();
                else {
                    var n = FS.getStream(e);
                    if (!n) throw new FS.ErrnoError(9);
                    t = n.path;
                }
                r = PATH.join2(t, r);
            }
            return r;
        },
        doStat: function (e, r, t) {
            try {
                var n = e(r);
            } catch (e) {
                if (
                    e &&
                    e.node &&
                    PATH.normalize(r) !== PATH.normalize(FS.getPath(e.node))
                )
                    return -20;
                throw e;
            }
            return (
                (HEAP32[t >> 2] = n.dev),
                (HEAP32[(t + 4) >> 2] = 0),
                (HEAP32[(t + 8) >> 2] = n.ino),
                (HEAP32[(t + 12) >> 2] = n.mode),
                (HEAP32[(t + 16) >> 2] = n.nlink),
                (HEAP32[(t + 20) >> 2] = n.uid),
                (HEAP32[(t + 24) >> 2] = n.gid),
                (HEAP32[(t + 28) >> 2] = n.rdev),
                (HEAP32[(t + 32) >> 2] = 0),
                (tempI64 = [
                    n.size >>> 0,
                    ((tempDouble = n.size),
                    1 <= +Math_abs(tempDouble)
                        ? 0 < tempDouble
                            ? (0 |
                                  Math_min(
                                      +Math_floor(tempDouble / 4294967296),
                                      4294967295,
                                  )) >>>
                              0
                            : ~~+Math_ceil(
                                  (tempDouble - +(~~tempDouble >>> 0)) /
                                      4294967296,
                              ) >>> 0
                        : 0),
                ]),
                (HEAP32[(t + 40) >> 2] = tempI64[0]),
                (HEAP32[(t + 44) >> 2] = tempI64[1]),
                (HEAP32[(t + 48) >> 2] = 4096),
                (HEAP32[(t + 52) >> 2] = n.blocks),
                (HEAP32[(t + 56) >> 2] = (n.atime.getTime() / 1e3) | 0),
                (HEAP32[(t + 60) >> 2] = 0),
                (HEAP32[(t + 64) >> 2] = (n.mtime.getTime() / 1e3) | 0),
                (HEAP32[(t + 68) >> 2] = 0),
                (HEAP32[(t + 72) >> 2] = (n.ctime.getTime() / 1e3) | 0),
                (HEAP32[(t + 76) >> 2] = 0),
                (tempI64 = [
                    n.ino >>> 0,
                    ((tempDouble = n.ino),
                    1 <= +Math_abs(tempDouble)
                        ? 0 < tempDouble
                            ? (0 |
                                  Math_min(
                                      +Math_floor(tempDouble / 4294967296),
                                      4294967295,
                                  )) >>>
                              0
                            : ~~+Math_ceil(
                                  (tempDouble - +(~~tempDouble >>> 0)) /
                                      4294967296,
                              ) >>> 0
                        : 0),
                ]),
                (HEAP32[(t + 80) >> 2] = tempI64[0]),
                (HEAP32[(t + 84) >> 2] = tempI64[1]),
                0
            );
        },
        doMsync: function (e, r, t, n) {
            var o = new Uint8Array(HEAPU8.subarray(e, e + t));
            FS.msync(r, o, 0, t, n);
        },
        doMkdir: function (e, r) {
            return (
                "/" === (e = PATH.normalize(e))[e.length - 1] &&
                    (e = e.substr(0, e.length - 1)),
                FS.mkdir(e, r, 0),
                0
            );
        },
        doMknod: function (e, r, t) {
            switch (61440 & r) {
                case 32768:
                case 8192:
                case 24576:
                case 4096:
                case 49152:
                    break;
                default:
                    return -22;
            }
            return FS.mknod(e, r, t), 0;
        },
        doReadlink: function (e, r, t) {
            if (t <= 0) return -22;
            var n = FS.readlink(e),
                o = Math.min(t, lengthBytesUTF8(n)),
                i = HEAP8[r + o];
            return stringToUTF8(n, r, t + 1), (HEAP8[r + o] = i), o;
        },
        doAccess: function (e, r) {
            if (-8 & r) return -22;
            var t;
            if (!(t = FS.lookupPath(e, { follow: !0 }).node)) return -2;
            var n = "";
            return (
                4 & r && (n += "r"),
                2 & r && (n += "w"),
                1 & r && (n += "x"),
                n && FS.nodePermissions(t, n) ? -13 : 0
            );
        },
        doDup: function (e, r, t) {
            var n = FS.getStream(t);
            return n && FS.close(n), FS.open(e, r, 0, t, t).fd;
        },
        doReadv: function (e, r, t, n) {
            for (var o = 0, i = 0; i < t; i++) {
                var a = HEAP32[(r + 8 * i) >> 2],
                    s = HEAP32[(r + (8 * i + 4)) >> 2],
                    u = FS.read(e, HEAP8, a, s, n);
                if (u < 0) return -1;
                if (((o += u), u < s)) break;
            }
            return o;
        },
        doWritev: function (e, r, t, n) {
            for (var o = 0, i = 0; i < t; i++) {
                var a = HEAP32[(r + 8 * i) >> 2],
                    s = HEAP32[(r + (8 * i + 4)) >> 2],
                    u = FS.write(e, HEAP8, a, s, n);
                if (u < 0) return -1;
                o += u;
            }
            return o;
        },
        varargs: 0,
        get: function (e) {
            return (SYSCALLS.varargs += 4), HEAP32[(SYSCALLS.varargs - 4) >> 2];
        },
        getStr: function () {
            return UTF8ToString(SYSCALLS.get());
        },
        getStreamFromFD: function () {
            var e = FS.getStream(SYSCALLS.get());
            if (!e) throw new FS.ErrnoError(9);
            return e;
        },
        get64: function () {
            var e = SYSCALLS.get();
            SYSCALLS.get();
            return e;
        },
        getZero: function () {
            SYSCALLS.get();
        },
    };
function ___syscall140(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD(),
            n = SYSCALLS.get(),
            o = SYSCALLS.get(),
            i = SYSCALLS.get(),
            a = SYSCALLS.get(),
            s = 4294967296 * n + (o >>> 0),
            u = 9007199254740992;
        return s <= -u || u <= s
            ? -75
            : (FS.llseek(t, s, a),
              (tempI64 = [
                  t.position >>> 0,
                  ((tempDouble = t.position),
                  1 <= +Math_abs(tempDouble)
                      ? 0 < tempDouble
                          ? (0 |
                                Math_min(
                                    +Math_floor(tempDouble / 4294967296),
                                    4294967295,
                                )) >>>
                            0
                          : ~~+Math_ceil(
                                (tempDouble - +(~~tempDouble >>> 0)) /
                                    4294967296,
                            ) >>> 0
                      : 0),
              ]),
              (HEAP32[i >> 2] = tempI64[0]),
              (HEAP32[(i + 4) >> 2] = tempI64[1]),
              t.getdents && 0 == s && 0 === a && (t.getdents = null),
              0);
    } catch (e) {
        return (
            (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
        );
    }
}
function ___syscall145(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD(),
            n = SYSCALLS.get(),
            o = SYSCALLS.get();
        return SYSCALLS.doReadv(t, n, o);
    } catch (e) {
        return (
            (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
        );
    }
}
function ___syscall146(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD(),
            n = SYSCALLS.get(),
            o = SYSCALLS.get();
        return SYSCALLS.doWritev(t, n, o);
    } catch (e) {
        return (
            (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
        );
    }
}
function ___syscall221(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD();
        switch (SYSCALLS.get()) {
            case 0:
                return (n = SYSCALLS.get()) < 0
                    ? -22
                    : FS.open(t.path, t.flags, 0, n).fd;
            case 1:
            case 2:
                return 0;
            case 3:
                return t.flags;
            case 4:
                var n = SYSCALLS.get();
                return (t.flags |= n), 0;
            case 12:
                n = SYSCALLS.get();
                return (HEAP16[(n + 0) >> 1] = 2), 0;
            case 13:
            case 14:
                return 0;
            case 16:
            case 8:
                return -22;
            case 9:
                return ___setErrNo(22), -1;
            default:
                return -22;
        }
    } catch (e) {
        return (
            (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
        );
    }
}
function ___syscall5(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStr(),
            n = SYSCALLS.get(),
            o = SYSCALLS.get();
        return FS.open(t, n, o).fd;
    } catch (e) {
        return (
            (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
        );
    }
}
function ___syscall54(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD(),
            n = SYSCALLS.get();
        switch (n) {
            case 21509:
            case 21505:
                return t.tty ? 0 : -25;
            case 21510:
            case 21511:
            case 21512:
            case 21506:
            case 21507:
            case 21508:
                return t.tty ? 0 : -25;
            case 21519:
                if (!t.tty) return -25;
                var o = SYSCALLS.get();
                return (HEAP32[o >> 2] = 0);
            case 21520:
                return t.tty ? -22 : -25;
            case 21531:
                o = SYSCALLS.get();
                return FS.ioctl(t, n, o);
            case 21523:
            case 21524:
                return t.tty ? 0 : -25;
            default:
                abort("bad ioctl syscall " + n);
        }
    } catch (e) {
        return (
            (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
        );
    }
}
function ___syscall6(e, r) {
    SYSCALLS.varargs = r;
    try {
        var t = SYSCALLS.getStreamFromFD();
        return FS.close(t), 0;
    } catch (e) {
        return (
            (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
        );
    }
}
function __emscripten_syscall_munmap(e, r) {
    if (-1 === e || 0 === r) return -22;
    var t = SYSCALLS.mappings[e];
    if (!t) return 0;
    if (r === t.len) {
        var n = FS.getStream(t.fd);
        SYSCALLS.doMsync(e, n, r, t.flags),
            FS.munmap(n),
            (SYSCALLS.mappings[e] = null),
            t.allocated && _free(t.malloc);
    }
    return 0;
}
function ___syscall91(e, r) {
    SYSCALLS.varargs = r;
    try {
        return __emscripten_syscall_munmap(SYSCALLS.get(), SYSCALLS.get());
    } catch (e) {
        return (
            (void 0 !== FS && e instanceof FS.ErrnoError) || abort(e), -e.errno
        );
    }
}
function ___unlock() {}
function _abort() {
    Module.abort();
}
function _emscripten_get_now() {
    abort();
}
function _emscripten_get_now_is_monotonic() {
    return (
        ENVIRONMENT_IS_NODE ||
        "undefined" != typeof dateNow ||
        ("object" == typeof performance &&
            performance &&
            "function" == typeof performance.now)
    );
}
function _clock_gettime(e, r) {
    var t;
    if (0 === e) t = Date.now();
    else {
        if (1 !== e || !_emscripten_get_now_is_monotonic())
            return ___setErrNo(22), -1;
        t = _emscripten_get_now();
    }
    return (
        (HEAP32[r >> 2] = (t / 1e3) | 0),
        (HEAP32[(r + 4) >> 2] = ((t % 1e3) * 1e3 * 1e3) | 0),
        0
    );
}
function _emscripten_set_main_loop_timing(e, r) {
    if (
        ((Browser.mainLoop.timingMode = e),
        (Browser.mainLoop.timingValue = r),
        !Browser.mainLoop.func)
    )
        return 1;
    if (0 == e)
        (Browser.mainLoop.scheduler = function () {
            var e =
                0 |
                Math.max(
                    0,
                    Browser.mainLoop.tickStartTime + r - _emscripten_get_now(),
                );
            setTimeout(Browser.mainLoop.runner, e);
        }),
            (Browser.mainLoop.method = "timeout");
    else if (1 == e)
        (Browser.mainLoop.scheduler = function () {
            Browser.requestAnimationFrame(Browser.mainLoop.runner);
        }),
            (Browser.mainLoop.method = "rAF");
    else if (2 == e) {
        if ("undefined" == typeof setImmediate) {
            var t = [],
                n = "setimmediate";
            addEventListener(
                "message",
                function (e) {
                    (e.data !== n && e.data.target !== n) ||
                        (e.stopPropagation(), t.shift()());
                },
                !0,
            ),
                (setImmediate = function (e) {
                    t.push(e),
                        ENVIRONMENT_IS_WORKER
                            ? (void 0 === Module.setImmediates &&
                                  (Module.setImmediates = []),
                              Module.setImmediates.push(e),
                              postMessage({ target: n }))
                            : postMessage(n, "*");
                });
        }
        (Browser.mainLoop.scheduler = function () {
            setImmediate(Browser.mainLoop.runner);
        }),
            (Browser.mainLoop.method = "immediate");
    }
    return 0;
}
function _emscripten_set_main_loop(e, r, t, n, o) {
    var i;
    (Module.noExitRuntime = !0),
        assert(
            !Browser.mainLoop.func,
            "emscripten_set_main_loop: there can only be one main loop function at once: call emscripten_cancel_main_loop to cancel the previous one before setting a new one with different parameters.",
        ),
        (Browser.mainLoop.func = e),
        (Browser.mainLoop.arg = n),
        (i =
            void 0 !== n
                ? function () {
                      Module.dynCall_vi(e, n);
                  }
                : function () {
                      Module.dynCall_v(e);
                  });
    var a = Browser.mainLoop.currentlyRunningMainloop;
    if (
        ((Browser.mainLoop.runner = function () {
            if (!ABORT)
                if (0 < Browser.mainLoop.queue.length) {
                    var e = Date.now(),
                        r = Browser.mainLoop.queue.shift();
                    if ((r.func(r.arg), Browser.mainLoop.remainingBlockers)) {
                        var t = Browser.mainLoop.remainingBlockers,
                            n = t % 1 == 0 ? t - 1 : Math.floor(t);
                        r.counted
                            ? (Browser.mainLoop.remainingBlockers = n)
                            : ((n += 0.5),
                              (Browser.mainLoop.remainingBlockers =
                                  (8 * t + n) / 9));
                    }
                    if (
                        (console.log(
                            'main loop blocker "' +
                                r.name +
                                '" took ' +
                                (Date.now() - e) +
                                " ms",
                        ),
                        Browser.mainLoop.updateStatus(),
                        a < Browser.mainLoop.currentlyRunningMainloop)
                    )
                        return;
                    setTimeout(Browser.mainLoop.runner, 0);
                } else
                    a < Browser.mainLoop.currentlyRunningMainloop ||
                        ((Browser.mainLoop.currentFrameNumber =
                            (Browser.mainLoop.currentFrameNumber + 1) | 0),
                        1 == Browser.mainLoop.timingMode &&
                        1 < Browser.mainLoop.timingValue &&
                        Browser.mainLoop.currentFrameNumber %
                            Browser.mainLoop.timingValue !=
                            0
                            ? Browser.mainLoop.scheduler()
                            : (0 == Browser.mainLoop.timingMode &&
                                  (Browser.mainLoop.tickStartTime =
                                      _emscripten_get_now()),
                              "timeout" === Browser.mainLoop.method &&
                                  Module.ctx &&
                                  (err(
                                      "Looks like you are rendering without using requestAnimationFrame for the main loop. You should use 0 for the frame rate in emscripten_set_main_loop in order to use requestAnimationFrame, as that can greatly improve your frame rates!",
                                  ),
                                  (Browser.mainLoop.method = "")),
                              Browser.mainLoop.runIter(i),
                              a < Browser.mainLoop.currentlyRunningMainloop ||
                                  ("object" == typeof SDL &&
                                      SDL.audio &&
                                      SDL.audio.queueNewAudioData &&
                                      SDL.audio.queueNewAudioData(),
                                  Browser.mainLoop.scheduler())));
        }),
        o ||
            (r && 0 < r
                ? _emscripten_set_main_loop_timing(0, 1e3 / r)
                : _emscripten_set_main_loop_timing(1, 1),
            Browser.mainLoop.scheduler()),
        t)
    )
        throw "SimulateInfiniteLoop";
}
var Browser = {
    mainLoop: {
        scheduler: null,
        method: "",
        currentlyRunningMainloop: 0,
        func: null,
        arg: 0,
        timingMode: 0,
        timingValue: 0,
        currentFrameNumber: 0,
        queue: [],
        pause: function () {
            (Browser.mainLoop.scheduler = null),
                Browser.mainLoop.currentlyRunningMainloop++;
        },
        resume: function () {
            Browser.mainLoop.currentlyRunningMainloop++;
            var e = Browser.mainLoop.timingMode,
                r = Browser.mainLoop.timingValue,
                t = Browser.mainLoop.func;
            (Browser.mainLoop.func = null),
                _emscripten_set_main_loop(t, 0, !1, Browser.mainLoop.arg, !0),
                _emscripten_set_main_loop_timing(e, r),
                Browser.mainLoop.scheduler();
        },
        updateStatus: function () {
            if (Module.setStatus) {
                var e = Module.statusMessage || "Please wait...",
                    r = Browser.mainLoop.remainingBlockers,
                    t = Browser.mainLoop.expectedBlockers;
                r
                    ? r < t
                        ? Module.setStatus(e + " (" + (t - r) + "/" + t + ")")
                        : Module.setStatus(e)
                    : Module.setStatus("");
            }
        },
        runIter: function (e) {
            if (!ABORT) {
                if (Module.preMainLoop) if (!1 === Module.preMainLoop()) return;
                try {
                    e();
                } catch (e) {
                    if (e instanceof ExitStatus) return;
                    throw (
                        (e &&
                            "object" == typeof e &&
                            e.stack &&
                            err("exception thrown: " + [e, e.stack]),
                        e)
                    );
                }
                Module.postMainLoop && Module.postMainLoop();
            }
        },
    },
    isFullscreen: !1,
    pointerLock: !1,
    moduleContextCreatedCallbacks: [],
    workers: [],
    init: function () {
        if (
            (Module.preloadPlugins || (Module.preloadPlugins = []),
            !Browser.initted)
        ) {
            Browser.initted = !0;
            try {
                new Blob(), (Browser.hasBlobConstructor = !0);
            } catch (e) {
                (Browser.hasBlobConstructor = !1),
                    console.log(
                        "warning: no blob constructor, cannot create blobs with mimetypes",
                    );
            }
            (Browser.BlobBuilder =
                "undefined" != typeof MozBlobBuilder
                    ? MozBlobBuilder
                    : "undefined" != typeof WebKitBlobBuilder
                      ? WebKitBlobBuilder
                      : Browser.hasBlobConstructor
                        ? null
                        : console.log("warning: no BlobBuilder")),
                (Browser.URLObject =
                    "undefined" != typeof window
                        ? window.URL
                            ? window.URL
                            : window.webkitURL
                        : void 0),
                Module.noImageDecoding ||
                    void 0 !== Browser.URLObject ||
                    (console.log(
                        "warning: Browser does not support creating object URLs. Built-in browser image decoding will not be available.",
                    ),
                    (Module.noImageDecoding = !0));
            var e = {
                canHandle: function (e) {
                    return (
                        !Module.noImageDecoding &&
                        /\.(jpg|jpeg|png|bmp)$/i.test(e)
                    );
                },
                handle: function (r, t, n, o) {
                    var e = null;
                    if (Browser.hasBlobConstructor)
                        try {
                            (e = new Blob([r], {
                                type: Browser.getMimetype(t),
                            })).size !== r.length &&
                                (e = new Blob([new Uint8Array(r).buffer], {
                                    type: Browser.getMimetype(t),
                                }));
                        } catch (e) {
                            warnOnce(
                                "Blob constructor present but fails: " +
                                    e +
                                    "; falling back to blob builder",
                            );
                        }
                    if (!e) {
                        var i = new Browser.BlobBuilder();
                        i.append(new Uint8Array(r).buffer), (e = i.getBlob());
                    }
                    var a = Browser.URLObject.createObjectURL(e),
                        s = new Image();
                    (s.onload = function () {
                        assert(
                            s.complete,
                            "Image " + t + " could not be decoded",
                        );
                        var e = document.createElement("canvas");
                        (e.width = s.width),
                            (e.height = s.height),
                            e.getContext("2d").drawImage(s, 0, 0),
                            (Module.preloadedImages[t] = e),
                            Browser.URLObject.revokeObjectURL(a),
                            n && n(r);
                    }),
                        (s.onerror = function (e) {
                            console.log("Image " + a + " could not be decoded"),
                                o && o();
                        }),
                        (s.src = a);
                },
            };
            Module.preloadPlugins.push(e);
            var r = {
                canHandle: function (e) {
                    return (
                        !Module.noAudioDecoding &&
                        e.substr(-4) in { ".ogg": 1, ".wav": 1, ".mp3": 1 }
                    );
                },
                handle: function (r, t, n, e) {
                    var o = !1;
                    function i(e) {
                        o ||
                            ((o = !0),
                            (Module.preloadedAudios[t] = e),
                            n && n(r));
                    }
                    function a() {
                        o ||
                            ((o = !0),
                            (Module.preloadedAudios[t] = new Audio()),
                            e && e());
                    }
                    if (!Browser.hasBlobConstructor) return a();
                    try {
                        var s = new Blob([r], { type: Browser.getMimetype(t) });
                    } catch (e) {
                        return a();
                    }
                    var u = Browser.URLObject.createObjectURL(s),
                        l = new Audio();
                    l.addEventListener(
                        "canplaythrough",
                        function () {
                            i(l);
                        },
                        !1,
                    ),
                        (l.onerror = function (e) {
                            o ||
                                (console.log(
                                    "warning: browser could not fully decode audio " +
                                        t +
                                        ", trying slower base64 approach",
                                ),
                                (l.src =
                                    "data:audio/x-" +
                                    t.substr(-3) +
                                    ";base64," +
                                    (function (e) {
                                        for (
                                            var r =
                                                    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
                                                t = "",
                                                n = 0,
                                                o = 0,
                                                i = 0;
                                            i < e.length;
                                            i++
                                        )
                                            for (
                                                n = (n << 8) | e[i], o += 8;
                                                6 <= o;
                                            ) {
                                                var a = (n >> (o - 6)) & 63;
                                                (o -= 6), (t += r[a]);
                                            }
                                        return (
                                            2 == o
                                                ? ((t += r[(3 & n) << 4]),
                                                  (t += "=="))
                                                : 4 == o &&
                                                  ((t += r[(15 & n) << 2]),
                                                  (t += "=")),
                                            t
                                        );
                                    })(r)),
                                i(l));
                        }),
                        (l.src = u),
                        Browser.safeSetTimeout(function () {
                            i(l);
                        }, 1e4);
                },
            };
            Module.preloadPlugins.push(r);
            var t = Module.canvas;
            t &&
                ((t.requestPointerLock =
                    t.requestPointerLock ||
                    t.mozRequestPointerLock ||
                    t.webkitRequestPointerLock ||
                    t.msRequestPointerLock ||
                    function () {}),
                (t.exitPointerLock =
                    document.exitPointerLock ||
                    document.mozExitPointerLock ||
                    document.webkitExitPointerLock ||
                    document.msExitPointerLock ||
                    function () {}),
                (t.exitPointerLock = t.exitPointerLock.bind(document)),
                document.addEventListener("pointerlockchange", n, !1),
                document.addEventListener("mozpointerlockchange", n, !1),
                document.addEventListener("webkitpointerlockchange", n, !1),
                document.addEventListener("mspointerlockchange", n, !1),
                Module.elementPointerLock &&
                    t.addEventListener(
                        "click",
                        function (e) {
                            !Browser.pointerLock &&
                                Module.canvas.requestPointerLock &&
                                (Module.canvas.requestPointerLock(),
                                e.preventDefault());
                        },
                        !1,
                    ));
        }
        function n() {
            Browser.pointerLock =
                document.pointerLockElement === Module.canvas ||
                document.mozPointerLockElement === Module.canvas ||
                document.webkitPointerLockElement === Module.canvas ||
                document.msPointerLockElement === Module.canvas;
        }
    },
    createContext: function (e, r, t, n) {
        if (r && Module.ctx && e == Module.canvas) return Module.ctx;
        var o, i;
        if (r) {
            var a = { antialias: !1, alpha: !1, majorVersion: 1 };
            if (n) for (var s in n) a[s] = n[s];
            "undefined" != typeof GL &&
                (i = GL.createContext(e, a)) &&
                (o = GL.getContext(i).GLctx);
        } else o = e.getContext("2d");
        return o
            ? (t &&
                  (r ||
                      assert(
                          "undefined" == typeof GLctx,
                          "cannot set in module if GLctx is used, but we are a non-GL context that would replace it",
                      ),
                  (Module.ctx = o),
                  r && GL.makeContextCurrent(i),
                  (Module.useWebGL = r),
                  Browser.moduleContextCreatedCallbacks.forEach(function (e) {
                      e();
                  }),
                  Browser.init()),
              o)
            : null;
    },
    destroyContext: function (e, r, t) {},
    fullscreenHandlersInstalled: !1,
    lockPointer: void 0,
    resizeCanvas: void 0,
    requestFullscreen: function (e, r, t) {
        (Browser.lockPointer = e),
            (Browser.resizeCanvas = r),
            (Browser.vrDevice = t),
            void 0 === Browser.lockPointer && (Browser.lockPointer = !0),
            void 0 === Browser.resizeCanvas && (Browser.resizeCanvas = !1),
            void 0 === Browser.vrDevice && (Browser.vrDevice = null);
        var n = Module.canvas;
        function o() {
            Browser.isFullscreen = !1;
            var e = n.parentNode;
            (document.fullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement ||
                document.webkitFullscreenElement ||
                document.webkitCurrentFullScreenElement) === e
                ? ((n.exitFullscreen = Browser.exitFullscreen),
                  Browser.lockPointer && n.requestPointerLock(),
                  (Browser.isFullscreen = !0),
                  Browser.resizeCanvas
                      ? Browser.setFullscreenCanvasSize()
                      : Browser.updateCanvasDimensions(n))
                : (e.parentNode.insertBefore(n, e),
                  e.parentNode.removeChild(e),
                  Browser.resizeCanvas
                      ? Browser.setWindowedCanvasSize()
                      : Browser.updateCanvasDimensions(n)),
                Module.onFullScreen &&
                    Module.onFullScreen(Browser.isFullscreen),
                Module.onFullscreen &&
                    Module.onFullscreen(Browser.isFullscreen);
        }
        Browser.fullscreenHandlersInstalled ||
            ((Browser.fullscreenHandlersInstalled = !0),
            document.addEventListener("fullscreenchange", o, !1),
            document.addEventListener("mozfullscreenchange", o, !1),
            document.addEventListener("webkitfullscreenchange", o, !1),
            document.addEventListener("MSFullscreenChange", o, !1));
        var i = document.createElement("div");
        n.parentNode.insertBefore(i, n),
            i.appendChild(n),
            (i.requestFullscreen =
                i.requestFullscreen ||
                i.mozRequestFullScreen ||
                i.msRequestFullscreen ||
                (i.webkitRequestFullscreen
                    ? function () {
                          i.webkitRequestFullscreen(
                              Element.ALLOW_KEYBOARD_INPUT,
                          );
                      }
                    : null) ||
                (i.webkitRequestFullScreen
                    ? function () {
                          i.webkitRequestFullScreen(
                              Element.ALLOW_KEYBOARD_INPUT,
                          );
                      }
                    : null)),
            t ? i.requestFullscreen({ vrDisplay: t }) : i.requestFullscreen();
    },
    requestFullScreen: function (e, r, t) {
        return (
            err(
                "Browser.requestFullScreen() is deprecated. Please call Browser.requestFullscreen instead.",
            ),
            (Browser.requestFullScreen = function (e, r, t) {
                return Browser.requestFullscreen(e, r, t);
            }),
            Browser.requestFullscreen(e, r, t)
        );
    },
    exitFullscreen: function () {
        return (
            !!Browser.isFullscreen &&
            ((
                document.exitFullscreen ||
                document.cancelFullScreen ||
                document.mozCancelFullScreen ||
                document.msExitFullscreen ||
                document.webkitCancelFullScreen ||
                function () {}
            ).apply(document, []),
            !0)
        );
    },
    nextRAF: 0,
    fakeRequestAnimationFrame: function (e) {
        var r = Date.now();
        if (0 === Browser.nextRAF) Browser.nextRAF = r + 1e3 / 60;
        else for (; r + 2 >= Browser.nextRAF; ) Browser.nextRAF += 1e3 / 60;
        var t = Math.max(Browser.nextRAF - r, 0);
        setTimeout(e, t);
    },
    requestAnimationFrame: function (e) {
        "function" != typeof requestAnimationFrame
            ? (0, Browser.fakeRequestAnimationFrame)(e)
            : requestAnimationFrame(e);
    },
    safeCallback: function (e) {
        return function () {
            if (!ABORT) return e.apply(null, arguments);
        };
    },
    allowAsyncCallbacks: !0,
    queuedAsyncCallbacks: [],
    pauseAsyncCallbacks: function () {
        Browser.allowAsyncCallbacks = !1;
    },
    resumeAsyncCallbacks: function () {
        if (
            ((Browser.allowAsyncCallbacks = !0),
            0 < Browser.queuedAsyncCallbacks.length)
        ) {
            var e = Browser.queuedAsyncCallbacks;
            (Browser.queuedAsyncCallbacks = []),
                e.forEach(function (e) {
                    e();
                });
        }
    },
    safeRequestAnimationFrame: function (e) {
        return Browser.requestAnimationFrame(function () {
            ABORT ||
                (Browser.allowAsyncCallbacks
                    ? e()
                    : Browser.queuedAsyncCallbacks.push(e));
        });
    },
    safeSetTimeout: function (e, r) {
        return (
            (Module.noExitRuntime = !0),
            setTimeout(function () {
                ABORT ||
                    (Browser.allowAsyncCallbacks
                        ? e()
                        : Browser.queuedAsyncCallbacks.push(e));
            }, r)
        );
    },
    safeSetInterval: function (e, r) {
        return (
            (Module.noExitRuntime = !0),
            setInterval(function () {
                ABORT || (Browser.allowAsyncCallbacks && e());
            }, r)
        );
    },
    getMimetype: function (e) {
        return {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            bmp: "image/bmp",
            ogg: "audio/ogg",
            wav: "audio/wav",
            mp3: "audio/mpeg",
        }[e.substr(e.lastIndexOf(".") + 1)];
    },
    getUserMedia: function (e) {
        window.getUserMedia ||
            (window.getUserMedia =
                navigator.getUserMedia || navigator.mozGetUserMedia),
            window.getUserMedia(e);
    },
    getMovementX: function (e) {
        return e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    },
    getMovementY: function (e) {
        return e.movementY || e.mozMovementY || e.webkitMovementY || 0;
    },
    getMouseWheelDelta: function (e) {
        var r = 0;
        switch (e.type) {
            case "DOMMouseScroll":
                r = e.detail / 3;
                break;
            case "mousewheel":
                r = e.wheelDelta / 120;
                break;
            case "wheel":
                switch (((r = e.deltaY), e.deltaMode)) {
                    case 0:
                        r /= 100;
                        break;
                    case 1:
                        r /= 3;
                        break;
                    case 2:
                        r *= 80;
                        break;
                    default:
                        throw (
                            "unrecognized mouse wheel delta mode: " +
                            e.deltaMode
                        );
                }
                break;
            default:
                throw "unrecognized mouse wheel event: " + e.type;
        }
        return r;
    },
    mouseX: 0,
    mouseY: 0,
    mouseMovementX: 0,
    mouseMovementY: 0,
    touches: {},
    lastTouches: {},
    calculateMouseEvent: function (e) {
        if (Browser.pointerLock)
            "mousemove" != e.type && "mozMovementX" in e
                ? (Browser.mouseMovementX = Browser.mouseMovementY = 0)
                : ((Browser.mouseMovementX = Browser.getMovementX(e)),
                  (Browser.mouseMovementY = Browser.getMovementY(e))),
                "undefined" != typeof SDL
                    ? ((Browser.mouseX = SDL.mouseX + Browser.mouseMovementX),
                      (Browser.mouseY = SDL.mouseY + Browser.mouseMovementY))
                    : ((Browser.mouseX += Browser.mouseMovementX),
                      (Browser.mouseY += Browser.mouseMovementY));
        else {
            var r = Module.canvas.getBoundingClientRect(),
                t = Module.canvas.width,
                n = Module.canvas.height,
                o =
                    void 0 !== window.scrollX
                        ? window.scrollX
                        : window.pageXOffset,
                i =
                    void 0 !== window.scrollY
                        ? window.scrollY
                        : window.pageYOffset;
            if (
                "touchstart" === e.type ||
                "touchend" === e.type ||
                "touchmove" === e.type
            ) {
                var a = e.touch;
                if (void 0 === a) return;
                var s = a.pageX - (o + r.left),
                    u = a.pageY - (i + r.top),
                    l = { x: (s *= t / r.width), y: (u *= n / r.height) };
                if ("touchstart" === e.type)
                    (Browser.lastTouches[a.identifier] = l),
                        (Browser.touches[a.identifier] = l);
                else if ("touchend" === e.type || "touchmove" === e.type) {
                    var c = Browser.touches[a.identifier];
                    (c = c || l),
                        (Browser.lastTouches[a.identifier] = c),
                        (Browser.touches[a.identifier] = l);
                }
                return;
            }
            var d = e.pageX - (o + r.left),
                f = e.pageY - (i + r.top);
            (d *= t / r.width),
                (f *= n / r.height),
                (Browser.mouseMovementX = d - Browser.mouseX),
                (Browser.mouseMovementY = f - Browser.mouseY),
                (Browser.mouseX = d),
                (Browser.mouseY = f);
        }
    },
    asyncLoad: function (r, t, n, e) {
        var o = e ? "" : getUniqueRunDependency("al " + r);
        readAsync(
            r,
            function (e) {
                assert(
                    e,
                    'Loading data file "' + r + '" failed (no arrayBuffer).',
                ),
                    t(new Uint8Array(e)),
                    o && removeRunDependency(o);
            },
            function (e) {
                if (!n) throw 'Loading data file "' + r + '" failed.';
                n();
            },
        ),
            o && addRunDependency(o);
    },
    resizeListeners: [],
    updateResizeListeners: function () {
        var r = Module.canvas;
        Browser.resizeListeners.forEach(function (e) {
            e(r.width, r.height);
        });
    },
    setCanvasSize: function (e, r, t) {
        var n = Module.canvas;
        Browser.updateCanvasDimensions(n, e, r),
            t || Browser.updateResizeListeners();
    },
    windowedWidth: 0,
    windowedHeight: 0,
    setFullscreenCanvasSize: function () {
        if ("undefined" != typeof SDL) {
            var e = HEAPU32[SDL.screen >> 2];
            (e |= 8388608), (HEAP32[SDL.screen >> 2] = e);
        }
        Browser.updateCanvasDimensions(Module.canvas),
            Browser.updateResizeListeners();
    },
    setWindowedCanvasSize: function () {
        if ("undefined" != typeof SDL) {
            var e = HEAPU32[SDL.screen >> 2];
            (e &= -8388609), (HEAP32[SDL.screen >> 2] = e);
        }
        Browser.updateCanvasDimensions(Module.canvas),
            Browser.updateResizeListeners();
    },
    updateCanvasDimensions: function (e, r, t) {
        r && t
            ? ((e.widthNative = r), (e.heightNative = t))
            : ((r = e.widthNative), (t = e.heightNative));
        var n = r,
            o = t;
        if (
            (Module.forcedAspectRatio &&
                0 < Module.forcedAspectRatio &&
                (n / o < Module.forcedAspectRatio
                    ? (n = Math.round(o * Module.forcedAspectRatio))
                    : (o = Math.round(n / Module.forcedAspectRatio))),
            (document.fullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement ||
                document.webkitFullscreenElement ||
                document.webkitCurrentFullScreenElement) === e.parentNode &&
                "undefined" != typeof screen)
        ) {
            var i = Math.min(screen.width / n, screen.height / o);
            (n = Math.round(n * i)), (o = Math.round(o * i));
        }
        Browser.resizeCanvas
            ? (e.width != n && (e.width = n),
              e.height != o && (e.height = o),
              void 0 !== e.style &&
                  (e.style.removeProperty("width"),
                  e.style.removeProperty("height")))
            : (e.width != r && (e.width = r),
              e.height != t && (e.height = t),
              void 0 !== e.style &&
                  (n != r || o != t
                      ? (e.style.setProperty("width", n + "px", "important"),
                        e.style.setProperty("height", o + "px", "important"))
                      : (e.style.removeProperty("width"),
                        e.style.removeProperty("height"))));
    },
    wgetRequests: {},
    nextWgetRequestHandle: 0,
    getNextWgetRequestHandle: function () {
        var e = Browser.nextWgetRequestHandle;
        return Browser.nextWgetRequestHandle++, e;
    },
};
function _emscripten_async_call(e, r, t) {
    function n() {
        getFuncWrapper(e, "vi")(r);
    }
    (Module.noExitRuntime = !0),
        0 <= t
            ? Browser.safeSetTimeout(n, t)
            : Browser.safeRequestAnimationFrame(n);
}
function _emscripten_get_heap_size() {
    return HEAP8.length;
}
function _exit(e) {
    exit(e);
}
var ENV = {};
function _getenv(e) {
    return 0 === e
        ? 0
        : ((e = UTF8ToString(e)),
          ENV.hasOwnProperty(e)
              ? (_getenv.ret && _free(_getenv.ret),
                (_getenv.ret = allocateUTF8(ENV[e])),
                _getenv.ret)
              : 0);
}
function _llvm_stackrestore(e) {
    var r = _llvm_stacksave,
        t = r.LLVM_SAVEDSTACKS[e];
    r.LLVM_SAVEDSTACKS.splice(e, 1), stackRestore(t);
}
function _llvm_stacksave() {
    var e = _llvm_stacksave;
    return (
        e.LLVM_SAVEDSTACKS || (e.LLVM_SAVEDSTACKS = []),
        e.LLVM_SAVEDSTACKS.push(stackSave()),
        e.LLVM_SAVEDSTACKS.length - 1
    );
}
function _emscripten_memcpy_big(e, r, t) {
    HEAPU8.set(HEAPU8.subarray(r, r + t), e);
}
function _pthread_attr_init(e) {
    return 0;
}
function _pthread_attr_setstacksize() {}
function _pthread_cond_destroy() {
    return 0;
}
function _pthread_cond_signal() {
    return 0;
}
function _pthread_cond_wait() {
    return 0;
}
function _pthread_create() {
    return 11;
}
function _pthread_join() {}
function abortOnCannotGrowMemory(e) {
    abort("OOM");
}
function _emscripten_resize_heap(e) {
    abortOnCannotGrowMemory(e);
}
function __isLeapYear(e) {
    return e % 4 == 0 && (e % 100 != 0 || e % 400 == 0);
}
function __arraySum(e, r) {
    for (var t = 0, n = 0; n <= r; t += e[n++]);
    return t;
}
var __MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    __MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
function __addDays(e, r) {
    for (var t = new Date(e.getTime()); 0 < r; ) {
        var n = __isLeapYear(t.getFullYear()),
            o = t.getMonth(),
            i = (n ? __MONTH_DAYS_LEAP : __MONTH_DAYS_REGULAR)[o];
        if (!(r > i - t.getDate())) return t.setDate(t.getDate() + r), t;
        (r -= i - t.getDate() + 1),
            t.setDate(1),
            o < 11
                ? t.setMonth(o + 1)
                : (t.setMonth(0), t.setFullYear(t.getFullYear() + 1));
    }
    return t;
}
function _strftime(e, r, t, n) {
    var o = HEAP32[(n + 40) >> 2],
        i = {
            tm_sec: HEAP32[n >> 2],
            tm_min: HEAP32[(n + 4) >> 2],
            tm_hour: HEAP32[(n + 8) >> 2],
            tm_mday: HEAP32[(n + 12) >> 2],
            tm_mon: HEAP32[(n + 16) >> 2],
            tm_year: HEAP32[(n + 20) >> 2],
            tm_wday: HEAP32[(n + 24) >> 2],
            tm_yday: HEAP32[(n + 28) >> 2],
            tm_isdst: HEAP32[(n + 32) >> 2],
            tm_gmtoff: HEAP32[(n + 36) >> 2],
            tm_zone: o ? UTF8ToString(o) : "",
        },
        a = UTF8ToString(t),
        s = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y",
        };
    for (var u in s) a = a.replace(new RegExp(u, "g"), s[u]);
    var l = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ],
        c = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
    function d(e, r, t) {
        for (
            var n = "number" == typeof e ? e.toString() : e || "";
            n.length < r;
        )
            n = t[0] + n;
        return n;
    }
    function f(e, r) {
        return d(e, r, "0");
    }
    function m(e, r) {
        function t(e) {
            return e < 0 ? -1 : 0 < e ? 1 : 0;
        }
        var n;
        return (
            0 === (n = t(e.getFullYear() - r.getFullYear())) &&
                0 === (n = t(e.getMonth() - r.getMonth())) &&
                (n = t(e.getDate() - r.getDate())),
            n
        );
    }
    function p(e) {
        switch (e.getDay()) {
            case 0:
                return new Date(e.getFullYear() - 1, 11, 29);
            case 1:
                return e;
            case 2:
                return new Date(e.getFullYear(), 0, 3);
            case 3:
                return new Date(e.getFullYear(), 0, 2);
            case 4:
                return new Date(e.getFullYear(), 0, 1);
            case 5:
                return new Date(e.getFullYear() - 1, 11, 31);
            case 6:
                return new Date(e.getFullYear() - 1, 11, 30);
        }
    }
    function S(e) {
        var r = __addDays(new Date(e.tm_year + 1900, 0, 1), e.tm_yday),
            t = new Date(r.getFullYear(), 0, 4),
            n = new Date(r.getFullYear() + 1, 0, 4),
            o = p(t),
            i = p(n);
        return m(o, r) <= 0
            ? m(i, r) <= 0
                ? r.getFullYear() + 1
                : r.getFullYear()
            : r.getFullYear() - 1;
    }
    var _ = {
        "%a": function (e) {
            return l[e.tm_wday].substring(0, 3);
        },
        "%A": function (e) {
            return l[e.tm_wday];
        },
        "%b": function (e) {
            return c[e.tm_mon].substring(0, 3);
        },
        "%B": function (e) {
            return c[e.tm_mon];
        },
        "%C": function (e) {
            return f(((e.tm_year + 1900) / 100) | 0, 2);
        },
        "%d": function (e) {
            return f(e.tm_mday, 2);
        },
        "%e": function (e) {
            return d(e.tm_mday, 2, " ");
        },
        "%g": function (e) {
            return S(e).toString().substring(2);
        },
        "%G": function (e) {
            return S(e);
        },
        "%H": function (e) {
            return f(e.tm_hour, 2);
        },
        "%I": function (e) {
            var r = e.tm_hour;
            return 0 == r ? (r = 12) : 12 < r && (r -= 12), f(r, 2);
        },
        "%j": function (e) {
            return f(
                e.tm_mday +
                    __arraySum(
                        __isLeapYear(e.tm_year + 1900)
                            ? __MONTH_DAYS_LEAP
                            : __MONTH_DAYS_REGULAR,
                        e.tm_mon - 1,
                    ),
                3,
            );
        },
        "%m": function (e) {
            return f(e.tm_mon + 1, 2);
        },
        "%M": function (e) {
            return f(e.tm_min, 2);
        },
        "%n": function () {
            return "\n";
        },
        "%p": function (e) {
            return 0 <= e.tm_hour && e.tm_hour < 12 ? "AM" : "PM";
        },
        "%S": function (e) {
            return f(e.tm_sec, 2);
        },
        "%t": function () {
            return "\t";
        },
        "%u": function (e) {
            return e.tm_wday || 7;
        },
        "%U": function (e) {
            var r = new Date(e.tm_year + 1900, 0, 1),
                t = 0 === r.getDay() ? r : __addDays(r, 7 - r.getDay()),
                n = new Date(e.tm_year + 1900, e.tm_mon, e.tm_mday);
            if (m(t, n) < 0) {
                var o =
                        __arraySum(
                            __isLeapYear(n.getFullYear())
                                ? __MONTH_DAYS_LEAP
                                : __MONTH_DAYS_REGULAR,
                            n.getMonth() - 1,
                        ) - 31,
                    i = 31 - t.getDate() + o + n.getDate();
                return f(Math.ceil(i / 7), 2);
            }
            return 0 === m(t, r) ? "01" : "00";
        },
        "%V": function (e) {
            var r,
                t = new Date(e.tm_year + 1900, 0, 4),
                n = new Date(e.tm_year + 1901, 0, 4),
                o = p(t),
                i = p(n),
                a = __addDays(new Date(e.tm_year + 1900, 0, 1), e.tm_yday);
            return m(a, o) < 0
                ? "53"
                : m(i, a) <= 0
                  ? "01"
                  : ((r =
                        o.getFullYear() < e.tm_year + 1900
                            ? e.tm_yday + 32 - o.getDate()
                            : e.tm_yday + 1 - o.getDate()),
                    f(Math.ceil(r / 7), 2));
        },
        "%w": function (e) {
            return e.tm_wday;
        },
        "%W": function (e) {
            var r = new Date(e.tm_year, 0, 1),
                t =
                    1 === r.getDay()
                        ? r
                        : __addDays(
                              r,
                              0 === r.getDay() ? 1 : 7 - r.getDay() + 1,
                          ),
                n = new Date(e.tm_year + 1900, e.tm_mon, e.tm_mday);
            if (m(t, n) < 0) {
                var o =
                        __arraySum(
                            __isLeapYear(n.getFullYear())
                                ? __MONTH_DAYS_LEAP
                                : __MONTH_DAYS_REGULAR,
                            n.getMonth() - 1,
                        ) - 31,
                    i = 31 - t.getDate() + o + n.getDate();
                return f(Math.ceil(i / 7), 2);
            }
            return 0 === m(t, r) ? "01" : "00";
        },
        "%y": function (e) {
            return (e.tm_year + 1900).toString().substring(2);
        },
        "%Y": function (e) {
            return e.tm_year + 1900;
        },
        "%z": function (e) {
            var r = e.tm_gmtoff,
                t = 0 <= r;
            return (
                (r = ((r = Math.abs(r) / 60) / 60) * 100 + (r % 60)),
                (t ? "+" : "-") + String("0000" + r).slice(-4)
            );
        },
        "%Z": function (e) {
            return e.tm_zone;
        },
        "%%": function () {
            return "%";
        },
    };
    for (var u in _)
        0 <= a.indexOf(u) && (a = a.replace(new RegExp(u, "g"), _[u](i)));
    var F = intArrayFromString(a, !1);
    return F.length > r ? 0 : (writeArrayToMemory(F, e), F.length - 1);
}
function _strftime_l(e, r, t, n) {
    return _strftime(e, r, t, n);
}
if ((FS.staticInit(), ENVIRONMENT_HAS_NODE)) {
    var fs = require("fs"),
        NODEJS_PATH = require("path");
    NODEFS.staticInit();
}
function intArrayFromString(e, r, t) {
    var n = 0 < t ? t : lengthBytesUTF8(e) + 1,
        o = new Array(n),
        i = stringToUTF8Array(e, o, 0, o.length);
    return r && (o.length = i), o;
}
(_emscripten_get_now = ENVIRONMENT_IS_NODE
    ? function () {
          var e = process.hrtime();
          return 1e3 * e[0] + e[1] / 1e6;
      }
    : "undefined" != typeof dateNow
      ? dateNow
      : "object" == typeof performance &&
          performance &&
          "function" == typeof performance.now
        ? function () {
              return performance.now();
          }
        : Date.now),
    (Module.requestFullScreen = function (e, r, t) {
        err(
            "Module.requestFullScreen is deprecated. Please call Module.requestFullscreen instead.",
        ),
            (Module.requestFullScreen = Module.requestFullscreen),
            Browser.requestFullScreen(e, r, t);
    }),
    (Module.requestFullscreen = function (e, r, t) {
        Browser.requestFullscreen(e, r, t);
    }),
    (Module.requestAnimationFrame = function (e) {
        Browser.requestAnimationFrame(e);
    }),
    (Module.setCanvasSize = function (e, r, t) {
        Browser.setCanvasSize(e, r, t);
    }),
    (Module.pauseMainLoop = function () {
        Browser.mainLoop.pause();
    }),
    (Module.resumeMainLoop = function () {
        Browser.mainLoop.resume();
    }),
    (Module.getUserMedia = function () {
        Browser.getUserMedia();
    }),
    (Module.createContext = function (e, r, t, n) {
        return Browser.createContext(e, r, t, n);
    });
var asmGlobalArg = {},
    asmLibraryArg = {
        c: abort,
        r: setTempRet0,
        x: getTempRet0,
        w: ___atomic_fetch_add_8,
        e: ___cxa_allocate_exception,
        d: ___cxa_throw,
        v: ___cxa_uncaught_exceptions,
        i: ___lock,
        u: ___map_file,
        l: ___setErrNo,
        t: ___syscall140,
        s: ___syscall145,
        q: ___syscall146,
        p: ___syscall221,
        M: ___syscall5,
        o: ___syscall54,
        n: ___syscall6,
        L: ___syscall91,
        h: ___unlock,
        b: _abort,
        K: _clock_gettime,
        k: _emscripten_async_call,
        J: _emscripten_get_heap_size,
        I: _emscripten_memcpy_big,
        H: _emscripten_resize_heap,
        G: _exit,
        j: _getenv,
        g: _llvm_stackrestore,
        f: _llvm_stacksave,
        F: _pthread_attr_init,
        E: _pthread_attr_setstacksize,
        D: _pthread_cond_destroy,
        C: _pthread_cond_signal,
        m: _pthread_cond_wait,
        B: _pthread_create,
        A: _pthread_join,
        z: _strftime_l,
        y: abortOnCannotGrowMemory,
        a: DYNAMICTOP_PTR,
    },
    asm = Module.asm(asmGlobalArg, asmLibraryArg, buffer);
Module.asm = asm;
var __ZSt18uncaught_exceptionv = (Module.__ZSt18uncaught_exceptionv =
        function () {
            return Module.asm.N.apply(null, arguments);
        }),
    ___errno_location = (Module.___errno_location = function () {
        return Module.asm.O.apply(null, arguments);
    }),
    _free = (Module._free = function () {
        return Module.asm.P.apply(null, arguments);
    }),
    _i64Add = (Module._i64Add = function () {
        return Module.asm.Q.apply(null, arguments);
    }),
    _main = (Module._main = function () {
        return Module.asm.R.apply(null, arguments);
    }),
    _malloc = (Module._malloc = function () {
        return Module.asm.S.apply(null, arguments);
    }),
    _uci_command = (Module._uci_command = function () {
        return Module.asm.T.apply(null, arguments);
    }),
    globalCtors = (Module.globalCtors = function () {
        return Module.asm.ma.apply(null, arguments);
    }),
    stackAlloc = (Module.stackAlloc = function () {
        return Module.asm.na.apply(null, arguments);
    }),
    stackRestore = (Module.stackRestore = function () {
        return Module.asm.oa.apply(null, arguments);
    }),
    stackSave = (Module.stackSave = function () {
        return Module.asm.pa.apply(null, arguments);
    }),
    dynCall_ii = (Module.dynCall_ii = function () {
        return Module.asm.U.apply(null, arguments);
    }),
    dynCall_iii = (Module.dynCall_iii = function () {
        return Module.asm.V.apply(null, arguments);
    }),
    dynCall_iiii = (Module.dynCall_iiii = function () {
        return Module.asm.W.apply(null, arguments);
    }),
    dynCall_iiiii = (Module.dynCall_iiiii = function () {
        return Module.asm.X.apply(null, arguments);
    }),
    dynCall_iiiiid = (Module.dynCall_iiiiid = function () {
        return Module.asm.Y.apply(null, arguments);
    }),
    dynCall_iiiiii = (Module.dynCall_iiiiii = function () {
        return Module.asm.Z.apply(null, arguments);
    }),
    dynCall_iiiiiid = (Module.dynCall_iiiiiid = function () {
        return Module.asm._.apply(null, arguments);
    }),
    dynCall_iiiiiii = (Module.dynCall_iiiiiii = function () {
        return Module.asm.$.apply(null, arguments);
    }),
    dynCall_iiiiiiii = (Module.dynCall_iiiiiiii = function () {
        return Module.asm.aa.apply(null, arguments);
    }),
    dynCall_iiiiiiiii = (Module.dynCall_iiiiiiiii = function () {
        return Module.asm.ba.apply(null, arguments);
    }),
    dynCall_iiiiij = (Module.dynCall_iiiiij = function () {
        return Module.asm.ca.apply(null, arguments);
    }),
    dynCall_jiji = (Module.dynCall_jiji = function () {
        return Module.asm.da.apply(null, arguments);
    }),
    dynCall_v = (Module.dynCall_v = function () {
        return Module.asm.ea.apply(null, arguments);
    }),
    dynCall_vi = (Module.dynCall_vi = function () {
        return Module.asm.fa.apply(null, arguments);
    }),
    dynCall_vii = (Module.dynCall_vii = function () {
        return Module.asm.ga.apply(null, arguments);
    }),
    dynCall_viii = (Module.dynCall_viii = function () {
        return Module.asm.ha.apply(null, arguments);
    }),
    dynCall_viiii = (Module.dynCall_viiii = function () {
        return Module.asm.ia.apply(null, arguments);
    }),
    dynCall_viiiii = (Module.dynCall_viiiii = function () {
        return Module.asm.ja.apply(null, arguments);
    }),
    dynCall_viiiiii = (Module.dynCall_viiiiii = function () {
        return Module.asm.ka.apply(null, arguments);
    }),
    dynCall_viijii = (Module.dynCall_viijii = function () {
        return Module.asm.la.apply(null, arguments);
    });
function ExitStatus(e) {
    (this.name = "ExitStatus"),
        (this.message = "Program terminated with exit(" + e + ")"),
        (this.status = e);
}
(Module.asm = asm), (Module.ccall = ccall);
var calledMain = !1;
function callMain(e) {
    var r = (e = e || []).length + 1,
        t = stackAlloc(4 * (r + 1));
    HEAP32[t >> 2] = allocateUTF8OnStack(thisProgram);
    for (var n = 1; n < r; n++)
        HEAP32[(t >> 2) + n] = allocateUTF8OnStack(e[n - 1]);
    HEAP32[(t >> 2) + r] = 0;
    try {
        exit(Module._main(r, t), !0);
    } catch (e) {
        if (e instanceof ExitStatus) return;
        if ("SimulateInfiniteLoop" == e)
            return void (Module.noExitRuntime = !0);
        var o = e;
        e && "object" == typeof e && e.stack && (o = [e, e.stack]),
            err("exception thrown: " + o),
            quit_(1, e);
    } finally {
        calledMain = !0;
    }
}
function run(e) {
    function r() {
        Module.calledRun ||
            ((Module.calledRun = !0),
            ABORT ||
                (initRuntime(),
                preMain(),
                Module.onRuntimeInitialized && Module.onRuntimeInitialized(),
                shouldRunNow && callMain(e),
                postRun()));
    }
    (e = e || arguments_),
        0 < runDependencies ||
            (preRun(),
            0 < runDependencies ||
                Module.calledRun ||
                (Module.setStatus
                    ? (Module.setStatus("Running..."),
                      setTimeout(function () {
                          setTimeout(function () {
                              Module.setStatus("");
                          }, 1),
                              r();
                      }, 1))
                    : r()));
}
function exit(e, r) {
    (r && Module.noExitRuntime && 0 === e) ||
        (Module.noExitRuntime ||
            ((ABORT = !0),
            (EXITSTATUS = e),
            exitRuntime(),
            Module.onExit && Module.onExit(e)),
        quit_(e, new ExitStatus(e)));
}
function abort(e) {
    throw (
        (Module.onAbort && Module.onAbort(e),
        out((e += "")),
        err(e),
        (ABORT = !0),
        (EXITSTATUS = 1),
        "abort(" + e + "). Build with -s ASSERTIONS=1 for more info.")
    );
}
if (
    ((dependenciesFulfilled = function e() {
        Module.calledRun || run(),
            Module.calledRun || (dependenciesFulfilled = e);
    }),
    (Module.run = run),
    (Module.abort = abort),
    Module.preInit)
)
    for (
        "function" == typeof Module.preInit &&
        (Module.preInit = [Module.preInit]);
        0 < Module.preInit.length;
    )
        Module.preInit.pop()();
var shouldRunNow = !0;
Module.noInitialRun && (shouldRunNow = !1), (Module.noExitRuntime = !0), run();
