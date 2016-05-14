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
  //console.log(stringTime + "的时间戳为：" + timestamp2);
  return timestamp2
}

module.exports = {
  parseUnixTime:parseUnixTime,
  parseTimestamp:parseTimestamp,


}