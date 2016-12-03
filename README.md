## mmq ![NPM version](https://img.shields.io/npm/v/mmq.svg?style=flat)

Mongodb-Message-Queue

### Installation
```bash
$ npm install mmq --save
```

### Usage
Check it in test/index.js

### Default Options
```
{
  uri: undefined, // The mongodb connection uri.
  mongoOptions: {}, // The mongodb connection options.
  enableDeadQueue: true, // If enable deadQueue for dead messages to save.
  deadQueueName: 'sungorusMQ-deadQueue', // The deadQueue name
  queueName: 'sungorusMQ-queue', // The queue name.
  visibility: 30, // Seconds for consumers to retain message.
  delay: 0, // Seconds for message been delay consumed.
  maxRetries: 5, // Max retry times to consume a message, the message will be append to deadQueue over the times.
  consumeInterval: 5000, // Milliseconds interval to start a consume process.
  maxConsumption: 5,  // Number of message to be consume every consume process.
  errorListener: _ => _, // The error listener.
  messageNameFormat: _ => null // A format function for log
}
```

### Contributing
- Fork this Repo first
- Clone your Repo
- Install dependencies by `$ npm install`
- Checkout a feature branch
- Feel free to add your features
- Make sure your features are fully tested
- Publish your local branch, Open a pull request
- Enjoy hacking <3

### MIT license
Copyright (c) 2016 Misery Lee &lt;miserylee@foxmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---
built upon love by [docor](git+https://github.com/turingou/docor.git) v0.3.0
