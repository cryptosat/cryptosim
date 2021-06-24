const MainService = require('./main');
const testUtils = require('../testUtils');
const binary = require('../binary');
const nacl = require('tweetnacl');

test('broadcast status and version', () => {
  const universe = testUtils.createTestUniverse();
  const service = new MainService(universe);
  const msg = service.broadcast();
  expect(msg.status).toEqual('ok');
  expect(msg.version).toEqual('0.1.0');
});

test('broadcast public keys', () => {
  const universe = testUtils.createTestUniverse();
  const service = new MainService(universe);
  const msg = service.broadcast();
  expect(msg.publicSigningKey).not.toBe(undefined);
  expect(msg.publicEncryptionKey).not.toBe(undefined);
});

test('broadcast timestamp', () => {
  const universe = testUtils.createTestUniverse();
  const service = new MainService(universe);
  const msg = service.broadcast();
  expect(parseInt(msg.timestamp)).toEqual(universe.clock().now().getTime());
});

test('broadcast timestamp signature', () => {
  const universe = testUtils.createTestUniverse();
  const service = new MainService(universe);
  const msg = service.broadcast();
  const publicKey = binary.str2ab(atob(msg.publicSigningKey));
  const timestamp = binary.str2ab(msg.timestamp);
  const timestampSignature = binary.str2ab(atob(msg.timestampSignature));
  expect(nacl.sign.detached.verify(
      timestamp, timestampSignature, publicKey)).toBe(true);
});

test('broadcast public random signature', () => {
  const universe = testUtils.createTestUniverse();
  const service = new MainService(universe);
  const msg = service.broadcast();
  const publicKey = binary.str2ab(atob(msg.publicSigningKey));
  const publicRandom = binary.str2ab(atob(msg.publicRandom));
  const signature = binary.str2ab(atob(msg.publicRandomSignature));
  expect(nacl.sign.detached.verify(
      publicRandom, signature, publicKey)).toBe(true);
});

test('request private randomness', () => {
  const universe = testUtils.createTestUniverse();
  const service = new MainService(universe);
  const sentMessages = [];
  service.send = (msg) => {
    sentMessages.push(msg);
  };
  const clientKey = nacl.box.keyPair();
  const broadcast = service.broadcast();
  const satelliteSigningKey = binary.str2ab(atob(
      broadcast.publicSigningKey));
  const satelliteEncryptionKey = binary.str2ab(atob(
      broadcast.publicEncryptionKey));

  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const request = {
    requestId: 'id',
    type: 'privateRandom',
    nonce: btoa(binary.ab2str(nonce)),
    publicKey: btoa(binary.ab2str(clientKey.publicKey)),
  };
  service.receive(request);
  expect(sentMessages.length).toEqual(1);
  const response = sentMessages[0];
  expect(response.requestId).toEqual('id');
  const encryptedRandom = binary.str2ab(atob(response.encryptedRandom));
  const signature = binary.str2ab(atob(response.signature));
  expect(nacl.sign.detached.verify(
      encryptedRandom, signature, satelliteSigningKey)).toBe(true);
  const plain = nacl.box.open(
      encryptedRandom, nonce, satelliteEncryptionKey, clientKey.secretKey);
  expect(plain.length).toEqual(128);
});

test('request signature', () => {
  const universe = testUtils.createTestUniverse();
  const service = new MainService(universe);
  const sentMessages = [];
  service.send = (msg) => {
    sentMessages.push(msg);
  };
  const broadcast = service.broadcast();
  const satelliteSigningKey = binary.str2ab(atob(broadcast.publicSigningKey));
  const request = {
    requestId: 'id',
    type: 'signature',
    msg: btoa('hello'),
  };
  service.receive(request);
  expect(sentMessages.length).toEqual(1);
  const response = sentMessages[0];
  expect(response.requestId).toEqual('id');
  const signature = binary.str2ab(atob(response.signature));
  const timestamp = binary.str2ab(response.timestamp.toString());
  const msg = binary.appendBuffers(binary.str2ab('hello'), timestamp);
  expect(nacl.sign.detached.verify(
      msg, signature, satelliteSigningKey)).toBe(true);
});

test('unrecognized request type throws an error', () => {
  const universe = testUtils.createTestUniverse();
  const service = new MainService(universe);
  const request = {
    type: 'unrecognized',
  };
  expect(() => {
    service.receive(request);
  }).toThrow(Error);
});
