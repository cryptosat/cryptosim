const LookAngle = require('./lookAngle');


test('construct LookAngle object', () => {
  const pos = new LookAngle(1, 2, 3);
  expect(pos.azimuth).toBe(1);
  expect(pos.elevation).toBe(2);
  expect(pos.distance).toBe(3);
});
