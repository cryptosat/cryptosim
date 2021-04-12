
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
    this.#satellites = {};
    this.#stations = {};
  }

  /**
   * @return {Clock} the clock used for modeling passage of time.
   */
  clock() {
    return this.#clock;
  }

  /**
   * Associate a new satellite with the universe
   * @param {Satellite} satellite - a new satellite to attach to the universe.
   * @throws an error if the satellite with the same id already exists in the
   *          universe.
   */
  addSatellite(satellite) {
    const sid = satellite.id();
    if (this.#satellites[sid] !== undefined &&
        this.#satellites[sid] != satellite) {
      throw new Error('Satellite with id: \'' + sid +
        '\' already exists in the universe.');
    }
    this.#satellites[sid] = satellite;
  }

  /**
   * Associate a new ground station with the universe
   * @param {GroundStation} station - a new station to attach to the universe.
   * @throws an error if a ground station with the same id already exists in
   *        the universe.
   */
  addGroundStation(station) {
    const sid = station.id();
    if (this.#stations[sid] !== undefined &&
        this.#stations[sid] != station) {
      throw new Error('Station with id: \'' + sid +
        '\' already exists in the universe.');
    }
    this.#stations[sid] = station;
  }
}

module.exports = Universe;
