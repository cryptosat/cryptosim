
/* The radius of the earth in kilometers */
const EARTH_RADIUS_KM = 6371.009;

/**
 * Class representing a position on earth or orbit in geographic
 * coordinate system . This is the familiar latitude, longitude, and
 * altitude that we all know and love.
 * https://en.wikipedia.org/wiki/Geographic_coordinate_system
 */
class GeoCoordinates {
  /**
   * Construct a GeoCoordinate object from 3 distinct coordinates.
   * @param {Number} latitude - Latitude
   * @param {Number} longitude - Longitude
   * @param {Number} altitude - Altitude
   */
  constructor(latitude, longitude, altitude) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.altitude = altitude;
  }

  /**
   * Creates a clone of this object.
   * @returns {GeoCoordinates} a new object that with identical properties
   *          this object.
   */
  clone() {
    return new GeoCoordinates(
      this.latitude,
      this.longitude,
      this.altitude);
  }

  /**
   * The distance as measured along the surface of the earth. Altitude is
   * ignored in the calculation.
   * @param {GeoCoordinates} pos - another GeoCoordinates object representing a
   *        location on earth.
   * @return {Number} the great circle distance between the coordinates,
            in kilometers.
   */
  geographicalDistanceTo(pos) {
    const dlambda = (pos.longitude - this.longitude) * Math.PI / 180;
    const phi1 = pos.latitude * Math.PI / 180;
    const phi2 = this.latitude * Math.PI / 180;
    const dphi = phi1 - phi2;
    return EARTH_RADIUS_KM * 2 * Math.asin(
        Math.sqrt(Math.sin(dphi / 2)**2 +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2)**2));
  }

  /**
   * The linear distance to another geographical coordinate. As opposed to
   * geographicDistance, this function calculates the distance as a straight
   * line. It is useful for mearuing the distance between a terretrial object
   * and celestial body and/or between two celestial bodies.
   * @param {GeoCoordinates} pos - another GeoCoordinates object representing a
   *        location on earth.
   * @return {Number} the linear distance between the coordinates, in
            kilometers.
   */
  linearDistanceTo(pos) {
    const phi1 = pos.latitude * Math.PI / 180;
    const lambda1 = pos.longitude * Math.PI / 180;
    const length1 = EARTH_RADIUS_KM + pos.altitude;
    const phi2 = this.latitude * Math.PI / 180;
    const lambda2 = this.longitude * Math.PI / 180;
    const length2 = EARTH_RADIUS_KM + this.altitude;
    const x1 = Math.cos(phi1) * Math.cos(lambda1) * length1;
    const y1 = Math.sin(phi1) * Math.cos(lambda1) * length1;
    const z1 = Math.sin(lambda1) * length1;
    const x2 = Math.cos(phi2) * Math.cos(lambda2) * length2;
    const y2 = Math.sin(phi2) * Math.cos(lambda2) * length2;
    const z2 = Math.sin(lambda2) * length2;
    return Math.sqrt((x1 - x2)**2 + (y1 - y2)**2 + (z1 - z2)**2);
  }
};

GeoCoordinates.EARTH_RADIUS_KM = EARTH_RADIUS_KM;

module.exports = GeoCoordinates;
