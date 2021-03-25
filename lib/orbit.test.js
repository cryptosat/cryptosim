const Orbit = require('./orbit');
const core = require('./core');

const ISS_TLE = [
  '1 25544U 98067A   21027.77992426  .00003336  00000-0  68893-4 0  9991',
  '2 25544  51.6465 317.1909 0002399 302.6503 164.1536 15.48908950266831',
];

jest.mock('./core');

test('retrieve position of body in orbit', () => {
  const orb = new Orbit(ISS_TLE[0], ISS_TLE[1]);
  const position = {'latitude': 1, 'longitude': 2, 'altitude': 3};
  core.propagate.mockReturnValue(position);
  expect(orb.getPosition(new Date())).toBe(position);
});

test('angle to ground observer', () => {
  const orb = new Orbit(ISS_TLE[0], ISS_TLE[1]);
  const angle = {'azimuth': 1, 'elevation': 2, 'distance': 3};
  core.angleTo.mockReturnValue(angle);
  expect(orb.angleFrom(new Date(), 4, 5, 6)).toBe(angle);
});
