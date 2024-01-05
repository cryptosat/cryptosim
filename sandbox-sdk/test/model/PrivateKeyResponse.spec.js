/*
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
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD.
    define(['expect.js', '../../src/index'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    factory(require('expect.js'), require('../../src/index'));
  } else {
    // Browser globals (root is window)
    factory(root.expect, root.sandbox-sdk);
  }
}(this, function(expect, sandbox-sdk) {
  'use strict';

  var instance;

  describe('(package)', function() {
    describe('PrivateKeyResponse', function() {
      beforeEach(function() {
        instance = new sandbox-sdk.PrivateKeyResponse();
      });

      it('should create an instance of PrivateKeyResponse', function() {
        // TODO: update the code to test PrivateKeyResponse
        expect(instance).to.be.a(sandbox-sdk.PrivateKeyResponse);
      });

      it('should have the property privateKey (base name: "private_key")', function() {
        // TODO: update the code to test the property privateKey
        expect(instance).to.have.property('privateKey');
        // expect(instance.getPrivateKey()).to.be(expectedValueLiteral);
      });

    });
  });

}));
