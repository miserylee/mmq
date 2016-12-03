const MQ = require('../index');
const assert = require('assert');

const name = 'My Queue';
const consumers = {
  'MyConsumer': (param1, param2) => {
    console.log('I am consumer!', param1, param2);
  }
};

const mq = MQ.init(name, {
  uri: 'mongodb://localhost/mmq',
  consumers,
  errorListener: error => console.error(error),
  messageNameFormat: ({operation, params}) => {
    return `${operation} with ${params.length} params`
  }
});

describe('Instance', function () {
  it('should init', function () {
    assert(mq instanceof MQ);
    assert.equal(mq.name, name);
    assert(MQ.instances[name]);
  });
  it('should got instance', function () {
    const mq = MQ.getInstance(name);
    assert(mq instanceof MQ);
    assert.equal(mq.name, name);
  });
});

mq.on('initialized', function () {
  describe('Message', function () {
    it('should append message', function () {
      mq.appendMessage({
        operation: 'MyConsumer',
        params: ['Hello', 'world']
      });
    });
    it('should consume', function () {
      mq.consume();
    });
    it('should append messages', function () {
      mq.appendMessages([{
        operation: 'MyConsumer',
        params: ['I am', 'message 1']
      }, {
        operation: 'MyConsumer',
        params: ['I am', 'message 2']
      }]);
    });
    it('should run consume timer', function (done) {
      this.timeout(20000);
      mq.run();
      setTimeout(done, 10000);
    });
  });
});