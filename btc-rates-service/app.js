'use strict';

const express = require('express');
const {
  json,
  urlencoded,
} = require('express');

const appConfig = require('./lib/config');

const KunaBtcRatesProvider = require('./application/rates-providers/kunaBtcRatesProvider');
const AccessCheckService = require('./application/services/accessCheckService');
const BtcRatesService = require('./application/services/btcRatesService');
const BtcRatesController = require('./application/controllers/btcRatesController');
const getBtcRatesRouter = require('./application/btcRatesRoutes');

const { rabbitMqLoggerAsyncFactory } = require('../common/loggers');

const {
  logHttpError,
  sendResponseOnHttpError,
} = require('../common/http/helpers');

const SERVICE_NAME = 'BTC-UAH rates service';

const createApp = async (debug = false) => {
  const btcRatesProvider = new KunaBtcRatesProvider();
  const accessCheckService = new AccessCheckService(
    appConfig.AUTH_SERVICE_URL,
  );
  const btcRatesService = new BtcRatesService(btcRatesProvider);

  const logger = await rabbitMqLoggerAsyncFactory(
    SERVICE_NAME, appConfig.AMQP_URL, debug,
  );

  const btcRatesController = new BtcRatesController(
    accessCheckService,
    btcRatesService,
  );
  const btcRatesRouter = getBtcRatesRouter(btcRatesController);

  const app = express();

  app.use(urlencoded({ extended: true }));
  app.use(json());

  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  });

  app.use(btcRatesRouter);

  /* eslint-disable-next-line */
  app.use((err, req, res, next) => {
    logHttpError(err, logger);
    sendResponseOnHttpError(err, res);
  });

  return app;
};

module.exports = createApp;
