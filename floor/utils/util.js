var formatNumber = function(n) {
  n = n.toString();
  return n[1] ? n : '0' + n;
}

var formatTime = function(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  var dateParts = [year, month, day];
  var timeParts = [hour, minute, second];
  var dateStr = dateParts.map(formatNumber).join('/');
  var timeStr = timeParts.map(formatNumber).join(':');

  return dateStr + ' ' + timeStr;
}

module.exports = {
  formatTime: formatTime
}
