const Protocol = require('./protocol');
const Satellite = require('../satellite');
const GroundStation = require('../groundStation');
const testUtils = require('../testUtils');

test('protocol is an abstract class', () => {
  const universe = testUtils.createTestUniverse();
  expect(() => {
    new Protocol(universe);
  }).toThrow(Error);
});

test('unbound protocol raises error if trying to send a message', () => {
  protocol = new class extends Protocol {}();
  expect(protocol.send).toThrow(Error);
});

test('bound protocol can send a message', () => {
  protocol = new class extends Protocol {}();
  protocol.bind(() => {
    return 'hello';
  });
  expect(protocol.send()).toEqual('hello');
});

test('bind to satellite', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  receivedMessages = [];
  const gstation = new GroundStation(universe, 'houston', gpos);
  gstation.startListening((msg) => {
    receivedMessages.push(msg);
  });
  sat.bindProtocol('id', new class extends Protocol {
    receive(body) {
      this.send('received: ' + body);
    }
  }(universe));
  universe.transmitFromStation(gstation, {protocolId: 'id', body: 'hello'});
  universe.clock().advance(2);
  expect(receivedMessages.length).toEqual(1);
  expect(receivedMessages[0].protocolId).toEqual('id');
  expect(receivedMessages[0].body).toEqual('received: hello');
});

test('broadcast called periodically', () => {
  const universe = testUtils.createTestUniverse();
  const sat = new Satellite(universe, 'crypto1', testUtils.ISS_TLE[0],
      testUtils.ISS_TLE[1]);
  const pos = sat.getPosition();
  const gpos = pos.clone();
  gpos.altitude = 0;
  receivedMessages = [];
  const gstation = new GroundStation(universe, 'houston', gpos);
  gstation.startListening((msg) => {
    receivedMessages.push(msg);
  });
  let x = 0;
  sat.bindProtocol('id', new class extends Protocol {
    broadcast() {
      x += 1;
      return String(x);
    }
  }(universe));
  universe.clock().advance(sat.broadcastPeriod() * 3 + 1);
  expect(receivedMessages.length).toEqual(3);
  expect(receivedMessages[0].body).toEqual('1');
  expect(receivedMessages[1].body).toEqual('2');
  expect(receivedMessages[2].body).toEqual('3');
});
