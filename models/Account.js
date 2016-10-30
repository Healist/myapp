/**
 * Created by Healist on 2016/9/26.
 */
    var crypto = require('crypto');
    var Account = require('../schema').Account;

    var nodemailer = require('nodemailer');
    var config = {
        mail: require('../config/mail')
    };

    exports.changePassword = function (accountId, newpassword) {
        var shaSum = crypto.createHash('sha256');
        shaSum.update(newpassword);
        var hashedPassword = shaSum.digest('hex');
        Account.update({_id:accountId}, {$set: {password:hashedPassword}}, {upsert:false},
        function changePasswordCallback(err) {
            console.log('Change password done for account ' + accountId);
        });
    };

    exports.forgotPassword =  function (email, resetPasswordUrl, callback) {
        var user = Account.findOne({email: email}, function findAccount(err, doc) {
            if(err) {
                callback(false);
            } else {
                var smtpTransport = nodemailer.createTransport('SMTP', config.mail);
                resetPasswordUrl += '?account=' + doc._id;
                smtpTransport.sendMail({
                    from: '794622537@qq.com',
                    to: doc.email,
                    subject: 'SocialNet Password Request',
                    text: 'Click here to reset your password: ' + resetPasswordUrl
                }, function forgotPasswordResult(err) {
                    if(err) {
                        callback(false);
                    } else {
                        callback(true);
                    }
                });
            }
        });
    };

    exports.login = function (username, password, callback) {
        var shaSum = crypto.createHash('sha256');
        var lastLogin = Date.now();
        shaSum.update(password);
        Account.findOne({username: username, password:shaSum.digest('hex')},function (err, doc) {
            if(err) {
                console.log(err);
            }
            Account.update({username: username},{$set: {'lastLogin': lastLogin}});
            callback(doc != null);
        });
    };

    exports.findByName = function (username, callback) {
        Account.findOne({'username': username}, function (err, doc) {
            if(err) {
                console.log(err);
                return;
            }
            callback(doc);
        });
    };

    exports.findByChatUserName = function (username, accountname, callback) {
        Account.findOne({'username': username}, function (err, user) {
            if(err) {
                console.log(err);
                return;
            }
            var arr = [];
            user.chat.forEach(function (item) {
                console.log("name:" + item.withUserName);
                if(item.withUserName == accountname) {
                    arr.push(item);
                }
            });
            //console.log(JSON.stringify(arr));
            callback(JSON.stringify(arr));
        });
    };

    exports.findIdByName = function (author, cb) {
        Account.findOne({username: author}, function (err, doc) {
            if(err) {
                console.log(err);
                return;
            }
            console.log("id" + doc._id);
            cb(doc._id);
        });
    };

    exports.findById = function (accountId, callback) {
      Account.findOne({_id: accountId}, function (err, doc) {
          if(err) {
              console.log(err);
          }
          callback(doc);
      });
    };

    exports.findByString = function (searchStr, callback) {
        var searchRegex = new RegExp(searchStr, 'i');
      Account.find({
        $or: [
            { 'name.full': {$regex: searchRegex} },
            { 'email': { $regex: searchRegex } }
        ]
      }, callback);
    };

    exports.findAllUser = function (cb) {
      Account.find({}, function (err, users) {
          if(err) {
              console.log(err);
          }
          cb(users);
      });
    };

    exports.register = function (email, password, username, cb) {
        var shaSum = crypto.createHash('sha256');
        shaSum.update(password);
        console.log('Registering ' + username);
        var createAt = Date.now();
        var user = new Account({
            email: email,
            username: username,
            password: shaSum.digest('hex'),
            createAt: createAt
        });
        user.save(cb);
        console.log('Save user command was sent');
    };

    //修改在线的状态
    exports.setStatus = function (username, status, cb) {
        Account.update({'username': username}, {$set: {'lineStatus': status}}, function (err) {
            cb(err);
        });
    };

    //添加关注
    exports.addFocus = function (account, addcontact, cb, cb2) {
        var user = {
            username: account.username,
            accountId: account._id,
            added: new Date(),
            updated: new Date()
        };
        var contact = {
            username: addcontact.username,
            accountId: addcontact._id,
            added: new Date(),
            updated: new Date()
        };
        //添加关注的人
        account.idols.push(contact);
        //被关注的人添加粉丝
        addcontact.followers.push(user);

        account.save(cb);
        addcontact.save(cb2);
    };

    exports.removeTopicFocus = function (account, title, cb) {
        account.myFocus.forEach(function (item, index) {
           if(item.topicTitle == title) {
               account.myFocus.splice(index, 1);
           }
        });
        account.save(cb);
    };

    //取消关注
    exports.removeFocus = function (account, addcontact, cb, cb2) {
        var user = {
            name: account.username,
            accountId: account._id,
            added: new Date(),
            updated: new Date()
        };
        var contact = {
            name: addcontact.username,
            accountId: addcontact._id,
            added: new Date(),
            updated: new Date()
        };
        var index1=0,index2=0;
        //去掉关注的人
        // account.idols.pop();
        // addcontact.followers.pop();
        account.idols.forEach(function (value, index) {
           if(value.username == addcontact.username)  {
                account.idols.splice(index, 1);
           }
        });

        addcontact.followers.forEach(function (value, index) {
            if(value.username == account.username)  {
                addcontact.followers.splice(index, 1);
            }
        });

        account.save(cb);
        addcontact.save(cb2);
    };

    exports.addContact = function (account, addcontact) {
      var contact = {
          name: addcontact.name,
          accountId: addcontact._id,
          added: new Date(),
          updated: new Date()
      };
      account.contacts.push(contact);

        account.save(function (err) {
           if(err) {
               console.log('Error saving account: ' + err);
           }
        });
    };

    //待优化
    exports.removeContact = function (account, accountId) {
        if(account.contacts == null) return;
        account.contacts.forEach(function (contact) {
           if(contact.accountId == contactId) {
               account.contacts.remove(contact);
           }
        });
        account.save();
    };
    //user 发消息给 account
    exports.sendMessage = function (user, account, content, cb1, cb2) {
        var chat = {
            withUserName: account.username,
            content: content,
            createAt: new Date(),
            isActive: true
        };
        var chat_reverse = {
            withUserName: user.username,
            content: content,
            createAt: new Date(),
            isActive: false
        };
        user.chat.push(chat);
        account.chat.push(chat_reverse);

        user.save(cb1);

        account.save(cb2);
    };

    exports.addAnnotation = function (user, account, title, action, type, cb) {
        var annotation = {
            accountId: user._id,
            username:user.username,
            action: action,                    //发布 回复 评论
            topicType: type,
            pubTitle: title,                 //新发布的topic标题
            added: Date.now(),
            updated: Date.now()
        };
        account.annotation.push(annotation);

        account.save(cb);
    };

    exports.addTopicAnnotation = function (user, title, action, type, cb) {
        var annotation = {
            accountId: user._id,
            username: user.username,
            action: action,                    //发布 回复 评论
            topicType: type,
            pubTitle: title,                 //新发布的topic标题
            added: Date.now(),
            updated: Date.now()
        };
        user.annotation.push(annotation);

        user.save(cb);
    };

exports.addReplyAnnotation = function (user, account, title, action, author, cb) {
    var annotation = {
        accountId: user._id,
        username:user.username,
        action: action,                    //发布 回复 评论
        topicTitle: title, //所参与的topic标题
        author: author,
        added: Date.now(),
        updated: Date.now()
    };
    account.annotation.push(annotation);

    account.save(cb);
};