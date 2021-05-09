
const Orbit = require('./Orbit');

/**
 * Class representing a cryposatellite. The representation consists of
 * the physical attributes of the satellites (such as orbit) as well as
 * the computational aspects such as transmitting messages, receving messages
 * generating random values, etc.
 *
 */
class Satellite {
  #universe = null;
  #id = null;
  #orbit = null;
  #tle = null;
  #protocols = {};
  #broadcastPeriodMilliseconds = 5000;

  /**
   * Construct a satellite.
   * @param {Universe} universe - The universe for which the satellite should
   *         belong.
   * @param {String} id - a unique identifier of the satellite.
   * @param {String} tle1 - the first line in the satellite's two line element
   *         set.
   * @param {String} tle2 - the second line in the satellite's two line
   *         element set.
   */
  constructor(universe, id, tle1, tle2) {
    this.#universe = universe;
    this.#id = id;
    this.#tle = [tle1, tle2];
    this.#orbit = new Orbit(tle1, tle2);
    this.#universe.addSatellite(this);
    this.#broadcast();
  }


  /**
   * @return {String} the satellite's unique ID string.
   */
  id() {
    return this.#id;
  }

  /**
   * @return {Orbit} a representation of the satellite's orbit.
   */
  orbit() {
    return this.#orbit;
  }

  /**
   * @return {Universe} the universe the satellite is associated with.
   */
  universe() {
    return this.#universe;
  }

  /**
   * @return {Number} the broadcast period of the satellite in milliseconds.
   */
  broadcastPeriod() {
    return this.#broadcastPeriodMilliseconds;
  }

  /**
   * Retrieve the position of the satellite
   * @return {GeoCoordinates} the position of the satellite at the given
   *          moment in time.
   */
  getPosition() {
    return this.#orbit.getPosition(this.#universe.clock());
  }

  /**
   * Export the satellite.
   * @return {Object} a serialization of the satellite.
   */
  serialize() {
    return {
      'id': this.#id,
      'tle': this.#tle,
    };
  }

  /**
   * Bind a protocol to the satellite.
   * @param {String} id - a unique string identifying the protocol.
   * @param {Protocol} protocol - a protocol object able to receive/broadcast
   *        messages.
   * @throw {Error} if the protocol with the given id has already been bound
   *        to the satellite.
   */
  bindProtocol(id, protocol) {
    if (id in this.#protocols) {
      throw Error('Protocol with id: "' + id +
          '" already bound to satellite.');
    }
    this.#protocols[id] = protocol;
    protocol.bind(this.#send.bind(this, id));
  }

  /**
   * Transmit a message to listening ground stations.
   * This is a private function that is provided to protocol implementations
   * with the id already bound so as to abstract away the routing mechanism
   * from the protocol implementation. see 'bindProtocol'
   * @param {String} id - the protocol id of the originating message.
   * @param {String} body - the contents of the message.
   */
  #send(id, body) {
    const msg = {
      protocolId: id,
      body: body,
    };
    this.#universe.transmitFromSatellite(this, msg);
  }

  /**
   * Receive a transmission from a ground station.
   * @param {{protocolId: String, body: String}} msg - the contents of the
   *        received transmission. The format should include the id of the
   *        protocol to route this message to and the body of the message
   *        to pass to the protocol for processing.
   *
   */
  receive(msg) {
    if (!('protocolId' in msg)) {
      console.error('Corrupt message: missing protocolId');
      return;
    }

    const protocol = this.#protocols[msg.protocolId];
    if (!protocol) {
      console.error('Protocol id: "' + msg.protocolId +
          '" not recognized by satellite. ');
      return;
    }
    protocol.receive(msg.body);
  }

  /**
   * Periodically broadcast a message to a ground station. This mehtod is
   * a convenience wrapper saving bound protocols from the hassle of
   * implementing their own broadcast logic. Instead, the satellite assembles
   * the periodic broadcast messages from each protocol in a centralized
   * fashion.
   */
  #broadcast() {
    for (const [id, protocol] of Object.entries(this.#protocols)) {
      const body = protocol.broadcast();
      if (!body) continue;
      this.#send(id, body);
    }
    // schedule next broadcast.
    this.#universe.clock().callbackIn(
        this.#broadcastPeriodMilliseconds,
        () => {
          this.#broadcast();
        });
  }

  /**
   * Import a satellite.
   * @param {Universe} universe - The universe for which the satellite should
   *        belong.
   * @param {String} blob - a serialization of the satellite as exported by the
   *        serialize() function.
   * @return {Satellite} - a reconstructed satellite.
   */
  static deserialize(universe, blob) {
    return new Satellite(universe, blob.id, blob.tle[0], blob.tle[1]);
  }
};

module.exports = Satellite;
