/**
 * Abstract class representing a service to be implemented on the satellite.
 * A service can be any class derived from the Service base class. The service
 * is then intended to be bound to a Satellite object using the Satellite's
 * 'bindService' function. New services should optionally override the
 * broadcast and receive functions with custom logic and can invoke the
 * 'send' function that will be supplied by the satellite at binding time.
 */
class Service {
  /**
   * Pure virtual constructor preventing direct instantiation
   * of a Service object.
   * @param {Universe} universe - the universe object modeling the simulation
   *        environment and context.
   */
  constructor(universe) {
    this.universe = universe;
    if (this.constructor == Service) {
      throw new Error('Service is an abstract base class.');
    }
  }

  /**
   * To be called by a satellite to supply an implementation of the `send`
   * function.
   * @param {Function} send - a function used for transmitting messages to
   *        listening ground stations.
   */
  bind(send) {
    this.send = send;
  }


  /**
   * An abstract method to be replaced at the time of binding by the satellite
   * object.
   * @throw {Error} indicating the function is virtual and not implemented.
   */
  send() {
    throw new Error('Service not bound to satellite. ' +
        'please bind it to a satellite using "Satellite.bindService()"');
  }

  /**
   * Broadcast a message periodically. This function will be invoked at the
   * broadcast period of the satellite and is expected to return the contents
   * of the message to broadcast
   * TODO: Implement custom broadcasting times.
   */
  broadcast() {}


  /**
   * Receive a transmission from a ground station.
   * @param {String} body - the contents of the transmission relevant to this
   *         service.
   */
  receive(body) {}
}

module.exports = Service;
