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
        hasMarkers: false,
        customCalloutMarkerIds: [],
        view_text: "",
        address: "",
        distance: "",
        title: "",
        la: "",
        ln: "",
        level: "",
        notShowLabel: true,
        distance_list: [],
        scale: 12,
        // 地区选择器
        region: ['江苏省', '南京市', '全部'],
        customItem: '全部'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        // 显示弹框获取用户所在地，并且随后存入全局
        if (!app.globalData.hasUserInfo) {
            return API.ShowModal('获取所在地', '点击确定以获取您所在地!', false).then(() => {
                return API.GetUserProfile()
            }).then(res => {
                // 确定真是的省份名称和城市名称
                res.province = that.whichProvince(res.province)
                res.city = res.city + '市'
                app.globalData.userInfo = res
                app.globalData.hasUserInfo = true
                // 存入本地缓存
                wx.setStorage({
                    key: "userInfo",
                    data: res
                })
                // 重新调用onLoad
                that.onLoad()
            }).catch(err => {
                API.ShowToast('获取失败', 'error')
                console.error(err);
            })
        }
        // 设置用户所在地
        let province = app.globalData.userInfo.province
        let city = app.globalData.userInfo.city
        this.setData({
            region: [province, city, '全部']
        })
        // 显示loading框
        wx.showLoading({
            title: '加载中',
        })
        // 获取风险地区列表
        RiskareaDB.getRiskareaList(province, city).then(res => {
            that.setData({
                markers: res,
                hasMarkers: true
            })
            // 隐藏loading框
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
        // 获取风险地区列表
        RiskareaDB.getRiskareaList(...region).then(res => {
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
     * 点击定位按钮，移动视图到现在所在位置
     * 考虑到用户会移动，因此必须再次获取用户位置
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
            // console.log(res);
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
        let that = this
        // 注意markerId并不等于序号
        let marker = this.data.markers.filter(function (x) {
            return x.id == e.detail.markerId;
        })[0];
        // 设置显示信息
        let r_level = ""
        if (marker.risk_level == "低风险") {
            r_level = "病例到访场所"
        } else {
            r_level = marker.risk_level + "地区"
        }
        // 判断mapXtx是否存在_important
        if (that.mapCtx == null || that.mapCtx == undefined) {
            that.mapCtx = wx.createMapContext('myMap')
        }
        // 移动视图中心
        this.mapCtx.moveToLocation({
            latitude: parseFloat(marker.latitude),
            longitude: parseFloat(marker.longitude),
        }).then(res => {
            that.setData({
                // callout_id: e.detail.markerId,
                address: marker.address,
                title: marker.title,
                distance: util.getDistance(parseFloat(this.data.la), parseFloat(this.data.ln), parseFloat(marker.latitude), parseFloat(marker.longitude)),
                level: r_level,
                notShowLabel: false,
                scale: 15
            })
        });
    },

    /**
     * 显示离我最近的风险地区
     * 进行距离计算排序
     */
    popup() {
        //流氓一波
        this.locate()
        let marker = this.data.markers
        let list_temp = []
        // 获取每个点到当前位置的距离
        for (let i = 0; i < marker.length; i++) {
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
        let arr = this.data.distance_list;
        this.setData({
            distance_list: arr.sort(this.compare("distance", true)).filter(function (x) {
                return x.distance <= 50
            })
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