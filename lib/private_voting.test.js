const { Ballot, encrypt_message } = require("@cryptosat/private-voting");

describe("Private Voting", () => {
  let ballot;
  const k = 5;

  beforeEach(() => {
    ballot = Ballot.new(k);
  });

  afterEach(() => {
    ballot.free();
  });

  test("ballot has a public key in PEM format", () => {
    console.log({ ballot });
    const pubkey_pem = ballot.get_pubkey_pem();
    expect(pubkey_pem).toMatch(/-----BEGIN PUBLIC KEY-----/);
    expect(pubkey_pem).toMatch(/-----END PUBLIC KEY-----/);
  });

  test("finalize the ballot and reveal results", () => {
    const options = [
      "option A",
      "option B",
      "option C",
      "option d",
      "option e",
    ];
    const pubkey_pem = ballot.get_pubkey_pem();

    options.forEach((option) => {
      const encrypted_vote = encrypt_message(pubkey_pem, option);
      ballot.vote(encrypted_vote);
    });

    const results = ballot.finalize();
    expect(results).toBeTruthy();
  });
});
