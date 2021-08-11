// pages/news/news.js
const app = getApp()
const util = require('../../utils/util.js')
const API = require("../../promise/wxAPI.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    news: [],
    provinces:[],
    myProvince:'',
    myCity:'',
    
  },

  /**
   * 生命周期函数--监听页面加载
   */

   bindPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value,
    })
    this.onLoad()
  },

  getData:function(pro='江苏省'/*,ci='扬州市'*/){
    wx.request({
      url: 'https://njtech.bamlubi.cn/get_news_data',
      data:{
        page:1,
        num:10,
        province:pro,
        //city:ci
      },
      success:res=>{
        console.log(res.data)
        this.setData({
          news:res.data
        })
      }
    })
   },

  onLoad: function (options) {
    //获取各个省
    wx.request({
      url: 'https://njtech.bamlubi.cn/get_provinceName',
      data:{},
      success:res=>{
        console.log(res.data)
        this.setData({
          provinces:res.data
        })
      }
    })

    //获取该省新闻
    this.getData(this.data.provinces[this.data.index]);
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
    wx.showNavigationBarLoading() //在标题栏中显示加载
      //模拟加载
      setTimeout(function(){
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
      },1500);
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
