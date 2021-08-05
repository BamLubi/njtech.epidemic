const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 地图marker的对象构造器
function createPoit(id, latitude, longitude, title, type) {
  this.id = parseInt(id);
  this.latitude = latitude;
  this.longitude = longitude;
  this.title = title;
  if (type == 0) { //高风险
    this.iconPath = '/images/定位.png'
    this.width = "30"
    this.height = "30"
  } else if (type == 1) { //中风险
    this.iconPath = '/images/location.png'
    this.width = "30"
    this.height = "30"
  } else {
    this.iconPath = '/images/足迹.png'
    this.width = "20"
    this.height = "20"
    // this.alpha=0.5
  }
  // this.customCallout = {
  //   display: "BYCLICK", //显示方式，可选值BYCLICK
  //   anchorX: 0, //横向偏移
  //   anchorY: 0,
  // }
  this.callout = {
    content: title,
    borderRadius: 10,
    padding: 10,
    display: "BYCLICK"
  }
}

function Rad(d) { //根据经纬度判断距离
  return d * Math.PI / 180.0;
}

function getDistance(lat1, lng1, lat2, lng2) {
  var radLat1 = Rad(lat1);
  var radLat2 = Rad(lat2);
  var a = radLat1 - radLat2;
  var b = Rad(lng1) - Rad(lng2);
  var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * 6378.137;
  s = Math.round(s * 10000) / 10000;
  s = s.toFixed(2) + '公里' //保留两位小数
  // console.log('经纬度计算的距离:' + s)
  return s
}

module.exports = {
  formatTime,
  createPoit,
  getDistance
}