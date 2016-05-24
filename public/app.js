'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute','angular-popups'
]).filter('formatAmount',function(){
    return function(input){
        return input/100000000;
    }
})
.controller('ctrl', function($scope,$http) {

    $scope.accountInfo = {};
    $scope.accountInfo.secret = 'garden scan oval hurdle mixed town next plastic exercise jungle bulk smile'
    $scope.secretDialog = {};
    $scope.investDialog = {};
    $scope.msgDialog = {};
    $scope.playNo = '';
    //$scope.msgDialog.open = true;
    //$scope.msgDialog.title = 'haha';
    //$scope.msgDialog.content = 'hehe';
    $scope.secretDialog.open = true;

    var iosocket = io.connect();

    iosocket.on('play/bet',function(data){

        var isWin = data.result.result.indexOf('Win')>-1;
        if(isWin){
            $scope.invest.totalInput-=data.result.amount;
            $scope.invest.totalProfit -= data.result.amount;
        }else{
            $scope.invest.totalInput+=data.result.amount;
            $scope.invest.totalProfit += data.result.amount;
        }

        $scope.invest.maxProfit = $scope.invest.totalInput/10;

        if(data.result.account == $scope.account.address){

            $scope.account.balance -= 0.1;

            if(isWin){
                $scope.account.balance += data.result.amount;
            }else{
                $scope.account.balance -= data.result.amount;
            }

            endLoading();
        }else{
            console.log('not self');
        }

        $scope.betInfo.list.splice(0,0,data.result);
        if (!$scope.$$phase) {
            $scope.$apply();
        }
    })



    iosocket.on('play/summary',function(data){
        return;
        console.log('refresh summary',new Date().getTime());
        $scope.invest = data;
        //data.totalProfit /= 100000000;
        //data.maxProfit /= 100000000;
        //data.totalInput /= 100000000;
        console.log('summary:',data);
        if(!$scope.$$phase) {
            $scope.$apply();
        }

    })

    iosocket.on('play/accountInfo',function(data){

        return;
        console.log('refresh account info',new Date().getTime());
        $scope.account = data.account;

        if (!$scope.$$phase) {
            $scope.$apply();
        }

        iosocket.emit('play/queryAccountInfo',{secret:secret});
    });

    iosocket.on('play/init',function(data){

        endLoading();
    });

    iosocket.on('connect', function () {
        //console.log('connect');

        //iosocket.on('welcome',function(data){
        //    console.log(data);
        //})
    });

    $scope.view = {};

    $scope.investInfo = {
        investAmount : 0,
        divestAmount : 0
    }

    var showLoading = function(text){
        $scope.view.inLoading = true;
        $scope.view.loadingText = text?text:'loading';

    }

    var endLoading = function(){
        $scope.view.loadingText='haha';
        $scope.view.inLoading = false;
    }


    var secret = '';
    //var secret = 'faculty disagree thumb bar outside obscure another adapt sponsor prefer retreat potato';
    //secret = 'garden scan oval hurdle mixed town next plastic exercise jungle bulk smile';
    var loadAccountInfo = function(callback) {
        $http.get('/api/accountInfo?secret='+secret).success(function (data) {
            $scope.account = data.account;

            if (!$scope.$$phase) {
                $scope.$apply();
            }

            callback()
        });
    }




    var init = function() {
        showLoading('loading account info');
        loadAccountInfo(function () {

            //iosocket.emit('play/queryAccountInfo',{secret:secret});

            endLoading();

        })
    }

    //    <td class="padding-in-1400">
    //    {{bet.number}}
    //</td>
    //<td class="ng-binding">
    //    {{bet.createTime|date:"MM/dd/yyyy @ hh:mm:ss"}}
    //</td>
    //<td class="ng-binding">
    //    {{bet.result}}
    //</td>
    //<td class="ng-binding">
    //    {{bet.betCount}}
    //</td>
    //<td class="ng-binding">
    //    {{bet.totalAmount}}
    //</td>
    //<td class="ng-binding">
    //    {{bet.winAmount}}
    //</td>

    $scope.history = {
        list:[
        ]
    }

    $scope.showMy = false;

    $scope.current = {
        list:[

        ]
    }

    $scope.betInfo ={
        list:[]
        //list:[{
        //    account:'12345',
        //    amount:1,
        //    createTime:'2014-11-15',
        //    result:'Win(2)'
        //
        //}]
    };

    $scope.submitSecret = function(){
        secret = $scope.accountInfo.secret;
        $scope.secretDialog.open = false;

        //init();
    }

    $scope.submitInvest = function(){

        $http.post('/api/doInvest',{secret:secret,amount:$scope.investInfo.investAmount,publicKey:$scope.account.publicKey}).success(function(data){
            if(data.success){
                $scope.investDialog.open = false;
                init();
            }

        });
    }

    $scope.submitDivest = function(){
        showLoading('start invest');
        $http.post('/api/doDivest',{address:$scope.account.address,amount:$scope.investInfo.divestAmount}).success(function(data){
           if(data.success)
            $scope.divestDialog.open = false;
            init();
        });
    }



    var doBet = function(type,sn){
        showLoading('start bet');
        var api = '/api/dapps/3965883626775130620/api/bet?account=123456&sn='+sn+'&which='+type;
        $http.get(api).success(function(data){

            endLoading();
            $scope.loadMy();
            console.log(data);
        })
    }

    $scope.betLo = function(sn){
        doBet('lo',sn)
    }

    $scope.betHi = function(sn){
        doBet('hi',sn);
    }

    $scope.betSingle = function(sn){
        doBet('single',sn);
    }

    $scope.betDouble = function(sn){
        doBet('double',sn);
    }

    $scope.betCenter = function(sn){
        doBet('center',sn)
    }

    $scope.betSide = function(sn){
        doBet('side',sn)
    }

    $scope.loadCurrent = function(){
        $scope.showMy = false;
        loadData();
    }

    $scope.formatStatus = function(type,status){
        var text = 'unknow';

        switch (type)
        {
            case 'lo':text='押小';break;
            case 'hi':text='押大';break;
            case 'side':text='押边';break;
            case 'double':text='押双';break;
            case 'single':text='押单';break;
        }

        text += '|';

        if (status == 0)
            text += '未开奖';
        else if(status == 1)
            text +='已中奖';
        else if(status == 2)
            text += '未中奖';

        return text;
    }


    $scope.loadMy = function(){
        $scope.showMy = true;
        showLoading('loading data');
        $http.get('/api/dapps/3965883626775130620/api/my?account=123456').success(function(data){
            endLoading();
            $scope.current.list = data.response;
        })
    }

    $scope.joinBet = function(playNo){
        $scope.investDialog.open = true;
        $scope.playNo = playNo;
    }


    $scope.account = {};
    $scope.invest = {};


    loadData();

    function loadData(){
        showLoading('loading data');
        $http.get('/api/dapps/3965883626775130620/api/').success(function(data){

            endLoading();
            //{number:123456,createTime:new Date().getTime(),result:'6+8=14',count:15,totalAmount:320,winAmount:10}
            $scope.history.list = data.response;
            $scope.current.list = data.response[0].next;
        })
    }



    //$http.get('/api/next').success(function(data){
    //    $scope.current.list = data;
    //})

    //init();

    //$scope.haha='cc';
});
