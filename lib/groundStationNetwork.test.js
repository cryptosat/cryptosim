const GeoCoordinates = require('./geoCoordinates');
const GroundStation = require('./groundStation');
const GroundStationNetwork = require('./groundStationNetwork');
const SimulatedClock = require('./clocks/simulatedClock');
const Satellite = require('./satellite');
const testUtils = require('./testUtils');


test('construct a GroundStation object', () => {
  const gsnetwork = new GroundStationNetwork('net');
  expect(gsnetwork.getId()).toEqual('net');
});

test('add stations to network', () => {
  const gsnetwork = new GroundStationNetwork('net');
  const gstation1 = new GroundStation('houston', new GeoCoordinates(1, 2, 3));
  const gstation2 = new GroundStation('london', new GeoCoordinates(4, 5, 6));
  gsnetwork.addStation(gstation1);
  gsnetwork.addStation(gstation2);
  const stations = gsnetwork.getStations();
  expect(stations).toContain(gstation1);
  expect(stations).toContain(gstation2);
});

test('remove station from network', () => {
  const gsnetwork = new GroundStationNetwork('net');
  const gstation = new GroundStation('houston', new GeoCoordinates(1, 2, 3));
  gsnetwork.addStation(gstation);
  expect(gsnetwork.getStations()).toContain(gstation);
  gsnetwork.removeStation('houston');
  expect(gsnetwork.getStations()).not.toContain(gstation);
});

test('cannot add station to network twice', () => {
  const gsnetwork = new GroundStationNetwork('net');
  const gstation = new GroundStation('houston', new GeoCoordinates(1, 2, 3));
  gsnetwork.addStation(gstation);
  expect(() => {
    gsnetwork.addStation(gstation);
  }).toThrow(/already exists/);
});

test('cannot remove non-existing station from to network', () => {
  const gsnetwork = new GroundStationNetwork('net');
  const gstation = new GroundStation('houston', new GeoCoordinates(1, 2, 3));
  expect(() => {
    gsnetwork.removeStation(gstation);
  }).toThrow(/doesn\'t exists/);
});

test('visible stations', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const sat = new Satellite('crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition(clock);
  const gpos1 = pos.clone();
  gpos1.altitude = 0;
  const gpos2 = gpos1.clone();
  gpos2.longitude = (gpos1.longitude + 360) % 180 - 180;
  const gsnetwork = new GroundStationNetwork('net');
  const gstation1 = new GroundStation('houston', gpos1);
  const gstation2 = new GroundStation('london', gpos2);
  gsnetwork.addStation(gstation1);
  gsnetwork.addStation(gstation2);
  const visible = gsnetwork.visibleStations(clock, sat);
  expect(visible).toContain(gstation1);
  expect(visible).not.toContain(gstation2);
});


test('closest station', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const sat = new Satellite('crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition(clock);
  const gpos1 = pos.clone();
  gpos1.altitude = 0;
  const gpos2 = gpos1.clone();
  const gpos3 = gpos1.clone();
  const gpos4 = gpos1.clone();
  gpos2.longitude = gpos1.longitude + 5;
  gpos3.longitude = gpos1.longitude + 10;
  gpos4.longitude = gpos1.longitude + 15;
  const gsnetwork = new GroundStationNetwork('net');
  const gstation1 = new GroundStation('one', gpos1);
  const gstation2 = new GroundStation('two', gpos2);
  const gstation3 = new GroundStation('three', gpos3);
  const gstation4 = new GroundStation('four', gpos4);
  gsnetwork.addStation(gstation1);
  gsnetwork.addStation(gstation2);
  gsnetwork.addStation(gstation3);
  gsnetwork.addStation(gstation4);
  const closest = gsnetwork.closestTo(clock, sat);
  expect(closest).toEqual(gstation1);
});

test('closest calculation for empty network', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const sat = new Satellite('crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const gsnetwork = new GroundStationNetwork('net');
  const closest = gsnetwork.closestTo(clock, sat);
  expect(closest).toEqual(null);
});

test('no station is close', () => {
  const clock = new SimulatedClock(new Date(2020, 1, 1, 0, 0, 0, 0));
  const sat = new Satellite('crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition(clock);
  const gpos = pos.clone();
  gpos.altitude = 0;
  gpos.longitude = (gpos.longitude + 360) % 180 - 180;
  const gsnetwork = new GroundStationNetwork('net');
  const gstation = new GroundStation('houston', gpos);
  gsnetwork.addStation(gstation);
  const closest = gsnetwork.closestTo(clock, sat);
  expect(closest).toEqual(null);
});

test('serialize and deserialize', () => {
  const gsnetwork = new GroundStationNetwork('net');
  const gstation1 = new GroundStation('houston', new GeoCoordinates(1, 2, 3));
  const gstation2 = new GroundStation('london', new GeoCoordinates(4, 5, 6));
  gsnetwork.addStation(gstation1);
  gsnetwork.addStation(gstation2);
  expect(GroundStationNetwork.deserialize(
      gsnetwork.serialize())).toEqual(gsnetwork);
});


