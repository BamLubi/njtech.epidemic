// pages/patient_trajectory/patient_trajectory.js
const API = require("../../promise/wxAPI.js")
const Util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeNames: [0, 1],
    group: [],
    markers: [],
    polyline:[],
    scale: 10
  },
  onChange(event) {
    this.setData({
      activeNames: event.detail,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    API.Request('https://njtech.bamlubi.cn/get_track_data', {
      city: "南京市"
    }, 'GET', '获取病例轨迹').then(res => {
      let group_all = [];
      let temp_group = [];
      let temp_udid = 0;
      for (let item of res) {
        if (item["ud_id"] != temp_udid) {
          temp_udid = item["ud_id"];
          if (temp_group != "") {
            group_all.push(temp_group);
            temp_group = [];
          }
        }
        let str = item["pass_date"].slice(4, 6) + "-" + item["pass_date"].slice(6);
        item["pass_date"] = str;
        temp_group.push(item);
      }
      let l = group_all.length;
      // console.log(group_all)
      // console.log(id_group)
      this.setData({
        group: group_all,
        activeNames: [l - 1]
      })
    })
  },
  showMap(e) {
    let trajectory = e.currentTarget.dataset.trajectory;
    let _markers = [];
    for (let item of trajectory) {
      if (!this.isLegalCoor(item["lat"], item["lng"])) continue;
      // 构造marker数据
      var point = new Util.createPoit(item["flag"], item["lat"], item["lng"], item["ch_name"], 2);
      _markers.push(point);
    }
    console.log(_markers)
    this.mapCtx = wx.createMapContext('myMap')
    this.mapCtx.moveToLocation({
      latitude: parseFloat(_markers[0].latitude),
      longitude: parseFloat(_markers[0].longitude),
    })
    console.log(_markers[0].latitude)
    console.log(_markers[0].longitude)
    this.setData({
      modalName: "Modal",
      markers: _markers,
      polyline:[{
        points:_markers,
        color:"#282c34",
        width:5,
        arrowLine:true,
        borderWidth:2
      }]
    })
  },
  hideMap(e) {
    this.setData({
      modalName: null
    })
  },
  isLegalCoor(lat, lng) {
    // 判断为空
    if (lat == null || lng == null || lat == '' || lng == '') return false;
    // 先格式化为浮点型
    lat = typeof (lat) == 'string' ? parseFloat(lat) : lat;
    lng = typeof (lng) == 'string' ? parseFloat(lng) : lat;
    // 判断是否合法
    if (lat < -90 || lat > 90) return false;
    if (lng < -180 || lng > 180) return false;
    return true;
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})