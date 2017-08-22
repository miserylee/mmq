const options = {
  uri: 'mongodb://localhost/mmq',
  consumeInterval: 1000,
  maxConsumption: 1000,
  visibility: 10,
  consumers: {
    ping: time => {
      console.log(Date.now() - time.getTime());
    }
  },
};

const MQ = require('../');

const mq = MQ.init('mmq', options);
mq.run();

setInterval(_ => {
  mq.appendMessage({
    operation: 'ping',
    params: [new Date()]
  });
}, 100);