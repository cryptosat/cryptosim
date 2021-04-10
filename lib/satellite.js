
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
