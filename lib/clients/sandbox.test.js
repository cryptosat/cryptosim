const SandboxClient = require('./sandbox');
const nacl = require('tweetnacl');
const binary = require('../binary');

test('status', async () => {
  const sandboxClient = new SandboxClient();
  const result = await sandboxClient.status();
  expect(result.status).toEqual('ok');
});

test('getPublicSigningKey', async () => {
  const sandboxClient = new SandboxClient();
  const result = await sandboxClient.getPublicSigningKey();
  const hexPubKey = result.toString('hex');
  expect(hexPubKey).toEqual(
    'b0809afb73e6affd8d8a442ac19a0f19fc633e06d2db896a1a903e7f6ee845b3');
});

test('getTimestamp', async () => {
  const sandboxClient = new SandboxClient();
  const result = await sandboxClient.getTimestamp();
  const publicKey = await sandboxClient.getPublicSigningKey();
  expect(
    nacl.sign.detached.verify(
      binary.int2ab(result.timestamp),
      result.signature,
      publicKey),
  ).toBe(true);
}, 10000);

test('getPublicRandom', async () => {
  const sandboxClient = new SandboxClient();
  const result = await sandboxClient.getPublicRandom();
  const publicKey = await sandboxClient.getPublicSigningKey();
  expect(
    nacl.sign.detached.verify(
      result.publicRandom,
      result.signature,
      publicKey),
  ).toBe(true);
}, 10000);

test('sign', async () => {
  const client = new SandboxClient();
  const tracker = await client.sign('hello');
  expect(await tracker.status()).toBe('SENT');
  expect(await tracker.result()).toBe(null);

  await new Promise((resolve) => {
    setTimeout(resolve, 60000);
  });

  const publicKey = await client.getPublicSigningKey();
  expect(await tracker.status()).toBe('READY');
  const result = await tracker.result();
  expect(
    nacl.sign.detached.verify(
      binary.str2ab('hello'),
      result.signature,
      publicKey),
  ).toBe(true);
}, 100000);

test('createDelayedKeypair', async () => {
  const client = new SandboxClient();
  const tracker = await client.createDelayedKeypair(10);

  expect(await tracker.status()).toBe('SENT');

  await new Promise((resolve) => {
    setTimeout(resolve, 120000);
  });

  expect(await tracker.status()).toBe('READY');
  const result = await tracker.result();
  expect(result.keypair_id).not.toBeNull();
  expect(result.public_key).not.toBeNull();
}, 200000);

test('fetchDelayedPubKey', async () => {
  const client = new SandboxClient();
  const keypairTracker = await client.createDelayedKeypair(10);

  await new Promise((resolve) => {
    setTimeout(resolve, 120000);
  });

  const result = await keypairTracker.result();
  const keypairId = result.keypair_id;
  const pubkeyTracker = await client.fetchDelayedPubKey(keypairId);
  const publicKey = await pubkeyTracker.result();
  expect(publicKey).not.toBeNull();
}, 200000);

test('fetchDelayedPrivKey', async () => {
  const client = new SandboxClient();
  const keypairTracker = await client.createDelayedKeypair(10);

  await new Promise((resolve) => {
    setTimeout(resolve, 120000 + 10000);
  });

  const result = await keypairTracker.result();
  const keypairId = result.keypair_id;
  const privkeyTracker = await client.fetchDelayedPrivKey(keypairId);
  expect(await privkeyTracker.status()).toBe('SENT');

  await new Promise((resolve) => {
    setTimeout(resolve, 60000);
  });

  const privateKey = await privkeyTracker.result();
  expect(privateKey).not.toBeNull();
}, 200000);
