core = require('./core');


/** Class representing the orbit of a celestial body */
class Orbit {
  /**
   * Construct an orbit using a Two Line Element (TLE) set.
   * https://en.wikipedia.org/wiki/Two-line_element_set
   * @param {String} tleLine1 - the first line in the TLE.
   * @param {String} tleLine2 - the second line in the TLE.
   */
  constructor(tleLine1, tleLine2) {
    this.satrec = core.createSatelliteRecord(tleLine1, tleLine2);
  }

  /**
   * Returns ths position of the satellite at a given point in time.
   * @param {Date} date - the date specifing how far along is the satellite
   *         along its trajectory
   * @return {{longitude: Number, latitude: Number, altitude: Number}}  The
   *         geographic coordinates of the satellites.
  */
  getPosition(date) {
    return GeoLocation(core.propagate(this.satrec, date));
  }

  /**
   * Returns information about the angle and distance from a point on earth to
   * the position of the orbit at a given point in time.
   * @param {Date} date - the date specifing how far along is the satellite
   *         along its trajectory
   * @param {GeoLocation} position - the position of the observation point in
            geographic coordinates.
   * @return {{azimuth: Number, elevation: Number, distance: Number}}  The
            azimuth with 0 indicating north, the elevation angle from -PI
            radians to +PI radians, with numbers below zero indicating no line
            of sight, and a euclidean distance to the body in kilometers.
  */
  angleFrom(date, position) {
    return core.angleTo(this.satrec, date,
        position.latitude,
        position.longitude,
        position.altitude);
  };
};

module.exports = Orbit;
