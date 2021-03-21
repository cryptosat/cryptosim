const core = require('./core');


const ISS_TLE = [
  '1 25544U 98067A   21027.77992426  .00003336  00000-0  68893-4 0  9991',
  '2 25544  51.6465 317.1909 0002399 302.6503 164.1536 15.48908950266831',
];

test('satellite record instantiation', () => {
  expect(core.createSatelliteRecord(ISS_TLE[0], ISS_TLE[1])).toBeDefined();
});

test('propagate satellite over short distance', () => {
  const satrec = core.createSatelliteRecord(ISS_TLE[0], ISS_TLE[1]);
  const d1 = new Date(2020, 1, 1, 0, 0, 0, 0);
  const d2 = new Date(2020, 1, 1, 0, 0, 1, 0); // one second later
  const location1 = core.propagate(satrec, d1);
  const location2 = core.propagate(satrec, d2);
  const dlat = Math.abs(location1.latitude - location2.latitude);
  const dlng = Math.abs(location1.longitude - location2.longitude);
  expect(dlat).toBeLessThan(1);
  expect(dlng).toBeLessThan(1);
});

test('propagate satellite over long distance', () => {
  const satrec = core.createSatelliteRecord(ISS_TLE[0], ISS_TLE[1]);
  const d1 = new Date(2020, 1, 1, 0, 0, 0, 0);
  const d2 = new Date(2020, 1, 1, 1, 0, 0, 0); // one hour later
  const location1 = core.propagate(satrec, d1);
  const location2 = core.propagate(satrec, d2);
  const dlat = Math.abs(location1.latitude - location2.latitude);
  const dlng = Math.abs(location1.longitude - location2.longitude);
  expect(dlat).toBeGreaterThan(10);
  expect(dlng).toBeGreaterThan(10);
});

test('angle to observer directly underneath satellite', () => {
  const satrec = core.createSatelliteRecord(ISS_TLE[0], ISS_TLE[1]);
  const d = new Date(2020, 1, 1, 0, 0, 0, 0);
  const location = core.propagate(satrec, d);
  angle = core.angleTo(satrec, d, location.latitude, location.longitude, 0);
  expect(angle.elevation).toBeCloseTo(Math.PI / 2);
  expect(angle.distance).toBeCloseTo(location.altitude);
});

test('angle to observer within view of satellite', () => {
  const satrec = core.createSatelliteRecord(ISS_TLE[0], ISS_TLE[1]);
  const d = new Date(2020, 1, 1, 0, 0, 0, 0);
  const location = core.propagate(satrec, d);
  angle = core.angleTo(satrec, d, location.latitude + 1, location.longitude, 0);
  expect(angle.elevation).toBeLessThan(Math.PI / 2);
  expect(angle.elevation).toBeGreaterThan(0);
});

test('angle to observer out of satellite view', () => {
  const satrec = core.createSatelliteRecord(ISS_TLE[0], ISS_TLE[1]);
  const d = new Date(2020, 1, 1, 0, 0, 0, 0);
  const location = core.propagate(satrec, d);
  const oppositeLongitude = (location.longitude + 360) % 180 - 180;
  angle = core.angleTo(satrec, d, location.latitude, oppositeLongitude, 0);
  expect(angle.elevation).toBeLessThan(0);
});
