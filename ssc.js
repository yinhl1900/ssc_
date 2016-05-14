
//var request = require('request');
//var http = require("http");
var cheerio = require("cheerio");
var httpify = require('httpify')
var superagent = require('superagent');
var async = require('async');
var time = require("./time")
//var wallet = require('wallet');




/*
//how to use

var ssc = require("./ssc");
ssc = new ssc();
var firstRace = true
var firstKL8 = true
ssc.getRace(function(err,data){ 
  if (firstRace){      
       //console.log(data)         
       firstRace =false   
      
    }
});
ssc.getKL8(function(err,data){
  
  if (firstKL8){       
       //console.log(data)         
       firstKL8 =false     
      
    }
});
*/
//KL8 早上9点至晚上23:55|每5分钟一期|每日开奖179期
//RACE 早上9点07至晚上23:57|每5分钟一期|每日开奖179期 
var SscData =[]
function Ssc () {
   this.KL8="http://www.bwlc.net/bulletin/keno.html" 

   this.Race="http://www.bwlc.net/bulletin/trax.html" 


  
  
  

}

Ssc.prototype.getKL8Data= function (callback) {

  url = this.KL8
  
  superagent.get(url, function(err, res){ 

    if(err){
      callback(err,null)
    } else{
      var str = String(res.text);
      var $ = cheerio.load(str);
      var html = $('table[class=tb]').html()
      
      $ = cheerio.load(html); 
     // var jinqui=[];
      //var result =[];
      var result =[]

      var objs = $("tr");
      var isFirst = true;
      //console.log(objs.length)
      for (var i=0;i<objs.length;i++){
        
        var str = $(objs[i]).html(); 
     

        var json = parseData(str,res);
        if (json.sn!=""){ 
            if (isFirst==true){
              json.isFirst= true;
              json = addExtraData(json)
             
              isFirst=false;
             
              
            }
            result.push(json);

        }

      } 
      callback(null,result);
       

    }
    

 
  });
  
}

function parseData(str,res){

      $$ = cheerio.load(str);
      var json={};
      json.symbol= "kl8"
      json.name="币28"
      json.sn =  $$('td').slice(0).eq(0).text()
      json.win_number= $$('td').slice(1).eq(0).text()
      json.time=  $$('td').slice(3).eq(0).text()
      json.timestamp =parseUnixTime(json.time);
      //json.timestamp_limit =json.timestamp-30;
      json.now_timestamp=parseUnixTime(res.header.date)
      json.left_second=json.timestamp-json.now_timestamp
      json.isFirst=false;
     
      json.isLastGame =isLastGame("23","55",json.timestamp)   
      
       


       var arr = json.win_number.split(",")
       json.arr =arr.sort();
       json.win_number=""
       for (i=0;i<arr.length;i++){
          if (i < arr.length-1){
            json.win_number = json.win_number+arr[i]+","
          } else {
             json.win_number = json.win_number+arr[i]
          }
       }
       json = calcKL8ResultNumber(json,",")
       json = calcKL8Result(json)  
       json.arr =[];


       return json

}

function addExtraData(json){
       if (json.isFirst){

         json = addKL8Odd(json)
         //json = calcNextGame(json);//计算下场时间
         //json = calcNext2Game(json);//计算下场时间   
         json = calcNext(json)         

         json = calcKL8Result(json);


       }  
       return json
}

Ssc.prototype.getRace= function (callback) {
//function getFromBW(url,callback){
  url = this.Race
  superagent.get(url, function(err, res){
    if(err){
      callback(err,null)
    } else{ 
      var str = String(res.text);
      var $ = cheerio.load(str);
      var html = $('table[class=tb]').html()
      
      $ = cheerio.load(html); 
     // var jinqui=[];
      var result =[];
      $("tr").each(function(i, e) {
           var str = $(this).html(); 

           $$ = cheerio.load(str);
          var json={};

          json.symbol= "race"
           json.name="赛车"
          json.sn =  $$('td').slice(0).eq(0).text()
          json.win_number= $$('td').slice(1).eq(0).text()
          json.time=  $$('td').slice(2).eq(0).text()
          json.timestamp =parseUnixTime(json.time);
          json.now_timestamp=parseUnixTime(res.header.date)
          json =calcRaceResultNumber(json,",")
          json.isLastGame =isLastGame("23","57",json.timestamp)
          json = calcNextGame(json);//计算下场时间
          json = calcNext2Game(json);//计算下场时间
          if (json.sn!=""){
     
           callback(null,json)
          }    
      
      
      });
    }
     

 
  });
  
}


