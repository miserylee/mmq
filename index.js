const info = require('debug')('mq:info');
const error = require('debug')('mq:error');
const debug = require('debug')('mq:debug');
const mongodb = require('mongodb');
const mq = require('mongodb-queue');
const co = require('co');
const EventEmitter = require('events');

class MQ extends EventEmitter {
  constructor (options) {
    super();
    this.options = options;
  }

  static init (name, options) {
    if (this.instances[name]) return this.instances[name];
    options = Object.assign({
      mongoOptions: {},
      enableDeadQueue: true,
      deadQueueName: 'sungorusMQ-deadQueue',
      queueName: 'sungorusMQ-queue',
      visibility: 30,
      delay: 0,
      maxRetries: 5,
      consumeInterval: 5000,
      maxConsumption: 5,
      errorListener: _ => _,
      messageNameFormat: _ => null
    }, options);
    if (!options.uri) throw new Error(`MQ [${name}] has not been initialized!`);
    const instance = new MQ(options);
    instance.name = name;
    instance._retianedMessages = [];
    co(function * () {
      yield instance._init();
    }).catch(options.errorListener);
    this.instances[name] = instance;
    return instance;
  }

  static getInstance (name) {
    if (this.instances[name]) return this.instances[name];
    throw new Error(`MQ [${name}] has not been initialized!`);
  }

  * _init () {
    const { uri, mongoOptions, enableDeadQueue, deadQueueName, queueName, visibility, delay, maxRetries } = this.options;
    const db = yield mongodb.MongoClient.connect(uri, mongoOptions);
    info(`MQ [${this.name}] connect database with uri: ${uri} success`);
    const deadQueue = mq(db, deadQueueName);
    this.queue = mq(db, queueName, {
      visibility: visibility,
      delay: delay,
      maxRetries: maxRetries,
      deadQueue: enableDeadQueue ? deadQueue : null
    });
    this._initialized = true;
    this.appendMessages(this._retianedMessages);
    this._retianedMessages = null;
    this.emit('initialized');
  }

  appendMessages (messages) {
    if (messages && Array.isArray(messages)) {
      messages.forEach(this.appendMessage.bind(this));
    }
  }

  appendMessage ({ operation, params, delay }) {
    if (this._initialized) {
      this.queue.add({ operation, params }, { delay }, err => {
        if (err) {
          error(err.message);
          err.operation = 'mq:appendMessages';
          this.options.errorListener(err);
        }
      });
      info(`MQ [${this.name}] add message [${this.options.messageNameFormat({
        operation,
        params,
        delay
      }) || operation}] success!`);

    } else {
      this._retianedMessages.push({ operation, params, delay });
    }
  }

  consume () {
    if (!this.options.consumers) throw new Error(`MQ [${this.name}] has no comsumers!`);
    if (!this._initialized) info(`MQ [${this.name}] has not been initialized!`);
    this.queue.get((err, msg) => {
      if (err) return error(err.message);
      if (!msg) return debug(`MQ [${this.name}] has no message in queue!`);

      const messageName = this.options.messageNameFormat(msg.payload) || msg.payload.operation;

      info(`MQ [${this.name}] get message [${msg.id}] with name [${messageName}]`);

      const consumer = this.options.consumers[msg.payload.operation];
      if (!consumer) return error(`MQ [${this.name}] consumer [${msg.payload.operation}] is not set. Message [${msg.id}] consume failed.`);
      if (msg.payload.params && !Array.isArray(msg.payload.params)) return error(`The params is wrong, got ${msg.payload.params}`);

      const retainInterval = setInterval(_ => {
        this.queue.ping(msg.ack, (err, id) => {
          if (err) return error(err.message);
          info(`MQ [${this.name}] ping message [${msg.id}] with name [${messageName}] success!`);
        });
      }, this.options.visibility * 1000 / 2);

      co(function * () {
        if (consumer.constructor.name === 'Function') {
          consumer(...(msg.payload.params || []));
        } else if (consumer.constructor.name === 'GeneratorFunction') {
          yield consumer(...(msg.payload.params || []));
        }
        yield new Promise((resolve, reject) => {
          this.queue.ack(msg.ack, (err, id) => {
            if (err) return reject(err);
            resolve(id);
          });
        });
        info(`MQ [${this.name}] consumes message [${msg.id}] with name [${messageName}] success!`);
        clearInterval(retainInterval);
      }.bind(this)).catch(err => {
        error(`MQ [${this.name}] consumes message [${msg.id}] with name [${messageName}] failed with error [${err.message}]!`);
        err.msgId = msg.id;
        err.operation = msg.payload.operation;
        this.options.errorListener(err);
        clearInterval(retainInterval);
      });
    });
  }

  run () {
    setInterval(co.wrap(function * () {
      if (!this._initialized) info(`MQ [${this.name}] has not been initialized!`);
      else {
        new Array(this.options.maxConsumption).fill('').forEach(_ => {
          this.consume();
        });
      }
    }.bind(this)), this.options.consumeInterval);
  }
}

MQ.instances = {};

module.exports = MQ;