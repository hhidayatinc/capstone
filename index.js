const express = require('express');
const createTcpPool = require('./connect-tcp.js');
const createUnixSocketPool = require('./connect-unix.js');

const app = express();
app.set('view engine', 'pug');
app.enable('trust proxy');

// Automatically parse request body as form data.
app.use(express.urlencoded({extended: false}));
// This middleware is available in Express v4.16.0 onwards
app.use(express.json());

const createPool = async () => {
    const config = {
        connectionLimit: 5,
        connectionTimeout: 10000,
        acquireTimeout: 10000,
        waitForConnection: true,
        queueLimit: 0
    };
    if (process.env.INSTANCE_HOST) {
        // Use a TCP socket when INSTANCE_HOST (e.g., 127.0.0.1) is defined
        return createTcpPool(config);
      } else if (process.env.INSTANCE_UNIX_SOCKET) {
        // Use a Unix socket when INSTANCE_UNIX_SOCKET (e.g., /cloudsql/proj:region:instance) is defined.
        return createUnixSocketPool(config);
      } else {
        throw 'Set either the `INSTANCE_HOST` or `INSTANCE_UNIX_SOCKET` environment variable.';
      }
};

const ensureSchema = async pool => {
    // Wait for tables to be created (if they don't already exist).
    await pool.query(
      `CREATE TABLE IF NOT EXISTS user
        ( id INT NOT NULL AUTO_INCREMENT, admin varchar(255),
        nama varchar(255), nomor varchar(255), pasword varchar(255)
        PRIMARY KEY (id) );`
    );
    console.log("Ensured that table 'user' exists");
};