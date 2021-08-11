// pages/news/news.js
const app = getApp()
const util = require('../../utils/util.js')
const API = require("../../promise/wxAPI.js")
const NewsDB = require("../../db/news_db.js")
import {
  province
} from "../../utils/province.js"
Page({
  /**
   * 页面的初始数据
   */
  data: {
    news: [],
    provinces: province,
    select: 0,
    hasMoreNews: true,
    isLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    // 获取新闻
    this.getNewsList()
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
    this.setData({
      news: []
    })
    // 获取新闻
    this.getNewsList().then(res => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 如果无数据了就不要再发请求了
    if (!this.data.hasMoreNews) return;
    // 节流
    if (!this.data.isLoading) {
      this.getNewsList()
    }
  },

  getNewsList: function () {
    let that = this
    let num = 12
    //获取该省新闻
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      isLoading: true
    })
    return NewsDB.getNewsList(this.data.news.length, num, this.data.provinces[this.data.select].postName).then(res => {
      // 更新视图
      that.setData({
        news: that.data.news.concat(res)
      })
      if (res.length < num) {
        that.setData({
          hasMoreNews: false
        })
      }
      that.setData({
        isLoading: false
      })
      wx.hideLoading()
    }).catch(err => {
      wx.hideLoading()
      API.ShowToast('网络请求失败', 'error')
      console.log(err)
    })
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
  },

  bindPickerChange: function (e) {
    this.setData({
      select: e.detail.value,
      news: [],
      hasMoreNews: true
    })
    // 获取新闻
    this.getNewsList()
  },
})