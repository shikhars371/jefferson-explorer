import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material';
import { MainService } from '../../services/mainapp.service';
import { NotificationsService } from 'angular2-notifications';
import {MatChipInputEvent} from '@angular/material';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

@Component({
  selector: 'vote-page',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.css']
})
export class VotePageComponent implements OnInit {
  transactionId;
  block;
  mainData;
  moment = moment;
  time;
  trxArr = [];
  dataSource;
  displayedColumns = ['actions'];
  spinner = false;
  unstaked = 0;
  staked = 0;
  balance = 0;

  identity;
  WINDOW: any = window;
  rsnNetwork = {
            blockchain: 'rsn',
            host: '',
            port: '',
            chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
  };
  rsnOptions = {
            broadcast: true,
            sign: true,
            chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906"
  };
  protocol = 'https';

  vote = {
    voter: '',
    proxy: '',
    producers: ['arisen', 'jared']
  };
  contract;
  contractName = 'arisen';
  contractKeys = {};
  contractMethod = '';
  contractField = {};
  contractFieldsRender = [];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private route: ActivatedRoute,
              protected http: HttpClient,
              public dialog: MatDialog,
              private notifications: NotificationsService){}

  getAccount(name){
      this.spinner = true;
      this.http.get(`/api/v1/get_account/${name}`)
           .subscribe((res: any) => {
                          this.mainData = res;
                          this.getBalance(name);
                          this.spinner = false;
                      },
                      (error) => {
                          console.error(error);
                          this.spinner = false;
                      });
  }

  getBalance(accountId){
      this.http.get(`/api/v1/get_currency_balance/arisen.token/${accountId}/RSN`)
           .subscribe((res: any) => {
                          this.unstaked = (!res[0]) ? 0 : Number(res[0].split(' ')[0]);
                          if (this.mainData.voter_info && this.mainData.voter_info.staked){
                              this.staked = this.mainData.voter_info.staked / 10000;
                          }
                          this.balance = this.unstaked + this.staked;
                      },
                      (error) => {
                          console.error(error);
                      });
  }

  getWalletAPI(){
       this.http.get(`/api/v1/get_wallet_api`)
          .subscribe((res: any) => {
                          this.rsnNetwork.host = res.host;
                          this.rsnNetwork.port = res.port;
                          this.protocol = res.protocol;
                      },
                      (error) => {
                          console.error(error);
                      });
  }

  getContract(name){
      this.spinner = true;
      this.http.get(`/api/v1/get_code/${name}`)
           .subscribe((res: any) => {
                          console.log(res);
                          if (res && res.abi && res.abi.structs){
                              this.contract = res.abi.structs;
                              this.contract.forEach(elem => {
                                  this.contractKeys[elem.name] = elem.fields;
                              });
                          }
                          this.spinner = false;
                      },
                      (error) => {
                          console.error(error);
                          this.spinner = false;
                      });
  }

  selectContractMethod(method) {
    if (this.contractKeys[method]){
       this.contractField = {};
       this.contractFieldsRender = this.contractKeys[method];
      }
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.vote.producers.push(value.trim());
    }

    if (input) {
      input.value = '';
    }
  }

  remove(producer): void {
    const index = this.vote.producers.indexOf(producer);

    if (index >= 0) {
      this.vote.producers.splice(index, 1);
    }
  }

  loginArkId(){
    if (!this.WINDOW.arkid){
        console.error('Please install arkid wallet !');
    }
    localStorage.setItem("arkid", 'loggedIn');
    this.WINDOW.arkid.getIdentity({
       accounts: [this.rsnNetwork]
    }).then(identity => {
        this.identity = identity;
        if (identity && identity.accounts[0] && identity.accounts[0].name){
            this.getAccount(identity.accounts[0].name);
        }
    }).catch(err => {
        console.error(err);
    });
  }

  logoutArkId(){
    if (!this.WINDOW.arkid){
        return this.notifications.error('ArkId error', 'Please install ArkId extension');
    }
    localStorage.setItem('arkid', 'loggedOut');
    this.WINDOW.arkid.forgetIdentity().then(() => {
        location.reload();
        this.notifications.success('Logout success', '');
    }).catch(err => {
        console.error(err);
    });
  }

  generateTransaction(){
    if(!this.identity){
        return this.notifications.error('Identity error!!!', '');
    }
    if (! this.vote.voter.length){
        return this.notifications.error('Error', 'Please type Voter');
    }
        let rsn = this.WINDOW.arkid.rsn(this.rsnNetwork, this.WINDOW.Rsn, this.rsnOptions, this.protocol);
        rsn.contract('arisen', {
            accounts: [this.rsnNetwork]
        }).then(contract => {
            contract.voteproducer({
                voter: this.vote.voter,
                proxy: this.vote.proxy,
                producers: this.vote.producers
            }).then(trx => {
                  console.log(trx);
                  this.getAccount(this.identity.accounts[0].name);
                  this.notifications.success('Transaction Success', '');
                  this.vote = {
                    voter: '',
                    proxy: '',
                    producers: ['arisen']
                  };
            }).catch(err => {
                 console.error(err);
                 this.notifications.error('Transaction Fail', '');
            });
           }).catch(err => {
                console.error(err);
                this.notifications.error('Transaction Fail', '');
           });
  }

  convertToBytes(string){
      let bytes = [];
      for (let i = 0; i < string.length; ++i) {
          bytes.push(string[i].charCodeAt());
      }
      return bytes;
  }

  openDialogMemo(event, data){
    let result = data;
    let json = false;
    if (data.indexOf('{') >= 0 && data.indexOf('}') >= 0){
        result = JSON.parse(data);
        json = true;
    }
    this.dialog.open(DialogDataMemo, {
      data: {
         result: result,
         json: json
      }
    });
  }

  ngOnInit() {
      this.getWalletAPI();

     if (localStorage.getItem("arkid") === 'loggedIn'){
           if (!this.WINDOW.arkid){
                document.addEventListener('arkidLoaded', () => {
                      this.loginArkId();
                });
           } else {
             this.loginArkId();
           }
     }
  }
}

@Component({
  selector: 'dialog-data-memo',
  template: `
  <h1 mat-dialog-title>Memo</h1>
  <div mat-dialog-content>
      <ngx-json-viewer [json]="data.result" *ngIf="data.json"></ngx-json-viewer>
      <div *ngIf="!data.json">{{ data.result }}</div>
  </div>
`,
})
export class DialogDataMemo {
  constructor(@Inject(MAT_DIALOG_DATA) public data) {}
}
