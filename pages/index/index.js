// pages/index/index.js
const app = getApp()
const util = require('../../utils/util.js')
const API = require("../../promise/wxAPI.js")
const NewsDB = require("../../db/news_db.js")
const OverallDB = require("../../db/overall_db.js")
import {province} from "../../utils/province.js"
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
      func: () => {
        wx.navigateToMiniProgram({
          appId: 'wx8f446acf8c4a85f5',
          envVersion: 'release',
        })
      }
    }],
    // 江苏省的确诊病例情况
    cases: [],
    // cases数据的更新时间
    casesUpdateTime: null,
    // 当前选择的省份
    select: 0,
    selectid: "江苏省",
    province: province,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // 获取五条最新的新闻信息
    NewsDB.getNewsList(this.data.news.length, 3).then(res => {
      that.setData({
        news: res
      })
    }).catch(err => {
      API.ShowToast('网络请求失败', 'error')
      console.log(err);
    })
    // 获取江苏省疫情数据
    this.getOverall()
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
  },

  /**
   * 获取省份的确诊情况和各市的确诊情况
   */
  getOverall: function () {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    // 获取江苏省的确诊情况
    OverallDB.getProvinceOverall(that.data.selectid)
      .then(res => {
        that.setData({
          cases: res,
          casesUpdateTime: res.updateTime
        })
        wx.hideLoading()
        // 获取省内各城市数据
        return OverallDB.getCityOverall(that.data.selectid)
      }).then(res => {
        that.setData({
          citycases: res
        })
      }).catch(err => {
        wx.hideLoading()
        API.ShowToast('网络请求失败', 'error')
      })
  },

  /**
   * 切换省份
   * @param {*} e 
   */
  getSelect: function (e) {
    if (e.currentTarget.dataset.index == this.data.select){
      return
    }
    this.setData({
      select: e.currentTarget.dataset.index,
      selectid: e.currentTarget.dataset.pn
    })
    // 获取疫情数据
    this.getOverall()
  }
})