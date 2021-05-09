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
   * @param {Clock} clock - a clock representing the current time.
   * @return {{longitude: Number, latitude: Number, altitude: Number}}  The
   *         geographic coordinates of the satellites.
   */
  getPosition(clock) {
    return core.propagate(this.satrec, clock);
  }

  /**
   * Returns information about the angle and distance from a point on earth to
   * the position of the orbit at a given point in time.
   * @param {Clock} clock - a clock representing the current time.
   * @param {GeoLocation} position - the position of the observation point in
   *        geographic coordinates.
   * @return {{azimuth: Number, elevation: Number, distance: Number}}  The
   *        azimuth with 0 indicating north, the elevation angle from -PI
   *        radians to +PI radians, with numbers below zero indicating no line
   *        of sight, and a euclidean distance to the body in kilometers.
   */
  angleFrom(clock, position) {
    return core.angleTo(this.satrec, clock, position);
  };

  /**
   * Determines whether there is a clear line of sight from a point on earth
   * to the position of the orbit at a given point in time.
   * @param {Clock} clock - a clock representing the current time.
   * @param {GeoLocation} position - the position of the observation point in
   *        geographic coordinates.
   * @return {Boolean} whether or not the satellite is visible from the ground
   *         station.
   */
  hasLineOfSight(clock, position) {
    const angle = this.angleFrom(clock, position);
    return angle.elevation > 0;
  }
};

module.exports = Orbit;