function isInGameTime(hour1,minute1,hour2,minute2,unix_timestamp){

  var date = new Date(unix_timestamp*1000);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  // Seconds part from the timestamp

  if ((hours>hour1)&&(hours) )

  var seconds = date.getSeconds();

  if ((hours==hour)&&(minutes==minute)){
     return true
  } else {
    return false
  }

 
}

function isLastGame(hour,minute,unix_timestamp){

  var date = new Date(unix_timestamp*1000);
  // Hours part from the timestamp
  var hours = date.getHours();
 
  // Minutes part from the timestamp

  var minutes = date.getMinutes();
  // Seconds part from the timestamp
  var seconds = date.getSeconds();

  if ((hours==hour)&&(minutes==minute)){
     return true
  } else {
    return false
  }

 
}
function add0(m){return m<10?'0'+m:m }


function parseTimestamp(timestamp){
//shijianchuo是整数，否则要parseInt转换
  var time = new Date();
  time.setTime(timestamp * 1000);
  var y = time.getFullYear();
  var m = time.getMonth()+1;
  var d = time.getDate();
  var h = time.getHours();
  var mm = time.getMinutes();
  var s = time.getSeconds();
  //return y+'-'+add0(m)+'-'+add0(d)+' '+add0(h)+':'+add0(mm)+':'+add0(s);
  return y+'-'+add0(m)+'-'+add0(d)+' '+add0(h)+':'+add0(mm)
}
function parseTimestamp2(unix_timestamp){
//http://www.cnblogs.com/yjf512/p/3796229.html

  var timestamp3 = unix_timestamp;
  var newDate = new Date()
  newDate.setTime(timestamp3 * 1000);
  return newDate()

}
function parseUnixTime(str){
  var stringTime =  str;// "2014-07-10 10:21:12";
  var timestamp2 = Date.parse(new Date(stringTime));
  timestamp2 = timestamp2 / 1000;
  //2014-07-10 10:21:12的时间戳为：1404958872 
  ////console.log(stringTime + "的时间戳为：" + timestamp2);
  return timestamp2
}
//很重要，结算。
function calcKL8Result(obj){
////console.log(obj.num_sum)
  if (obj.num_sum != undefined){
     result =[];
    
    if (obj.num_sum  % 2 == 0) {
      result.push("SO")
    } else {
       result.push("SD")
    }
    if (obj.num_sum  > 13) {
      result.push("SB")
    } else {
       result.push("SS")
    }  

    if ((obj.num_sum>9)&&((obj.num_sum<18))){
      result.push("SC")
    } else {
       result.push("SM")
    }  


    result.push("SUM"+obj.num_sum)
    obj.result =result
    return obj
  }
  return obj
}
function calcKL8ResultNumber(obj,symbol){
  var str =String(obj.win_number)
  var sym = symbol || " "
  var detail =  str.split(sym)
  //num= detail[1]+ detail[3]+detail[5]+detail[7]+detail[9]+detail[11]
  num= parseInt(detail[1]) + parseInt(detail[3])  +parseInt(detail[5])+parseInt(detail[7])+parseInt(detail[9])+parseInt(detail[11])
  ////console.log(num)
  num= num % 10
  obj.num_h = num

  num= parseInt(detail[2]) + parseInt(detail[4])  +parseInt(detail[6])+parseInt(detail[8])+parseInt(detail[10])+parseInt(detail[12])

  num= num % 10
  obj.num_t = num

  num= parseInt(detail[14]) + parseInt(detail[15])  +parseInt(detail[16])+parseInt(detail[17])+parseInt(detail[18])+parseInt(detail[19])

  num= num % 10
  obj.num_o = num  
  obj.num_sum = obj.num_h+obj.num_t+obj.num_o
  //number1+number3+number5+number7+number9+ number11
  return obj
}
//计算下NUM场的timestamp和sn
function calcNext(obj,num){
  num = num ||5

 // //console.log("calcKL8NextGame")
  //var str =String(obj.win_number)
  var next =[]
  for (var i=1;i<num+1;i++){
      var game = {}


      //if (isHourValid("8",game.timestamp)){
      if (obj.isLastGame==false){ 
        game.timestamp =  (300*(i)) +obj.timestamp ;//300秒 =5分钟
        game.playNo = parseInt(obj.sn)+i
        game.openTime = time.parseTimestamp(game.timestamp)
        next.push(game)
      } else {
        game.timestamp = obj.timestamp + (300*i)+32400+300;//300秒 =5分钟 ;32400秒 =9小时
        game.openTime= parseTimestamp(game.timestamp)
        game.playNo =  parseInt(obj.sn)+i
         next.push(game)
      }
      
  }
 // next.pop()
  /*
  if (obj.isLastGame==false){
    nextGame.timestamp = obj.timestamp + 300;//300秒 =5分钟
    nextGame.time= parseTimestamp(nextGame.timestamp)
    nextGame.sn = parseInt(obj.sn)+1
    obj.nextGame =nextGame;
  } else {
    nextGame.timestamp = obj.timestamp + 300+32400+300;//300秒 =5分钟 ;32400秒 =9小时
    nextGame.time= parseTimestamp(nextGame.timestamp)
    nextGame.sn =  parseInt(obj.sn)+1
    obj.nextGame =nextGame;

  }
  */
  obj.next = next
  return obj
}
/*
unix_timestamp 转化後的小时是否比hour大
*/
function isHourValid(hour,unix_timestamp){



  var date = new Date(unix_timestamp*1000);
  // Hours part from the timestamp
  var hours = date.getHours();
  ////console.log(hours)

  // Minutes part from the timestamp

  var minutes = date.getMinutes();
  // Seconds part from the timestamp
  var seconds = date.getSeconds();

 if (hours>hour){  
     return true
  } else {
    return false
  }

 
 
}
//计算下一场的timestamp和sn

