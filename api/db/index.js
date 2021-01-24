const config = require('config');
const mysql = require('mysql');

const dbCredentials = {
  connectionLimit: 10,
  host: config.get('database.host'),
  database: config.get('database.name'),
  port: config.get('database.port'),
  user: config.get('database.username'),
  password: config.get('database.password')
};

const pool = mysql.createPool(dbCredentials);

const dbApi = {
  query: (query, ...params) => {
    return new Promise((resolve, reject) => {
      pool.query(query, params, (err, result) => {
        if (err)
          reject(err);

        resolve(result);
      });
    });
  },
  close: () => pool.end()
}

module.exports = dbApi;