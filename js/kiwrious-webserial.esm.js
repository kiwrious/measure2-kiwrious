// Kiwrious WebSerial SDK - ESM Build
// Version: 2.0.0

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/jsfft/dist/complex_array.js
var require_complex_array = __commonJS({
  "node_modules/jsfft/dist/complex_array.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _createClass = /* @__PURE__ */ function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      __name(defineProperties, "defineProperties");
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    __name(_classCallCheck, "_classCallCheck");
    var ComplexArray = function() {
      function ComplexArray2(other) {
        var arrayType = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : Float32Array;
        _classCallCheck(this, ComplexArray2);
        if (other instanceof ComplexArray2) {
          this.ArrayType = other.ArrayType;
          this.real = new this.ArrayType(other.real);
          this.imag = new this.ArrayType(other.imag);
        } else {
          this.ArrayType = arrayType;
          this.real = new this.ArrayType(other);
          this.imag = new this.ArrayType(this.real.length);
        }
        this.length = this.real.length;
      }
      __name(ComplexArray2, "ComplexArray");
      _createClass(ComplexArray2, [{
        key: "toString",
        value: /* @__PURE__ */ __name(function toString() {
          var components = [];
          this.forEach(function(value, i) {
            components.push("(" + value.real.toFixed(2) + ", " + value.imag.toFixed(2) + ")");
          });
          return "[" + components.join(", ") + "]";
        }, "toString")
      }, {
        key: "forEach",
        value: /* @__PURE__ */ __name(function forEach(iterator) {
          var n = this.length;
          var value = Object.seal(Object.defineProperties({}, {
            real: { writable: true },
            imag: { writable: true }
          }));
          for (var i = 0; i < n; i++) {
            value.real = this.real[i];
            value.imag = this.imag[i];
            iterator(value, i, n);
          }
        }, "forEach")
        // In-place mapper.
      }, {
        key: "map",
        value: /* @__PURE__ */ __name(function map(mapper) {
          var _this = this;
          this.forEach(function(value, i, n) {
            mapper(value, i, n);
            _this.real[i] = value.real;
            _this.imag[i] = value.imag;
          });
          return this;
        }, "map")
      }, {
        key: "conjugate",
        value: /* @__PURE__ */ __name(function conjugate() {
          return new ComplexArray2(this).map(function(value) {
            value.imag *= -1;
          });
        }, "conjugate")
      }, {
        key: "magnitude",
        value: /* @__PURE__ */ __name(function magnitude() {
          var mags = new this.ArrayType(this.length);
          this.forEach(function(value, i) {
            mags[i] = Math.sqrt(value.real * value.real + value.imag * value.imag);
          });
          return mags;
        }, "magnitude")
      }]);
      return ComplexArray2;
    }();
    exports.default = ComplexArray;
  }
});