/*
function calcNextGame(obj){
 // //console.log("calcKL8NextGame")
  //var str =String(obj.win_number)
  var nextGame ={}
  if (obj.isLastGame==false){
    nextGame.timestamp = obj.timestamp + 300;//300秒 =5分钟
    nextGame.time= parseTimestamp(nextGame.timestamp)
    nextGame.sn = parseInt(obj.sn)+1
    obj.nextGame =nextGame;
  } else {
    nextGame.timestamp = obj.timestamp + 300+32400+300;//300秒 =5分钟 ;32400秒 =9小时
    nextGame.time= parseTimestamp(nextGame.timestamp)
    nextGame.sn =  parseInt(obj.sn)+1
    obj.nextGame =nextGame;

  }
  return obj
}


function calcNext2Game(obj){
 // //console.log("calcKL8NextGame")
  var str =String(obj.win_number)
  var next2Game ={}
  if (obj.isLastGame==false){
    next2Game.timestamp = obj.timestamp + 600;//600秒 =10分钟
    next2Game.time= parseTimestamp(next2Game.timestamp)
    next2Game.sn = parseInt(obj.sn)+2
    obj.next2Game =next2Game;
  } else {
    next2Game.timestamp = obj.timestamp + 300+32400+600;//300秒 =5分钟 ;32400秒 =9小时
    next2Game.time= parseTimestamp(next2Game.timestamp)
    next2Game.sn =  parseInt(obj.sn)+2
    obj.next2Game =next2Game;

  }
  return obj
}
*/
function calcRaceResultNumber(obj,symbol){
  var str =String(obj.win_number)
  var sym = symbol || " "
  var detail =  str.split(sym)
  //num= detail[1]+ detail[3]+detail[5]+detail[7]+detail[9]+detail[11]
  num= parseInt(detail[0])
  ////console.log(num)
  num= num % 10
  obj.pk = num

  num9= parseInt(detail[9])
  ////console.log(num)
  num9= num9 % 10
  if (num>num9) {
    obj.dt = true  
  } else {
    obj.dt = false
  }


  return obj
}

Ssc.prototype.getKL8Odd= function () {
   var obj ={}
  return addKL8Odd(obj)
}


