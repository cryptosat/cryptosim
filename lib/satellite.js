
const Orbit = require('./orbit');

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
  #services = {};
  #broadcastPeriodMilliseconds = 5000;
  #functional = null;

  /**
   * Construct a satellite.
   * @param {Universe} universe - The universe for which the satellite should
   *         belong.
   * @param {int} functional - 1 if the satellite should respond to commands, otherwise 0.
   * @param {String} id - a unique identifier of the satellite.
   * @param {String} tle1 - the first line in the satellite's two line element
   *         set.
   * @param {String} tle2 - the second line in the satellite's two line
   *         element set.
   */
  constructor(universe, functional, id, tle1, tle2) {
    this.#universe = universe;
    this.#id = id;
    this.#tle = [tle1, tle2];
    this.#orbit = new Orbit(tle1, tle2);
    this.#functional = functional;
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
   *
   * @return {Int} returns if the satellite is functional or not.
   */
  isFunctional() {
    return this.#functional;
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
   * Bind a service to the satellite.
   * @param {String} id - a unique string identifying the service.
   * @param {Service} service - a service object able to receive/broadcast
   *        messages.
   * @throw {Error} if the service with the given id has already been bound
   *        to the satellite.
   */
  bindService(id, service) {
    if (id in this.#services) {
      throw Error('Service with id: "' + id +
          '" already bound to satellite.');
    }
    this.#services[id] = service;
    service.bind(this.send.bind(this, id));
  }

  /**
   * Transmit a message to listening ground stations.
   * This is a private function that is provided to service implementations
   * with the id already bound so as to abstract away the routing mechanism
   * from the service implementation. see 'bindService'
   * @param {String} id - the service id of the originating message.
   * @param {String} payload - the contents of the message.
   */
  send(id, payload) {
    const msg = {
      satelliteHeader: {
        serviceId: id,
      },
      satellitePayload: payload,
    };
    return this.#universe.transmitFromSatellite(this, msg);
  }

  /**
   * Receive a transmission from a ground station.
   * @param {{satelliteHeader: {serviceId: string},
   *        satellitePayload: Object}} msg - the contents of the received
   *        transmission. The format should include the id of the service to
   *        route this message to and the body of the message to pass to the
   *        service for processing.
   *
   */
  receive(msg) {
    const header = msg.satelliteHeader;
    if (!('serviceId' in header)) {
      console.error('Corrupt message: missing serviceId');
      return;
    }

    const service = this.#services[header.serviceId];
    if (!service) {
      console.error('Service id: "' + header.serviceId +
          '" not recognized by satellite. ');
      return;
    }
    service.receive(msg.satellitePayload);
  }

  /**
   * Periodically broadcast a message to a ground station. This mehtod is
   * a convenience wrapper saving bound services from the hassle of
   * implementing their own broadcast logic. Instead, the satellite assembles
   * the periodic broadcast messages from each service in a centralized
   * fashion.
   */
  #broadcast() {
    //for (const [id, service] of Object.entries(this.#services)) {
      //const body = service.broadcast();
      //if (!body) continue;
      //this.send(id, body);
    //}
    // schedule next broadcast.
    //this.#universe.clock().callbackIn(
        //this.#broadcastPeriodMilliseconds,
        //() => {
          //this.#broadcast();
        //});
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
   * Import a satellite.
   * @param {Universe} universe - The universe for which the satellite should
   *        belong.
   * @param {String} blob - a serialization of the satellite as exported by the
   *        serialize() function.
   * @return {Satellite} - a reconstructed satellite.
   */
  static deserialize(universe, blob) {
    return new Satellite(universe, blob.functional, blob.id, blob.tle[0], blob.tle[1]);
  }
};

module.exports = Satellite;
