const MainService = require('./main').MainService;
const testUtils = require('../testUtils');
const binary = require('../binary');
const nacl = require('tweetnacl');

test('broadcast status and version', () => {
  const universe = testUtils.createTestUniverse();
  const service = new MainService(universe);
  const msg = service.broadcast().servicePayload;
  expect(msg.status).toEqual('ok');
  expect(msg.version).toEqual('0.1.0');
});

test('broadcast public keys', () => {
  const universe = testUtils.createTestUniverse();
  const service = new MainService(universe);
  const msg = service.broadcast().servicePayload;
  expect(msg.publicSigningKey).not.toBe(undefined);
  expect(msg.publicEncryptionKey).not.toBe(undefined);
});

test('broadcast timestamp', () => {
  const universe = testUtils.createTestUniverse();
  const service = new MainService(universe);
  const msg = service.broadcast().servicePayload;
  expect(msg.timestamp).toEqual(universe.clock().now().getTime());
});

test('broadcast timestamp signature', () => {
  const universe = testUtils.createTestUniverse();
  const service = new MainService(universe);
  const msg = service.broadcast().servicePayload;
  const publicKey = binary.ascii2ab(msg.publicSigningKey);
  const timestamp = binary.intToArrayBuffer(msg.timestamp);
  const timestampSignature = binary.ascii2ab(msg.timestampSignature);
  expect(nacl.sign.detached.verify(
      timestamp, timestampSignature, publicKey)).toBe(true);
});

test('broadcast public random signature', () => {
  const universe = testUtils.createTestUniverse();
  const service = new MainService(universe);
  const msg = service.broadcast().servicePayload;
  const publicKey = binary.ascii2ab(msg.publicSigningKey);
  const publicRandom = binary.ascii2ab(msg.publicRandom);
  const signature = binary.ascii2ab(msg.publicRandomSignature);
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
  const broadcast = service.broadcast().servicePayload;
  const satelliteSigningKey = binary.ascii2ab(
      broadcast.publicSigningKey);
  const satelliteEncryptionKey = binary.ascii2ab(
      broadcast.publicEncryptionKey);

  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const request = {
    serviceHeader: {
      type: 'privateRandom',
      requestId: 'id',
    },
    servicePayload: {
      nonce: binary.ab2ascii(nonce),
      publicKey: binary.ab2ascii(clientKey.publicKey),
    },
  };
  service.receive(request);
  expect(sentMessages.length).toEqual(1);
  const response = sentMessages[0];
  expect(response.serviceHeader.requestId).toEqual('id');
  const payload = response.servicePayload;
  const encryptedRandom = binary.ascii2ab(payload.encryptedRandom);
  const signature = binary.ascii2ab(payload.signature);
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
  const broadcast = service.broadcast().servicePayload;
  const satelliteSigningKey = binary.ascii2ab(broadcast.publicSigningKey);
  const request = {
    serviceHeader: {
      type: 'signature',
      requestId: 'id',
    },
    servicePayload: btoa('hello'),
  };
  service.receive(request);
  expect(sentMessages.length).toEqual(1);
  const response = sentMessages[0];
  expect(response.serviceHeader.requestId).toEqual('id');
  const payload = response.servicePayload;
  const signature = binary.ascii2ab(payload.signature);
  const timestamp = binary.intToArrayBuffer(payload.timestamp);
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
