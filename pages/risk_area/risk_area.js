// pages/risk_area/risk_area.js
const app = getApp()
const util = require('../../utils/util.js')
const API = require("../../promise/wxAPI.js")
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
        callout_id: "",
        la: "",
        ln: "",
        level: "",
        notShowLabel: true,
        distance_list: [],
        scale: 12
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
        API.Request('https://njtech.bamlubi.cn/get_detailed_data', {
            city: "南京市"
        }, 'GET', '获取风险地区').then(res => {
            let _markers = [];
            for (let item of res) {
                let type = 2;
                if (item["risk_level"] == "高风险") {
                    type = 0;
                } else if (item["risk_level"] == "中风险") {
                    type = 1;
                }
                let point = new util.createPoit(item["flag"], item["lat"], item["lng"], item["title"], type);
                point.address = item["address"];
                point.risk_level = item["risk_level"];
                _markers.push(point);
            }
            that.setData({
                markers: _markers,
                hasMarkers: true
            })
            // 获取用户位置
            return wx.getLocation({
                type: 'wgs84'
            })
        }).then(res => {
            // 不需要实时渲染的数据，尽量不使用this.setData
            that.data.la = res.latitude;
            that.data.ln = res.longitude;
            // map组件渲染完成时，获取MAP组件，并移动到用户所在位置
            that.mapCtx = wx.createMapContext('myMap')
            that.mapCtx.moveToLocation({
                latitude: parseFloat(res.latitude),
                longitude: parseFloat(res.longitude),
            })
            // 隐藏加载框
            wx.hideLoading()
        }).catch(err => {
            // 隐藏加载框
            wx.hideLoading()
            API.ShowToast('定位失败', 'error')
            console.error(err);
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {},

    /**
     * 当map组件渲染完成时触发
     * @param {*} params 
     */
    moveToMyLocation: function (params) {
        // this.mapCtx = wx.createMapContext('myMap')
        // // map组件渲染完成时，获取MAP组件，并移动到用户所在位置
        // this.mapCtx.moveToLocation()
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
            console.log(res);
            // 不需要实时渲染的数据，尽量不使用this.setData
            that.data.la = res.latitude
            that.data.ln = res.longitude
            // 移动位置
            return that.mapCtx.moveToLocation({
                latitude: parseFloat(res.latitude),
                longitude: parseFloat(res.longitude),
            })
        }).then(res => {
            wx.hideLoading()
            that.setData({
                notShowLabel: true,
                scale: 14
            })
        }).catch(err=>{
            wx.hideLoading()
            API.ShowToast('定位失败', 'error')
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
        // 移动视图中心
        this.mapCtx.moveToLocation({
            latitude: parseFloat(marker.latitude),
            longitude: parseFloat(marker.longitude),
        }).then(res=>{
            that.setData({
                // callout_id: e.detail.markerId,
                address: marker.address,
                title: marker.title,
                distance: util.getDistance(parseFloat(this.data.la), parseFloat(this.data.ln), parseFloat(marker.latitude), parseFloat(marker.longitude)),
                level: r_level,
                notShowLabel: false,
                scale: 14
            })
        });
    },

    /**
     * 关闭气泡
     */
    close: function () {
        this.setData({
            notShowLabel: true
        })
    },

    /**
     * 显示离我最近的风险地区
     * 进行距离计算排序
     */
    popup() {
        let marker = this.data.markers
        let list_temp = []
        // 获取每个点到当前位置的距离
        for (let i = 0; i < marker.length; i++) {
            let dis_obj = new Object()
            dis_obj.index = i
            dis_obj.address = marker[i].title
            dis_obj.distance = parseFloat(util.getDistance(parseFloat(this.data.la), parseFloat(this.data.ln), parseFloat(marker[i].latitude), parseFloat(marker[i].longitude)))
            list_temp.push(dis_obj)
            dis_obj.markerId = marker[i].id
        }
        this.setData({
            distance_list: list_temp
        })
        // 排序
        let property = "distance";
        let self = this;
        let arr = self.data.distance_list;
        let sortRule = true; // 正序倒序
        self.setData({
            distance_list: arr.sort(self.compare(property, sortRule)).filter(function (x) {
                return x.distance <= 50
            })
        })
        // console.log(this.data.distance_list)
        // console.log(list_temp)
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
        this.markertap({detail: {markerId: markerId}})
    },

    hideLabel: function () {
        this.setData({
            notShowLabel: true
        })
    }
})