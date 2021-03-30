
/**
 * Class representing a ground station. Ground stations are stations set up
 * on earth to communicate with cryptosatellites. The class represents both
 * the physical attributes of the stations (such as location) as well as
 * the computational aspects such as transmitting messages, receving messages
 * figuring out the next transmission window, etc.
 *
 */
class GroundStation {
  #id = null;
  #position = null;

  /**
   * Construct a ground station.
   * @param {String} id - a unique string identifying the satellite.
   * @param {GeoCoordinates} position - the position of the satellite on earth.
   */
  constructor(id, position) {
    this.#id = id;
    this.#position = position;
  }

  /**
   * @return {String} the unique ID string of the ground station.
   */
  getId() {
    return this.#id;
  }

  /**
   * @return {GeoCoordinates} the location of the station on earth.
   */
  getPosition() {
    return this.#position;
  }


  /**
   * Compute the angle between a ground station and a satellite.
   * @param {Clock} clock - a clock indicating the current time.
   * @param {Satellite} satellite - a satellite to observe.
   * @return {LookAngle} the angle at which the satellite appears in the sky.
   */
  angleTo(clock, satellite) {
    return satellite.getOrbit().angleFrom(clock, this.#position);
  };

  /**
   * Determines whether there is a clear line of sight between a ground
   * station and a satellite.
   * @param {Clock} clock - a clock indicating the current time.
   * @param {Satellite} satellite - a satellite to observe.
   * @return {Boolean} whether or not the satellite is visible from the ground
   *         station.
   */
  hasLineOfSight(clock, satellite) {
    const angle = this.angleTo(clock, satellite);
    return angle.elevation > 0;
  }

  /**
   * Calculate the next time at which the ground station will be able to
   * communicate to the satellite.
   * @param {Clock} clock - a clock indicating the current time.
   * @param {Satellite} satellite - a satellite to communicate with.
   * @param {Number} windowMilliseconds - a duration in milliseconds indicating
   *         how far into the future to search for a transmission window.
   * @return {Date} the next time at which communication between the ground
   *         station and the satellite will be possible.
   */
  nextTransmissionWindow(clock, satellite, windowMilliseconds) {
    throw new Error('Not implemented.');
    return null;
  }

  /**
   * Export the ground station.
   * @return {String} a serialization of the ground station.
   */
  serialize() {
    return {
      'id': this.#id,
      'position': this.#position.serialize(),
    };
  }

  /**
   * Import a ground station.
   * @param {String} blob - a serialization of the ground station as exported
   *        by the deserialize() function.
   * @return {GroundStation} - a reconstructed GroundStation object.
   */
  static deserialize(blob) {
    return new GroundStation(blob.id,
        GeoCoordinates.deserialize(blob.position));
  }
};

module.exports = GroundStation;
