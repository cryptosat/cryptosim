const Service = require('./service');
const binary = require('../binary');
const nacl = require('tweetnacl');

/**
 * A service containing the basic cryptographic primitives to be deployed
 * onboard the cryptosatellite.
 */
class MainService extends Service {
  #version = '0.1.0';
  #signingKey = null;
  #encryptionKey = null;

  #REQUEST_TYPES = {
    PRIVATE_RANDOM: 'privateRandom',
    SIGNATURE: 'signature',
  }

  /**
   * Construct a main service object. The code here will simulate the
   * initialization step that takes place onboard the satellite once it is in
   * orbit.
   * @param {Universe} universe - a reference to the universe modeling the
   *        physical environment.
   */
  constructor(universe) {
    super(universe);
    this.#signingKey = nacl.sign.keyPair();
    this.#encryptionKey = nacl.box.keyPair();
  }

  /**
   * This method will be called periodically. Its return value is taken
   * to be the message to send back to the ground station.
   * @return {Object} a message to broadcast.
   */
  broadcast() {
    const timestamp = this.universe.clock().now().getTime();
    const randomBytes = nacl.randomBytes(256);
    return {
      status: 'ok',
      version: this.#version,
      timestamp: timestamp,
      timestampSignature: binary.ab2ascii(
          this.#sign(binary.intToArrayBuffer(timestamp))),
      publicRandom: binary.ab2ascii(randomBytes),
      publicRandomSignature: binary.ab2ascii(this.#sign(randomBytes)),
      publicSigningKey: binary.ab2ascii(this.#signingKey.publicKey),
      publicEncryptionKey: binary.ab2ascii(this.#encryptionKey.publicKey),
    };
  }

  /**
   * Digitally sign a message using the service private key.
   * @param {Uint8Array} m - a string message to sign.
   * @return {Uint8Array} a hexadecimal encoded string containing the digitally
   *         signed SHA256 hash of the message.
   */
  #sign(m) {
    return nacl.sign.detached(m, this.#signingKey.secretKey);
  }

  /**
   * Process a request to provide the caller with private randomness. A response
   * is issued and sent back to the caller.
   * @param {{requestId: string, none: string, publicKey: string, }} request -
   *        request object containing a public key of the caller to use in order
   *        to sign the message, a unique nonce for this request and a request
   *        id.
   */
  #requestPrivateRandom(request) {
    const publicKey = binary.ascii2ab(request.publicKey);
    // TODO: consider whether the nonce can be the request id
    const nonce = binary.ascii2ab(request.nonce);
    const msgRandom = nacl.randomBytes(128);
    const encryptedRandom = nacl.box(
        msgRandom, nonce, publicKey, this.#encryptionKey.secretKey);
    const response = {
      requestId: request.requestId,
      encryptedRandom: binary.ab2ascii(encryptedRandom),
      signature: binary.ab2ascii(this.#sign(encryptedRandom)),
    };
    this.send(response);
  }

  /**
   * Process a request to sign a message.
   * @param {{requestId: string, signature: string}} request - the request
   *        object containing the message to sign and a requestId uniquely
   *        identifying the message.
   */
  #requestSignature(request) {
    const timestamp = this.universe.clock().now().getTime();
    const msgBuffer = binary.ascii2ab(request.msg);
    const timestampBuffer = binary.intToArrayBuffer(timestamp);
    const msgWithTimestamp = binary.appendBuffers(msgBuffer, timestampBuffer);
    const response = {
      requestId: request.requestId,
      timestamp: timestamp,
      signature: binary.ab2ascii(this.#sign(msgWithTimestamp)),
    };
    this.send(response);
  }

  /**
   * Receive a message from a ground station.
   * This method is invoked whenever a new message is received and determined
   * by the satellite that it is addressed to this service.
   * @param {Object} request - the contents of the message. Can be any of the
   *        requests supported by the satellite.
   * @throw {Error} if the satellite doesn't recognize the type of the request.
   */
  receive(request) {
    if (request.type == this.#REQUEST_TYPES.PRIVATE_RANDOM) {
      this.#requestPrivateRandom(request);
    } else if (request.type == this.#REQUEST_TYPES.SIGNATURE) {
      this.#requestSignature(request);
    } else {
      throw new Error('unrecognized request type: "' + request.type + '"' );
    }
  }
}

module.exports = MainService;
