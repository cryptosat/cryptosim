/**
 * Abstract class representing a protocol to be implemented on the satellite.
 * A protocol can be any class derived from the protocol object. The protocol
 * is then intended to be bound to a Satellite object using the Satellite's
 * 'bindProtocol' function. New protocols should optionally override the
 * broadcast and receive functions with custom logic and can invoke the
 * 'send' function that will be supplied by the satellite at binding time.
 */
class Protocol {

  /**
   * Pure virtual constructor preventing direct instantiation
   * of a Protocol object.
   * @param {Universe} universe - the universe object modeling the simulation
   *        environment and context.
   */
  constructor(universe) {
    this.universe = universe;
    if (this.constructor == Protocol) {
      throw new Error('Protocol is an abstract base class.');
    }
  }

  /**
   * To be called by a satellite to supply an implementation of the `send`
   * function.
   * @param {Function} send - a function used for transmiggin messages to
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
    throw new Error('Protocol not bound to satellite. ' +
        'please bind it to a satellite using "Satellite.bindProtocol()"');
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
   *         protocol.
   */
  receive(body) {}
}

module.exports = Protocol;
