const GroundStation = require('./groundStation');
const Satellite = require('./satellite');
const SimulatedClock = require('./clocks/simulatedClock');

/**
 * The Universe class is represents the physical environment in which the
 * simulation takes place. It is responsible for modelling the passage of time,
 * communication between satellites and ground stations, etc. In the object
 * oriented framework where elements such as satellites and ground stations
 * are represented as objects, the universe is responsible for coordinating
 * all inter-object communication and relations. The recommended way to
 * associate an object with a universe is to require a universe to be passed
 * in as arguments to the objects constructor.
 *
 */
class Universe {
  #clock = null;
  #satellites = null;
  #stations = null;

  /**
   * Construct a universe.
   * @param {Clock} clock - A clock to represent the passage of time. It is
   *        provided as an argument to allow the user to specify the desired
   *        clock implementation.
   */
  constructor(clock) {
    this.#clock = clock;
    this.#satellites = new Map();
    this.#stations = new Map();
  }

  /**
   * Raise an error if the given universe is incompatible with this object.
   * This check is used when handling objects passed in as arguments to ensure
   * the user hasn't accidentally mixed and matched elements from different
   * universes.
   * @param {Universe} universe - a unvierse to evaluate.
   * @throw {Error} if the given universe is not the same as this object.
   */
  #assertUniverse(universe) {
    if (universe !== this) {
      throw Error('Universe mismatch');
    }
  }

  /**
   * @return {Clock} the clock used for modeling passage of time.
   */
  clock() {
    return this.#clock;
  }

  /**
   * @return {GroundStation[]} an array of ground stations that have been added
   *          to the universe.
   */stations() {
    return this.#stations;
  }

  /**
   * @return {Satellites[]} an array of satellites that have been added
   *          to the universe.
   */
  satellites() {
    return this.#satellites;
  }

  /**
   * Associate a new satellite with the universe
   * @param {Satellite} satellite - a new satellite to attach to the universe.
   * @throws an error if the satellite with the same id already exists in the
   *          universe.
   */
  addSatellite(satellite) {
    const sid = satellite.id();
    if (this.#satellites.has(sid) && this.#satellites.get(sid) != satellite) {
      throw new Error('Satellite with id: \'' + sid +
        '\' already exists in the universe.');
    }
    this.#satellites.set(sid, satellite);
  }

  /**
   * Associate a new ground station with the universe
   * @param {GroundStation} station - a new station to attach to the universe.
   * @throws an error if a ground station with the same id already exists in
   *        the universe.
   */
  addGroundStation(station) {
    const sid = station.id();
    if (this.#stations.has(sid) && this.#stations.get(sid) != station) {
      throw new Error('Station with id: \'' + sid +
        '\' already exists in the universe.');
    }
    this.#stations.set(sid, station);
  }

  /**
   * Transmit a message from a ground station. The message will be received
   * by all satellites that have a line of sight to the station.
   * @param {GroundStation} station - the station to originate the transmission.
   * @param {String} msg - the message contents to transmit.
   * @param {Number} milliseconds - optionally include a delay to transmit the
   *        message at a time in the future.
   * @return {Number} when milliseconds = 1: 1 if station has line of sight, 0 if not. whenever milliseconds != 1, return 2.
   */
   transmitFromStation(station, msg, milliseconds = 1) {
    this.#assertUniverse(station.universe());
    if(milliseconds == 1){
      for (const sat of this.#satellites.values()) {
        if(station.hasLineOfSight(sat) && sat.isFunctional() == 1) {
          sat.receive(msg);
          return 1;
        }
      }
  
      return 0;
    }

    this.#clock.callbackIn(milliseconds, () => {
      for (const sat of this.#satellites.values()) {
        if (station.hasLineOfSight(sat)) {
          sat.receive(msg);
        }
      }
    });

    return 2;
  }

  /**
   * Transmit a message from a satellites. The message will be received
   * by all ground stations that have a line of sight to the satellite.
   * @param {Satellite} satellite - the satellite to originate the transmission.
   * @param {String} msg - the message contents to transmit.
   * @param {Number} milliseconds - optionally include a delay to transmit the
   *        message at a time in the future.
   */
  transmitFromSatellite(satellite, msg, milliseconds = 1) {
    this.#assertUniverse(satellite.universe());
    this.#clock.callbackIn(milliseconds, () => {
      for (const station of this.#stations.values()) {
        if (station.hasLineOfSight(satellite)) {
          station.receive(msg);
        }
      }
    });
  }

  /**
   * Remove all satellites and ground stations to restore the universe to
   * its clearn state.
   */
  clear() {
    this.#satellites.clear();
    this.#stations.clear();
    this.#clock.clear();
  }

  /**
   * Export the universe.
   * @return {Object} a serialization of the universe.
   */
  serialize() {
    const satellites = [];
    const stations = [];
    for (const sat of this.#satellites.values()) {
      satellites.push(sat.serialize());
    }
    for (const station of this.#stations.values()) {
      stations.push(station.serialize());
    }
    return {
      satellites: satellites,
      stations: stations,
      clock: this.#clock.now(),
    };
  }

  /**
   * Import a universe.
   * @param {String} blob - a serialization of the universe as exported by the
   *        serialize() function.
   * @param {Function} clockType - the type of clock to use in the universe.
   *        Must support the Clock interface.
   * @return {Universe} - a reconstructed universe.
   */
  static deserialize(blob, clockType = SimulatedClock) {
    const clock = new SimulatedClock(new Date(blob.clock));
    const universe = new Universe(clock);
    for (const b of blob.satellites) {
      Satellite.deserialize(universe, b);
    }
    for (const b of blob.stations) {
      GroundStation.deserialize(universe, b);
    }
    return universe;
  }
}

module.exports = Universe;
