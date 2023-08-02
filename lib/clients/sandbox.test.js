const SandboxClient = require('./sandbox');
const nacl = require('tweetnacl');
const binary = require('../binary');
// eslint-disable-next-line camelcase
const {encrypt_message} = require('@cryptosat/private-voting');

test('status', async () => {
  const sandboxClient = new SandboxClient();
  const result = await sandboxClient.status();
  expect(result.status).toEqual('ok');
});

test('getPublicSigningKey', async () => {
  const sandboxClient = new SandboxClient();
  const result = await sandboxClient.getPublicSigningKey();
  expect(result).toEqual(
    new Uint8Array([
      176, 128, 154, 251, 115, 230, 175, 253,
      141, 138, 68, 42, 193, 154, 15, 25,
      252, 99, 62, 6, 210, 219, 137, 106,
      26, 144, 62, 127, 110, 232, 69, 179,
    ]));
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

test('bllot.init', async () => {
  const client = new SandboxClient();
  const tracker = await client.ballot.init(2);

  expect(await tracker.status()).toBe('SENT');

  await new Promise((resolve) => {
    setTimeout(resolve, 60000);
  });

  expect(await tracker.status()).toBe('READY');
  const result = await tracker.result();
  console.log('ballot init result: ', result);
  expect(result.ballot_id).not.toBeNull();
  expect(result.public_key).not.toBeNull();
}, 100000);

test('bllot.vote', async () => {
  const client = new SandboxClient();
  const tracker = await client.ballot.init(2);

  await new Promise((resolve) => {
    setTimeout(resolve, 60000);
  });

  const result = await tracker.result();
  const encryptedVote = encrypt_message(result.public_key, 'candidate-1');
  await client.ballot.vote(encryptedVote);
}, 100000);

test('bllot.finalize', async () => {
  const client = new SandboxClient();
  const tracker = await client.ballot.init(3);

  await new Promise((resolve) => {
    setTimeout(resolve, 60000);
  });

  const result = await tracker.result();

  const encryptedVote1 = encrypt_message(result.public_key, 'candidate-1');
  const encryptedVote2 = encrypt_message(result.public_key, 'candidate-2');
  const encryptedVote3 = encrypt_message(result.public_key, 'candidate-1');
  await client.ballot.vote(encryptedVote1);
  await client.ballot.vote(encryptedVote2);
  await client.ballot.vote(encryptedVote3);

  await new Promise((resolve) => {
    setTimeout(resolve, 60000);
  });

  const finalizeTracker = await client.ballot.finalize();

  await new Promise((resolve) => {
    setTimeout(resolve, 90000);
  });

  expect(await finalizeTracker.result()).toEqual('candidate-1');
}, 300000);
