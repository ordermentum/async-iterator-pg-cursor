const crypto = require('crypto');
const nullLogger = require('null-logger');

const generateName = (prefix) => `${prefix}_${crypto.randomBytes(16).toString('hex')}`;

class Cursor {
  constructor(client, query, { logger = nullLogger, name = null, size = 1000 } = {}) {
    this.client = client;
    this.query = query;
    this.size = size;
    this.prepared = false;
    this.name = name ? name : generateName('fetch_');
    this.log = logger;

    this.log.trace(`name: ${this.name}`);
    this.log.trace(`query: ${this.query}`);
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  async prepare() {
    this.log.trace('preparing');
    await this.client.query(`begin;
    declare ${this.name} cursor for ${this.query};`);
    this.log.trace('prepared');
    this.prepared = true;
  }

  async close() {
    this.log.trace('closing');
    await this.client.query(`close ${this.name}`);
    return this.client.query(`commit;`);
  }

  fetch() {
    this.log.trace('fetching');
    return this.client.query(`fetch forward ${this.size} from ${this.name};`);
  }

  async next() {
    if (!this.prepared) {
      await this.prepare();
    }

    const result = await this.fetch();

    const {
      rows,
      rowCount,
    } = result;

    if (rowCount === 0) {
      await this.close();
    }

    return Promise.resolve({
      done: rowCount === 0,
      value: rows,
    });
  }
}

module.exports = Cursor;
