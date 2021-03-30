const GroundStation = require('./groundStation');

/**
 * Class representing a collection of ground stations operating as a single
 * entity.
 */
class GroundStationNetwork {
  #id = null;
  #stations = null;

  /**
   * Construct a ground station network.
   * @param {String} id - the unique id of the ground station network.
   */
  constructor(id) {
    this.#id = id;
    this.#stations = {};
  }

  /**
   * @return {String} the unique ID identifying the ground station network.
   */
  getId() {
    return this.#id;
  }


  /**
   * @return {Object} a list of the stations comprising the network.
   */
  getStations() {
    return Object.values(this.#stations);
  }

  /**
   * Add a station to the network.
   * @param {GroundStation} station - a ground station to add.
   */
  addStation(station) {
    const sid = station.getId();
    if (this.#stations[sid] !== undefined) {
      throw new Error('Station with id: \'' + station.id +
        '\' already exists in the network.');
    }
    this.#stations[sid] = station;
  }

  /**
   * Remove a station from the network.
   * @param {String} stationId - ID of the ground station to remove.
   */
  removeStation(stationId) {
    if (this.#stations[stationId] === undefined) {
      throw new Error('Station with id: \'' + stationId +
        '\' doesn\'t exists in the network.');
    }
    delete this.#stations[stationId];
  }

  /**
   * Calculates which of the station is closest to the satellite in
   * Euclidian distance.
   * @param {Clock} clock - a clock representing the current time.
   * @param {Satellite} satellite - the satellite to observe.
   * @return {GroundStation} the closest station to the satellite.
   */
  closestTo(clock, satellite) {
    if (Object.values(this.#stations).length == 0) return null;
    const stationsWithDistance = Object.values(this.#stations).map(
        (station) => {
          const angle = station.angleTo(clock, satellite);
          return {
            'station': station,
            'distance': (angle.elevation > 0) ? angle.distance : Infinity,
          };
        }).sort();
    const closest = stationsWithDistance[0];
    return closest.distance === Infinity ? null : closest.station;
  };

  /**
   * Calculates which of the network's stations have a line of sight to
   * the satellite.
   * @param {Clock} clock - a clock representing the current time.
   * @param {Satellite} satellite - the satellite to observe.
   * @return {[GroundStation]} a list of stations that have a direct line of
   *         sight to the satellite.
   */
  visibleStations(clock, satellite) {
    return Object.values(this.#stations).filter((station) => {
      return station.hasLineOfSight(clock, satellite);
    });
  }

  /**
   * Calculates when is the next time one of the stations in the network
   * will have line of sight to the satellite and will be able to transmit
   * and receive data.
   * @param {Clock} clock - a clock representing the current time.
   * @param {Satellite} satellite - the satellite to observe.
   * @return {Date} the date of the next transmission window.
   */
  nextTransmissionWindow(clock, satellite) {
    throw new Error('Not implemented');
    return null;
  }

  /**
   * Export the network.
   * @return {Object} a serialized representation of the ground station network.
   */
  serialize() {
    return {
      'id': this.#id,
      'stations': Object.values(this.#stations).map((station) => {
        return station.serialize();
      }),
    };
  }

  /**
   * Import a network.
   * @param {Object} blob - a serialization of the network produced by the
   *         serialize function.
   * @return {GroundStationNetwork} - a reconstructed network.
   */
  static deserialize(blob) {
    const gsnetwork = new GroundStationNetwork(blob.id);
    blob.stations.forEach((stationBlob) => {
      gsnetwork.addStation(GroundStation.deserialize(stationBlob));
    });
    return gsnetwork;
  }
};

module.exports = GroundStationNetwork;
