// miniprogram/db/news_db.js

const Promise = require('../promise/es6-promise.min.js')
const CloudDB = require("../promise/wxCloudDB.js")
const CloudFun = require("../promise/wxCloudFun.js")
const API = require("../promise/wxAPI.js")
const Util = require("../utils/util.js")

/**
 * 获取新闻列表
 * @param {*} page 
 * @param {*} num 
 * @param {*} city 
 */
function getNewsList(page = 1, num = 10, province = '') {
    return new Promise(function (resolve, reject) {
        let url = "https://njtech.bamlubi.cn/get_news_data"
        let data = {
            page: page,
            num: num,
            province: province
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