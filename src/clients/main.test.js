const crypto = require('crypto');
const MainClient = require('./main');
const MainService = require('../services/main');
const Satellite = require('../satellite');
const GroundStation = require('../groundStation');
const GroundStationNetwork = require('../groundStationNetwork');
const PromiseTimeout = require('promise-timeout');
const testUtils = require('../testUtils');

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

test('public RSA key', () => {
  const [client, sat, universe] = setupClient();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const result = client.getPublicRsaKey();
  expect(result.type).toBe('public');
});

test('public random', () => {
  const [client, sat, universe] = setupClient();
  const before = universe.clock().now().getTime();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const after = universe.clock().now().getTime();
  const publicKey = client.getPublicRsaKey();
  const result = client.getPublicRandom();
  expect(result.timestamp).toBeGreaterThan(before);
  expect(result.timestamp).toBeLessThan(after);
  const verify = crypto.createVerify('SHA256');
  verify.update(result.publicRandom);
  expect(verify.verify(publicKey, result.signature)).toBe(true);
});

test('timestamp', () => {
  const [client, sat, universe] = setupClient();
  const before = universe.clock().now().getTime();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const after = universe.clock().now().getTime();
  const publicKey = client.getPublicRsaKey();
  const result = client.getTimestamp();
  expect(result.timestamp).toBeGreaterThan(before);
  expect(result.timestamp).toBeLessThan(after);
  const verify = crypto.createVerify('SHA256');
  verify.update(result.timestamp.toString());
  expect(verify.verify(publicKey, result.signature)).toBe(true);
});

test('private random', async () => {
  const [client, sat, universe] = setupClient();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const publicKeySatellite = client.getPublicRsaKey();
  const key = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
  const nonce = crypto.randomBytes(64);
  const promise = client.getPrivateRandom(key.publicKey, nonce);
  universe.clock().advance(10);
  const result = await promise;
  const verify = crypto.createVerify('SHA256');
  verify.update(result.encryptedRandom);
  expect(verify.verify(publicKeySatellite, result.signature)).toBe(true);
  const decryptedBuffer = crypto.privateDecrypt(key.privateKey,
      result.encryptedRandom);
  expect(decryptedBuffer.slice(0, 64)).toEqual(nonce);
});

test('private random timeout', async () => {
  // eslint-disable-next-line
  const [client, ...ignored] = setupClient();
  const key = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
  const nonce = crypto.randomBytes(64);
  const promise = client.getPrivateRandom(key.publicKey, nonce, 10);
  // not advancing the clock will cause the client call to timeout
  await expect(promise).rejects.toThrow(PromiseTimeout.TimeoutError);
});

test('signature', async () => {
  const [client, sat, universe] = setupClient();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const publicKeySatellite = client.getPublicRsaKey();
  const promise = client.sign('hello', 1000);
  universe.clock().advance(10);
  const result = await promise;
  const verify = crypto.createVerify('SHA256');
  verify.update('hello');
  expect(verify.verify(publicKeySatellite, result.signature)).toBe(true);
});

test('signature timeout', async () => {
  // eslint-disable-next-line
  const [client, ...ignored] = setupClient();
  const promise = client.sign('hello', 10);
  // not advancing the clock will cause the client call to timeout
  await expect(promise).rejects.toThrow(PromiseTimeout.TimeoutError);
});
