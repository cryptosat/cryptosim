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
    BROADCAST: 'broadcast',
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
      serviceHeader: {
        type: this.#REQUEST_TYPES.BROADCAST,
      },
      servicePayload: {
        status: 'ok',
        version: this.#version,
        timestamp: timestamp,
        timestampSignature: binary.ab2ascii(
            this.#sign(binary.intToArrayBuffer(timestamp))),
        publicRandom: binary.ab2ascii(randomBytes),
        publicRandomSignature: binary.ab2ascii(this.#sign(randomBytes)),
        publicSigningKey: binary.ab2ascii(this.#signingKey.publicKey),
        publicEncryptionKey: binary.ab2ascii(this.#encryptionKey.publicKey),
      },
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
   * @param {{none: string, publicKey: string}} msg - object containing a public
   *        key of the caller to use in order to sign the message, a unique
   *        nonce for this request and a request id.
   * @return {{encryptedRandom: string, signature: string}} an object containing
   *          random bytes encrypted using the supplied publicKey, and a
   *          signature using the satellite's signing key to verify the
   *          integrity of the message.
   */
  #processPrivateRandomnessRequest(msg) {
    const publicKey = binary.ascii2ab(msg.publicKey);
    // TODO: consider whether the nonce can be the request id and/or include
    // the timestamp as part of the signature.
    const nonce = binary.ascii2ab(msg.nonce);
    const msgRandom = nacl.randomBytes(128);
    const encryptedRandom = nacl.box(
        msgRandom, nonce, publicKey, this.#encryptionKey.secretKey);
    return {
      encryptedRandom: binary.ab2ascii(encryptedRandom),
      signature: binary.ab2ascii(this.#sign(encryptedRandom)),
    };
  }

  /**
   * Process a request to sign a message.
   * @param {{signature: string}} msg - the request object containing the
   *        message to sign.
   * @return {{timestamp: Number, signature: string}} an object containing the
   *        timestamp of when the request was processed and a signature over
   *        the contents of the message and the timestamp.
   */
  #processSignatureRequest(msg) {
    const timestamp = this.universe.clock().now().getTime();
    const msgBuffer = binary.ascii2ab(msg);
    const timestampBuffer = binary.intToArrayBuffer(timestamp);
    const msgWithTimestamp = binary.appendBuffers(msgBuffer, timestampBuffer);
    return {
      timestamp: timestamp,
      signature: binary.ab2ascii(this.#sign(msgWithTimestamp)),
    };
  }

  /**
   * Receive a message from a ground station.
   * This method is invoked whenever a new message is received and determined
   * by the satellite that it is addressed to this service.
   * @param {Object} msg - the contents of the message. Can be any of the
   *        requests supported by the satellite.
   * @throw {Error} if the satellite doesn't recognize the type of the request.
   */
  receive(msg) {
    const type = msg.serviceHeader.type;
    let responsePayload = {};
    if (type == this.#REQUEST_TYPES.PRIVATE_RANDOM) {
      responsePayload = this.#processPrivateRandomnessRequest(
          msg.servicePayload);
    } else if (type == this.#REQUEST_TYPES.SIGNATURE) {
      responsePayload = this.#processSignatureRequest(msg.servicePayload);
    } else {
      throw new Error('unrecognized request type: "' + type + '"' );
    }
    const response = {
      serviceHeader: {
        requestId: msg.serviceHeader.requestId,
      },
      servicePayload: responsePayload,
    };
    this.send(response);
  }
}

module.exports = MainService;
