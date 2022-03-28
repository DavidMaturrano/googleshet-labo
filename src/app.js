const express = require('express');

require('./spreadsheet');

const app = express();

app.use(require('./routes/google.routes'));

module.exports = app;