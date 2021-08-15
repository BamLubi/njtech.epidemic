// miniprogram/db/acidarea_db.js
const Promise = require('../promise/es6-promise.min.js')
const CloudDB = require("../promise/wxCloudDB.js")
const CloudFun = require("../promise/wxCloudFun.js")
const API = require("../promise/wxAPI.js")
const Util = require("../utils/util.js")

/**
 * 获取指定省份、城市、地区的核酸检测地列表
 * @param {string} province 省份
 * @param {string} city 城市
 * @param {string} district 地区
 */
function getAcidareaList(province = '江苏省', city = '南京市', district = '') {
    return new Promise(function (resolve, reject) {
        let data = null; // 请求参数
        let flg = district != '' && district != '全部'; // 是否需要过滤地区
        if (city == '全部') {
            data = {
                province: province
            }
        } else {
            data = {
                city: city
            }
        }
        // 网络请求
        API.Request('https://njtech.bamlubi.cn/get_detection_site', data, 'GET', `获取核酸检测点:${province}${city}${district}`).then(res => {
            let _markers = [];
            for (let item of res) {
                // 判断是否需要过滤地区
                if (flg && item["district"] != district) continue;
                // 如果经纬度超过范围或者为空则跳过
                if (!isLegalCoor(item["lat"], item["lng"])) continue;
                // 构造marker数据
                var point = new Util.createPoit(item["flag"], item["lat"], item["lng"], item["name"], 1);
                point.address = item["address"];
                point.tel = item["tel"];
                _markers.push(point);
            }
            // 回调
            resolve(_markers)
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 判断是否是合法的坐标
 * @param {string | number} lat 纬度
 * @param {string | number} lng 经度
 */
function isLegalCoor(lat, lng) {
    // 判断为空
    if (lat == null || lng == null || lat == '' || lng == '') return false;
    // 先格式化为浮点型
    lat = typeof (lat) == 'string' ? parseFloat(lat) : lat;
    lng = typeof (lng) == 'string' ? parseFloat(lng) : lat;
    // 判断是否合法
    if (lat < -90 || lat > 90) return false;
    if (lng < -180 || lng > 180) return false;
    return true;
}

module.exports = {
    getAcidareaList
}