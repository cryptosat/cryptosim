const crypto = require('crypto');
const BaseApi = require('./baseApi');
const BaseProtocol = require('../protocols/baseProtocol');
const Satellite = require('../satellite');
const GroundStation = require('../groundStation');
const GroundStationNetwork = require('../groundStationNetwork');
const PromiseTimeout = require('promise-timeout');
const testUtils = require('../testUtils');

/**
 * Setup a basic test environment with a single satellite and ground station.
 * @return {[BaseApi, Satellite, Universe]} an API object used for testing
 * along with supplementary objects needed to be exposed for testing.
 */
function setupApi() {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const gpos = sat.getPosition();
  gpos.altitude = 0;
  const gstation = new GroundStation(universe, 'houston', gpos);
  expect(gstation.hasLineOfSight(sat)).toBe(true);
  const gsnetwork = new GroundStationNetwork('net');
  gsnetwork.addStation(gstation);
  const baseProtocol = new BaseProtocol(universe);
  sat.bindProtocol('base', baseProtocol);
  return [new BaseApi(universe, gsnetwork, 'base'), sat, universe];
}

test('status', () => {
  const [api, sat, universe] = setupApi();
  const before = universe.clock().now().getTime();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const after = universe.clock().now().getTime();
  const result = api.status();
  expect(result.status).toEqual('ok');
  expect(result.timestamp).toBeGreaterThan(before);
  expect(result.timestamp).toBeLessThan(after);
});

test('version', () => {
  const [api, sat, universe] = setupApi();
  const before = universe.clock().now().getTime();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const after = universe.clock().now().getTime();
  const result = api.version();
  expect(result.version).not.toBe(undefined);
  expect(result.timestamp).toBeGreaterThan(before);
  expect(result.timestamp).toBeLessThan(after);
});

test('public RSA key', () => {
  const [api, sat, universe] = setupApi();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const result = api.getPublicRsaKey();
  expect(result.type).toBe('public');
});

test('public random', () => {
  const [api, sat, universe] = setupApi();
  const before = universe.clock().now().getTime();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const after = universe.clock().now().getTime();
  const publicKey = api.getPublicRsaKey();
  const result = api.getPublicRandom();
  expect(result.timestamp).toBeGreaterThan(before);
  expect(result.timestamp).toBeLessThan(after);
  const verify = crypto.createVerify('SHA256');
  verify.update(result.publicRandom);
  expect(verify.verify(publicKey, result.signature)).toBe(true);
});

test('timestamp', () => {
  const [api, sat, universe] = setupApi();
  const before = universe.clock().now().getTime();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const after = universe.clock().now().getTime();
  const publicKey = api.getPublicRsaKey();
  const result = api.getTimestamp();
  expect(result.timestamp).toBeGreaterThan(before);
  expect(result.timestamp).toBeLessThan(after);
  const verify = crypto.createVerify('SHA256');
  verify.update(result.timestamp.toString());
  expect(verify.verify(publicKey, result.signature)).toBe(true);
});

test('private random', async () => {
  const [api, sat, universe] = setupApi();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const publicKeySatellite = api.getPublicRsaKey();
  const key = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
  const nonce = crypto.randomBytes(64);
  const promise = api.getPrivateRandom(key.publicKey, nonce);
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
  const [api, ...ignored] = setupApi();
  const key = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
  const nonce = crypto.randomBytes(64);
  const promise = api.getPrivateRandom(key.publicKey, nonce, 10);
  // not advancing the clock will cause the api call to timeout
  await expect(promise).rejects.toThrow(PromiseTimeout.TimeoutError);
});

test('signature', async () => {
  const [api, sat, universe] = setupApi();
  universe.clock().advance(sat.broadcastPeriod() + 1);
  const publicKeySatellite = api.getPublicRsaKey();
  const promise = api.sign('hello', 1000);
  universe.clock().advance(10);
  const result = await promise;
  const verify = crypto.createVerify('SHA256');
  verify.update('hello');
  expect(verify.verify(publicKeySatellite, result.signature)).toBe(true);
});

test('signature timeout', async () => {
  // eslint-disable-next-line
  const [api, ...ignored] = setupApi();
  const promise = api.sign('hello', 10);
  // not advancing the clock will cause the api call to timeout
  await expect(promise).rejects.toThrow(PromiseTimeout.TimeoutError);
});
