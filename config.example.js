/*
  App configuration example created by jared (31.08.18)
*/
const path = require('path');
let config = {};

// production mod
config.PROD = false;

// mongo uri and options
config.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ArisenExplorer';
config.MONGO_OPTIONS = {
    socketTimeoutMS: 30000,
    keepAlive: true,
    reconnectTries: 30000,
    useNewUrlParser: true
};

// connection to Mariadb (Tokens list for account)
config.MARIA_DB_ENABLE = false;
config.MARIA_DB = {
    host: '',
    user: '',
    password: '',
    db: ''
};

// cron processes (aggregation of main stat - actions, transactions, accounts, analytics)
config.CRON = false;
config.CRON_API = 'https://api.arising.io';

config.TPS_ENABLE = true;
config.MAX_TPS_TIME_UPDATE = 5000;

config.rsnInfoConfigs = {
      mainNet: {
        chainId: "fffa80dc4492fedaa90cbc4ee6f5520568826dfb31ed9c8c161224349f6b82f5",
        httpEndpoint: "https://greatchain.arisennodes.io",
        name: "Main Net",
        key: "mainNet"
      },
};

// telegram alert bot
config.telegram = {
  ON: false,
  TOKEN: '',
  TIME_UPDATE: 5000
};

// reserve nodes
config.endpoints = ['https://greatchain.arisennodes.io'];

// rsnjs
config.rsnConfig = {
  chainId: "fffa80dc4492fedaa90cbc4ee6f5520568826dfb31ed9c8c161224349f6b82f5",
  keyProvider: "",
  httpEndpoint: config.endpoints[0],
  expireInSeconds: 60,
  broadcast: true,
  debug: false,
  sign: true,
  logger: {
    log: console.log,
    error: console.error
  }
};

// ArkID wallet
config.walletAPI = {
        host: 'https://greatchain.arisennodes.io',
        port: '',
        protocol: 'https'
};

// api url for producers list
config.customChain = 'https://greatchain.arisennodes.io';

// api url for history
config.historyChain = 'https://greatchain.arisennodes.io';

config.apiV = 'v1'; // api version
config.RAM_UPDATE = 5 * 60 * 1000; // time for ram update - /api/api.*.socket
config.HISTORY_UPDATE = 5 * 60 * 1000; // time for stats update - /api/api.*.socket
config.MAX_BUFFER = 500000; // max buffer size for child processes (kb) - /crons
config.blockUpdateTime = 900; // mainpage upades frequency  - /api/api.*.socket in ml sec
config.offsetElementsOnMainpage = 10; // blocks on mainpage
config.limitAsync = 30; // max threads for async.js module
config.updateTPS = 1000;

// log4js
config.logger = {
    appenders: {
      out:  {
            type: 'stdout'
      },
      server: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/server.log'),
      },
      socket_io: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/socket_io.log'),
      },
      accounts_daemon: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/accounts_daemon.log'),
      },
      accounts_analytics: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/accounts_analytics.log'),
      },
      global_stat: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/global_stat.log'),
      },
      ram_bot: {
        type: 'file',
        filename: path.join(__dirname, './server/logs/ram_bot.log'),
      }
    },
    categories: {
        default:       {
          appenders: ['out'],
          level:     'trace'
        },
        server:  {
          appenders: ['out', 'server'],
          level:     'trace'
        },
        socket_io:  {
          appenders: ['out', 'socket_io'],
          level:     'trace'
        },
        accounts_daemon:  {
          appenders: ['out', 'accounts_daemon'],
          level:     'trace'
        },
        accounts_analytics:  {
          appenders: ['out', 'accounts_analytics'],
          level:     'trace'
        },
        global_stat:  {
          appenders: ['out', 'global_stat'],
          level:     'trace'
        },
        ram_bot:  {
          appenders: ['out', 'ram_bot'],
          level:     'trace'
        }
    }
};

// slack notifications
config.loggerSlack = {
      alerts: {
        type: '',
        token: '',
        channel_id: '',
        username: '',
      }
};

module.exports = config;