// node_modules/jsfft/dist/fft.js
var require_fft = __commonJS({
  "node_modules/jsfft/dist/fft.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.ComplexArray = void 0;
    var _createClass = /* @__PURE__ */ function() {
      function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      __name(defineProperties, "defineProperties");
      return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      };
    }();
    exports.FFT = FFT;
    exports.InvFFT = InvFFT;
    exports.frequencyMap = frequencyMap;
    var _complex_array = require_complex_array();
    var _complex_array2 = _interopRequireDefault(_complex_array);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    __name(_interopRequireDefault, "_interopRequireDefault");
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    __name(_classCallCheck, "_classCallCheck");
    function _possibleConstructorReturn(self, call) {
      if (!self) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }
    __name(_possibleConstructorReturn, "_possibleConstructorReturn");
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
      }
      subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });
      if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }
    __name(_inherits, "_inherits");
    var PI = Math.PI;
    var SQRT1_2 = Math.SQRT1_2;
    function FFT(input) {
      return ensureComplexArray(input).FFT();
    }
    __name(FFT, "FFT");
    function InvFFT(input) {
      return ensureComplexArray(input).InvFFT();
    }
    __name(InvFFT, "InvFFT");
    function frequencyMap(input, filterer) {
      return ensureComplexArray(input).frequencyMap(filterer);
    }
    __name(frequencyMap, "frequencyMap");
    var ComplexArray = exports.ComplexArray = function(_baseComplexArray) {
      _inherits(ComplexArray2, _baseComplexArray);
      function ComplexArray2() {
        _classCallCheck(this, ComplexArray2);
        return _possibleConstructorReturn(this, (ComplexArray2.__proto__ || Object.getPrototypeOf(ComplexArray2)).apply(this, arguments));
      }
      __name(ComplexArray2, "ComplexArray");
      _createClass(ComplexArray2, [{
        key: "FFT",
        value: /* @__PURE__ */ __name(function FFT2() {
          return fft2(this, false);
        }, "FFT")
      }, {
        key: "InvFFT",
        value: /* @__PURE__ */ __name(function InvFFT2() {
          return fft2(this, true);
        }, "InvFFT")
        // Applies a frequency-space filter to input, and returns the real-space
        // filtered input.
        // filterer accepts freq, i, n and modifies freq.real and freq.imag.
      }, {
        key: "frequencyMap",
        value: /* @__PURE__ */ __name(function frequencyMap2(filterer) {
          return this.FFT().map(filterer).InvFFT();
        }, "frequencyMap")
      }]);
      return ComplexArray2;
    }(_complex_array2.default);
    function ensureComplexArray(input) {
      return input instanceof ComplexArray && input || new ComplexArray(input);
    }
    __name(ensureComplexArray, "ensureComplexArray");
    function fft2(input, inverse) {
      var n = input.length;
      if (n & n - 1) {
        return FFT_Recursive(input, inverse);
      } else {
        return FFT_2_Iterative(input, inverse);
      }
    }
    __name(fft2, "fft");
    function FFT_Recursive(input, inverse) {
      var n = input.length;
      if (n === 1) {
        return input;
      }
      var output = new ComplexArray(n, input.ArrayType);
      var p = LowestOddFactor(n);
      var m = n / p;
      var normalisation = 1 / Math.sqrt(p);
      var recursive_result = new ComplexArray(m, input.ArrayType);
      for (var j = 0; j < p; j++) {
        for (var i = 0; i < m; i++) {
          recursive_result.real[i] = input.real[i * p + j];
          recursive_result.imag[i] = input.imag[i * p + j];
        }
        if (m > 1) {
          recursive_result = fft2(recursive_result, inverse);
        }
        var del_f_r = Math.cos(2 * PI * j / n);
        var del_f_i = (inverse ? -1 : 1) * Math.sin(2 * PI * j / n);
        var f_r = 1;
        var f_i = 0;
        for (var _i = 0; _i < n; _i++) {
          var _real = recursive_result.real[_i % m];
          var _imag = recursive_result.imag[_i % m];
          output.real[_i] += f_r * _real - f_i * _imag;
          output.imag[_i] += f_r * _imag + f_i * _real;
          var _ref = [f_r * del_f_r - f_i * del_f_i, f_i = f_r * del_f_i + f_i * del_f_r];
          f_r = _ref[0];
          f_i = _ref[1];
        }
      }
      for (var _i2 = 0; _i2 < n; _i2++) {
        input.real[_i2] = normalisation * output.real[_i2];
        input.imag[_i2] = normalisation * output.imag[_i2];
      }
      return input;
    }
    __name(FFT_Recursive, "FFT_Recursive");
    function FFT_2_Iterative(input, inverse) {
      var n = input.length;
      var output = BitReverseComplexArray(input);
      var output_r = output.real;
      var output_i = output.imag;
      var width = 1;
      while (width < n) {
        var del_f_r = Math.cos(PI / width);
        var del_f_i = (inverse ? -1 : 1) * Math.sin(PI / width);
        for (var i = 0; i < n / (2 * width); i++) {
          var f_r = 1;
          var f_i = 0;
          for (var j = 0; j < width; j++) {
            var l_index = 2 * i * width + j;
            var r_index = l_index + width;
            var left_r = output_r[l_index];
            var left_i = output_i[l_index];
            var right_r = f_r * output_r[r_index] - f_i * output_i[r_index];
            var right_i = f_i * output_r[r_index] + f_r * output_i[r_index];
            output_r[l_index] = SQRT1_2 * (left_r + right_r);
            output_i[l_index] = SQRT1_2 * (left_i + right_i);
            output_r[r_index] = SQRT1_2 * (left_r - right_r);
            output_i[r_index] = SQRT1_2 * (left_i - right_i);
            var _ref2 = [f_r * del_f_r - f_i * del_f_i, f_r * del_f_i + f_i * del_f_r];
            f_r = _ref2[0];
            f_i = _ref2[1];
          }
        }
        width <<= 1;
      }
      return output;
    }
    __name(FFT_2_Iterative, "FFT_2_Iterative");
    function BitReverseIndex(index, n) {
      var bitreversed_index = 0;
      while (n > 1) {
        bitreversed_index <<= 1;
        bitreversed_index += index & 1;
        index >>= 1;
        n >>= 1;
      }
      return bitreversed_index;
    }
    __name(BitReverseIndex, "BitReverseIndex");
    function BitReverseComplexArray(array) {
      var n = array.length;
      var flips = /* @__PURE__ */ new Set();
      for (var i = 0; i < n; i++) {
        var r_i = BitReverseIndex(i, n);
        if (flips.has(i)) continue;
        var _ref3 = [array.real[r_i], array.real[i]];
        array.real[i] = _ref3[0];
        array.real[r_i] = _ref3[1];
        var _ref4 = [array.imag[r_i], array.imag[i]];
        array.imag[i] = _ref4[0];
        array.imag[r_i] = _ref4[1];
        flips.add(r_i);
      }
      return array;
    }
    __name(BitReverseComplexArray, "BitReverseComplexArray");
    function LowestOddFactor(n) {
      var sqrt_n = Math.sqrt(n);
      var factor = 3;
      while (factor <= sqrt_n) {
        if (n % factor === 0) return factor;
        factor += 2;
      }
      return n;
    }
    __name(LowestOddFactor, "LowestOddFactor");
  }
});

// src/service/SerialHexValue.ts
var _SerialHexValue = class _SerialHexValue {
  constructor(rawHexValue) {
    this.rawHexValue = rawHexValue;
  }
  toFloat() {
    const raw = Number(this.rawHexValue);
    const s = raw & 2147483648 ? -1 : 1;
    const e = (raw >> 23 & 255) - 127;
    const c = 1 + (raw & 8388607) / 8388607;
    return s * c * Math.pow(2, e);
  }
  toInt() {
    return Number(parseInt(this.rawHexValue).toFixed());
  }
  divideByHundred() {
    return Number((parseInt(this.rawHexValue) / 100).toFixed());
  }
};
__name(_SerialHexValue, "SerialHexValue");
var SerialHexValue = _SerialHexValue;
var _SerialNumberValue = class _SerialNumberValue {
  constructor(value) {
    this._raw = value;
  }
  get value() {
    return this._raw;
  }
  toInt() {
    return Number(this._raw.toFixed());
  }
  divideByHundred() {
    return Number((this._raw / 100).toFixed());
  }
};
__name(_SerialNumberValue, "SerialNumberValue");
var SerialNumberValue = _SerialNumberValue;

