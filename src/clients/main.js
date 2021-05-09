const crypto = require('crypto');
const uuid = require('uuid');
const PromiseTimeout = require('promise-timeout');

/**
 * Parse a public key into a format expected by the main service
 * @param {string} key - a k in seralized hex format.
 * @return {KeyObject} a parsed representation of the argument.
 */
function parseKey(key) {
  return crypto.createPublicKey({
    key: key,
    format: 'der',
    type: 'spki',
    encoding: 'hex',
  });
}

/**
 * Client for interacting the main service running onboard the satellite.
 * The class listens to satellite communication and locally caches the last
 * public broadcasts received from the satellite. The client serves the cached
 * public information so that even when the satellite is offline the clients
 * can still use the client. For private requests, the client will keep track
 * of the requests in flight and will match them with the appropriate response
 * when one arrives.
 */
class MainClient {
  #universe = null;
  #gsnetwork = null;
  #cache = {};
  #serviceId = null;

  /**
   * Construct a MainClient object. Every instance acts as a separate client.
   * @param {Universe} universe - a reference to the universe modeling the
   *        physical environment.
   * @param {GroundStationNetwork} gsnetwork - the network of ground stations
   *        employed to communicate with the satellites on which the service
   *        runs.
   * @param {string} serviceId - an identifier for the service to which
   *        the corresponding service is registered in the satellite.
   */
  constructor(universe, gsnetwork, serviceId) {
    this.#universe = universe;
    this.#gsnetwork = gsnetwork;
    this.#gsnetwork.startListening(this.#receive.bind(this));
    this.#serviceId = serviceId;
  }

