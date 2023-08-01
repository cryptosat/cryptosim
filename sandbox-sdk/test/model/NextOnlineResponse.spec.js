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
    describe('NextOnlineResponse', function() {
      beforeEach(function() {
        instance = new sandbox-sdk.NextOnlineResponse();
      });

      it('should create an instance of NextOnlineResponse', function() {
        // TODO: update the code to test NextOnlineResponse
        expect(instance).to.be.a(sandbox-sdk.NextOnlineResponse);
      });

      it('should have the property nextOnlineS (base name: "next_online_s")', function() {
        // TODO: update the code to test the property nextOnlineS
        expect(instance).to.have.property('nextOnlineS');
        // expect(instance.getNextOnlineS()).to.be(expectedValueLiteral);
      });

    });
  });

}));