// src/service/SerialRawValue.ts
var SENSOR_TYPE = {
  UNKNOWN: "UNKNOWN",
  UV: "UV",
  UV2: "UV2",
  HUMIDITY: "HUMIDITY",
  VOC: "VOC",
  CONDUCTIVITY: "CONDUCTIVITY",
  HEART_RATE: "HEART_RATE",
  HEART_RATE2: "HEART_RATE2",
  TEMPERATURE: "TEMPERATURE",
  TEMPERATURE2: "TEMPERATURE2"
  // TODO: other sensor types
};
var SENSOR_VALUE = {
  UNKNOWN: "UNKNOWN",
  UV_INDEX: "Uv",
  LUX: "Lux",
  HUMIDITY: "Hum",
  TEMPERATURE: "Temp",
  VOC: "Voc",
  CONDUCTIVITY: "Con",
  HEART_RATE: "HeartRate",
  INFRARED_TEMPERATURE: "InfraredTemp",
  AMBIENT_TEMPERATURE: "AmbientTemp"
};
var LATEST_SENSOR_VERSION = /* @__PURE__ */ new Map([
  ["UV", 2],
  ["HUMIDITY", void 0],
  ["VOC", void 0],
  ["CONDUCTIVITY", void 0],
  ["HEART_RATE", 2],
  ["TEMPERATURE", 2]
]);
var _SerialRawValue = class _SerialRawValue {
  constructor(rawValue) {
    this.rawValue = rawValue;
    this.dataView = new DataView(rawValue.buffer);
    if (!this.isValidLength) {
      throw new Error(`invalid array length. expected [] but got [${rawValue.length}]`);
    }
  }
  get isValidLength() {
    return this.rawValue.length === 26;
  }
  get sensorTypeRaw() {
    return this.rawValue[2];
  }
  get header2Bytes() {
    return this.getTwoBytesByIndex(0);
  }
  get sequence2Bytes() {
    return this.getTwoBytesByIndex(22);
  }
  get footer2Bytes() {
    return this.getTwoBytesByIndex(24);
  }
  get decoderType() {
    switch (this.sensorTypeRaw) {
      case 1:
        return SENSOR_TYPE.UV;
      case 2:
        return SENSOR_TYPE.TEMPERATURE;
      case 4:
        return SENSOR_TYPE.CONDUCTIVITY;
      case 5:
        return SENSOR_TYPE.HEART_RATE;
      case 6:
        return SENSOR_TYPE.VOC;
      case 7:
        return SENSOR_TYPE.HUMIDITY;
      case 9:
        return SENSOR_TYPE.TEMPERATURE2;
      // updated firmware sensor
      case 10:
        return SENSOR_TYPE.HEART_RATE2;
      case 11:
        return SENSOR_TYPE.UV2;
      // TODO OTHER SENSORS
      default:
        throw new Error(`invalid sensor type ${this.sensorTypeRaw}`);
    }
  }
  get isFirmwareOutdated() {
    const regex = /\d$/gm;
    let currentSensorVersion = this.decoderType.match(regex)?.toString();
    return currentSensorVersion != LATEST_SENSOR_VERSION.get(this.sensorType);
  }
  get sensorType() {
    const regex = /\d$/gm;
    const sensorName = this.decoderType.replace(regex, "");
    return sensorName;
  }
  // For humidity and temp sensor
  getTwoBytesSignedByIndex(index) {
    const value = this.dataView.getInt16(index, true);
    return value;
  }
  getTwoBytesUnsignedByIndex(index) {
    const value = this.dataView.getUint16(index, true);
    return value;
  }
  getTwoBytesByIndex(index) {
    const value = this.dataView.getUint16(index, true);
    return value;
  }
  getFourBytesByIndex(index) {
    const value = this.dataView.getUint32(index, true);
    return value;
  }
  getFourBytesFloatByIndex(index) {
    const value = this.dataView.getFloat32(index, true);
    return value;
  }
  sliceBytes(index, numberOfBytes) {
    if (index + numberOfBytes > this.rawValue.length) {
      throw new Error(`invalid index [${index}] for array length [${this.rawValue.length}]`);
    }
    const sliced = this.rawValue.slice(index, index + numberOfBytes);
    return sliced;
  }
  getByteByIndex(index) {
    if (index >= this.rawValue.length) {
      throw new Error(`invalid index [${index}] for array length [${this.rawValue.length}]`);
    }
    const value = this.rawValue[index];
    return value;
  }
  getHexDigitByIndex(index) {
    if (index >= this.rawValue.length) {
      throw new Error(`invalid index [${index}] for array length [${this.rawValue.length}]`);
    }
    const value16 = this.rawValue[index].toString(16).padStart(2, "0");
    return value16;
  }
  // obsolete, use getTwoBytesByIndex() istead
  // TODO: refactor to use getTwoBytesByIndex()
  getHexString2(index0, index1) {
    const data0_a = this.getHexDigitByIndex(index0);
    const data0_b = this.getHexDigitByIndex(index1);
    const data0 = `0x${data0_a}${data0_b}`;
    return new SerialHexValue(data0);
  }
  // obsolete, use getFourBytesByIndex() istead
  // TODO: refactor to use getFourBytesByIndex()
  getHexString4(index0, index1, index2, index3) {
    const data0_a = this.getHexDigitByIndex(index0);
    const data0_b = this.getHexDigitByIndex(index1);
    const data0_c = this.getHexDigitByIndex(index2);
    const data0_d = this.getHexDigitByIndex(index3);
    const data0 = `0x${data0_a}${data0_b}${data0_c}${data0_d}`;
    return new SerialHexValue(data0);
  }
};
__name(_SerialRawValue, "SerialRawValue");
var SerialRawValue = _SerialRawValue;

