const BaseProtocol = require('./baseProtocol');
const testUtils = require('../testUtils');
const crypto = require('crypto');


/**
 * Parse a public key into a format expected by the base protocol
 * @param {string} k - a k in seralized hex format.
 * @return {KeyObject} a parsed representation of the argument.
 */
function parseKey(k) {
  return crypto.createPublicKey({
    key: k,
    format: 'der',
    type: 'spki',
    encoding: 'hex',
  });
}

test('broadcast status and version', () => {
  const universe = testUtils.createTestUniverse();
  const protocol = new BaseProtocol(universe);
  const msg = protocol.broadcast();
  expect(msg.status).toEqual('ok');
  expect(msg.version).toEqual('0.1.0');
});

test('broadcast rsa public key', () => {
  const universe = testUtils.createTestUniverse();
  const protocol = new BaseProtocol(universe);
  const msg = protocol.broadcast();
  const publicKey = parseKey(msg.publicRsaKey);
  expect(publicKey.asymmetricKeyType).toEqual('rsa');
});

test('broadcast timestamp', () => {
  const universe = testUtils.createTestUniverse();
  const protocol = new BaseProtocol(universe);
  const msg = protocol.broadcast();
  expect(parseInt(msg.timestamp)).toEqual(universe.clock().now().getTime());
});

test('broadcast timestamp signature', () => {
  const universe = testUtils.createTestUniverse();
  const protocol = new BaseProtocol(universe);
  const msg = protocol.broadcast();
  const verify = crypto.createVerify('SHA256');
  const publicKey = parseKey(msg.publicRsaKey);
  const signature = Buffer.from(msg.timestampSignature, 'hex');
  verify.update(msg.timestamp);
  expect(verify.verify(publicKey, signature)).toBe(true);
});

test('broadcast public random signature', () => {
  const universe = testUtils.createTestUniverse();
  const protocol = new BaseProtocol(universe);
  const msg = protocol.broadcast();
  const verify = crypto.createVerify('SHA256');
  const publicKey = parseKey(msg.publicRsaKey);
  const signature = Buffer.from(msg.publicRandomSignature, 'hex');
  verify.update(msg.publicRandom);
  expect(verify.verify(publicKey, signature)).toBe(true);
});

test('request private randomness', () => {
  const universe = testUtils.createTestUniverse();
  const protocol = new BaseProtocol(universe);
  const sentMessages = [];
  protocol.send = (msg) => {
    sentMessages.push(msg);
  };
  const key = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
  const satellitePublicKey = parseKey(protocol.broadcast().publicRsaKey);
  const nonce = crypto.randomBytes(64);
  const request = {
    requestId: 'id',
    type: 'privateRandom',
    nonce: nonce.toString('hex'),
    publicKey: key.publicKey.export(
        {format: 'der', type: 'spki'}).toString('hex'),
  };
  protocol.receive(request);
  expect(sentMessages.length).toEqual(1);
  const response = sentMessages[0];
  expect(response.requestId).toEqual('id');
  const signature = Buffer.from(response.signature, 'hex');
  const verify = crypto.createVerify('SHA256');
  verify.update(response.encryptedRandom);
  expect(verify.verify(satellitePublicKey, signature)).toBe(true);
  const encryptedBuffer = Buffer.from(response.encryptedRandom, 'hex');
  const decryptedBuffer = crypto.privateDecrypt(key.privateKey,
      encryptedBuffer);
  expect(decryptedBuffer.slice(0, 64)).toEqual(nonce);
});

test('request signature', () => {
  const universe = testUtils.createTestUniverse();
  const protocol = new BaseProtocol(universe);
  const sentMessages = [];
  protocol.send = (msg) => {
    sentMessages.push(msg);
  };
  const satellitePublicKey = parseKey(protocol.broadcast().publicRsaKey);
  const request = {
    requestId: 'id',
    type: 'signature',
    msg: 'hello',
  };
  protocol.receive(request);
  expect(sentMessages.length).toEqual(1);
  const response = sentMessages[0];
  expect(response.requestId).toEqual('id');
  const signature = Buffer.from(response.signature, 'hex');
  const verify = crypto.createVerify('SHA256');
  verify.update('hello');
  expect(verify.verify(satellitePublicKey, signature)).toBe(true);
});

test('unrecognized request type throws an error', () => {
  const universe = testUtils.createTestUniverse();
  const protocol = new BaseProtocol(universe);
  const request = {
    type: 'unrecognized',
  };
  expect(() => {
    protocol.receive(request);
  }).toThrow(Error);
});
