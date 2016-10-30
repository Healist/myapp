/**
 * Created by Healist on 2016/10/17.
 */
var mongoose = require('mongoose');

var Status = new mongoose.Schema({
    accountId: {type: mongoose.Schema.ObjectId},
    username:{type: String},
    status: {type: String}
});

var Annotation = new mongoose.Schema({
    accountId: {type: mongoose.Schema.ObjectId},
    username:{type: String},
    author: {type: String, default: null},                    //被回复的人
    action: {type: String},                    //发布 回复 评论
    topicType: {type: String, default: null},  //所在板块
    topicTitle: {type: String, default: null}, //所参与的topic标题
    pubTitle: {type: String, default: null},   //新发布的topic标题
    isReaded: {type: Boolean, default: false}, //是否已经浏览
    added: {type: Date, default: Date.now()},
    updated: {type: Date, default: Date.now()}
});

var Chat = new mongoose.Schema({
    withUserName: {type: String}, //和谁聊天的那个人的姓名
    content: {type: String},
    createAt: {type: Date, default: Date.now()},
    isActive: {type: Boolean, default: true}, //是否为主动聊天？
    isRead: {type: Boolean, default: false}
});

var Contact = new mongoose.Schema({
    username: {type: String},
    accountId: {type: mongoose.Schema.ObjectId},
    added: {type: Date, default: Date.now()},
    updated: {type: Date, default: Date.now()}
});

var Topic = new mongoose.Schema({
    topicTitle: {type: String},
    added: {type: Date, default: Date.now()},
    updated: {type: Date, default: Date.now()}
});

var AccountSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    username: { type: String, unique: true },
    password: { type:String },
    photoUrl: { type:String },
    createAt: { type: Date, default: Date.now()},
    lastLogin: { type: Date, default: Date.now()},
    lineStatus: {type: Number, default: 1},   // 1:在线, 2:离开, 3：请勿打扰, 4:隐身
    groupStage: {type: String, default: "青铜"},
    goals:   {type: Number, default: 0},      //积分 0~100：青铜， 100~200：白银，200~300：黄金，300~400：白金，400~500：大师，500~600：最强王者
    myFocus: [Topic],
    contacts: [Contact],                      // 联系人
    annotation: [Annotation],
    followers: [Contact],                      //关注我的人
    idols: [Contact],                          //我关注的人
    chat: [Chat],
    browseCount: { type: Number, default: 0 },
    postCount: {type: Number, default: 0},     //发帖数量
    status:[Status],  // when the contact was added
    activity: [Status]  // when the contact was last updated
});

var Account = mongoose.model('Account', AccountSchema);