// src/service/SerialUtil.ts
var _SerialUtil = class _SerialUtil {
  static concatArray(a, b) {
    const c = new Uint8Array(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
  }
  static concatMultiArrays(arrays) {
    const totalLen = arrays.reduce((a, c) => {
      return a + c.length;
    }, 0);
    const result = new Uint8Array(totalLen);
    arrays.reduce((a, c) => {
      result.set(c, a);
      return a + c.length;
    }, 0);
    return result;
  }
};
__name(_SerialUtil, "SerialUtil");
var SerialUtil = _SerialUtil;

// src/service/SerialReader.ts
var EXPECTED_ARRAY_SIZE = 26;
var _SerialReader = class _SerialReader {
  constructor(reader) {
    this._reader = reader;
    this._array = new Uint8Array();
  }
  _log(...msg) {
    console.log("|SerialReader|", ...msg);
  }
  _err(...msg) {
    console.error("|SerialReader|", ...msg);
  }
  async _read() {
    if (this._array.length >= EXPECTED_ARRAY_SIZE) {
      const spliced = this._array.subarray(0, EXPECTED_ARRAY_SIZE);
      this._array = this._array.subarray(EXPECTED_ARRAY_SIZE);
      return new SerialRawValue(spliced);
    }
    if (!this._reader) {
      this._err("readLoop - no reader. returning");
      throw new Error("no reader");
    }
    const readInstance = await this._reader.read();
    const { value, done } = readInstance;
    if (done) {
      throw new Error("reader done");
    }
    if (value.length === EXPECTED_ARRAY_SIZE) {
      this._array = new Uint8Array();
      return new SerialRawValue(value.subarray(0));
    }
    this._array = SerialUtil.concatArray(this._array, value);
    return await this.readOnce();
  }
  async readMultiple(numberToRead = 10) {
    const array = [];
    while (array.length < numberToRead) {
      const value = await this._read();
      array.push(value);
    }
    return array;
  }
  async readOnce() {
    const value = await this._read();
    if (value) {
    }
    return value;
  }
};
__name(_SerialReader, "SerialReader");
var SerialReader = _SerialReader;

// src/service/SerialDecoder.ts
var _SerialDecoder = class _SerialDecoder {
  constructor() {
  }
  _log(...msg) {
    console.log("|SerialDecoder|", ...msg);
  }
  _err(...msg) {
    console.error("|SerialDecoder|", ...msg);
  }
};
__name(_SerialDecoder, "SerialDecoder");
var SerialDecoder = _SerialDecoder;

// src/decoder/SerialHumidityDecoder.ts
var _HumiditySerialDecoder = class _HumiditySerialDecoder extends SerialDecoder {
  constructor() {
    super();
  }
  _log(...msg) {
    console.log("|HumiditySerialDecoder|", ...msg);
  }
  async decode(rawValues) {
    if (!rawValues.length) {
      throw new Error("invlalid input. expected 1 value at least");
    }
    const rawValue = rawValues[0];
    if (!rawValue.isValidLength) {
      this._log(`invalid length ${rawValue.rawValue.length}. skipping..`);
      return null;
    }
    const data0f = new SerialNumberValue(rawValue.getTwoBytesSignedByIndex(6)).divideByHundred();
    const data1f = new SerialNumberValue(rawValue.getTwoBytesSignedByIndex(8)).divideByHundred();
    const value0 = { label: SENSOR_VALUE.TEMPERATURE, value: data0f, type: "number" };
    const value1 = { label: SENSOR_VALUE.HUMIDITY, value: data1f, type: "number" };
    const result = {
      sensorType: rawValue.sensorType,
      decodedValues: [value0, value1]
    };
    return result;
  }
};
__name(_HumiditySerialDecoder, "HumiditySerialDecoder");
var HumiditySerialDecoder = _HumiditySerialDecoder;

// src/decoder/SerialUVDecoder.ts
var _UVSerialDecoder = class _UVSerialDecoder extends SerialDecoder {
  constructor() {
    super();
  }
  _log(...msg) {
    console.log("|UVSerialDecoder|", ...msg);
  }
  async decode(rawValues) {
    if (!rawValues.length) {
      throw new Error("invlalid input. expected 1 value at least");
    }
    const rawValue = rawValues[0];
    const data0f = rawValue.getFourBytesFloatByIndex(6).toFixed(0);
    const data1f = rawValue.getFourBytesFloatByIndex(10).toFixed(1);
    const value0 = { label: SENSOR_VALUE.LUX, value: data0f, type: "number" };
    const value1 = { label: SENSOR_VALUE.UV_INDEX, value: data1f, type: "number" };
    const result = {
      sensorType: rawValue.sensorType,
      decodedValues: [value0, value1]
    };
    return result;
  }
};
__name(_UVSerialDecoder, "UVSerialDecoder");
var UVSerialDecoder = _UVSerialDecoder;

// src/decoder/SerialVOCDecoder.ts
var MAX_MS_WAIT_FOR_DATA_READY = 2e4;
var INTERVAL_MS = 1e3;
var MAX_PERCENTAGE = 100;
var _VOCSerialDecoder = class _VOCSerialDecoder extends SerialDecoder {
  constructor() {
    super();
    this._hasStartedWaitingForData = false;
    this._dataReadyPercentage = 0;
    this._incrementPercentage = INTERVAL_MS * MAX_PERCENTAGE / MAX_MS_WAIT_FOR_DATA_READY;
  }
  async decode(rawValues) {
    if (!rawValues.length) {
      throw new Error("invlalid input. expected 1 value at least");
    }
    const rawValue = rawValues[0];
    if (!rawValue.isValidLength) {
      this._log(`invalid length ${rawValue.rawValue.length}. skipping..`);
      return null;
    }
    if (!this._hasStartedWaitingForData) {
      this.startIntervalForDataReady();
    }
    const data0f = rawValue.getTwoBytesByIndex(6);
    if (data0f > 0) {
      this.clearIntervalIfRunning();
    }
    const data = {
      status: this._dataReadyPercentage !== MAX_PERCENTAGE ? VOC_RESULT_STATUS.PROCESSING : VOC_RESULT_STATUS.READY,
      dataReadyPercentage: this._dataReadyPercentage,
      value: data0f
    };
    const value0 = { label: SENSOR_VALUE.VOC, value: data, type: "object" };
    const result = {
      sensorType: rawValue.sensorType,
      decodedValues: [value0]
    };
    return result;
  }
  clearIntervalIfRunning() {
    if (!this._dataReadyIntervalId) {
      return;
    }
    this._log("clearIntervalIfRunning");
    clearInterval(this._dataReadyIntervalId);
    this._dataReadyIntervalId = void 0;
    this._dataReadyPercentage = MAX_PERCENTAGE;
  }
  startIntervalForDataReady() {
    this._log("start interval for data ready..");
    this.runOneInterval();
    this._dataReadyIntervalId = setInterval(() => {
      this.runOneInterval();
    }, INTERVAL_MS);
    this._hasStartedWaitingForData = true;
  }
  runOneInterval() {
    if (this._dataReadyPercentage >= MAX_PERCENTAGE) {
      this.clearIntervalIfRunning();
      return;
    }
    this._dataReadyPercentage += this._incrementPercentage;
  }
};
__name(_VOCSerialDecoder, "VOCSerialDecoder");
var VOCSerialDecoder = _VOCSerialDecoder;
var VOC_RESULT_STATUS = {
  PROCESSING: "PROCESSING",
  READY: "READY"
};

// src/decoder/SerialConductivityDecoder.ts
var CONDUCTIVITY_RESULT_STATUS = {
  MAX: "MAX",
  MIN: "MIN",
  READY: "READY"
};
var MAX_CONDUCTANCE_VALUE = 2e5;
var MIN_CONDUCTANCE_VALUE = 65535;
var _ConductivitySerialDecoder = class _ConductivitySerialDecoder extends SerialDecoder {
  constructor() {
    super();
  }
  _log(...msg) {
    console.log("|ConductivitySerialDecoder|", ...msg);
  }
  async decode(rawValues) {
    if (!rawValues.length) {
      throw new Error("invlalid input. expected 1 value at least");
    }
    const rawValue = rawValues[0];
    if (!rawValue.isValidLength) {
      this._log(`invalid length ${rawValue.rawValue.length}. skipping..`);
      return null;
    }
    const data0f = rawValue.getTwoBytesByIndex(6);
    const data1f = rawValue.getTwoBytesByIndex(8);
    const conductivity = _ConductivitySerialDecoder.calculateConductivity(data0f, data1f);
    const value0 = { label: SENSOR_VALUE.CONDUCTIVITY, value: conductivity, type: "object" };
    const result = {
      sensorType: rawValue.sensorType,
      decodedValues: [value0]
    };
    return result;
  }
  static calculateConductivity(data0, data1) {
    if (data0 >= MIN_CONDUCTANCE_VALUE) {
      const result2 = {
        value: 0,
        status: CONDUCTIVITY_RESULT_STATUS.MIN
      };
      return result2;
    }
    const conductivity = Number((1 / (data0 * data1) * Math.pow(10, 6)).toFixed(1));
    if (conductivity > MAX_CONDUCTANCE_VALUE) {
      const result2 = {
        value: "MAX",
        status: CONDUCTIVITY_RESULT_STATUS.MAX
      };
      return result2;
    }
    const result = {
      value: conductivity,
      status: CONDUCTIVITY_RESULT_STATUS.READY
    };
    return result;
  }
};
__name(_ConductivitySerialDecoder, "ConductivitySerialDecoder");
var ConductivitySerialDecoder = _ConductivitySerialDecoder;

// src/processing/HeartRateProcessor.ts
var import_jsfft = __toESM(require_fft(), 1);
var MIN_INPUT_VALUE = 3e5;
var MAX_INPUT_VALUE = 9e5;
var SAMPLE_RATE = 200;
var INPUT_ARRAY_SIZE = 2048;
var RESULT_ARRAY_SIZE = 100;
var SOS = [
  [[1, 0, -1], [1, -1.9794, 0.9847]],
  [[1, 0, -1], [1, -1.9948, 0.9953]],
  [[1, 0, -1], [1, -1.9537, 0.9583]],
  [[1, 0, -1], [1, -1.9849, 0.9855]],
  [[1, 0, -1], [1, -1.973, 0.9737]],
  [[1, 0, -1], [1, -1.9392, 0.9426]],
  [[1, 0, -1], [1, -1.9571, 0.9583]],
  [[1, 0, -1], [1, -1.941, 0.9432]]
];
var GAIN = [0.0256, 0.0256, 0.0254, 0.0254, 0.0252, 0.0252, 0.0251, 0.0251, 1];
var HEART_RATE_RESULT_STATUS = {
  TOO_LOW: "TOO_LOW",
  TOO_HIGH: "TOO_HIGH",
  PROCESSING: "PROCESSING",
  READY: "READY"
};
var _FixedArray = class _FixedArray {
  constructor(size) {
    this._size = size;
    this._array = [];
    this._sum = 0;
  }
  _log(...msg) {
    console.log("|FixedArray|", ...msg);
  }
  get isAverageReady() {
    return this._array.length >= this._size;
  }
  get average() {
    return _FixedArray.calcAverage(this._sum, this._array.length);
  }
  get array() {
    return this._array;
  }
  _cleanup() {
    while (this._array.length > this._size) {
      const removed = this._array.shift();
      if (removed) {
        this._sum -= removed;
      }
    }
  }
  _add(item) {
    this._array.push(item);
    this._sum += item;
  }
  add(item) {
    this._add(item);
    this._cleanup();
  }
  addItems(items) {
    for (const i of items) {
      this._add(i);
    }
    this._cleanup();
  }
  static calcSum(array) {
    return array.reduce((item, curr) => item + curr, 0);
  }
  static calcAverage(sum, length) {
    if (!length) {
      return 0;
    }
    return sum / length;
  }
  static createSteppedArray(startValue, stopValue, cardinality) {
    const arr = [];
    const step = (stopValue - startValue) / (cardinality - 1);
    for (let i = 0; i < cardinality; i++) {
      arr.push(startValue + step * i);
    }
    return arr;
  }
};
__name(_FixedArray, "FixedArray");
var FixedArray = _FixedArray;
var _Biquad = class _Biquad {
  // Biquad direct form II representation, g1 and g2 are input and output gains respectively
  constructor(b, a, g1, g2) {
    this.b = b;
    this.a = a;
    this.g1 = g1;
    this.g2 = g2;
    this.w = [1, 1, 1];
  }
  _log(...msg) {
    console.log("|Biquad|", ...msg);
  }
  updateFilter(x) {
    const xGained = x * this.g1;
    this.w[2] = this.w[1];
    this.w[1] = this.w[0];
    this.w[0] = xGained - this.a[1] * this.w[1] - this.a[2] * this.w[2];
    const y = this.b[0] * this.w[0] + this.b[1] * this.w[1] + this.b[2] * this.w[2];
    const yGained = y * this.g2;
    return yGained;
  }
};
__name(_Biquad, "Biquad");
var Biquad = _Biquad;
var _HeartRateProcessor = class _HeartRateProcessor {
  constructor() {
    this._log("ctor");
    this._initFilters();
    const halfSampleRate = Math.floor(SAMPLE_RATE / 2);
    this._resultArray = new FixedArray(RESULT_ARRAY_SIZE);
    this._inputArray = new FixedArray(INPUT_ARRAY_SIZE);
    const L = INPUT_ARRAY_SIZE;
    const halfL = Math.floor(L / 2);
    this._xf = FixedArray.createSteppedArray(0, halfSampleRate, halfL);
  }
  _log(...msg) {
    console.log("|HeartRateProcessor|", ...msg);
  }
  _initFilters() {
    this._filters = SOS.map((s, i) => new Biquad(s[0], s[1], GAIN[i], 1));
  }
  getStatusForInput(input) {
    if (input < MIN_INPUT_VALUE) {
      return HEART_RATE_RESULT_STATUS.TOO_LOW;
    } else if (input > MAX_INPUT_VALUE) {
      return HEART_RATE_RESULT_STATUS.TOO_HIGH;
    }
    return HEART_RATE_RESULT_STATUS.PROCESSING;
  }
  processSingleInput(input) {
    const status = this.getStatusForInput(input);
    if (status !== HEART_RATE_RESULT_STATUS.PROCESSING) {
      const result2 = { status };
      return result2;
    }
    this._inputArray.add(input);
    const output = this.process();
    if (!output) {
      const result2 = { status: HEART_RATE_RESULT_STATUS.PROCESSING };
      return result2;
    }
    const result = { status: HEART_RATE_RESULT_STATUS.READY, value: output };
    return result;
  }
  processMultiInput(inputArray) {
    for (const input of inputArray) {
      const status = this.getStatusForInput(input);
      if (status !== HEART_RATE_RESULT_STATUS.PROCESSING) {
        const result2 = { status };
        return result2;
      }
    }
    this._inputArray.addItems(inputArray);
    const output = this.process();
    if (!output) {
      const result2 = { status: HEART_RATE_RESULT_STATUS.PROCESSING };
      return result2;
    }
    const result = { status: HEART_RATE_RESULT_STATUS.READY, value: output };
    return result;
  }
  process() {
    if (!this._inputArray.isAverageReady) {
      return null;
    }
    const heartRate = this._process(this._inputArray);
    if (!heartRate) {
      return null;
    }
    this._resultArray.add(heartRate);
    if (!this._resultArray.isAverageReady) {
      return null;
    }
    return this._resultArray.average;
  }
  _process(inputArray) {
    if (!inputArray.isAverageReady) {
      throw new Error(`average is not ready. arr len: ${inputArray.array.length}`);
    }
    const filtered = inputArray.array.map((value) => {
      const adjustedV = value - inputArray.average;
      return this._updateAllFilters(adjustedV);
    });
    const dataFFT = new import_jsfft.default.ComplexArray(filtered.length).map((value, i, n) => {
      value.real = filtered[i];
    });
    const spectrum = dataFFT.FFT();
    const mag = spectrum.magnitude();
    let minVal = 0;
    let minIndex = 0;
    for (let index = 0; index < mag.length / 2; index++) {
      const element = mag[index];
      if (element > minVal) {
        minVal = element;
        minIndex = index;
      }
    }
    const heartRate = this._xf[minIndex] * 60;
    return heartRate;
  }
  _updateAllFilters(input) {
    let output;
    let current = input;
    for (let f of this._filters) {
      output = f.updateFilter(current);
      current = output;
    }
    return output;
  }
};
__name(_HeartRateProcessor, "HeartRateProcessor");
var HeartRateProcessor = _HeartRateProcessor;

// src/decoder/SerialHeartRateDecoder.ts
var _SerialHeartRateDecoder = class _SerialHeartRateDecoder extends SerialDecoder {
  constructor() {
    super();
    this._processor = new HeartRateProcessor();
  }
  _log(...msg) {
    console.log("|SerialHeartRateDecoder|", ...msg);
  }
  async decode(rawValues) {
    if (!rawValues.length) {
      throw new Error("invlalid input. expected 1 value at least");
    }
    const rawValue = rawValues[0];
    const data0 = rawValue.getFourBytesByIndex(6);
    const data1 = rawValue.getFourBytesByIndex(10);
    const data2 = rawValue.getFourBytesByIndex(14);
    const data3 = rawValue.getFourBytesByIndex(18);
    const heartRateResult = this._processor.processMultiInput([data0, data1, data2, data3]);
    const value0 = { label: SENSOR_VALUE.HEART_RATE, value: heartRateResult, type: "object" };
    const result = {
      sensorType: rawValue.sensorType,
      decodedValues: [value0]
    };
    return result;
  }
};
__name(_SerialHeartRateDecoder, "SerialHeartRateDecoder");
var SerialHeartRateDecoder = _SerialHeartRateDecoder;

// src/processing/MinValueThreshold.ts
var _MinValueThreshold = class _MinValueThreshold {
  constructor() {
    this.LOW_THRESHOLD = 1e5;
    this.HIGH_THRESHOLD = 2e6;
    this._isAboveHigh = false;
  }
  check(value) {
    if (value > this.HIGH_THRESHOLD) {
      this._isAboveHigh = true;
      return true;
    }
    if (this._isAboveHigh) {
      if (value > this.LOW_THRESHOLD) {
        return true;
      } else {
        this._isAboveHigh = false;
        return false;
      }
    }
    return false;
  }
};
__name(_MinValueThreshold, "MinValueThreshold");
var MinValueThreshold = _MinValueThreshold;

// src/decoder/SerialHeartRate2Decoder.ts
var _SerialHeartRate2Decoder = class _SerialHeartRate2Decoder extends SerialDecoder {
  constructor() {
    super();
    this._thresholdChecker = new MinValueThreshold();
    this._postProcessor = new HeartRateValuePostProcessor();
    this._processor = new HeartRateProcessor();
    this._detector = new HeartRateDetector();
  }
  _log(...msg) {
    console.log("|SerialHeartRateDecoder|", ...msg);
  }
  async decode(array) {
    const sliced = array[0].rawValue.slice(0, 26);
    const rawValue = new SerialRawValue(sliced);
    const data0 = rawValue.getFourBytesByIndex(6);
    const isValid = this._thresholdChecker.check(data0);
    this._log("rawValue", data0, isValid);
    const value0 = {
      label: SENSOR_VALUE.HEART_RATE,
      value: {
        status: HEART_RATE_RESULT_STATUS.TOO_LOW,
        value: 0
      },
      type: "object"
    };
    const result = {
      sensorType: array[0].sensorType,
      decodedValues: [value0]
    };
    const subArrays = array.map((i) => i.rawValue.subarray(6, 22));
    const rawData = SerialUtil.concatMultiArrays(subArrays);
    if (isValid) {
      const heartRateResult = await this._detector.detectHeartRate(rawData);
      this._log("heartrate-result", heartRateResult);
      const postProcessedResult = this._postProcessor.process(heartRateResult);
      value0.value = postProcessedResult;
    }
    return result;
  }
};
__name(_SerialHeartRate2Decoder, "SerialHeartRate2Decoder");
var SerialHeartRate2Decoder = _SerialHeartRate2Decoder;
var _HeartRateValuePostProcessor = class _HeartRateValuePostProcessor {
  constructor() {
    this._wasReady = false;
  }
  process(heartrateValue) {
    if (heartrateValue.status === HEART_RATE_RESULT_STATUS.PROCESSING && this._wasReady) {
      heartrateValue.status = HEART_RATE_RESULT_STATUS.READY;
    }
    this._wasReady = heartrateValue.status === HEART_RATE_RESULT_STATUS.READY;
    return heartrateValue;
  }
};
__name(_HeartRateValuePostProcessor, "HeartRateValuePostProcessor");
var HeartRateValuePostProcessor = _HeartRateValuePostProcessor;

// src/decoder/SerialTemperatureDecoder.ts
var _TemperatureSerialDecoder = class _TemperatureSerialDecoder extends SerialDecoder {
  constructor() {
    super();
  }
  _log(...msg) {
    console.log("|TemperatureSerialDecoder|", ...msg);
  }
  async decode(rawValues) {
    if (!rawValues.length) {
      throw new Error("invlalid input. expected 1 value at least");
    }
    const rawValue = rawValues[0];
    if (!rawValue.isValidLength) {
      this._log(`invalid length ${rawValue.rawValue.length}. skipping..`);
      return null;
    }
    const data0f = new SerialNumberValue(rawValue.getTwoBytesSignedByIndex(6)).divideByHundred();
    const data1f = new SerialNumberValue(rawValue.getTwoBytesSignedByIndex(8)).divideByHundred();
    const value0 = { label: SENSOR_VALUE.INFRARED_TEMPERATURE, value: data0f, type: "number" };
    const value1 = { label: SENSOR_VALUE.AMBIENT_TEMPERATURE, value: data1f, type: "number" };
    const result = {
      sensorType: rawValue.sensorType,
      decodedValues: [value0, value1]
    };
    return result;
  }
};
__name(_TemperatureSerialDecoder, "TemperatureSerialDecoder");
var TemperatureSerialDecoder = _TemperatureSerialDecoder;

// src/decoder/SerialTemperature2Decoder.ts
var _Temperature2SerialDecoder = class _Temperature2SerialDecoder extends SerialDecoder {
  constructor() {
    super();
  }
  _log(...msg) {
    console.log("|Temperature2SerialDecoder|", ...msg);
  }
  async decode(rawValues) {
    if (!rawValues.length) {
      throw new Error("invlalid input. expected 1 value at least");
    }
    const rawValue = rawValues[0];
    if (!rawValue.isValidLength) {
      this._log(`invalid length ${rawValue.rawValue.length}. skipping..`);
      return null;
    }
    const data0f = new SerialNumberValue(rawValue.getTwoBytesSignedByIndex(6)).divideByHundred();
    const X = new SerialNumberValue(rawValue.getTwoBytesUnsignedByIndex(8)).value;
    const a = new SerialNumberValue(rawValue.getFourBytesFloatByIndex(10)).value;
    const b = new SerialNumberValue(rawValue.getFourBytesFloatByIndex(14)).value;
    const c = new SerialNumberValue(rawValue.getFourBytesFloatByIndex(18)).value;
    const infrared_temp = (a * Math.pow(X, 2) / Math.pow(10, 5) + b * X + c).toFixed(0);
    const value0 = { label: SENSOR_VALUE.AMBIENT_TEMPERATURE, value: data0f, type: "number" };
    const value1 = { label: SENSOR_VALUE.INFRARED_TEMPERATURE, value: infrared_temp, type: "number" };
    const result = {
      sensorType: rawValue.sensorType,
      decodedValues: [value0, value1]
    };
    return result;
  }
};
__name(_Temperature2SerialDecoder, "Temperature2SerialDecoder");
var Temperature2SerialDecoder = _Temperature2SerialDecoder;

// src/service/ValueReader.ts
var _SingleValueReader = class _SingleValueReader {
  async readValue(serialReader) {
    const value = await serialReader.readOnce();
    return [value];
  }
};
__name(_SingleValueReader, "SingleValueReader");
var SingleValueReader = _SingleValueReader;
var _TenValuesReader = class _TenValuesReader {
  async readValue(serialReader) {
    const values = await serialReader.readMultiple(10);
    return values;
  }
};
__name(_TenValuesReader, "TenValuesReader");
var TenValuesReader = _TenValuesReader;

// src/service/SerialDecoderFactory.ts
var _SerialDecoderFactory = class _SerialDecoderFactory {
  static _log(...msg) {
    console.log("|SerialDecoderFactory|", ...msg);
  }
  static _err(...msg) {
    console.error("|SerialDecoderFactory|", ...msg);
  }
  static createDecoder(type) {
    _SerialDecoderFactory._log("createDecoder");
    _SerialDecoderFactory._log("type = " + type);
    switch (type) {
      case SENSOR_TYPE.UV:
      case SENSOR_TYPE.UV2:
        return new UVSerialDecoder();
      case SENSOR_TYPE.HUMIDITY:
        return new HumiditySerialDecoder();
      case SENSOR_TYPE.HEART_RATE:
        return new SerialHeartRateDecoder();
      case SENSOR_TYPE.HEART_RATE2:
        return new SerialHeartRate2Decoder();
      case SENSOR_TYPE.VOC:
        return new VOCSerialDecoder();
      case SENSOR_TYPE.CONDUCTIVITY:
        return new ConductivitySerialDecoder();
      case SENSOR_TYPE.TEMPERATURE:
        return new TemperatureSerialDecoder();
      case SENSOR_TYPE.TEMPERATURE2:
        return new Temperature2SerialDecoder();
      case SENSOR_TYPE.HEART_RATE2:
        return new SerialHeartRate2Decoder();
      default:
        throw new Error(`invalid type ${type}`);
    }
  }
  static createReader(type) {
    _SerialDecoderFactory._log("createReader");
    switch (type) {
      case SENSOR_TYPE.UV:
      case SENSOR_TYPE.UV2:
      case SENSOR_TYPE.HUMIDITY:
      case SENSOR_TYPE.HEART_RATE:
      case SENSOR_TYPE.VOC:
      case SENSOR_TYPE.CONDUCTIVITY:
      case SENSOR_TYPE.TEMPERATURE:
      case SENSOR_TYPE.TEMPERATURE2:
        return new SingleValueReader();
      case SENSOR_TYPE.HEART_RATE2:
        return new TenValuesReader();
      default:
        throw new Error(`invalid type ${type}`);
    }
  }
};
__name(_SerialDecoderFactory, "SerialDecoderFactory");
var SerialDecoderFactory = _SerialDecoderFactory;

// src/service/SerialService.ts
var _SerialService = class _SerialService {
  constructor() {
    this._isConnected = false;
    this._isReading = false;
    this._log("ctor");
  }
  _log(...msg) {
    console.log("|SerialService|", ...msg);
  }
  _err(...msg) {
    console.error("|SerialService|", ...msg);
  }
  _warn(...msg) {
    console.warn("|SerialService|", ...msg);
  }
  get isReading() {
    return this._isReading;
  }
  get canResumeReading() {
    return !!this._port;
  }
  triggerStopReading() {
    this._isReading = false;
  }
  closeReader() {
    this._log("closing reader..");
    if (!this._reader) {
      this._log("no reader found. exiting..");
      return;
    }
    this.triggerStopReading();
    this._log("cancelling..");
    this._reader.cancel();
    this._log("releasing lock..");
    this._reader.releaseLock();
    this._reader = null;
    this._log("reader closed");
  }
  async closePortAsync() {
    this._log("closing port..");
    if (!this._port) {
      this._log("no port found. exiting..");
      return;
    }
    this._isConnected = false;
    try {
      await this._port.close();
      this._log("port closed");
    } catch (e) {
      this._err("failed to close port", e);
    }
    if (this.onSerialConnection) {
      this.onSerialConnection(this._isConnected);
    }
  }
  async resumeReading() {
    this._log("resume reading..");
    if (!this._port) {
      this._log("port not found, restarting..");
      await this.connectAndReadAsync();
      return;
    }
    return await this.startStage2ConnectPortAsync(this._port);
  }
  async disconnectAsync() {
    this._log("disconnecting..");
    this.triggerStopReading();
    setTimeout(async () => {
      await this.stopStage2ClosePortAsync();
    }, 0);
  }
  async connectAndReadAsync() {
    this._log("connect and read..");
    const port = await this.startStage1RequestPortAsync();
    if (!port) {
      this._err("unable to request port");
      return;
    }
    return await this.startStage2ConnectPortAsync(port);
  }
  async startStage1RequestPortAsync() {
    const { serial } = navigator;
    if (!serial) {
      alert("This feature only works on Chrome with 'Experimental Web Platform features' enabled");
      return null;
    }
    serial.onconnect = () => {
      this._log("serial connect");
    };
    serial.ondisconnect = async () => {
      this._log("serial disconnect");
      await this.disconnectAsync();
      this._port = null;
    };
    this._log("requesting port..");
    const port = await serial.requestPort({
      filters: [{ usbVendorId: 1240, vendorId: 1240 }, { usbVendorId: 3368, usbProductId: 516 }]
    }).catch((e) => {
      this._err(`failed to serial.requestPort`, e);
    });
    if (!port) {
      this._err("unable to find port value");
      return null;
    }
    return port;
  }
  async startStage2ConnectPortAsync(port) {
    this._log("startStage2ReadingAsync");
    const connection = await this.connectPortAsync(port);
    if (!connection) {
      this._err("failed to connect");
      return;
    }
    this._isConnected = true;
    this._port = connection.port;
    this._reader = connection.reader;
    if (this.onSerialConnection) {
      this.onSerialConnection(this._isConnected);
    }
    this.startReading();
  }
  async stopStage2ClosePortAsync() {
    this._log("stopStage2ClosePortAsync");
    this.closeReader();
    await this.closePortAsync();
  }
  //TODO: PORT ANY
  async connectPortAsync(port) {
    const portInfo = port.getInfo();
    this._log("port info", portInfo);
    if (port.readable) {
      this._err("port is already readable");
      return null;
    }
    this._log("openning port..");
    await port.open({ baudrate: 230400, baudRate: 230400 }).catch((e) => {
      this._err(`failed to port.open`, e);
    });
    if (!port.readable) {
      this._err(`port is not readable..`);
      return null;
    }
    const reader = port.readable.getReader();
    if (reader.locked) {
      this._err("reader is locked");
      return null;
    }
    return { port, reader };
  }
  async startReading() {
    try {
      this._log("starting reader..");
      const serialReader = new SerialReader(this._reader);
      this._log("creating decoder..");
      const serialValueForDecoder = await serialReader.readOnce();
      if (this.onFirmwareUpdateAvailable) {
        this.onFirmwareUpdateAvailable(serialValueForDecoder.isFirmwareOutdated);
        this._warn(`New firmware available ? ${serialValueForDecoder.isFirmwareOutdated}`);
      }
      const decoderType = serialValueForDecoder.decoderType;
      const sensorType = serialValueForDecoder.sensorType;
      const valueReader = SerialDecoderFactory.createReader(decoderType);
      const decoder = SerialDecoderFactory.createDecoder(decoderType);
      this._log("starting loop..");
      this._isReading = true;
      while (this._isReading) {
        const serialValues = await valueReader.readValue(serialReader);
        const decodedValues = await decoder.decode(serialValues);
        if (decodedValues) {
          if (sensorType !== decodedValues.sensorType) {
            this._err(`invalid sensor type. expecting ${sensorType}, but got ${decodedValues.sensorType}.`);
            continue;
          }
          if (this.onSerialData) {
            this.onSerialData(decodedValues);
          }
        }
      }
      this._log("loop complete..");
    } catch (e) {
      this._err("error reading loop startReading", e);
    } finally {
      this.stopStage2ClosePortAsync();
      this._log("startReading complete");
    }
  }
};
__name(_SerialService, "SerialService");
var SerialService = _SerialService;
var singletonInstance = new SerialService();
var SerialService_default = singletonInstance;

// src/index.ts
var index_default = SerialService_default;
export {
  SerialService_default as SerialService,
  index_default as default
};
//# sourceMappingURL=kiwrious-webserial.esm.js.map
