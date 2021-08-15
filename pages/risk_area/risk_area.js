// pages/risk_area/risk_area.js
const app = getApp()
const util = require('../../utils/util.js')
const API = require("../../promise/wxAPI.js")
const RiskareaDB = require("../../db/riskarea_db.js")
import {
    province
} from "../../utils/province.js"
Page({
    /**
     * 页面的初始数据
     */
    data: {
        markers: [],
        selectMarkerId: -1,
        customCalloutMarkerIds: [],
        view_text: "",
        address: "",
        distance: "",
        title: "",
        la: 32.06071,
        ln: 118.76295,
        userLa: 32.06071,
        userLn: 118.76295,
        level: "",
        notShowLabel: true,
        distance_list: [],
        scale: 12,
        // 地区选择器
        region: ['江苏省', '南京市', '全部'],
        customItem: '全部',
        isSettingLocation: false, // 用户是否开启定位权限
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
                // 判断使用新街口还是旧接口
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

        // 2. 获取风险地区
        wx.showLoading({
            title: '加载中',
        })
        // 获取风险地区列表
        RiskareaDB.getRiskareaList(province, city).then(res => {
            that.setData({
                markers: res
            })
            // 隐藏loading框
            wx.hideLoading()
            // 回调函数，广播markers已创建
            if (that.getMarkersCallback) {
                that.getMarkersCallback();
            }
        }).catch(err => {
            // 隐藏加载框
            wx.hideLoading()
            API.ShowToast('加载失败', 'error')
        })
    },

    /**
     * 页面显示时，需获取用户位置
     */
    onShow: function () {
        let that = this
        // 判断是否获得定位权限
        wx.getSetting().then(res => {
            // 判断是否有这个设置，没有的话要调用一个wx.getLocation
            if (res.authSetting["scope.userLocation"] == undefined || res.authSetting["scope.userLocation"] == null) {
                // scope.userLocation不存在，需要调用一次getLocation
                console.log("scope.userLocation不存在");
                // 定位到用户所在地
                that.locate(0)
            } else if (!res.authSetting["scope.userLocation"]) {
                // 有这个设置时，判断是否开启授权
                throw new Error("未获得定位权限")
            } else {
                console.log("已获得定位权限");
                that.data.isSettingLocation = true
                // 定位到用户所在地
                that.locate()
            }
        }).catch(err => {
            wx.hideLoading()
            console.log("未获得定位权限", err);
            return API.ShowModal('未获得定位权限', '请点击右上角设置-位置消息，赋予本小程序定位权限！', false)
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
     * 移动到指定位置
     * @param {*} latitude 
     * @param {*} longitude 
     */
    moveToLocation: function (latitude, longitude) {
        let that = this
        console.log(`移动到`, latitude, longitude);
        // 设置视图中心
        that.setData({
            la: latitude,
            ln: longitude
        })
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
        if (region[0] == '全部' || region[1] == '全部') {
            API.ShowModal('', '请至少选择到指定市哦！', false)
            // 重置选择器选项位置
            that.setData({
                region: that.data.region
            })
            return
        }
        // 显示loading框
        wx.showLoading({
            title: '查询中',
        })
        // 获取风险地区列表
        RiskareaDB.getRiskareaList(...region).then(res => {
            // 如果没数据则展示
            if (res.length == 0) {
                // loading和toast不能同时出现
                wx.hideLoading().then(() => {
                    API.ShowToast('暂时没有数据', 'none')
                })
                // 重置选择器选项位置
                that.setData({
                    region: that.data.region
                })
                return
            } else {
                // 隐藏loading框
                wx.hideLoading()
                // 移动位置
                that.moveToLocation(res[0].latitude, res[0].longitude)
                that.setData({
                    markers: res,
                    scale: 12,
                    region: region
                })
            }
        }).catch(err => {
            // 隐藏loading框
            wx.hideLoading().then(() => {
                // 显示查询失败
                API.ShowToast('查询失败', 'error')
            })
            console.error(err);
        })
    },

    /**
     * 点击定位按钮，移动视图到现在所在位置
     * 考虑到用户会移动，因此必须再次获取用户位置
     * @param {*} type 请求类型，若为0会跳过定位权限判断
     */
    locate: function (type = 1) {
        let that = this
        // 判断是否获得用户权限
        if (!that.data.isSettingLocation && type) {
            console.log("用户未打开权限，无法定位");
            return API.ShowModal('未获得定位权限', '请点击右上角设置-位置消息，赋予本小程序定位权限！', false)
        }
        // 加载中
        wx.showLoading({
            title: '定位中',
        })
        // 获取用户最新位置
        wx.getLocation({
            type: 'wgs84'
        }).then(res => {
            // 如果顺利拿到数据，则说明用户已经授予权限。当第一次调用getLocation时，由系统弹出是否给予定位权限，此时需要置isSettingLocation为真。
            // 如果没有拿到数据，也可能是用户关闭了定位
            if (!type) {
                that.data.isSettingLocation = true
            }
            // 移动位置
            wx.hideLoading()
            // 保存用户位置
            that.data.userLa = res.latitude
            that.data.userLn = res.longitude
            // 移动位置
            that.moveToLocation(res.latitude, res.longitude)
            that.setData({
                notShowLabel: true,
                scale: 12,
            })
        }).catch(err => {
            // 在初次授权时，没拿到数据也要置isSettingLocation为真。
            if (!type && err.errCode == 2) {
                that.data.isSettingLocation = true
            }
            wx.hideLoading().then(() => {
                API.ShowModal('定位失败', "请确认已打开定位功能!", false)
            })
            console.log("定位到用户所在位置失败", err);
            // 用户既未授权定位，又未获取到markers的时候，需要判断是否可以移动
            if (that.data.markers[0] != undefined || that.data.markers[0] != null) {
                that.moveToLocation(that.data.markers[0].latitude, that.data.markers[0].longitude)
            } else {
                // 异步操作
                that.getMarkersCallback = res => {
                    that.moveToLocation(that.data.markers[0].latitude, that.data.markers[0].longitude)
                }
            }
        })
    },

    /**
     * 点击marker
     * @param {*} e 
     */
    markertap(e) {
        let that = this
        // 注意markerId并不等于序号
        let marker = this.data.markers.filter(function (x) {
            return x.id == e.detail.markerId;
        })[0];
        // 如果选中的marker与上一次一致，就不要移动视图
        if (e.detail.markerId == that.data.selectMarkerId) {
            that.setData({
                notShowLabel: false
            })
            return
        } else {
            that.data.selectMarkerId = e.detail.markerId
        }
        // 设置显示信息
        let r_level = ""
        if (marker.risk_level == "低风险") {
            r_level = "病例到访场所"
        } else {
            r_level = marker.risk_level + "地区"
        }
        // 移动位置
        that.moveToLocation(marker.latitude, marker.longitude)
        that.setData({
            address: marker.address,
            title: marker.title,
            distance: util.getDistance(parseFloat(that.data.userLa), parseFloat(that.data.userLn), parseFloat(marker.latitude), parseFloat(marker.longitude)),
            level: r_level,
            notShowLabel: false,
            scale: 14
        })
    },

    /**
     * 显示离我最近的风险地区
     * 进行距离计算排序
     */
    popup() {
        // 如果没有用户的位置则不显示
        if (this.data.userLa == "" || this.data.userLa == null || this.data.userLa == undefined) {
            return this.locate()
        }
        let marker = this.data.markers
        let list_temp = []
        // 获取每个点到当前位置的距离
        for (let i = 0; i < marker.length; i++) {
            let dis_obj = new Object()
            dis_obj.index = i
            dis_obj.address = marker[i].title
            dis_obj.distance = parseFloat(util.getDistance(parseFloat(this.data.userLa), parseFloat(this.data.userLn), parseFloat(marker[i].latitude), parseFloat(marker[i].longitude)))
            dis_obj.markerId = marker[i].id
            list_temp.push(dis_obj)
        }
        this.setData({
            distance_list: list_temp
        })
        // 排序
        let arr = this.data.distance_list;
        this.setData({
            distance_list: arr.sort(this.compare("distance", true))
        })
        // 显示列表
        this.selectComponent('#bottomFrame').showFrame();
    },

    compare: function (property, bol) {
        return function (a, b) {
            let value1 = a[property];
            let value2 = b[property];
            if (bol) {
                return value1 - value2;
            } else {
                return value2 - value1;
            }
        }
    },

    /**
     * 点击离我最近列表中的位置，地图移动到该点
     * 视图中心位置的移动交由 markertap 完成
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
     * 隐藏气泡label
     */
    hideLabel: function () {
        this.setData({
            notShowLabel: true
        })
    }
})