// app.js
App({
  globalData: {
    address: [],
    locate_lat: "",
    locate_log: "",
    level: [],
    userInfo: null,
    hasUserInfo: false,
    hasAskedUser: false
  },
  onLaunch: function (options) {
    let that = this
    // 从本地缓存获取userInfo
    wx.getStorage({
      key: 'userInfo'
    }).then(res => {
      if(res.data.province != '' || res.data.province != null || res.data.province != undefined){
        that.globalData.userInfo = res.data
        that.globalData.hasUserInfo = true
      }
    }).catch(err=>{
      // console.log(err);
    })
  },
  onShow: function (options) {

  },
  onHide: function () {

  },
  onError: function (msg) {

  }
});