/**
* core.js
*
* This module contains the math and physics calculations for describing the
* the trajectories of satellites in orbit. It is a low level module that is
* *not* meant to be consumed directly. Instead, it should be used by higher
* level classes and modules that abstract away the details from the end user.
* This module utilizes the satellite.js as its underlying engine and is itself
* just an adapter on top of it. It serves as a bridge between the basic building
* blocks of this package such as a Clock, and GeoCoordinates classes to the
* primitive data types required by the package. Concentrating the relevant
* functionality in this module is meant to isolate consumers from such
* implementation details and make it easier to swap the underlying engine in
* the future.
*
* All of the state of a satellite, is captured by an opaque data structure
* called the satellite record. It is instantiated using the two line element
* set (TLE) data format as follows:
*
* var satrec = core.createSatelliteRecord(tle1, tle2);
*
* The satellite record contains information about the satellite's position,
* velocity, and other parameters for a single point in time. Subsequent
* calculations that need to be performed require the satellite record to be
* passed explicitly along with a Date object specifing how far along the orbit
* the satellite has progressed.
*/

satellite = require('satellite.js/lib/index');
GeoCoordinates = require('./geoCoordinates');
LookAngle = require('./lookAngle');

exports.createSatelliteRecord = function(tleLine1, tleLine2) {
  return satellite.twoline2satrec(tleLine1, tleLine2);
};

/**
 * Calculate the satellite's position at a given point in time.
 * @param {Object} satrec - an opaque satellite record object representing the
 *        satellite state.
 * @param {Clock} clock - a clock representing the current time.
 * @return {GeoCoordinates} the position of the satellite.
 */
exports.propagate = function(satrec, clock) {
  const date = clock.now();
  const positionAndVelocity = satellite.propagate(satrec, date);
  const positionEci = positionAndVelocity.position;
  const gmst = satellite.gstime(date);
  const positionGd = satellite.eciToGeodetic(positionEci, gmst);
  const longitudeRad = positionGd.longitude;
  const latitudeRad = positionGd.latitude;
  const height = positionGd.height;

  return new GeoCoordinates(
      satellite.degreesLat(latitudeRad),
      satellite.degreesLong(longitudeRad),
      height);
};

/**
 * Calculate the angle from an observer on earth to the satellite.
 * @param {Object} satrec - an opaque satellite record object representing the
 *        satellite state.
 * @param {Clock} clock - a clock representing the current time.
 * @param {GeoCoordinates} position - the terrestrial position of an observer
  *       on earth.
 * @return {LookAngle} the looking angle from the given position to the
 *         satellite.
 */
exports.angleTo = function(satrec, clock, position) {
  const date = clock.now();
  const positionAndVelocity = satellite.propagate(satrec, date);
  const positionEci = positionAndVelocity.position;
  const gmst = satellite.gstime(date);
  const positionEcf = satellite.eciToEcf(positionEci, gmst);
  const observerGd = {
    longitude: satellite.degreesToRadians(position.longitude),
    latitude: satellite.degreesToRadians(position.latitude),
    height: position.altitude,
  };
  const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
  const azimuth = lookAngles.azimuth;
  const elevation = lookAngles.elevation;
  const distance = lookAngles.rangeSat;
  return new LookAngle(
      azimuth,
      elevation,
      distance,
  );
};
