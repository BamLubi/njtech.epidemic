// pages/index/index.js
const app = getApp()
const util = require('../../utils/util.js')
const API = require("../../promise/wxAPI.js")
const NewsDB = require("../../db/news_db.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 五条最新的新闻用于展示
    news: [],
    // 工具栏列表
    toolsList: [{
      id: 0,
      name: '核酸检测地点',
      src: '/images/index/acidtest.png',
      path: '/pages/acid_area/acid_area',
      type: 'page'
    }, {
      id: 1,
      name: '核酸检测结果',
      src: '/images/index/hesuan.png',
      path: '/',
      type: 'button',
      func: () => {
        wx.navigateToMiniProgram({
          appId: 'wx2eec5fb00157a603',
          envVersion: 'release',
          shortLink: "#小程序://国家政务服务平台/核酸和抗体检测结果查询/UKhozm70xQjKBRa"
        })
      }
    }, {
      id: 2,
      name: '风险地区',
      src: '/images/index/riskarea.png',
      path: '/pages/risk_area/risk_area',
      type: 'page'
    }, {
      id: 3,
      name: '通信行程卡',
      src: '/images/index/xingcheng.png',
      path: '/',
      type: 'button',
      func: () =>{
        wx.navigateToMiniProgram({
          appId: 'wx8f446acf8c4a85f5',
          envVersion: 'release',
        })
      }
    }],
    // 江苏省的确诊病例情况
    cases: [],
    // cases数据的更新时间
    casesUpdateTime: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    // 获取五条最新的新闻信息
    NewsDB.getNewsList(0,3).then(res => {
      that.setData({
        news: res
      })
      // 获取江苏省的确诊情况
      return API.Request("https://njtech.bamlubi.cn/get_overall_data", {}, 'GET', '获取江苏省的确诊情况')
    }).then(res => {
      throw new Error()
      // that.setData({
      //   cases: res.results[0],
      //   casesUpdateTime: util.formatTime(new Date(res.results[0].updateTime))
      // })
      wx.hideLoading()
    }).catch(err=>{
      console.log("网络请求失败");
      let res = {"results":[{"locationId":320000,"continentName":"亚洲","continentEnglishName":"Asia","countryName":"中国","countryEnglishName":"China","countryFullName":null,"provinceName":"江苏省","provinceEnglishName":"Jiangsu","provinceShortName":"江苏","currentConfirmedCount":468,"confirmedCount":1227,"suspectedCount":3,"curedCount":759,"deadCount":0,"comment":"","cities":[{"cityName":"南京","currentConfirmedCount":222,"confirmedCount":322,"suspectedCount":0,"curedCount":100,"deadCount":0,"highDangerCount":1,"midDangerCount":28,"locationId":320100,"currentConfirmedCountStr":"222","cityEnglishName":"Nanjing"},{"cityName":"扬州","currentConfirmedCount":220,"confirmedCount":243,"suspectedCount":0,"curedCount":23,"deadCount":0,"highDangerCount":1,"midDangerCount":66,"locationId":321000,"currentConfirmedCountStr":"220","cityEnglishName":"Yangzhou"},{"cityName":"境外输入","currentConfirmedCount":18,"confirmedCount":132,"suspectedCount":1,"curedCount":114,"deadCount":0,"highDangerCount":0,"midDangerCount":0,"locationId":0,"currentConfirmedCountStr":"18"},{"cityName":"淮安","currentConfirmedCount":12,"confirmedCount":78,"suspectedCount":0,"curedCount":66,"deadCount":0,"highDangerCount":0,"midDangerCount":10,"locationId":320800,"currentConfirmedCountStr":"12","cityEnglishName":"Huainan"},{"cityName":"宿迁","currentConfirmedCount":3,"confirmedCount":16,"suspectedCount":0,"curedCount":13,"deadCount":0,"highDangerCount":0,"midDangerCount":2,"locationId":321300,"currentConfirmedCountStr":"3","cityEnglishName":"Suqian"},{"cityName":"苏州","currentConfirmedCount":0,"confirmedCount":87,"suspectedCount":0,"curedCount":87,"deadCount":0,"highDangerCount":0,"midDangerCount":0,"locationId":320500,"currentConfirmedCountStr":"0","cityEnglishName":"Suzhou"},{"cityName":"徐州","currentConfirmedCount":0,"confirmedCount":79,"suspectedCount":0,"curedCount":79,"deadCount":0,"highDangerCount":0,"midDangerCount":0,"locationId":320300,"currentConfirmedCountStr":"0","cityEnglishName":"Xuzhou"},{"cityName":"无锡","currentConfirmedCount":0,"confirmedCount":55,"suspectedCount":0,"curedCount":55,"deadCount":0,"highDangerCount":0,"midDangerCount":0,"locationId":320200,"currentConfirmedCountStr":"0","cityEnglishName":"Wuxi"},{"cityName":"常州","currentConfirmedCount":0,"confirmedCount":51,"suspectedCount":0,"curedCount":51,"deadCount":0,"highDangerCount":0,"midDangerCount":0,"locationId":320400,"currentConfirmedCountStr":"0","cityEnglishName":"Changzhou"},{"cityName":"连云港","currentConfirmedCount":0,"confirmedCount":48,"suspectedCount":0,"curedCount":48,"deadCount":0,"highDangerCount":0,"midDangerCount":0,"locationId":320700,"currentConfirmedCountStr":"0","cityEnglishName":"Lianyungang"},{"cityName":"南通","currentConfirmedCount":0,"confirmedCount":40,"suspectedCount":0,"curedCount":40,"deadCount":0,"highDangerCount":0,"midDangerCount":0,"locationId":320600,"currentConfirmedCountStr":"0","cityEnglishName":"Nantong"},{"cityName":"泰州","currentConfirmedCount":0,"confirmedCount":37,"suspectedCount":0,"curedCount":37,"deadCount":0,"highDangerCount":0,"midDangerCount":0,"locationId":321200,"currentConfirmedCountStr":"0","cityEnglishName":"Taizhou"},{"cityName":"盐城","currentConfirmedCount":0,"confirmedCount":27,"suspectedCount":0,"curedCount":27,"deadCount":0,"highDangerCount":0,"midDangerCount":0,"locationId":320900,"currentConfirmedCountStr":"0","cityEnglishName":"Yancheng"},{"cityName":"镇江","currentConfirmedCount":0,"confirmedCount":12,"suspectedCount":0,"curedCount":12,"deadCount":0,"highDangerCount":0,"midDangerCount":0,"locationId":321100,"currentConfirmedCountStr":"0","cityEnglishName":"Zhenjiang"}],"updateTime":1628220675435}],"success":true};
      that.setData({
        cases: res.results[0],
        casesUpdateTime: util.formatTime(new Date(res.results[0].updateTime))
      })
      wx.hideLoading()
    })
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

  },

  /**
   * 跳转显示新闻的具体内容
   * @param {*} e 
   */
  showNews: function (e) {
    let data = e.currentTarget.dataset.data;
    data.sourceUrl = ""; // 必须置空，否则页面携参跳转时会发生截断，sourceUrl中包含？关键词
    let url = "/pages/news_detail/news_detail?" + "data=" + JSON.stringify(data);
    console.log(url);
    wx.navigateTo({
      url: url
    })
  },

  /**
   * 跳转页面
   */
  navigatePage: function (e) {
    // 判断地址是否为空
    if (e.currentTarget.dataset.path != '') {
      if (e.currentTarget.dataset.type == 'page') {
        // 跳转页面
        wx.navigateTo({
          url: e.currentTarget.dataset.path,
        })
      } else if (e.currentTarget.dataset.type == 'button') {
        // 执行对应方法
        this.data.toolsList[e.currentTarget.dataset.index].func();
      } else {
        wx.switchTab({
          url: e.currentTarget.dataset.path,
        })
      }
    } else {
      API.ShowToast('正在施工中...', 'none', 2000)
    }
  }

})