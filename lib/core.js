/**
* core.js
*
* This module contains the math and physics calculations for describing the
* the trajectories of satellites in orbit. It is a low level module that is
* *not* meant to be consumed directly. Instead, it should be used by higher
* level classes and modules that abstract away the details from the end user.
* This module utilizes the satellite.js as its underlying engine and is itself
* just an adapter on top of it. Concentrating the relevant functionality in
* this module is meant to isolate consumers from such implementation details
* and make it easier to swap the underlying engine in the future.
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
* the satellite has progressed. The functions in the core module operate on
* primitive types such as latitude, longitude, as opposed to higher level
* objects (such as a "Location" type that aggregates both latitude and
* longitude) so as to make it easier to reason about its operation and keep
* it isolated from any dependencies in this package.
*/

satellite = require('satellite.js/lib/index');

exports.createSatelliteRecord = function(tleLine1, tleLine2) {
  return satellite.twoline2satrec(tleLine1, tleLine2);
};

exports.propagate = function(satrec, date) {
  const positionAndVelocity = satellite.propagate(satrec, date);
  const positionEci = positionAndVelocity.position;
  const gmst = satellite.gstime(date);
  const positionGd = satellite.eciToGeodetic(positionEci, gmst);
  const longitudeRad = positionGd.longitude;
  const latitudeRad = positionGd.latitude;
  const height = positionGd.height;

  return {
    'longitude': satellite.degreesLong(longitudeRad),
    'latitude': satellite.degreesLat(latitudeRad),
    'altitude': height,
  };
};

exports.angleTo = function(satrec, date, latitude, longitude, altitude) {
  const positionAndVelocity = satellite.propagate(satrec, date);
  const positionEci = positionAndVelocity.position;
  const gmst = satellite.gstime(date);
  const positionEcf = satellite.eciToEcf(positionEci, gmst);
  const observerGd = {
    longitude: satellite.degreesToRadians(longitude),
    latitude: satellite.degreesToRadians(latitude),
    height: altitude,
  };
  const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);
  const azimuth = lookAngles.azimuth;
  const elevation = lookAngles.elevation;
  const distance = lookAngles.rangeSat;
  return {
    'azimuth': azimuth,
    'elevation': elevation,
    'distance': distance,
  };
};
