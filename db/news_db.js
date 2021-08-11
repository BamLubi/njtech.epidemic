// miniprogram/db/news_db.js

const Promise = require('../promise/es6-promise.min.js')
const CloudDB = require("../promise/wxCloudDB.js")
const CloudFun = require("../promise/wxCloudFun.js")
const API = require("../promise/wxAPI.js")
const Util = require("../utils/util.js")

/**
 * 获取新闻列表
 * @param {*} length 已有数据长度
 * @param {*} num 获取数据长度
 * @param {*} type 请求类型,0代表获取全国、1代表获取省、2代表获取市
 * @param {*} postdata 附带参数
 */
function getNewsList(length = 0, num = 10, type = 0, postdata = '') {
    return new Promise(function (resolve, reject) {
        let url = "https://njtech.bamlubi.cn/get_news_data"
        let page = Math.ceil(length / num)
        let data = {
            page: page ? page : 1,
            num: num
        }
        // 更具请求类型判断是获取全国、省、市
        if (type == 0) {} else if (type == 1) {
            data.province = postdata
        } else if (type == 2) {
            data.city = postdata
        }
        API.Request(url, data, 'GET', '获取新闻').then(res => {
            let data = res
            data.filter(function (x) {
                x.pubDate = Util.formatTime(new Date(parseInt(x.pubDate)));
            })
            resolve(data)
        }).catch(err => {
            reject(err)
        })
    })
}

module.exports = {
    getNewsList
}