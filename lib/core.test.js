const core = require('./core');
const SimulatedClock = require('./clocks/simulatedClock');
const testUtils = require('./testUtils');

test('satellite record instantiation', () => {
  expect(core.createSatelliteRecord(
      testUtils.ISS_TLE[0], testUtils.ISS_TLE[1])).toBeDefined();
});

test('propagate satellite over short distance', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const satrec = core.createSatelliteRecord(testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos1 = core.propagate(satrec, clock);
  clock.advanceByMilliseconds(1000);
  const pos2 = core.propagate(satrec, clock);
  const dlat = Math.abs(pos1.latitude - pos2.latitude);
  const dlng = Math.abs(pos1.longitude - pos2.longitude);
  expect(dlat).toBeLessThan(1);
  expect(dlng).toBeLessThan(1);
});

test('propagate satellite over long distance', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const satrec = core.createSatelliteRecord(testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]); const pos1 = core.propagate(satrec, clock);
  clock.advanceByMilliseconds(1000 * 3600);
  const pos2 = core.propagate(satrec, clock);
  const dlat = Math.abs(pos1.latitude - pos2.latitude);
  const dlng = Math.abs(pos1.longitude - pos2.longitude);
  expect(dlat).toBeGreaterThan(10);
  expect(dlng).toBeGreaterThan(10);
});

test('angle to observer directly underneath satellite', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const satrec = core.createSatelliteRecord(testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos1 = core.propagate(satrec, clock);
  const pos2 = pos1.clone();
  pos2.altitude = 0;
  angle = core.angleTo(satrec, clock, pos2);
  expect(angle.elevation).toBeCloseTo(Math.PI / 2);
  expect(angle.distance).toBeCloseTo(pos1.altitude);
});

test('angle to observer within view of satellite', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const satrec = core.createSatelliteRecord(testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]); const pos = core.propagate(satrec, clock);
  pos.altitude = 0;
  pos.latitude += 1;
  angle = core.angleTo(satrec, clock, pos);
  expect(angle.elevation).toBeLessThan(Math.PI / 2);
  expect(angle.elevation).toBeGreaterThan(0);
});

test('angle to observer out of satellite view', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const satrec = core.createSatelliteRecord(testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]); const pos1 = core.propagate(satrec, clock);
  const pos2 = pos1.clone();
  pos2.altitude = 0;
  pos2.longitude =
      (pos1.longitude + 360) % 180 - 180; // across the world
  angle = core.angleTo(satrec, clock, pos2);
  expect(angle.elevation).toBeLessThan(0);
});
