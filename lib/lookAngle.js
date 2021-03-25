
/**
 * Class expressing the geometric relationship between a satellite and an
 * terrestrial observer or a celestial body.
 * https://www.celestis.com/resources/faq/what-are-the-azimuth-and-elevation-of-a-satellite/
 */
class LookAngle {
  /**
   * Construct a LookAngle object.
   * @param {Number} azimuth - the direction, in radians, from the observer
            towards the celestial object where 0 is North, PI / 2 is East, PI is
            South and 3 * PI / 4 is West. This tells the observer which way to
            turn.
   * @param {Number} elevation - Meausre the elevation over the horizon, in
            radians. 0 is just at the horizon, PI / 2 is at the zenith, and
            anything below 0 is below the horizon.
   * @param {Number} distance - The euclidian distance from the observer to the
            object in Kilometers.
   */
  constructor(azimuth, elevation, distance) {
    this.azimuth = azimuth;
    this.elevation = elevation;
    this.distance = distance;
  }
};

module.exports = LookAngle;
