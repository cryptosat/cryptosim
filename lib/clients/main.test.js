const nacl = require('tweetnacl');
const MainClient = require('./main');
const MainService = require('../services/main');
const Satellite = require('../satellite');
const GroundStation = require('../groundStation');
const GroundStationNetwork = require('../groundStationNetwork');
const PromiseTimeout = require('promise-timeout');
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
  return [new MainClient(universe, gsnetwork, 'main'), sat, universe];
}

test('status', () => {
  const [client, sat, universe] = setupClient();
  const before = universe.clock().now().getTime();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const after = universe.clock().now().getTime();
  const result = client.status();
  expect(result.status).toEqual('ok');
  expect(result.timestamp).toBeGreaterThan(before);
  expect(result.timestamp).toBeLessThan(after);
});

test('version', () => {
  const [client, sat, universe] = setupClient();
  const before = universe.clock().now().getTime();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const after = universe.clock().now().getTime();
  const result = client.version();
  expect(result.version).not.toBe(undefined);
  expect(result.timestamp).toBeGreaterThan(before);
  expect(result.timestamp).toBeLessThan(after);
});

test('public signing key', () => {
  const [client, sat, universe] = setupClient();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const result = client.getPublicSigningKey();
  expect(result).not.toBe(undefined);
});

test('public encryption key', () => {
  const [client, sat, universe] = setupClient();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const result = client.getPublicEncryptionKey();
  expect(result).not.toBe(undefined);
});

test('public random', () => {
  const [client, sat, universe] = setupClient();
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
  const [client, sat, universe] = setupClient();
  const before = universe.clock().now().getTime();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const after = universe.clock().now().getTime();
  const publicKey = client.getPublicSigningKey();
  const result = client.getTimestamp();
  expect(result.timestamp).toBeGreaterThan(before);
  expect(result.timestamp).toBeLessThan(after);
  const timestamp = binary.intToArrayBuffer(result.timestamp);
  expect(nacl.sign.detached.verify(
      timestamp, result.signature, publicKey)).toBe(true);
});

test('private random', async () => {
  const [client, sat, universe] = setupClient();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const satelliteSigningKey = client.getPublicSigningKey();
  const satelliteEncryptionKey = client.getPublicEncryptionKey();
  const clientKey = nacl.box.keyPair();
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const promise = client.getPrivateRandom(clientKey.publicKey, nonce);
  universe.clock().advance(10);
  const result = await promise;
  expect(nacl.sign.detached.verify(
      result.encryptedRandom, result.signature, satelliteSigningKey),
  ).toBe(true);
  const plain = nacl.box.open(
      result.encryptedRandom, nonce, satelliteEncryptionKey,
      clientKey.secretKey);
  expect(plain.length).toEqual(128);
});

test('private random timeout', async () => {
  // eslint-disable-next-line
  const [client, ...ignored] = setupClient();
  const clientKey = nacl.box.keyPair();
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const promise = client.getPrivateRandom(clientKey.publicKey, nonce, 10);
  // not advancing the clock will cause the client call to timeout
  await expect(promise).rejects.toThrow(PromiseTimeout.TimeoutError);
});

test('signature', async () => {
  const [client, sat, universe] = setupClient();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const satelliteSigningKey = client.getPublicSigningKey();
  const before = universe.clock().now().getTime();
  const promise = client.sign('hello', 1000);
  universe.clock().advance(10);
  const result = await promise;
  expect(result.timestamp).toBeGreaterThanOrEqual(before);
  const msg = binary.appendBuffers(
      binary.str2ab('hello'),
      binary.intToArrayBuffer(result.timestamp));
  expect(nacl.sign.detached.verify(
      msg, result.signature, satelliteSigningKey)).toBe(true);
});

test('signature timeout', async () => {
  // eslint-disable-next-line
  const [client, ...ignored] = setupClient();
  const promise = client.sign('hello', 10);
  // not advancing the clock will cause the client call to timeout
  await expect(promise).rejects.toThrow(PromiseTimeout.TimeoutError);
});
