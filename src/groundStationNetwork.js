const GroundStation = require('./groundStation');

/**
 * Class representing a collection of ground stations operating as a single
 * entity.
 */
class GroundStationNetwork {
  #id = null;
  #stations = null;
  #nextListenId = 0;
  #listeners = {};

  /**
   * @param {Universe} universe - a new universe to evaluate.
   * @throws an error if the new universe is different than the universe of
   * the rest of the ground stations in the network.
   */
  #assertConsistentUniverse(universe) {
    const universes = new Set(Object.values(
        this.#stations).map((s) => {
      return s.universe();
    }));
    universes.add(universe);
    if (universes.size != 1) {
      throw new Error('Universe mismatch');
    }
  }

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
  id() {
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
    const sid = station.id();
    this.#assertConsistentUniverse(station.universe());
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
   * @param {Satellite} satellite - the satellite to observe.
   * @return {GroundStation} the closest station to the satellite.
   */
  closestTo(satellite) {
    if (Object.values(this.#stations).length == 0) return null;
    const stationsWithDistance = Object.values(this.#stations).map(
        (station) => {
          const angle = station.angleTo(satellite);
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
   * @param {Satellite} satellite - the satellite to observe.
   * @return {[GroundStation]} a list of stations that have a direct line of
   *         sight to the satellite.
   */
  visibleStations(satellite) {
    return Object.values(this.#stations).filter((station) => {
      return station.hasLineOfSight(satellite);
    });
  }

  /**
   * Calculates when is the next time one of the stations in the network
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
    const nextWindows = Object.values(this.#stations).map((s) =>
      s.nextTransmissionWindow(satellite, futureSeconds, stepSeconds),
    ).filter((w) => w != null).sort();
    return nextWindows.length > 0 ? nextWindows[0] : null;
  }

  /**
   * Register to listen for received messages by the ground stations.
   * @param {function} callback - a callback to be invoked whenever a new
   *        message is received.
   * @return {Number} an identifier that can be supplied to the `stopListening`
   *         function in order to stop invoking the callback upon receipt of
   *         new messages.
   */
  startListening(callback) {
    const listenId = this.#nextListenId;
    this.#nextListenId += 1;
    const listeners = {};
    for (const [stationId, station] of Object.entries(this.#stations)) {
      listeners[stationId] = station.startListening(callback);
    }
    this.#listeners[listenId] = listeners;
    return listenId;
  }

  /**
   * Unregister a previous request to listen for messages received by the
   * ground station.
   * @param {Number} listenId - an identifier supplied by the 'startListening`
   *        function identifying the request to revoke.
   */
  stopListening(listenId) {
    const listeners = this.#listeners[listenId];
    if (!listeners) return;
    for (const [stationId, listenId] of Object.entries(listeners)) {
      this.#stations[stationId].stopListening(listenId);
    }
    delete this.#listeners[listenId];
  }

  /**
   * Transmit a message via all the ground stations in the network to all
   * satellites in view.
   * @param {String} msg - the message contents to transmit.
   */
  transmit(msg) {
    for (const station of Object.values(this.#stations)) {
      station.transmit(msg);
    }
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
   * @param {Universe} universe - The universe for which the ground station
   *        should belong.
   * @param {Object} blob - a serialization of the network produced by the
   *        serialize function.
   * @return {GroundStationNetwork} - a reconstructed network.
   */
  static deserialize(universe, blob) {
    const gsnetwork = new GroundStationNetwork(blob.id);
    blob.stations.forEach((stationBlob) => {
      gsnetwork.addStation(GroundStation.deserialize(universe, stationBlob));
    });
    return gsnetwork;
  }
};

module.exports = GroundStationNetwork;
