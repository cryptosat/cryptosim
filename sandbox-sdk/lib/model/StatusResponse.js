"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StatusResponse = void 0;
var _ApiClient = require("../ApiClient");
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); } /*
                                                                                                                                                                                                                                                                                                                                                                                               * Cryptosat Sandbox
                                                                                                                                                                                                                                                                                                                                                                                               * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * OpenAPI spec version: 1.0.0
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * NOTE: This class is auto generated by the swagger code generator program.
                                                                                                                                                                                                                                                                                                                                                                                               * https://github.com/swagger-api/swagger-codegen.git
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * Swagger Codegen version: 3.0.46
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               * Do not edit the class manually.
                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                               */
var StatusResponse = /*#__PURE__*/function () {
  function StatusResponse() {
    _classCallCheck(this, StatusResponse);
  }
  _createClass(StatusResponse, [{
    key: "getSignature",
    value: function getSignature() {
      return this.signature;
    }
  }, {
    key: "setSignature",
    value: function setSignature(signature) {
      this.signature = signature;
    }
  }, {
    key: "getMessage",
    value: function getMessage() {
      return this.message;
    }
  }, {
    key: "setMessage",
    value: function setMessage(message) {
      this.message = message;
    }
  }, {
    key: "getTimestamp",
    value: function getTimestamp() {
      return this.timestamp;
    }
  }, {
    key: "setTimestamp",
    value: function setTimestamp(timestamp) {
      this.timestamp = timestamp;
    }
  }], [{
    key: "constructFromObject",
    value: function constructFromObject(data, obj) {
      if (data) {
        obj = obj || new StatusResponse();
        if (data.hasOwnProperty('signature')) obj.signature = _ApiClient.ApiClient.convertToType(data['signature'], 'String');
        if (data.hasOwnProperty('message')) obj.message = _ApiClient.ApiClient.convertToType(data['message'], 'String');
        if (data.hasOwnProperty('timestamp')) obj.timestamp = _ApiClient.ApiClient.convertToType(data['timestamp'], 'Number');
      }
      return obj;
    }
  }]);
  return StatusResponse;
}();
exports.StatusResponse = StatusResponse;
StatusResponse.prototype.signature = undefined;
StatusResponse.prototype.message = undefined;
StatusResponse.prototype.timestamp = undefined;