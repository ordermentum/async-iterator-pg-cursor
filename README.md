# async-iterator-pg-cursor

```javascript
const Cursor = require('async-iterator-pg-cursor');
const pg = require('pg');

const host = process.env.DATABASE_HOST;
const user = process.env.DATABASE_USER;
const port = process.env.DATABASE_PORT;
const password = process.env.DATABASE_PASSWORD;
const database = process.env.DATABASE_NAME;
const client = new pg.Client({ database, host, port, user, password });

const query = `SELECT * FROM products`;

async function start() {
  await client.connect();
  const cursor = new Cursor(client, query);
  for await (const rows of cursor) {
    for (const row of rows) {
      console.log(row);
    }
  }

  return true;
};

start().then(() => process.exit());
```
