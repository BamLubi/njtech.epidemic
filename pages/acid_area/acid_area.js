// pages/acid_area/acid_area.js
const app = getApp()
const util = require('../../utils/util.js')
const API = require("../../promise/wxAPI.js")
const AcidareaDB = require("../../db/acidarea_db.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    markers: [],
    hasMarkers: false,
    view_text: "",
    address: "",
    distance: "",
    title: "",
    la: "",
    ln: "",
    notShowLabel: true,
    distance_list: [],
    scale: 12,
    tele: "",
    viewShowed: false, //显示结果view的状态
    inputVal: "", // 搜索框值
    serachList: [], //搜索渲染推荐数据
    // 地区选择器
    region: ['江苏省', '南京市', '全部'],
    customItem: '全部'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // 显示loading框
    wx.showLoading({
      title: '加载中',
    })
    // 获取地图标记点数据
    AcidareaDB.getAcidareaList("江苏省", "南京市").then(res => {
      that.setData({
        markers: res,
        hasMarkers: true
      })
      wx.hideLoading()
      // 定位用户当前位置
      that.locate()
    }).catch(err => {
      // 隐藏加载框
      wx.hideLoading()
      API.ShowToast('加载失败', 'error')
      console.error(err);
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 选择想要查看的地区
   * 并对数据进行筛选
   */
  bindRegionChange: function (e) {
    let that = this;
    // 判断用户是否选择了全部省份或全部城市
    let region = e.detail.value
    console.log(region);
    if (region[0] == '全部' || region[1] == '全部') {
      API.ShowModal('', '请至少选择到指定市哦！', false)
      region = ['江苏省', '南京市', '全部']
      this.setData({
        region: region
      })
      return
    }
    // 显示loading框
    wx.showLoading({
      title: '加载中',
    })
    // 获取核酸地区列表
    AcidareaDB.getAcidareaList(...region).then(res => {
      // 如果没数据则展示
      if (res.length == 0) {
        API.ShowToast('暂时没有数据', 'none');
        region = ['江苏省', '南京市', '全部']
        return
      }
      // 判断mapXtx是否存在_important
      if (that.mapCtx == null || that.mapCtx == undefined) {
        that.mapCtx = wx.createMapContext('myMap')
      }
      // 地图中心转移
      that.mapCtx.moveToLocation({
        latitude: parseFloat(res[0].latitude),
        longitude: parseFloat(res[0].longitude),
      })
      that.setData({
        markers: res,
        hasMarkers: true,
        scale: 12
      })
    }).then(res => {
      // 隐藏loading框
      wx.hideLoading()
      // 同步视图
      this.setData({
        region: region
      })
    }).catch(err => {
      // 隐藏loading框
      wx.hideLoading()
      // 显示查询失败
      API.ShowToast('查询失败', 'error')
      console.error(err);
    })
  },

  /**
   *点击定位按钮，移动视图到现在所在位置
   */
  locate: function () {
    let that = this
    wx.showLoading({
      title: '定位中',
    })
    // 获取用户最新位置
    wx.getLocation({
      type: 'wgs84'
    }).then(res => {
      console.log(res);
      // 不需要实时渲染的数据，尽量不使用this.setData
      that.data.la = res.latitude
      that.data.ln = res.longitude
      // 判断mapXtx是否存在_important
      if (that.mapCtx == null || that.mapCtx == undefined) {
        that.mapCtx = wx.createMapContext('myMap')
      }
      // 移动位置
      return that.mapCtx.moveToLocation({
        latitude: parseFloat(res.latitude),
        longitude: parseFloat(res.longitude),
      })
    }).then(res => {
      wx.hideLoading()
      that.setData({
        notShowLabel: true,
        scale: 12
      })
    }).catch(err => {
      wx.hideLoading()
      API.ShowModal('定位失败', "请确认已打开定位功能!", false)
    })
  },

  /**
   * 点击marker
   * @param {*} e 
   */
  markertap(e) {
    // 注意markerId并不等于序号
    let marker = this.data.markers.filter(function (x) {
      return x.id == e.detail.markerId;
    })[0];
    console.log(marker);
    // 判断mapXtx是否存在_important
    if (this.mapCtx == null || this.mapCtx == undefined) {
      this.mapCtx = wx.createMapContext('myMap')
    }
    // 移动视图中心
    this.mapCtx.moveToLocation({
      latitude: parseFloat(marker.latitude),
      longitude: parseFloat(marker.longitude),
    });
    // 设置显示信息
    this.setData({
      address: marker.address,
      title: marker.title,
      distance: util.getDistance(parseFloat(this.data.la), parseFloat(this.data.ln), parseFloat(marker.latitude), parseFloat(marker.longitude)),
      notShowLabel: false,
      tele: marker.tel,
      scale: 15
    })
  },

  /**
   * 弹窗
   * 进行距离计算排序
   */
  popup() {
    let marker = this.data.markers
    var list_temp = []
    // 获取每个点到当前位置的距离
    for (var i = 0; i < marker.length; i++) {
      let dis_obj = new Object()
      dis_obj.index = i
      dis_obj.address = marker[i].title
      dis_obj.distance = parseFloat(util.getDistance(parseFloat(this.data.la), parseFloat(this.data.ln), parseFloat(marker[i].latitude), parseFloat(marker[i].longitude)))
      dis_obj.markerId = marker[i].id
      list_temp.push(dis_obj)
    }
    this.setData({
      distance_list: list_temp
    })
    // 排序
    var arr = this.data.distance_list;
    this.setData({
      distance_list: arr.sort(this.compare("distance", true))
    })
    // 显示列表
    this.selectComponent('#bottomFrame').showFrame();
  },
  compare: function (property, bol) {
    return function (a, b) {
      var value1 = a[property];
      var value2 = b[property];
      if (bol) {
        return value1 - value2;
      } else {
        return value2 - value1;
      }
    }
  },

  /**
   * 离我最近列表中点击text，地图中心移动到该点
   * @param {*} e 
   */
  toMarker: function (e) {
    let markerId = e.currentTarget.dataset.marker_id
    // 隐藏离我最近列表
    this.selectComponent('#bottomFrame').hideFrame()
    // 主动触发marker点击事件
    this.markertap({
      detail: {
        markerId: markerId
      }
    })
  },

  /**
   * 搜索框
   * 进行模糊搜索,点击跳转到对应点
   */
  hideInput: function () {
    this.setData({
      inputVal: "",
      viewShowed: false,
    });
  },

  /**
   * 输入框，键盘抬起事件
   * @param {*} e 
   */
  inputTyping: function (e) {
    // console.log("input-----",e)
    var value = e.detail.value
    var that = this;
    var markers = that.data.markers
    if (value == '') {
      that.setData({
        viewShowed: false,
      });
    } else {
      //“这里需要特别注意，不然在选中下拉框值的时候，下拉框又出现”
      if (e.detail.cursor) { //e.detail.cursor表示input值当前焦点所在的位置
        var arr = [];
        for (var i = 0; i < markers.length; i++) {
          if (markers[i].title.indexOf(value) >= 0) {
            let marker_obj = new Object()
            marker_obj.marker_index = i; //对应markers数组下标
            marker_obj.addr = markers[i].title
            arr.push(marker_obj);
          }
        }
        // console.log(arr)
        that.setData({
          viewShowed: true,
          serachList: arr
        });
      }
    }
  },

  // 点击搜索列表中的结果
  name: function (res) {
    // console.log(res.currentTarget.dataset.index);
    var index = res.currentTarget.dataset.index;
    let marker = that.data.markers[index];
    this.setData({
      inputVal: marker.title,
      viewShowed: false,
      scale: 15,
      address: marker.address,
      title: marker.title,
      distance: util.getDistance(parseFloat(this.data.la), parseFloat(this.data.ln), parseFloat(marker.latitude), parseFloat(marker.longitude)),
      notShowLabel: false,
      tele: marker.tel
    })
    // 判断mapXtx是否存在_important
    if (this.mapCtx == null || this.mapCtx == undefined) {
      this.mapCtx = wx.createMapContext('myMap')
    }
    //移动试图到搜索到的点
    this.mapCtx.moveToLocation({
      latitude: parseFloat(marker.latitude),
      longitude: parseFloat(marker.longitude),
    });
  },

  // 隐藏信息框
  hideLabel: function () {
    this.setData({
      inputVal: "",
      notShowLabel: true
    })
  }
})