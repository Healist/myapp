/**
 * Created by Healist on 2016/10/17.
 */
var mongoose = require('mongoose');

var Comment = new mongoose.Schema({
    //评论人
    username: {type: String},
    groupStage: {type: String, default:"青铜"},
    //被评论人
    toUserName: {type: String, default: null},
    accountId: {type: mongoose.Schema.ObjectId},
    type: {type: Number, default: 0},  // 1代表该类型为评论，2代表类型为评论的回复
    content: {type: String, default: null},
    added: {type: Date, default: Date.now()},
    updated: {type: Date, default: Date.now()}
});

var TopicSchema = new mongoose.Schema({
    title: { type: String },
    content: { type: String },
    author_id: { type: mongoose.Schema.ObjectId },
    author_name: { type: String, default: null },
    groupStage: {type: String, default:"青铜"},
    comment: [Comment],
    top: { type: Boolean, default: false }, // 置顶帖
    good: {type: Boolean, default: false}, // 精华帖
    lock: {type: Boolean, default: false}, // 被锁定主题
    reply_count: { type: Number, default: 0 },
    visit_count: { type: Number, default: 0 },
    collect_count: { type: Number, default: 0 }, //参与数
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    last_reply: { type: mongoose.Schema.ObjectId, default: null },
    last_reply_at: { type: Date, default: Date.now },
    type: {type: String},
    tab: {type: String, default: null},  //文章标签
    deleted: {type: Boolean, default: false}
});

var Topic = mongoose.model("Topic", TopicSchema);