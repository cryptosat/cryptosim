"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DelayEncryptionApi = void 0;
var _ApiClient = require("../ApiClient");
var _KeypairResponse = require("../model/KeypairResponse");
var _PrivateKeyResponse = require("../model/PrivateKeyResponse");
var _PublicKeyResponse = require("../model/PublicKeyResponse");
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
var DelayEncryptionApi = /*#__PURE__*/function () {
  function DelayEncryptionApi(apiClient) {
    _classCallCheck(this, DelayEncryptionApi);
    this.apiClient = apiClient || _ApiClient.ApiClient.instance;
  }
  _createClass(DelayEncryptionApi, [{
    key: "delayEncKeypairDelayPostWithHttpInfo",
    value: function delayEncKeypairDelayPostWithHttpInfo(delay) {
      var postBody = null;
      // verify the required parameter 'delay' is set
      if (delay === undefined || delay === null) {
        throw new Error("Missing the required parameter 'delay' when calling delayEncKeypairDelayPost");
      }
      var pathParams = {
        'delay': delay
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};
      var authNames = ['RequestAuthorizer'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = _KeypairResponse.KeypairResponse;
      return this.apiClient.callApi('/delay-enc-keypair/{delay}', 'POST', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }
  }, {
    key: "delayEncKeypairDelayPost",
    value: function delayEncKeypairDelayPost(delay) {
      return this.delayEncKeypairDelayPostWithHttpInfo(delay).then(function (response_and_data) {
        return response_and_data.data;
      });
    }
  }, {
    key: "delayEncKeypairsKeypairIdPrivateGetWithHttpInfo",
    value: function delayEncKeypairsKeypairIdPrivateGetWithHttpInfo(keypairId) {
      var postBody = null;
      // verify the required parameter 'keypairId' is set
      if (keypairId === undefined || keypairId === null) {
        throw new Error("Missing the required parameter 'keypairId' when calling delayEncKeypairsKeypairIdPrivateGet");
      }
      var pathParams = {
        'keypair_id': keypairId
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};
      var authNames = ['RequestAuthorizer'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = _PrivateKeyResponse.PrivateKeyResponse;
      return this.apiClient.callApi('/delay-enc-keypairs/{keypair_id}/private', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }
  }, {
    key: "delayEncKeypairsKeypairIdPrivateGet",
    value: function delayEncKeypairsKeypairIdPrivateGet(keypairId) {
      return this.delayEncKeypairsKeypairIdPrivateGetWithHttpInfo(keypairId).then(function (response_and_data) {
        return response_and_data.data;
      });
    }
  }, {
    key: "delayEncKeypairsKeypairIdPublicGetWithHttpInfo",
    value: function delayEncKeypairsKeypairIdPublicGetWithHttpInfo(keypairId) {
      var postBody = null;
      // verify the required parameter 'keypairId' is set
      if (keypairId === undefined || keypairId === null) {
        throw new Error("Missing the required parameter 'keypairId' when calling delayEncKeypairsKeypairIdPublicGet");
      }
      var pathParams = {
        'keypair_id': keypairId
      };
      var queryParams = {};
      var headerParams = {};
      var formParams = {};
      var authNames = ['RequestAuthorizer'];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = _PublicKeyResponse.PublicKeyResponse;
      return this.apiClient.callApi('/delay-enc-keypairs/{keypair_id}/public', 'GET', pathParams, queryParams, headerParams, formParams, postBody, authNames, contentTypes, accepts, returnType);
    }
  }, {
    key: "delayEncKeypairsKeypairIdPublicGet",
    value: function delayEncKeypairsKeypairIdPublicGet(keypairId) {
      return this.delayEncKeypairsKeypairIdPublicGetWithHttpInfo(keypairId).then(function (response_and_data) {
        return response_and_data.data;
      });
    }
  }]);
  return DelayEncryptionApi;
}();
exports.DelayEncryptionApi = DelayEncryptionApi;