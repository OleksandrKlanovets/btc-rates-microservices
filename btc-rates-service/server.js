'use strict';

const createApp = require('./app');
const { PORT, DEBUG_MODE } = require('./lib/config');

createApp(DEBUG_MODE).listen(
  PORT,
  /* eslint-disable-next-line */
  () => console.log(`The BTC-rates service has started on port ${PORT}.`),
);