  /**
   * Filter messages that are addressed to this service. Ground stations
   * intercept all messages sent from the satellite, whether or not they are
   * part of this service. Only messages that have the service ID for which
   * the service was registered with the satellite are of interest to this
   * client.
   * @param {{serviceId: string, body: Object}} msg - a message received from
   *        a satellite.
   * @return {Object} the body of the message if the service ID of the message
   *         matches the service ID of this client. Otherwise return undefined.
   */
  #filterMessageForService(msg) {
    if (msg.serviceId == this.#serviceId) {
      return msg.body;
    }
  }

  /**
   * A method to be inoked upon receipt of a message from a satellite. The
   * signature of the message matches the signature expected of a callback
   * supplied to the `startListening` method of the ground station network.
   * @param {string} stationId - the ID of the station which received the
   *        transmission.
   * @param {Object} msg - the received message.
   */
  #receive(stationId, msg) {
    const body = this.#filterMessageForService(msg);
    if (body && body.status !== undefined) {
      this.#cache.status = body.status;
      this.#cache.version = body.version;
      this.#cache.timestamp = parseInt(body.timestamp);
      this.#cache.timestampSignature =
          Buffer.from(body.timestampSignature, 'hex');
      this.#cache.publicRandom = Buffer.from(body.publicRandom, 'hex');
      this.#cache.publicRandomSignature = Buffer.from(
          body.publicRandomSignature, 'hex');
      this.#cache.publicRsaKey = parseKey(body.publicRsaKey);
    }
  }

  /**
   * Issue a reset command to the satellite service. This will cause the
   * satellite to generate new private keys and delete old state.
   * @param {string} password - special password required to invoke the reset
   *        procedure.
   */
  reset(password) {
    throw Error('Not implemented');
  }

  /**
   * @return {{status: string, timestamp: Number}} the operational status last
   *         reported by the satellite and received by any of the ground
   *         stations. The timestamp refers to the time when that last
   *         was received.
   */
  status() {
    return {
      status: this.#cache.status,
      timestamp: this.#cache.timestamp,
    };
  }

  /**
   * @return {{version: string, timestamp: Number}} the version of the service
   *         running onboard the satellite last reported by the satellite. The
   *         timestamp refers to the time when that last transmission was
   *         received.
   *
   */
  version() {
    return {
      version: this.#cache.version,
      timestamp: this.#cache.timestamp,
    };
  }

  /**
   * @return {KeyObject} the cryptosat public RSA key last reported by the
   *         satellite. As opposed to other methods in this client, the timestamp
   *         is not reported here as the public key is expected to change
   *         throughout the lifetime of the satellite.
   */
  getPublicRsaKey() {
    return this.#cache.publicRsaKey;
  }

  /**
   * @return {{timestamp: Number, publicRandom: Buffer, signature: Buffer}} -
   *         random bytes last generated by the satellite along with the
   *         timestamp of when they were received and a signature using the
   *         satellite's private RSA key demonstrating it was in fact issued
   *         by the satellite.
   */
  getPublicRandom() {
    // TODO: consider signing both the public random value and the timestamp.
    return {
      timestamp: this.#cache.timestamp,
      publicRandom: this.#cache.publicRandom,
      signature: this.#cache.publicRandomSignature,
    };
  }

  /**
   * @return {{timestamp: Number, signature: Buffer}} a timestamp signed by
   *         the satellite's private RSA key. The timestamp is taken from the
   *         last broadcast transmission received by the satellite.
   */
  getTimestamp() {
    return {
      timestamp: this.#cache.timestamp,
      signature: this.#cache.timestampSignature,
    };
  }


  /**
   * Request private random bytes from the satellite encrypted using a supplied
   * public key. This is an asynchronous operation as it requires sending a
   * request to the satellite and waiting for a response. This also means it
   * may fail if no ground station in the network is able to communicate with
   * the satellite at the time the request is issued.
   * @param {KeyObject} publicKey - a public key belonging to the user.
   * @param {Buffer} nonce - arbitrary bytes used for proving integrity.
   * @param {Number} timeoutAfter - an optional number of milliseconds to
   *        wait for a response *in real time* from the satellite before timing
   *        out the request. This parameter is useful for situations in which no
   *        satellite is currently in view of any of the ground stations.
   *        Note that this timeout is given in real time, not simulated time.
   * @return {Promise} -  a promise to be fulfilled when the response is
   *        received from the satellite. The resolved promise will include an
   *        object with the random generated bytes along with a signature over
   *        the bytes and the supplied nonce using the satellite's private RSA
   *        key. If a timeout is supplied and the promise isn't fulfilled by
   *        the deadline a TimeoutError is thrown.
   */
  async getPrivateRandom(publicKey, nonce, timeoutAfter = null) {
    const requestId = uuid.v4();
    const request = {
      serviceId: 'main',
      body: {
        type: 'privateRandom',
        requestId: requestId,
        publicKey: publicKey.export(
            {format: 'der', type: 'spki'}).toString('hex'),
        nonce: nonce.toString('hex'),
      },
    };
    this.#gsnetwork.transmit(request);
    const stopListening = () => {
      this.#gsnetwork.stopListening(listenId);
    };
    let listenId;
    const promise = new Promise((resolve, reject) => {
      listenId = this.#gsnetwork.startListening((sid, msg) => {
        const body = this.#filterMessageForService(msg);
        if (body && body.requestId == requestId) {
          resolve({
            encryptedRandom: Buffer.from(body.encryptedRandom, 'hex'),
            signature: Buffer.from(body.signature, 'hex'),
          });
        }
      });
    }).finally(stopListening);
    if (timeoutAfter > 0) {
      return PromiseTimeout.timeout(promise, timeoutAfter).finally(
          stopListening);
    } else {
      return promise;
    }
  }


  /**
   * Request a signature from the satellite of a given message.
   * @param {string} msg - the message requiring a signature.
   * @param {Number} timeoutAfter - an optional number of milliseconds to
   *        wait for a response *in real time* from the satellite before timing
   *        out the request. This parameter is useful for situations in which no
   *        satellite is currently in view of any of the ground stations.
   *        Note that this timeout is given in real time, not simulated time.
   * @return {Promise} -  a promise to be fulfilled when the response is
   *        received from the satellite. The resolved promise will include an
   *        object with the signature of the message using the satellite's
   *        private RSA key. If a timeout is supplied and the promise isn't
   *        fulfilled by the deadline a TimeoutError is thrown.
   */
  async sign(msg, timeoutAfter = null) {
    const requestId = uuid.v4();
    const request = {
      serviceId: 'main',
      body: {
        type: 'signature',
        requestId: requestId,
        msg: msg,
      },
    };
    this.#gsnetwork.transmit(request);
    const stopListening = () => {
      this.#gsnetwork.stopListening(listenId);
    };
    let listenId;
    const promise = new Promise((resolve, reject) => {
      listenId = this.#gsnetwork.startListening((sid, msg) => {
        const body = this.#filterMessageForService(msg);
        if (body && body.requestId == requestId) {
          resolve({
            signature: Buffer.from(body.signature, 'hex'),
          });
        }
      });
    }).finally(stopListening);
    if (timeoutAfter) {
      return PromiseTimeout.timeout(promise, timeoutAfter).finally(
          stopListening);
    } else {
      return promise;
    }
  }
};

module.exports = MainClient;
