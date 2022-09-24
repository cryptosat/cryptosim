const uuid = require('uuid');
const binary = require('../binary');

// A enum enumerating the different the different states of a request.
Status = {
  PENDING: 'Pending',
  SENT: 'Sent',
  READY: 'Ready',
};

/**
 * Class for tracking the status of in asynchronous request. Requests made to
 * the client API might occur when the satellite is offline. In addition, once
 * the request has reached the satellite, by the time the response is prepared
 * the satellite might be offline. To handle such cases, when interactive
 * requests are made to the API the service returns a Request object that
 * makes it convinient for the user to track the status of the request.
 */
class Request {
  #requestId = null;
  #status = null;
  #result = null;
  #client = null;

  /**
   * Constructs a Request object
   * @param {MainClient} client - a client for the Main API. Underlying calls
   *        will be made to the API using this client.
   * @param {string} requestId - the ID of the request to track.
   */
  constructor(client, requestId) {
    this.#client = client;
    this.#requestId = requestId;
    // keep a local reference to make the enum accessible to the users.
    this.Status = Status;
  }

  /**
   * Update the status of the request from the API provider.
   */
  _update() {
    if (this.#result) return;
    const t = this.#client.trackRequest(this.#requestId);
    this.#status = t.status;
    this.#result = t.result;
  }

  /**
   * @return {string} the ID of the request tracked by this object.
   */
  requestId() {
    return this.#requestId;
  }

  /**
   * @return {string} the current status of the request.
   */
  status() {
    this._update();
    return this.#status;
  }

  /**
   * @return {Object} when the request is ready this method will return the
   *         result of the request. Until then it will return null.
   */
  result() {
    this._update();
    return this.#result;
  }
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
  #gsnetwork = null
  #satellite = null;
  #cache = {};
  #requests = null;
  #serviceId = null;

  /**
   * Construct a MainClient object. Every instance acts as a separate client.
   * @param {Universe} universe - a reference to the universe modeling the
   *        physical environment.
   * @param {Satellite} satellite - the satellite the service will be
   *         communicating with. While call communications are happening in
   *         a satellite agnostic way, meta operations such as computing the
   *         the satellite's communication window.
   * @param {GroundStationNetwork} gsnetwork - the network of ground stations
   *        employed to communicate with the satellites on which the service
   *        runs.
   * @param {string} serviceId - an identifier for the service to which
   *        the corresponding service is registered in the satellite.
   */
  constructor(universe, satellite, gsnetwork, serviceId) {
    this.#universe = universe;
    this.#satellite = satellite;
    this.#gsnetwork = gsnetwork;
    this.#gsnetwork.startListening(this.#receive.bind(this));
    this.#requests = new Map();
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
    if (msg.satelliteHeader.serviceId == this.#serviceId) {
      return msg.satellitePayload;
    }
  }

  /**
   * Send a request to the satellite. This message schedules the transmission
   * to the next communication window with the satellite and listens for
   * a response for a specified amount of simulated time. The function
   * filters the received transmissions until it finds a response to the
   * original message and invokes the user supplied callback.
   * @param {Object} msg - a message to be transmitted to the satellite.
   * @param {string} type - the type of the message being sent. Should be one
   *        of the message types recognized by the service.
   * @param {function} callback - a callback function to be invoked with the
   *        response.
   * @return {Request}  a Request object used to track the status of the
   *        request.
   */
  #sendRequest(msg, type, callback) {
    const requestId = uuid.v4();
    const request = { // satellite layer
      satelliteHeader: {
        serviceId: 'main',
      },
      satellitePayload: { // service layer
        serviceHeader: {
          requestId: requestId,
          type: type,
        },
        servicePayload: msg, // endpoint layer
      },
    };

    this.#requests.set(requestId, {
      external: {
        status: Status.PENDING,
        result: null,
      },
      internal: {
        request: request,
        sentAt: null,
        callback: null,
      },
    });

    const nextWindow =
      this.#gsnetwork.nextTransmissionWindow(this.#satellite) -
      this.#universe.clock().now();

    this.#universe.clock().callbackIn(nextWindow + 1, () => {
      this.#gsnetwork.transmit(request);
      const req = this.#requests.get(requestId);
      req.external.status = Status.SENT;
      req.internal.sentAt = this.#universe.clock().now();
      req.internal.callback = callback;
    });

    return new Request(this, requestId);
  }


  /**
   * A method to query the status of an asynchronous request.
   * @param {string} requestId - the ID of the request
   * @return {{status: string, result: Object}} an object containing the
   *        most recent status of the request along with the result if one
   *        is available.
   */
  trackRequest(requestId) {
    const request = this.#requests.get(requestId);
    if (!request) return null;
    if (request.external.status == Status.READY) {
      this.#requests.delete(requestId);
    }
    return request.external;
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
    const satellitePayload = this.#filterMessageForService(msg);
    if (!satellitePayload) return;
    const header = satellitePayload.serviceHeader;
    const payload = satellitePayload.servicePayload;
    if (header.requestId !== undefined) {
      const request = this.#requests.get(header.requestId);
      if (request) {
        request.external.result = request.internal.callback(payload);
        request.external.status = Status.READY;
      }
    } else if (header.type === 'broadcast') {
      this.#cache.status = payload.status;
      this.#cache.version = payload.version;
      this.#cache.timestamp = payload.timestamp;
      this.#cache.timestampSignature =
          binary.ascii2ab(payload.timestampSignature);
      this.#cache.publicRandom =
          binary.ascii2ab(payload.publicRandom);
      this.#cache.publicRandomSignature =
          binary.ascii2ab(payload.publicRandomSignature);
      this.#cache.publicSigningKey =
          binary.ascii2ab(payload.publicSigningKey);
      this.#cache.publicEncryptionKey =
          binary.ascii2ab(payload.publicEncryptionKey);
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
   * @return {Uint8Array} the cryptosat public key used for signing that was
   *         last reported by the satellite. As opposed to other methods in this
   *         client, the timestamp is not reported here as the public key is
   *         expected to change throughout the lifetime of the satellite.
   */
  getPublicSigningKey() {
    return this.#cache.publicSigningKey;
  }

  /**
   * @return {Uint8Array} the cryptosat public key used for encryption that was
   *         last reported by the satellite. As opposed to other methods in this
   *         client, the timestamp is not reported here as the public key is
   *         expected to change throughout the lifetime of the satellite.
   */
  getPublicEncryptionKey() {
    return this.#cache.publicEncryptionKey;
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
   * @return {Request} - a request object to followup on the status of the
   *         request. Once ready, the result will include an object with the
   *         random generated bytes along with a signature over the bytes and
   *         the supplied nonce using the satellite's encryption key.
   */
  getPrivateRandom(publicKey, nonce) {
    const payload = {
      publicKey: binary.ab2ascii(publicKey),
      nonce: binary.ab2ascii(nonce),
    };
    const callback = (payload) => {
      return {
        encryptedRandom: binary.ascii2ab(payload.encryptedRandom),
        signature: binary.ascii2ab(payload.signature),
      };
    };
    return this.#sendRequest(payload, 'privateRandom', callback);
  }


  /**
   * Request a signature from the satellite of a given message.
   * @param {string} msg - the message requiring a signature.
   * @return {Request} - a tracking object to followup on the status of the
   *         request. Once ready, the result will include an object with the
   *         signature of the message using the satellite's signing key.
   */
  sign(msg) {
    const callback = (payload) => {
      return {
        signature: binary.ascii2ab(payload.signature),
        timestamp: payload.timestamp,
      };
    };
    return this.#sendRequest(btoa(msg), 'signature', callback);
  }

  createDelayedKeypair(time_to_release) {
    const payload = {
      time_to_release: time_to_release,
    };

    const callback = (payload) => {
      return {
        keypair_id: payload,
      };
    };
    return this.#sendRequest(payload, 'DE_CREATE', callback);
  }

  deleteDelayedKeypair(id) {
    const payload = {
      keypair_id: id,
    };

    const callback = (payload) => {
      return {
        command_status: payload.command_status,
      };
    };
    return this.#sendRequest(payload, 'DE_DELETE', callback);
  }

  fetchDelayedPubKey(id) {
    const payload = {
      keypair_id: id,
    };

    const callback = (payload) => {
      return {
        public_key: payload,
      };
    };
    return this.#sendRequest(payload, 'DE_FETCH_PUB', callback);
  }

  fetchDelayedPrivKey(id) {
    const payload = {
      keypair_id: id,
    };

    const callback = (payload) => {
      return {
        payload: payload,
      };
    };
    return this.#sendRequest(payload, 'DE_FETCH_PRIV', callback);
  }

  fetchKeypairList() {
    const payload = {};
    const callback = (payload) => {
      return {
        payload: payload,
      };
    };
    return this.#sendRequest(payload, 'DE_LIST_KEYPAIRS', callback);
  }

  /**
   * Calculates when is the next time the satellite will be online, namely
   * that one of the ground stations in the network will have line of sight to
   * the satellite and will be able to transmit and receive data.
   * @return {Date} the date of the next transmission window or null if no
   *        transmission window is found within the next deadline.
   */
  nextOnlineTime() {
    return this.#gsnetwork.nextTransmissionWindow(this.#satellite);
  }
};

module.exports = MainClient;
