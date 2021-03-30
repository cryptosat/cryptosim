
const Orbit = require('./Orbit');

/**
 * Class representing a cryposatellite. The representation consists of
 * the physical attributes of the satellites (such as orbit) as well as
 * the computational aspects such as transmitting messages, receving messages
 * generating random values, etc.
 *
 */
class Satellite {
  #id = null;
  #orbit = null;

  /**
   * Construct a satellite.
   * @param {String} id - a unique identifier of the satellite.
   * @param {String} tle1 - the first line in the satellite's two line element
   *         set.
   * @param {String} tle2 - the second line in the satellite's two line
   *         element set.
   */
  constructor(id, tle1, tle2) {
    this.#id = id;
    this.#orbit = new Orbit(tle1, tle2);
  }


  /**
   * @return {String} the satellite's unique ID string.
   */
  getId() {
    return this.#id;
  }

  /**
   * @return {Orbit} a representation of the satellite's orbit.
   */
  getOrbit() {
    return this.#orbit;
  }

  /**
   * Retrieve the position of the satellite
   * @param {Clock} clock - a clock representing the current time.
   * @return {GeoCoordinates} the position of the satellite at the given
   *          moment in time.
   */
  getPosition(clock) {
    return this.#orbit.getPosition(clock);
  }
};

module.exports = Satellite;
