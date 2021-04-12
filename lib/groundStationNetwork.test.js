const GeoCoordinates = require('./geoCoordinates');
const GroundStation = require('./groundStation');
const GroundStationNetwork = require('./groundStationNetwork');
const Satellite = require('./satellite');
const testUtils = require('./testUtils');


test('construct a GroundStation object', () => {
  const gsnetwork = new GroundStationNetwork('net');
  expect(gsnetwork.id()).toEqual('net');
});

test('add stations to network', () => {
  const universe = testUtils.createTestUniverse();
  const gsnetwork = new GroundStationNetwork('net');
  const gstation1 = new GroundStation(
      universe, 'houston', new GeoCoordinates(1, 2, 3));
  const gstation2 = new GroundStation(
      universe, 'london', new GeoCoordinates(4, 5, 6));
  gsnetwork.addStation(gstation1);
  gsnetwork.addStation(gstation2);
  const stations = gsnetwork.getStations();
  expect(stations).toContain(gstation1);
  expect(stations).toContain(gstation2);
});

test('remove station from network', () => {
  const universe = testUtils.createTestUniverse();
  const gsnetwork = new GroundStationNetwork('net');
  const gstation = new GroundStation(
      universe, 'houston', new GeoCoordinates(1, 2, 3));
  gsnetwork.addStation(gstation);
  expect(gsnetwork.getStations()).toContain(gstation);
  gsnetwork.removeStation('houston');
  expect(gsnetwork.getStations()).not.toContain(gstation);
});

test('adding same station to network twice is ok', () => {
  const universe = testUtils.createTestUniverse();
  const gsnetwork = new GroundStationNetwork('net');
  const gstation = new GroundStation(
      universe, 'houston', new GeoCoordinates(1, 2, 3));
  gsnetwork.addStation(gstation);
  expect(() => {
    gsnetwork.addStation(gstation);
  }).not.toThrow(/already exists/);
});

test('cannot remove non-existing station from to network', () => {
  const universe = testUtils.createTestUniverse();
  const gsnetwork = new GroundStationNetwork('net');
  const gstation = new GroundStation(
      universe, 'houston', new GeoCoordinates(1, 2, 3));
  expect(() => {
    gsnetwork.removeStation(gstation);
  }).toThrow(/doesn\'t exists/);
});

test('visible stations', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos1 = pos.clone();
  gpos1.altitude = 0;
  const gpos2 = gpos1.clone();
  gpos2.longitude = (gpos1.longitude + 360) % 180 - 180;
  const gsnetwork = new GroundStationNetwork('net');
  const gstation1 = new GroundStation(universe, 'houston', gpos1);
  const gstation2 = new GroundStation(universe, 'london', gpos2);
  gsnetwork.addStation(gstation1);
  gsnetwork.addStation(gstation2);
  const visible = gsnetwork.visibleStations(sat);
  expect(visible).toContain(gstation1);
  expect(visible).not.toContain(gstation2);
});


test('closest station', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos1 = pos.clone();
  gpos1.altitude = 0;
  const gpos2 = gpos1.clone();
  const gpos3 = gpos1.clone();
  const gpos4 = gpos1.clone();
  gpos2.longitude = gpos1.longitude + 5;
  gpos3.longitude = gpos1.longitude + 10;
  gpos4.longitude = gpos1.longitude + 15;
  const gsnetwork = new GroundStationNetwork('net');
  const gstation1 = new GroundStation(universe, 'one', gpos1);
  const gstation2 = new GroundStation(universe, 'two', gpos2);
  const gstation3 = new GroundStation(universe, 'three', gpos3);
  const gstation4 = new GroundStation(universe, 'four', gpos4);
  gsnetwork.addStation(gstation1);
  gsnetwork.addStation(gstation2);
  gsnetwork.addStation(gstation3);
  gsnetwork.addStation(gstation4);
  const closest = gsnetwork.closestTo(sat);
  expect(closest).toEqual(gstation1);
});

test('closest calculation for empty network', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const gsnetwork = new GroundStationNetwork('net');
  const closest = gsnetwork.closestTo(sat);
  expect(closest).toEqual(null);
});

test('no station is close', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  gpos.longitude = (gpos.longitude + 360) % 180 - 180;
  const gsnetwork = new GroundStationNetwork('net');
  const gstation = new GroundStation(universe, 'houston', gpos);
  gsnetwork.addStation(gstation);
  const closest = gsnetwork.closestTo(sat);
  expect(closest).toEqual(null);
});

test('next transmission window', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const gpos1 = sat.getPosition();
  gpos1.altitude = 0;
  const gstation1 = new GroundStation(universe, 'farther', gpos1);
  universe.clock().advance(-1 * 60 * 1000);
  const gpos2 = sat.getPosition();
  gpos2.altitude = 0;
  const gstation2 = new GroundStation(universe, 'closer', gpos2);
  expect(gstation1.hasLineOfSight(sat)).toBe(true);
  expect(gstation2.hasLineOfSight(sat)).toBe(true);
  const gsnetwork = new GroundStationNetwork('net');
  gsnetwork.addStation(gstation1);
  universe.clock().advance(-30 * 60 * 1000);
  const nextWindow1 = gsnetwork.nextTransmissionWindow(sat, 60 * 60);
  gsnetwork.addStation(gstation2);
  const nextWindow2 = gsnetwork.nextTransmissionWindow(sat, 60 * 60);
  expect(nextWindow2.getTime()).toBeLessThan(nextWindow1.getTime());
});

test('next transmission window within time bounds', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  const gsnetwork = new GroundStationNetwork('net');
  const gstation = new GroundStation(universe, 'houston', gpos);
  gsnetwork.addStation(gstation);
  expect(gstation.hasLineOfSight(sat)).toBe(true);
  universe.clock().advance(-30 * 60 * 1000);
  expect(gstation.hasLineOfSight(sat)).toBe(false);
  expect(gsnetwork.nextTransmissionWindow(sat, 15 * 60)).toBe(null);
});

test('serialize and deserialize', () => {
  const universe1 = testUtils.createTestUniverse();
  const universe2 = testUtils.createTestUniverse();
  const gsnetwork = new GroundStationNetwork('net');
  const gstation1 = new GroundStation(
      universe1, 'houston', new GeoCoordinates(1, 2, 3));
  const gstation2 = new GroundStation(
      universe1, 'london', new GeoCoordinates(4, 5, 6));
  gsnetwork.addStation(gstation1);
  gsnetwork.addStation(gstation2);
  expect(GroundStationNetwork.deserialize(
      universe2, gsnetwork.serialize())).toEqual(gsnetwork);
});


