// miniprogram/db/overall_db.js
const Promise = require('../promise/es6-promise.min.js')
const CloudDB = require("../promise/wxCloudDB.js")
const CloudFun = require("../promise/wxCloudFun.js")
const API = require("../promise/wxAPI.js")
const Util = require("../utils/util.js")

/**
 * 获取省份疫情基本数据
 * @param {*} province 省份
 */
function getProvinceOverall(province = '江苏省') {
    return new Promise(function (resolve, reject) {
        API.Request("https://njtech.bamlubi.cn/get_province_overall_data", {
            province: province
        }, 'GET', `获取${province}的总体确诊情况`).then(res => {
            let data = res[0]
            // 转换时间
            data.updateTime = Util.formatTime(new Date(parseInt(data.updateTime)*1000))
            // 回调
            resolve(data)
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * 获取一个省份所有城市的疫情基本数据
 * @param {*} province 省份
 */
function getCityOverall(province = '江苏省') {
    return new Promise(function (resolve, reject) {
        API.Request("https://njtech.bamlubi.cn/get_city_overall_data", {
            province: province
        }, 'GET', `获取${province}内各个城市的数据`).then(res => {
            // 回调
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}

module.exports = {
    getProvinceOverall,
    getCityOverall
}