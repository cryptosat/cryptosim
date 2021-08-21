const nacl = require('tweetnacl');
const MainClient = require('./main');
const MainService = require('../services/main');
const Satellite = require('../satellite');
const GroundStation = require('../groundStation');
const GroundStationNetwork = require('../groundStationNetwork');
const testUtils = require('../testUtils');
const binary = require('../binary');

/**
 * Setup a basic test environment with a single satellite and ground station.
 * @return {[MainClient, Satellite, Universe]} an API object used for testing
 * along with supplementary objects needed to be exposed for testing.
 */
function setupClient() {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const gpos = sat.getPosition();
  gpos.altitude = 0;
  const gstation = new GroundStation(universe, 'houston', gpos);
  expect(gstation.hasLineOfSight(sat)).toBe(true);
  const gsnetwork = new GroundStationNetwork('net');
  gsnetwork.addStation(gstation);
  const mainService = new MainService(universe);
  sat.bindService('main', mainService);
  const client = new MainClient(universe, sat, gsnetwork, 'main');
  return [client, mainService, sat, universe];
}

test('status', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  const before = universe.clock().now().getTime();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const after = universe.clock().now().getTime();
  const result = client.status();
  expect(result.status).toEqual('ok');
  expect(result.timestamp).toBeGreaterThan(before);
  expect(result.timestamp).toBeLessThan(after);
});

test('version', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  const before = universe.clock().now().getTime();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const after = universe.clock().now().getTime();
  const result = client.version();
  expect(result.version).not.toBe(undefined);
  expect(result.timestamp).toBeGreaterThan(before);
  expect(result.timestamp).toBeLessThan(after);
});

test('public signing key', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const result = client.getPublicSigningKey();
  expect(result).not.toBe(undefined);
});

test('public encryption key', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const result = client.getPublicEncryptionKey();
  expect(result).not.toBe(undefined);
});

test('public random', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  const before = universe.clock().now().getTime();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const after = universe.clock().now().getTime();
  const publicKey = client.getPublicSigningKey();
  const result = client.getPublicRandom();
  expect(result.timestamp).toBeGreaterThan(before);
  expect(result.timestamp).toBeLessThan(after);
  expect(nacl.sign.detached.verify(
      result.publicRandom, result.signature, publicKey)).toBe(true);
});

test('timestamp', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  const before = universe.clock().now().getTime();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const after = universe.clock().now().getTime();
  const publicKey = client.getPublicSigningKey();
  const result = client.getTimestamp();
  expect(result.timestamp).toBeGreaterThan(before);
  expect(result.timestamp).toBeLessThan(after);
  const timestamp = binary.int2ab(result.timestamp);
  expect(nacl.sign.detached.verify(
      timestamp, result.signature, publicKey)).toBe(true);
});

test('request pending status', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  const tracker = client.sign('hello');
  expect(tracker.status()).toBe(tracker.Status.PENDING);
});

test('request sent status', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  const tracker = client.sign('hello');
  universe.clock().advance(1);
  expect(tracker.status()).toBe(tracker.Status.SENT);
});

test('request ready status', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  const tracker = client.sign('hello');
  universe.clock().advance(1000);
  expect(tracker.status()).toBe(tracker.Status.READY);
});

test('request result is', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  const tracker = client.sign('hello');
  universe.clock().advance(1000);
  expect(tracker.result()).not.toBe(null);
});

test('signature', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const satelliteSigningKey = client.getPublicSigningKey();
  const before = universe.clock().now().getTime();
  const tracker = client.sign('hello');
  universe.clock().advance(10);
  expect(tracker.status()).toBe(tracker.Status.READY);
  const result = tracker.result();
  expect(result.timestamp).toBeGreaterThanOrEqual(before);
  const msg = binary.appendBuffers(
      binary.str2ab('hello'),
      binary.int2ab(result.timestamp));
  expect(nacl.sign.detached.verify(
      msg, result.signature, satelliteSigningKey)).toBe(true);
});

test('signature request out of window', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  // unclear why, but broadcasting considerably slows down the test.
  // Possibly because of crypto operations.
  service.broadcast = () => {};
  const timeToWindow = 30 * 60 * 1000;
  universe.clock().advance(-timeToWindow);
  const tracker = client.sign('hello');
  universe.clock().advance(2 * timeToWindow);
  expect(tracker.status()).toBe(tracker.Status.READY);
});

test('private random', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const satelliteSigningKey = client.getPublicSigningKey();
  const satelliteEncryptionKey = client.getPublicEncryptionKey();
  const clientKey = nacl.box.keyPair();
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const tracker = client.getPrivateRandom(clientKey.publicKey, nonce);
  universe.clock().advance(1000);
  expect(tracker.status()).toBe(tracker.Status.READY);
  const result = tracker.result();
  expect(nacl.sign.detached.verify(
      result.encryptedRandom, result.signature, satelliteSigningKey),
  ).toBe(true);
  const plain = nacl.box.open(
      result.encryptedRandom, nonce, satelliteEncryptionKey,
      clientKey.secretKey);
  expect(plain.length).toEqual(128);
});

test('next online time is now', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  expect(client.nextOnlineTime()).toEqual(universe.clock().now());
});

test('next online time is in the future', () => {
  // eslint-disable-next-line
  const [client, service, sat, universe] = setupClient();
  universe.clock().advance(-30 * 60 * 1000);
  const millisecondsUntilWindow =
      client.nextOnlineTime() - universe.clock().now();
  expect(millisecondsUntilWindow).toBeGreaterThan(0);
});
