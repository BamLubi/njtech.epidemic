// pages/patient_trajectory/patient_trajectory.js
const app = getApp()
const API = require("../../promise/wxAPI.js")
const Util = require("../../utils/util.js")
const TrajectoryDB = require("../../db/patienttrajectory_db.js")
import {
  province
} from "../../utils/province.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activeNames: [0, 1],
    group: [],
    markers: [],
    polyline: [],
    scale: 10,
    region: ['江苏省', '南京市', '全部'],
    customItem: '全部',
    isSettingLocation: false,
    //最新确诊时间
    confirmedDate: 0,
    isLoading: false,
    hasMorePatient: true,
    show: false
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
    let that = this;

    // 1. 获取用户所在地信息
    let province = "江苏省"
    let city = "南京市"
    // 显示弹框获取用户所在地，并且随后存入全局
    if (!app.globalData.hasUserInfo && !app.globalData.hasAskedUser) {
      app.globalData.hasAskedUser = true
      return API.ShowModal('获取所在地', '点击确定以获取您所在地!', false).then(() => {
        // 判断使用新接口还是旧接口
        // IOS使用getUserProfile报错，必须要用户点
        if (wx.getUserProfile) {
          return API.GetUserProfile()
        } else {
          return API.GetUserInfo()
        }
      }).then(res => {
        // 判断是否为空
        if (res.province == '' || res.province == null || res.city == '' || res.city == null) {
          throw new Error("获取的用户地区不完整")
        }
        // 确定真是的省份名称和城市名称
        res.province = that.whichProvince(res.province)
        res.city = res.city + '市'
        app.globalData.userInfo = res
        app.globalData.hasUserInfo = true
        // 设置用户所在地
        province = res.province
        city = res.city
        console.log("获得用户所在地", province, city);
        // 存入本地缓存
        wx.setStorage({
          key: "userInfo",
          data: res
        })
        // 重新调用onLoad
        that.onLoad()
      }).catch(err => {
        API.ShowToast('获取所在地失败', 'error')
        console.log('获取所在地失败', err)
        // 失败后也要加载地图，再次执行onLoad
        that.onLoad()
      })

    } else if (app.globalData.hasUserInfo) {
      province = app.globalData.userInfo.province
      city = app.globalData.userInfo.city
    }
    this.setData({
      region: [province, city, '全部']
    })
    // 2. 获取病例轨迹
    that.getTrajectoryList([province, city, '全部'], 0);
  },
  /**
   * 选择想要查看的地区
   * 并对数据进行筛选
   */
  bindRegionChange: function (e) {
    let that = this;
    // 判断是否获得用户权限
    if (!that.data.isSettingLocation) {
      return API.ShowModal('未获得定位权限', '请点击右上角设置-位置消息，赋予本小程序定位权限！', false)
    }
    // 判断用户是否选择了全部省份或全部城市
    let region = e.detail.value
    console.log(region);
    if (region[0] == '全部' || region[1] == '全部' || region[2] != '全部') {
      API.ShowModal('', '当前仅支持以市为单位搜索！', false)
      that.setData({
        region: that.data.region
      })
      return
    }
    //type=1 换地区查询模式，需要先清空group
    let type = 1;
    that.getTrajectoryList(region, type)
  },
  /**
   * 获取病例轨迹列表
   */
  getTrajectoryList: function (region, type) {
    let that = this;
    let num = 10;
    // 显示loading框
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      isLoading: true
    })
    // 获取病例轨迹列表
    let length = 0;
    if (type == 0) {
      length = this.data.group.length
    }
    return TrajectoryDB.getTrajectoryList(length, num, region[0], region[1]).then(res => {
      // 如果没数据则展示
      if (res.length == 0) {
        // loading和toast不能同时出现
        wx.hideLoading().then(() => {
          API.ShowToast('暂时没有数据', 'none')
        })
        that.setData({
          hasMorePatient: false
        })
        return
      } else {
        // 隐藏loading框
        wx.hideLoading()
        if (type == 1) {
          that.setData({
            hasMorePatient: true,
            group: [],
            activeNames:[0,1]
          })
        }
        //当打开界面第一次获取数据，或者是切换地区
        if (this.data.group == "") {
          that.setData({
            //获取最近确诊时间并赋值
            confirmedDate: res[0][0].date,
          })
        }
        that.setData({
          group: that.data.group.concat(res),
          region: region,
          isLoading: false
        })
        //没有更多数据
        if (res.length < num) {
          that.setData({
            hasMorePatient: false
          })
        }
      }
    }).catch(err => {
      // 隐藏loading框
      wx.hideLoading().then(() => {
        // 显示查询失败
        API.ShowToast('加载失败', 'error')
      })
      console.error(err);
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 如果无数据了就不要再发请求了
    if (!this.data.hasMorePatient) return;
    // 节流
    if (!this.data.isLoading) {
      this.getTrajectoryList(this.data.region, 0);
    }
  },
  /**
   * 展示地图模态框
   */
  showMap(e) {
    let trajectory = e.currentTarget.dataset.trajectory;
    let _markers = [];
    let _polyline = [];
    for (let item of trajectory) {
      if (!this.isLegalCoor(item["lat"], item["lng"])) continue;
      // 构造marker数据
      var point = new Util.createPoit(item["flag"], item["lat"], item["lng"], item["ch_name"], 2);
      _markers.push(point);
      _polyline.push(point);
    }

    // 移动视图
    this.mapCtx = wx.createMapContext('myMap')
    this.mapCtx.moveToLocation({
      latitude: parseFloat(_markers[0].latitude),
      longitude: parseFloat(_markers[0].longitude),
    })

    this.setData({
      markers: _markers,
      show: true
    })
    //如果只有一个有效点，则不画轨迹
    if (_polyline.length != 1) {
      this.setData({
        polyline: [{
          points: _polyline,
          color: "#282c34",
          width: 5,
          arrowLine: true,
          borderWidth: 2
        }]
      })
    }
  },
  /**
   * 关闭地图模态框
   */
  hideMap(e) {
    this.setData({
      show: false
    })
  },
  /**
   * 判断省份、直辖市、自治区的具体名称
   * @param {*} target 
   */
  whichProvince: function (target) {
    // 需要查看到底是哪个省、直辖市、自治区
    for (let index in province) {
      if (province[index].name.indexOf(target) != -1) {
        return province[index].name
      }
    }
  },
  /**
   * 判断是否是合法的坐标
   * @param {string | number} lat 纬度
   * @param {string | number} lng 经度
   */
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
    let that = this
    // 判断是否获得定位权限
    wx.getSetting().then(res => {
      // 判断是否有这个设置，没有的话要调用一个wx.getLocation
      if (res.authSetting["scope.userLocation"] == undefined || res.authSetting["scope.userLocation"] == null) {
        // scope.userLocation不存在，需要调用一次getLocation
        console.log("scope.userLocation不存在");
      } else if (!res.authSetting["scope.userLocation"]) {
        // 有这个设置时，判断是否开启授权
        throw new Error("未获得定位权限")
      } else {
        console.log("已获得定位权限");
        that.data.isSettingLocation = true
        // 定位到用户所在地
      }
    }).catch(err => {
      wx.hideLoading()
      console.log("未获得定位权限", err);
      return API.ShowModal('未获得定位权限', '请点击右上角设置-位置消息，赋予本小程序定位权限！', false)
    })
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
})