function addKL8Odd(obj){
  odds= []
/*
  var odd = {}
  odd.name = "SUM0"
  odd.rate=960
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM27"
  odd.rate=960
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM1"
  odd.rate=320
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM26"
  odd.rate=320
  odds.push(odd) 

  
  var odd = {}
  odd.name = "SUM2"
  odd.rate=160
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM25"
  odd.rate=160
  odds.push(odd) 

  
  var odd = {}
  odd.name = "SUM3"
  odd.rate=96
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM24"
  odd.rate=96
  odds.push(odd) 


  var odd = {}
  odd.name = "SUM4"
  odd.rate=63.3
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM23"
  odd.rate=63.3
  odds.push(odd) 
 


  var odd = {}
  odd.name = "SUM5"
  odd.rate=46
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM22"
  odd.rate=46
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM6"
  odd.rate=34.5
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM21"
  odd.rate=34.5
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM7"
  odd.rate=26.9
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM20"
  odd.rate=26.9
  odds.push(odd)

  var odd = {}
  odd.name = "SUM8"
  odd.rate=21.1
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM19"
  odd.rate=21.1
  odds.push(odd)

  var odd = {}
  odd.name = "SUM9"
  odd.rate=17.2
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM18"
  odd.rate=17.2
  odds.push(odd)


  var odd = {}
  odd.name = "SUM10"
  odd.rate=15.3
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM17"
  odd.rate=15.3
  odds.push(odd)

  var odd = {}
  odd.name = "SUM11"
  odd.rate=14.4
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM16"
  odd.rate=14.4
  odds.push(odd)  

  var odd = {}
  odd.name = "SUM12"
  odd.rate=13.4
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM15"
  odd.rate=13.4
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM13"
  odd.rate=12.5
  odds.push(odd) 

  var odd = {}
  odd.name = "SUM14"
  odd.rate=12.5
  odds.push(odd)    







  odd.rate=15.3
  odds.push(odd) 
  var odd = {}
  odd.h = 11
  odd.rate=14.4
  odds.push(odd)
  var odd = {}
  odd.h = 16
  odd.rate=14.4
  odds.push(odd) 

  var odd = {}
  odd.h = 12
  odd.rate=13.4
  odds.push(odd)
  var odd = {}
  odd.h = 15
  odd.rate=13.4
  odds.push(odd) 

  var odd = {}
  odd.h = 13
  odd.rate=12.5
  odds.push(odd)

  var odd = {}
  odd.h = 14
  odd.rate=12.5
  odds.push(odd) 
*/
  var odd = {}
  odd.name = "SB"
  odd.rate=1.98
  odds.push(odd) 

  var odd = {}
  odd.name = "SS"
  odd.rate=1.98
  odds.push(odd) 
  obj.odds= odds

  var odd = {}
  odd.name = "SO"
  odd.rate=1.98
  odds.push(odd) 
  obj.odds= odds  

  var odd = {}
  odd.name = "SD"
  odd.rate=1.98
  odds.push(odd) 
  obj.odds= odds 

  var odd = {}
  odd.name = "SM"
  odd.rate=2.22
  odds.push(odd) 
  obj.odds= odds  

  var odd = {}
  odd.name = "SC"
  odd.rate=1.75
  odds.push(odd) 
  obj.odds= odds 


  return obj;

}

module.exports = new Ssc()



