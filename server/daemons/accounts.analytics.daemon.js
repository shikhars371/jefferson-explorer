// Accounts analytics for airdrops (public info)
const async			= require('async');
const mongoose      = require("mongoose");
const config      	= require('../../config');
const fs 			= require('fs');
const csvWriter 	= require('csv-write-stream');

const RSN     		= require('arisenjs');
config.rsnConfig.httpEndpoint =  (config.CRON) ? config.CRON_API : config.rsnConfig.httpEndpoint;
const rsn     		= RSN(config.rsnConfig);

const log4js      = require('log4js');
log4js.configure(config.logger);
const log         = log4js.getLogger('accounts_analytics');

const customSlack = require('../modules/slack.module');
const logSlack    = customSlack.configure(config.loggerSlack.alerts);

const rsnToInt = 10000;

mongoose.Promise = global.Promise;
const mongoMain  = mongoose.createConnection(config.MONGO_URI, config.MONGO_OPTIONS,
 (err) => {
    if (err){
      log.error(err);
      process.exit(1);
    }
    log.info('[Connected to Mongo RSN in accounts daemon] : 27017');
});

const STATS_ACCOUNTS = require('../models/api.accounts.model')(mongoMain);



process.on('uncaughtException', (err) => {
	// rewrite to slack notify
    logSlack(`======= UncaughtException Accounts daemon server : ${err}`);
    process.exit(1);
});

function getAccountsAnalytics (){
	async.waterfall([
		(cb) => {
			STATS_ACCOUNTS.distinct("account_name").exec((err, result) => {
				if (err){
					return cb(err);
				}
				if (!result){
					return cb(result);
				}
				cb(null, result);
			});
		},
		(result, cb) => {
			let counter = 0;
			async.eachLimit(result, config.limitAsync, (elem, ret) => {
			   	rsn.getAccount({ account_name: elem })
			   		.then(account => {
			   			findBalanceAndUpdate(account, () => {
			   				log.info('==== accounts updated - cursor ', counter++);
			   				ret();
			   			});
			   		})
			   		.catch(err => {
			   			log.error('====== getAccountsAnalytics getAccount elem error - ', err);
			   			ret();
			   		});
			   	}, (err) => {
			   		if (err){
			   			return cb(err)
			   		}
			   		cb(null);
			   	});
		},
	], (err) => {
		if (err){
			log.error(err);
			process.exit(1);
		}
		log.info('===== end analytics function ');
		process.exit(0);
	});
};

function findBalanceAndUpdate(account, callback) {
	  if (!account){
		  return callback();
      }
      let accInfo = {
		  staked: 0,
		  unstaked: 0,
		  balance_rsn: 0,
		  balance: []
	  };
      if (account && account.voter_info && account.voter_info.staked){
			accInfo.staked = account.voter_info.staked / rsnToInt;
      }

 	  rsn.getCurrencyBalance({
      			code: 'arisen.token',
      			account: account.account_name
			})
	   	 	.then(balance => {
	   	 		accInfo.balance = Array.isArray(balance) ? balance : [];
	   	 		accInfo.balance.forEach((elem) => {
	   	 			if (elem.indexOf('RSN') !== -1){
	   	 				accInfo.unstaked = !isNaN(Number(elem.split(' ')[0])) ? Number(elem.split(' ')[0]) : 0;
	   	 			}
	   	 		});
	   	 		accInfo.balance_rsn = accInfo.unstaked + accInfo.staked;
	   	 		STATS_ACCOUNTS.findOneAndUpdate({ account_name: account.account_name }, { staked: accInfo.staked,
	   	 																				  unstaked: accInfo.unstaked,
	   	 																				  balance_rsn: accInfo.balance_rsn,
	   	 																				  balance: accInfo.balance,
	   	 																				  created: new Date(account.created) }, {multi: true})
	   	 				     .exec((err) => {
	   	 				     	if (err){
	   	 				     		log.error(err);
	   	 				     	}
	   	 				     	callback();
	   	 				     });
	   	 	})
	   	 	.catch(err => {
	   	 		log.error(err);
	   	 		callback();
	   	 	});
}


getAccountsAnalytics();
