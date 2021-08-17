// miniprogram/db/patienttrajectory_db.js
const Promise = require('../promise/es6-promise.min.js')
const CloudDB = require("../promise/wxCloudDB.js")
const CloudFun = require("../promise/wxCloudFun.js")
const API = require("../promise/wxAPI.js")
const Util = require("../utils/util.js")

/**
 * 获取指定省份、城市、地区的病例轨迹列表
 * @param {string} province 省份
 * @param {string} city 城市
 * @param {string} district 地区
 */
function getTrajectoryList(length=0,num=10,province = '江苏省', city = '南京市') {
  return new Promise(function (resolve, reject) {
    let page=Math.ceil(length/num)+1;
    let data = null; // 请求参数
      data = {
        city: city,
        page:page,
        num:num
      }
    // 网络请求
    API.Request('https://njtech.bamlubi.cn/get_track_data', data, 'GET', `获取病例轨迹:${page}-${num}`).then(res => {
      let group_all = [];
      let temp_group = [];
      //构建患者轨迹数据
      for (let item of res) {
        let temp=[];
        temp=item["data"].split(/\[|\],|\]/);
        for(let trajectory of temp){
          if(trajectory=="")  continue;
          trajectory=trajectory.split(",");
          //处理经过时间显示格式
          let str ="";
          if(trajectory[8]!=""){
            str=trajectory[8].slice(4, 6) + "-" + trajectory[8].slice(6)
          }
          //构建轨迹对象
          var obj={
            ch_name:trajectory[4],
            date:trajectory[7],
            pass_date:str,
            flag:trajectory[0],
            ud_id:trajectory[1],
            lat:trajectory[6],
            lng:trajectory[5]
          };
          temp_group.push(obj);
        }
        // 一个患者的轨迹组完成，push进group_all中
        group_all.push(temp_group);
        temp_group = [];
      }
      // 回调
      resolve(group_all)
    }).catch(err => {
      reject(err)
    })
  })
}

module.exports = {
  getTrajectoryList
}