const express = require('express');
const cors = require('cors');
require('express-async-errors');

const routes = require('./routes');
const errorHandler = require('./app/middlewares/errorHandler');

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);
app.use(errorHandler);

const server = app.listen(PORT, () => console.log(`🔥 Server started at http://localhost:${PORT}`));

module.exports = server;