//function GetDataFromTwoWeb(callback){

  /*

function GetFromBet365(url,callback){

  superagent.get(url, function(err, res){ 
    var str = res.text;
    str=str.replace(/\'/g,"");//替换半角单引号为全角单引号
    str=str.replace(/\(/g,"");//替换半角单引号为全角单引号
    str=str.replace(/parent.Result/g,"");//替换半角单引号为全角单引号

      ////console.log(str); 
      var detail= new Array(); 
      var infos = new Array(); 
      
      detail=str.split("new Array")
      ////console.log("detail:",detail[1])
        for (i=0;i<detail.length;i++){
        var info = new Array();
        info = detail[i].split(",") 
        info[2] = parseUnixTime(info[1])
        var s = String(info[22]); 
        s = s.substring(0,2)
        info[22] =s
        infos.push(info)
      }
    callback(null,infos)
  });
  

  ////console.log("detail:",detail[1])  
}

function GetDataFromAgent(targetURL){
  var url = targetURL;

  superagent.get(url, function(err, res){
    if (err) throw err;
    ////console.log(res.text);
    var str = res.text
    switch(targetURL){

      case SPFUrl    : ParseSPF(str);
              break;
      case BiFenUrl  : ParseBiFen(str);
              break;
      case JinQiuUrl : ParseJinQiu(str);
              break;
      case BanQuanUrl: ParseBanQuan(str);
              break;
      case AiCaiUrl  : ParseAiCaiUrl(str);
              break;
      case CqSscUrl  : ParseCqSsc(str,"cq");
              break;
      case Kl8Url  : ParseKl8(str);
              break;
      case Kl8Url365  : ParseKl8365(str);
              break;
      case JxSScUrl  : ParseCqSsc(str,"jx");
              break;


    } 

  });
}




function ParseKl8365(str){
str=str.replace(/\'/g,"");//替换半角单引号为全角单引号
str=str.replace(/\(/g,"");//替换半角单引号为全角单引号
str=str.replace(/parent.Result/g,"");//替换半角单引号为全角单引号

  //console.log(str); 
  var detail= new Array(); 
  var infos = new Array(); 
  
  detail=str.split("new Array")
  //console.log("detail:",detail[1])
    for (i=0;i<detail.length;i++){
    var info = new Array();
    info = detail[i].split(",") 
    info[2] = parseUnixTime(info[1])
    var s = String(info[22]); 
    s = s.substring(0,2)
    info[22] =s
    infos.push(info)
  }

////console.log("infos:",infos) 
  

 return infos;
  
}


function GetFrom163(url,callback){

  superagent.get(url, function(err, res){ 
    var str = res.text;
    var $ = cheerio.load(str);
    ////console.log(str); 
    var jinqui=[];
    $("a").each(function(i, e) {
      ////console.log($(this))
      if ($(this).attr('matchball')){     

        ////console.log('data-period:',$(this).text()); 
        ////console.log('data-win-number:',$(this).attr('matchball'));

        var json={};

        json.symbol= "kl8"
        json.sn = $(this).text()
        json.win_number= $(this).attr('matchball')
        json.time= $(this).attr('time')
        json.timestamp =parseUnixTime(json.time);
        ////console.log("json:",json)
        callback(null,json)
        //SendDataTo(json,"ssc")        
        
      };
  
    
    
    });

    //callback(null,infos)
  });
  

  ////console.log("detail:",detail[1])  
}

Ssc.prototype.getDataFromTwoWeb= function (callback) {
  GetFromBet365(Kl8Url365,function(err,dataOne){
    if (dataOne) {//console.log("365 online")}
    ////console.log(dataOne)
    var detail = [];
    for (i=0;i<dataOne.length;i++){
      var obj ={}
      //obj.win_number =dataOne[i][3]+dataOne[i][4]+dataOne[i][5]
      obj.timestamp =dataOne[i][2]
      //obj.timestamp =dataOne[i][1]
      obj.sn=dataOne[i][0]
      verify =String(dataOne[i][3]+dataOne[i][4]+dataOne[i][5]+dataOne[i][6]+dataOne[i][7]+dataOne[i][8]+
              dataOne[i][9]+dataOne[i][10]+dataOne[i][11]+dataOne[i][12]+dataOne[i][13]+dataOne[i][14]+
              dataOne[i][15]+dataOne[i][16]+dataOne[i][17]+dataOne[i][18]+dataOne[i][19]+dataOne[i][20]+
              dataOne[i][21]+dataOne[i][22])
      verify = verify.replace(/0/g,"");   

      obj.verify=verify;      
      detail.push(obj)
    //  obj.
    }
    ////console.log(detail[0])
    
    GetFrom163(Kl8Url,function(err,dataTwo){
      //if (dataTwo) {//console.log("163 online")}
      dataTwo.verify ="";
      verify = String(dataTwo.win_number)
      verify = verify.replace(/0/g,"");
      var data = verify.split(" ")
      for (i=0;i<data.length;i++){
        dataTwo.verify = dataTwo.verify+data[i]
      }
      ////console.log(dataTwo)
      for (i=0;i<detail.length;i++){
        if ((detail[i].sn==dataTwo.sn)&&
          (detail[i].timestamp==dataTwo.timestamp)&&
          (detail[i].verify==dataTwo.verify)
          ) {
          ////console.log(dataTwo.verify)
          ////console.log(detail[i].verify)
          dataTwo = calcSscResultNumber(dataTwo)
          callback(null,dataTwo)
          //SendDataTo(dataTwo,"ssc") 
          //break;
        }
      }
      
    })


  })

}
//function loop(){

*/
