const Satellite = require('./satellite');
const Orbit = require('./orbit');
const SimulatedClock = require('./clocks/simulatedClock');
const testUtils = require('./testUtils');


test('satellite name', () => {
  const sat = new Satellite('crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  expect(sat.getId()).toEqual('crypto1');
});

test('satellite orbit', () => {
  const sat = new Satellite('crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const orbit = new Orbit(testUtils.ISS_TLE[0], testUtils.ISS_TLE[1]);
  expect(sat.getOrbit()).toEqual(orbit);
});

test('satellite returns orbit position', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const sat = new Satellite('crypto1',
      testUtils.ISS_TLE[0], testUtils.ISS_TLE[1]);
  const orbit = new Orbit(testUtils.ISS_TLE[0], testUtils.ISS_TLE[1]);
  const pos = orbit.getPosition(clock);
  expect(sat.getPosition(clock)).toEqual(pos);
});


