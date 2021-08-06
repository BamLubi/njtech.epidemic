// pages/acid_area/acid_area.js
const app = getApp()
const util = require('../../utils/util.js')
const API = require("../../promise/wxAPI.js")
var p_data=require('./data.js')
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
        notShowLabel:true,
        distance_list:[],
        scale:10,
        tele:"",
        viewShowed: false, //显示结果view的状态
        inputVal: "", // 搜索框值
        serachList: [], //搜索渲染推荐数据
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
        // // 获取地图标记点数据
        // API.Request('https://njtech.bamlubi.cn/getdata_auto', {
        //     city: "南京市"
        // }, 'GET', '获取风险地区').then(res => {
        //     let _markers = [];
        //     for (let item of res) {
        //         let type = 2;
        //         if (item["risk_level"] == "高风险") {
        //             type = 0;
        //         } else if (item["risk_level"] == "中风险") {
        //             type = 1;
        //         }
        //         let point = new util.createPoit(item["flag"], item["lat"], item["lng"], item["title"], type);
        //         point.address = item["address"];
        //         point.risk_level = item["risk_level"];
        //         _markers.push(point);
        //     }
        //     that.setData({
        //         markers: _markers,
        //         hasMarkers: true
        //     })
        //     // 获取用户位置
        //     return wx.getLocation({
        //         type: 'wgs84'
        //     })
        // }).then(res => {
        //     that.setData({
        //         la: res.latitude,
        //         ln: res.longitude
        //     })
        //     this.mapCtx.moveToLocation({
        //         latitude: parseFloat(this.data.la),
        //         longitude: parseFloat(this.data.ln),
        //     });
        //     // 隐藏加载框
        //     wx.hideLoading()
        // }).catch(err => {
        //     // 隐藏加载框
        //     wx.hideLoading()
        //     API.ShowToast('定位失败','error')
        //     console.error(err);
        // })
        // 获取地图标记点数据
        var _markers=[]
        for(let item of p_data.postData.RECORDS){
            // if(item["lat"]>180||item["lat"]<-180||item["lng"]>180||item["lng"]<-180){
            //     console.log(item["uuid"])
            // }
            let point = new util.createPoit(item["uuid"], item["lat"], item["lng"], item["name"], 0)
            point.address = item["address"]
            point.tel=item["tel"]
            
            _markers.push(point)
            // console.log(_markers)
        }
        that.setData({
            markers:_markers,
            hasMarkers:true
        })
        return wx.getLocation({
                type: 'wgs84'
            }).then(res => {
                that.setData({
                    la: res.latitude,
                    ln: res.longitude
                })
                this.mapCtx.moveToLocation({
                    latitude: parseFloat(this.data.la),
                    longitude: parseFloat(this.data.ln),
                });
                // 隐藏加载框
                wx.hideLoading()
            }).catch(err => {
                // 隐藏加载框
                wx.hideLoading()
                API.ShowToast('定位失败','error')
                console.error(err);
            })
        
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        // 页面渲染完成时，获取MAP组件
        this.mapCtx = wx.createMapContext('myMap')
        // this.mapCtx.moveToLocation()
        // let marker=this.data.markers
    },
    /**
     *点击定位按钮，移动视图到现在所在位置
     */
    locate:function(){
        this.mapCtx.moveToLocation({
            latitude: parseFloat(this.data.la),
            longitude: parseFloat(this.data.ln),
        });
        // console.log(this.data.la)
        this.setData({
            scale:10
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
        // console.log(marker);
        // 移动视图中心
        this.mapCtx.moveToLocation({
            latitude: parseFloat(marker.latitude),
            longitude: parseFloat(marker.longitude),
        });
        // 设置显示信息
        this.setData({
            address: marker.address,
            title: marker.title,
            distance: util.getDistance(parseFloat(this.data.la), parseFloat(this.data.ln), parseFloat(marker.latitude), parseFloat(marker.longitude))+"km",
            notShowLabel: false,
            tele:marker.tel
        })
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
     * 弹窗
     * 进行距离计算排序
     */
    popup(){
        let marker=this.data.markers
        var list_temp=[]
        // 获取每个点到当前位置的距离
        for(var i=0;i<marker.length;i++){
            let dis_obj=new Object()
            dis_obj.index=i
            dis_obj.address=marker[i].title
            dis_obj.distance=parseFloat(util.getDistance(parseFloat(this.data.la), parseFloat(this.data.ln), parseFloat(marker[i].latitude), parseFloat(marker[i].longitude)))
            list_temp.push(dis_obj)
        }
        this.setData({
            distance_list:list_temp
        })
        // 排序
        var property = "distance";
        var self = this;
        var arr = self.data.distance_list;
        var sortRule = true; // 正序倒序
        self.setData({
            distance_list: arr.sort(self.compare(property, sortRule))
        })
        // console.log(this.data.distance_list)
        // console.log(list_temp)
        this.selectComponent('#bottomFrame').showFrame();
      },
    compare: function (property, bol) {
        return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        if(bol){
          return value1 - value2;
        }else {
          return value2 - value1;
        }
      }
    },
    // 点击text，地图中心移动到该点
    toMarker:function(e){
        var index=e.currentTarget.dataset.item_index
        // console.log(e.currentTarget.dataset.item_index)
        this.mapCtx.moveToLocation({
            latitude: parseFloat(this.data.markers[index].latitude),
            longitude: parseFloat(this.data.markers[index].longitude),
        });
        this.setData({
            scale:15
        })
    },
        /**
     * 搜索框
     * 进行模糊搜索,点击跳转到对应点
     */
    // 隐藏搜索框样式
  hideInput: function() {
    this.setData({
      inputVal: "",
      viewShowed: false,
    });
  },
  // 键盘抬起事件2
  inputTyping: function(e) {
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
            let marker_obj=new Object()
            marker_obj.marker_index=i;  //对应markers数组下标
            marker_obj.addr=markers[i].title
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
  name: function(res) {
    // console.log(res.currentTarget.dataset.index);
    var index = res.currentTarget.dataset.index;
    var that = this;
    let marker=that.data.markers[index];
    that.setData({
      inputVal: marker.title,
      viewShowed: false,
      scale:15,
      address: marker.address,
      title: marker.title,
      distance: util.getDistance(parseFloat(this.data.la), parseFloat(this.data.ln), parseFloat(marker.latitude), parseFloat(marker.longitude))+"km",
      notShowLabel: false,
      tele:marker.tel
    })
    //移动试图到搜索到的点
    this.mapCtx.moveToLocation({
        latitude: parseFloat(marker.latitude),
        longitude: parseFloat(marker.longitude),
    });
  }
})