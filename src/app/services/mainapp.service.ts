import { Injectable, EventEmitter, Inject } from '@angular/core';

@Injectable()
export class MainService {

  //rsnRateReady: EventEmitter<any> = new EventEmitter();
  rsnRateReady = {};
  votesToRemove;

  WINDOW: any = window;

  rsnConfig = {
    chainId: "",
    httpEndpoint: "",
    expireInSeconds: 60,
    broadcast: true,
    debug: false,
    sign: true,
    /*logger: {
      log: console.log,
      error: console.error
    }*/
  };

  constructor() {}

  setRsnPrice(data){
      this.rsnRateReady = data;
  }
  getRsnPrice(){
      return this.rsnRateReady;
  }

  sortArray(data) {
      if(!data){
        return;
      }
      let result = data.sort((a, b) => {
          return b.total_votes - a.total_votes;
      }).map((elem, index) => {
          let rsn_votes = Math.floor(this.calculateRsnFromVotes(elem.total_votes));
          elem.all_votes = elem.total_votes;
          elem.total_votes = Number(rsn_votes).toLocaleString();
          elem.index = index + 1;
          return elem;
      });
      return result;
  }

  countRate(data, totalProducerVoteWeight){
      if(!data){
        return;
      }
      this.votesToRemove = data.reduce((acc, cur) => {
            const percentageVotes = cur.all_votes / totalProducerVoteWeight * 100;
            if (percentageVotes * 200 < 100) {
              acc += parseFloat(cur.all_votes);
            }
            return acc;
      }, 0);
      data.forEach((elem) => {
        elem.rate    = (elem.all_votes / totalProducerVoteWeight * 100).toLocaleString();
        elem.rewards = this.countRewards(elem.all_votes, elem.index, totalProducerVoteWeight);
      });

      return data;
  }

  countRewards(total_votes, index, totalProducerVoteWeight){
    let position = index;
    let reward = 0;
    let percentageVotesRewarded = total_votes / (totalProducerVoteWeight - this.votesToRemove) * 100;

     if (position < 22) {
       reward += 318;
     }
     reward += percentageVotesRewarded * 200;
     if (reward < 100) {
       reward = 0;
     }
     return Math.floor(reward).toLocaleString();
  }

  calculateRsnFromVotes(votes){
      let date = +new Date() / 1000 - 946684800;
      let weight = parseInt(`${ date / (86400 * 7) }`, 10) / 52; // 86400 = seconds per day 24*3600
      return votes / (2 ** weight) / 10000;
  };


  getGlobalNetConfig(){
    if (!this.getCookie("netsConf")){
      this.rsnConfig.chainId = "136ce1b8190928711b8bb50fcae6c22fb620fd2c340d760873cf8f7ec3aba2b3";
      this.rsnConfig.httpEndpoint = "http://jefferson.arisennodes.io";
      return this.WINDOW.Rsn(this.rsnConfig);
    }
      let cookie = JSON.parse(this.getCookie("netsConf"));
      let net = localStorage.getItem("netName") || "mainNet";
      this.rsnConfig.chainId = cookie[net].chainId;
      this.rsnConfig.httpEndpoint = cookie[net].httpEndpoint;
      return this.WINDOW.Rsn(this.rsnConfig);
  }

  getCookie(name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
  }

  sortBlocks(data){
       if (!data){
           return null;
       }
       data.sort((a, b) => {
           if (a.block_num < b.block_num){
               return 1;
           } else {
               return -1;
           }
       });
       return data;
  }

// end service export
}
