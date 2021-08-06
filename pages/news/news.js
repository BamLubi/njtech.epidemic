// pages/news/news.js
const app = getApp()
const Util = require('../../utils/util.js')
const API = require("../../promise/wxAPI.js")
const NewsDB = require("../../db/news_db.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    swiperList: ["https://mmbiz.qpic.cn/mmbiz_jpg/fPSa4zeEwhAYSFRn22tqNPaOHeeXejDIp60EVwZalZMoyuctJHQLLdx1KsbZvhkhoibd6IgjRqvped3fywG0Hww/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1", "http://www.njcdc.cn/Uploads/Images/20210709/210709062456620147.jpg", "http://www.njcdc.cn/Uploads/Images/20210625/210625041223057216.jpg"],
    news: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // 获取新闻信息
    let url = "https://lab.isaaclin.cn/nCoV/api/news";
    let data = {
      page: 1,
      num: 10
    }
    NewsDB.getNewsList(0, 10).then(res => {
      that.setData({
        news: res
      })
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
    // 跳转页面
    let url = "/pages/news_detail/news_detail?" + "data=" + JSON.stringify(data);
    wx.navigateTo({
      url: url
    })
  }
})