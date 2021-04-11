const GeoCoordinates = require('./geoCoordinates');
const LookAngle = require('./lookAngle');
const Orbit = require('./orbit');
const core = require('./core');
const SimulatedClock = require('./clocks/simulatedClock');

jest.mock('./core');

test('retrieve position of body in orbit', () => {
  core.createSatelliteRecord.mockReturnValue('mock satellite record');
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const orb = new Orbit('tle1', 'tle2');
  const pos = new GeoCoordinates(1, 2, 3);
  core.propagate.mockReturnValue(pos);
  expect(orb.getPosition(clock)).toBe(pos);
});

test('angle to ground observer', () => {
  core.createSatelliteRecord.mockReturnValue('mock satellite record');
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const orb = new Orbit('tle1', 'tle2');
  const pos = new GeoCoordinates(1, 2, 3);
  const angle = new LookAngle(4, 5, 6);
  core.angleTo.mockReturnValue(angle);
  expect(orb.angleFrom(clock, pos)).toBe(angle);
});

test('line of sight to ground observer', () => {
  core.createSatelliteRecord.mockReturnValue('mock satellite record');
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const orb = new Orbit('tle1', 'tle2');
  const pos = new GeoCoordinates(1, 2, 3);
  core.angleTo.mockReturnValue(new LookAngle(4, 5, 6));  
  expect(orb.hasLineOfSight(clock, pos)).toBe(true);
  core.angleTo.mockReturnValue(new LookAngle(4, -5, 6));  
  expect(orb.hasLineOfSight(clock, pos)).toBe(false);
});
