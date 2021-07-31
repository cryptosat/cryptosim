const Service = require('./service');
const Satellite = require('../satellite');
const GroundStation = require('../groundStation');
const testUtils = require('../testUtils');

test('service is an abstract class', () => {
  const universe = testUtils.createTestUniverse();
  expect(() => {
    new Service(universe);
  }).toThrow(Error);
});

test('unbound service raises error if trying to send a message', () => {
  service = new class extends Service {}();
  expect(service.send).toThrow(Error);
});

test('bound service can send a message', () => {
  service = new class extends Service {}();
  service.bind(() => {
    return 'hello';
  });
  expect(service.send()).toEqual('hello');
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
  gstation.startListening((stationId, msg) => {
    receivedMessages.push(msg);
  });
  sat.bindService('id', new class extends Service {
    // eslint-disable-next-line
    receive(body) {
      this.send('received: ' + body);
    }
  }(universe));
  const request = {
    satelliteHeader: {
      serviceId: 'id',
    },
    satellitePayload: 'hello',
  };
  universe.transmitFromStation(gstation, request);
  universe.clock().advance(2);
  expect(receivedMessages.length).toEqual(1);
  expect(receivedMessages[0].satelliteHeader.serviceId).toEqual('id');
  expect(receivedMessages[0].satellitePayload).toEqual('received: hello');
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
  gstation.startListening((stationId, msg) => {
    receivedMessages.push(msg);
  });
  let x = 0;
  sat.bindService('id', new class extends Service {
    // eslint-disable-next-line
    broadcast() {
      x += 1;
      return String(x);
    }
  }(universe));
  universe.clock().advance(sat.broadcastPeriod() * 3 + 1);
  expect(receivedMessages.length).toEqual(3);
  expect(receivedMessages[0].satellitePayload).toEqual('1');
  expect(receivedMessages[1].satellitePayload).toEqual('2');
  expect(receivedMessages[2].satellitePayload).toEqual('3');
});
