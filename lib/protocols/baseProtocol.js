const Protocol = require('./Protocol');
const crypto = require('crypto');

/**
 * A protocol containing the basic cryptographic primitives to be deployed
 * onboard the cryptosatellite.
 */
class BaseProtocol extends Protocol {
  #version = '0.1.0';
  #rsaKey = null;

  #REQUEST_TYPES = {
    PRIVATE_RANDOM: 'privateRandom',
    SIGNATURE: 'signature',
  }

  /**
   * Construct a base protocol object. The code here will simulate the
   * initialization step that takes place onboard the satellite once it is in
   * orbit.
   * @param {Universe} universe - a reference to the universe modeling the
   *        physical environment.
   */
  constructor(universe) {
    super(universe);
    this.#rsaKey = crypto.generateKeyPairSync('rsa', {modulusLength: 520});
  }

  /**
   * This method will be called periodically. Its return value is taken
   * to be the message to send back to the ground station.
   * @return {String} a serialized message to broadcast.
   */
  broadcast() {
    const timestamp = String(this.universe.clock().now().getTime());
    const randomBytes = crypto.randomBytes(256).toString('hex');
    return {
      status: 'ok',
      version: this.#version,
      timestamp: timestamp,
      timestampSignature: this.#sign(timestamp),
      publicRandom: randomBytes,
      publicRandomSignature: this.#sign(randomBytes),
      publicRsaKey: this.#rsaKey.publicKey.export(
          {format: 'der', type: 'spki'}).toString('hex'),
    };
  }

  /**
   * Digially sign a message using the protocol private key.
   * @param {String} m - a string message to sign.
   * @return {String} a hexadecimal encoded string containing the digitally
   *         signed SHA256 hash of the message.
   */
  #sign(m) {
    const s = crypto.createSign('SHA256');
    s.write(m);
    s.end();
    return s.sign(this.#rsaKey.privateKey, 'hex');
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
    const publicKey = crypto.createPublicKey({
      key: request.publicKey,
      format: 'der',
      type: 'spki',
      encoding: 'hex',
    });
    // TODO: consider whether the nonce can be the request id
    const nonce = Buffer.from(request.nonce, 'hex');
    const msgRandom = Buffer.alloc(192);
    Buffer.from(nonce).copy(msgRandom, 0, 0, 64);
    crypto.randomBytes(128).copy(msgRandom, 64);
    const encryptedRandom = crypto.publicEncrypt(publicKey,
        msgRandom).toString('hex');
    const response = {
      requestId: request.requestId,
      encryptedRandom: encryptedRandom,
      signature: this.#sign(encryptedRandom),
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
    const response = {
      requestId: request.requestId,
      signature: this.#sign(request.msg),
    };
    this.send(response);
  }

  /**
   * Receive a message from a ground station.
   * This method is invoked whenever a new message is received and determined
   * by the satellite that it is addressed to this protocol.
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

module.exports = BaseProtocol;
