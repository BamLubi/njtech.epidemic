// miniprogram/db/news_db.js
// Package all wechat API into Promise Object

const Promise = require('../promise/es6-promise.min.js')
const CloudDB = require("../promise/wxCloudDB.js")
const CloudFun = require("../promise/wxCloudFun.js")
const API = require("../promise/wxAPI.js")
const Util = require("../utils/util.js")

/**
 * 获取新闻列表
 * @param {*} start 
 * @param {*} num 
 * @param {*} city 
 */
function getNewsList(start = 0, num = 3, city = '') {
    return new Promise(function (resolve, reject) {
        let url = "https://lab.isaaclin.cn/nCoV/api/news"
        let data = {
            page: 1,
            num: num
        }
        API.Request(url, data, 'GET', '获取新闻').then(res => {
            let data = res.results
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