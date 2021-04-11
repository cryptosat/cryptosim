const SimulatedClock = require('./clocks/simulatedClock');

/**
 * Class representing a ground station. Ground stations are stations set up
 * on earth to communicate with cryptosatellites. The class represents both
 * the physical attributes of the stations (such as location) as well as
 * the computational aspects such as transmitting messages, receving messages
 * figuring out the next transmission window, etc.
 *
 */
class GroundStation {
  #universe = null;
  #id = null;
  #position = null;

  /**
   * Construct a ground station.
   * @param {Universe} universe - The universe for which the ground station
   *        should belong.
   * @param {String} id - a unique string identifying the ground station.
   * @param {GeoCoordinates} position - the position of the ground station on
   *                         earth.
   */
  constructor(universe, id, position) {
    this.#universe= universe;
    this.#id = id;
    this.#position = position;
    this.#universe.addGroundStation(this);
  }

  /**
   * @param {Universe} universe - a new universe to evaluate.
   * @throws an error if the new universe is different than the universe of
   *         this station.
   */
  #assertConsistentUniverse(universe) {
    if (this.#universe !== universe) {
      throw new Error('Universe mismatch');
    }
  }

  /**
   * @return {String} the unique ID string of the ground station.
   */
  id() {
    return this.#id;
  }

  /**
   * @return {GeoCoordinates} the location of the station on earth.
   */
  position() {
    return this.#position;
  }

  /**
   * @return {Universe} the universe the station is associated with.
   */
  universe() {
    return this.#universe;
  }


  /**
   * Compute the angle between a ground station and a satellite.
   * @param {Satellite} satellite - a satellite to observe.
   * @return {LookAngle} the angle at which the satellite appears in the sky.
   */
  angleTo(satellite) {
    return satellite.orbit().angleFrom(this.#universe.clock(),
        this.#position);
  };

  /**
   * Determines whether there is a clear line of sight between a ground
   * station and a satellite.
   * @param {Satellite} satellite - a satellite to observe.
   * @return {Boolean} whether or not the satellite is visible from the ground
   *         station.
   */
  hasLineOfSight(satellite) {
    return satellite.orbit().hasLineOfSight(this.#universe.clock(),
        this.#position);
  }

  /**
   * Calculates when is the next time the station in the network
   * will have line of sight to the satellite and will be able to transmit
   * and receive data.
   * @param {Satellite} satellite - the satellite to observe.
   * @param {Number} futureSeconds - the max number of seconds into the future
   *        to search until.
   * @param {Number} stepSeconds - the granularity to perform the search with.
   *        higher values will improve performance but might lead to false
   *        negatives.
   * @return {Date} the date of the next transmission window or null if no
   *        transmission window is found within the next deadline.
   */
  nextTransmissionWindow(satellite, futureSeconds = 30 * 60 * 60,
      stepSeconds = 5 * 60) {
    this.#assertConsistentUniverse(satellite.universe());
    if (this.hasLineOfSight(satellite)) return this.#universe.clock().now();
    const orbit = satellite.orbit();
    let latest = new Date(this.#universe.clock().now());
    const deadline = new Date(latest);
    deadline.setMilliseconds(deadline.getMilliseconds() + futureSeconds * 1000);
    let step = stepSeconds * 1000;
    while (step > 1) {
      const clock = new SimulatedClock(latest);
      let found = false;
      while (clock.now() <= deadline) {
        if (orbit.hasLineOfSight(clock, this.#position)) {
          clock.advanceByMilliseconds(-step); // rewind clock one step
          found = true;
          step /= 2;
          latest = clock.now();
          break;
        }
        clock.advanceByMilliseconds(step);
      }
      if (!found) {
        return null;
      }
    }
    return latest;
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
   * @param {Universe} universe - The universe for which the ground station
   *        should belong.
   * @param {String} blob - a serialization of the ground station as exported
   *        by the deserialize() function.
   * @return {GroundStation} - a reconstructed GroundStation object.
   */
  static deserialize(universe, blob) {
    return new GroundStation(universe, blob.id,
        GeoCoordinates.deserialize(blob.position));
  }
};

module.exports = GroundStation;
