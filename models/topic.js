/**
 * Created by Healist on 2016/9/30.
 */
    var Topic = require('../schema').Topic;

    exports.publicArticle = function (user, title, content, type, label, cb) {
        var topic = new Topic({
            author_id: user._id,
            author_name: user.username,
            groupStage: user.groupStage,
            title: title,
            content: content,
            type: type,
            tab: label
        });
        topic.save(cb);
        console.log("Save article command was send");
    };

    exports.findAll = function (cb) {
        Topic.find({}, function (err, docs) {
            cb(docs);
        })
    };

    exports.findAllByLimit = function (page, limit, cb) {
        var total_length = 0;
        var page_num = 0;  //总页数
        var from = 0;     // 开始位置
        var to = 0;       // 终位置
        Topic.find({}, function (err, docs) {
            if(err) {
                console.log(err);
            }
            total_length = docs.length;
            page_num = Math.ceil(total_length / limit);
            from = (page-1) * limit;
            var query = Topic.find({}).sort('-create_at').skip(from).limit(limit);
            query.exec(cb);
        });
    };

    exports.findArticleByTitle = function (title, cb) {
        Topic.findOne({title: title}, function (err, doc) {
            if(err) {
                console.log(err);
                res.send(400);
            }
            cb(doc);
        });
    };

    exports.addComment = function (topic, user, content, cb) {
        var comment = {
            username: user.username,
            accountId: user._id,
            groupStage: user.groupStage,
            content: content,
            type: 1,
            added: new Date(),
            updated: new Date()
        };
        //添加关注的人
        topic.comment.push(comment);

        topic.save(cb);
    };

    exports.addReply = function (topic, user, author, content, cb) {
        var comment = {
            username: user.username,
            toUserName: author,
            groupStage: user.groupStage,
            accountId: user._id,
            content: content,
            type: 2,
            added: new Date(),
            updated: new Date()
        };
        //添加关注的人
        topic.comment.push(comment);

        topic.save(cb);
    };

    exports.addVisitCount = function (title, count, cb) {
        Topic.update({'title': title}, {$set: {'visit_count': count}}, function (err) {
            cb(err);
        });
    };

    exports.addCollectCount = function (title, count, cb) {
      Topic.update({'title': title}, {$set: {'collect_count': count}}, function (err) {
          cb(err);
      });
    };

    exports.findAllTags = function (cb) {
        var tagList = [];

        Topic.find({}, function (err, topics) {
            cb(err, topics);
        });
    };

    // return {
    //     publicArticle: publicArticle,
    //     findAll: findAll,
    //     findArticleByTitle: findArticleByTitle,
    //     addComment: addComment,
    //     addReply: addReply
    // }
