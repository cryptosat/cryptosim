const GeoCoordinates = require('./geoCoordinates');


test('construct GeoCoordinates object', () => {
  const pos = new GeoCoordinates(1, 2, 3);
  expect(pos.latitude).toBe(1);
  expect(pos.longitude).toBe(2);
  expect(pos.altitude).toBe(3);
});

test('distance between london and nyc', () => {
  const london = new GeoCoordinates(51.5074, 0.1278, 0);
  const nyc = new GeoCoordinates(40.7128, 74.006, 0);
  const truth = 5566.721;
  // Check for precision within +/-10km.
  expect(london.geographicalDistanceTo(nyc)).toBeCloseTo(truth, -1);
  expect(nyc.geographicalDistanceTo(london)).toBeCloseTo(truth, -1);
});

test('vertical distance', () => {
  const pos1 = new GeoCoordinates(1, 2, 3);
  const pos2 = new GeoCoordinates(1, 2, 13);
  expect(pos1.linearDistanceTo(pos2)).toBeCloseTo(10);
});

test('linear distance between locations ' +
       'on the exact opposites side of the world', () => {
  const pos1 = new GeoCoordinates(0, -90, 0);
  const pos2 = new GeoCoordinates(0, +90, 0);
  expect(pos1.linearDistanceTo(pos2)).toBeCloseTo(
      2 * GeoCoordinates.EARTH_RADIUS_KM);
});

test('cloning a GeoCoordinates object returns an identical ' +
     'yet different object', () => {
  const pos1 = new GeoCoordinates(1, 2, 3);
  const pos2 = pos1.clone();
  expect(pos1).toEqual(pos2);
  expect(pos1).not.toBe(pos2); // different objects
});

