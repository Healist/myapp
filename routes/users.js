var express = require('express');
var router = express.Router();

var Account = require('../models').Account;
var Topic = require('../models').Topic;

/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.send('the api of user operation');
    res.json({status: 200, message:"这是user路由json接口"});
});

router.post('/register', function (req, res) {
  var username = req.param('username', null);
  var password = req.param('password',null);
  var email    = req.param('email', null);

  if(username==null || password==null || email == null) {
    res.send(400);
  } else {
    //查找是否已经有该用户名
      Acccount.findByName(username, function (account) {
         if(account == null || account == "") {
             res.send({status: 200, msg: "exist"});
         }  else {
             //orm实例化注册对象
             //noinspection JSUnresolvedVariable
             Account.register(email, password, username, function (err) {
                 if(err) {
                     console.log(err);
                     res.send(400);
                 } else {
                     res.send({status: 200, msg: "success"});
                     res.send(200);
                 }
             });
         }
      });
   }
});

router.post('/login', function (req, res) {
    console.log('login request');
    var username = req.param('username',null);
    var password = req.param('password', null);
    if(username == null || password == null || password.length < 1) {
        console.log(username);
        console.log(password);
        console.log(password.length);
      res.send(400);
      return;
    }
    Account.login(username, password, function (success) {
      if(!success) {
        res.send(401);
        return ;
      }
      console.log('login was successful');
      res.send(200);
    });
});

router.post('/forgotpassword', function (req, res) {
    var hostname = req.header.host;
    var resetPasswordUrl = 'http://' + hostname + '/resetPassword';
    var email = req.param('email', null);
    if(email==null || email.length<1) {
      res.send(400);
      return;
    }

    Account.forgotPassword(email, resetPasswordUrl, function (success) {
      if(success) {
        res.send(200);
      } else {
        res.send(404);
      }
    });
});

//设置在线状态
router.post('/linestatus', function (req, res) {
    var status = req.param('linestatus', null);
    var username = req.param('username', null);
    console.log(status);
    console.log(username);
    if(status == null || username == null) {
        res.send(400);
    } else {
        Account.setStatus(username, status, function (err) {
            if(err) {
                console.log(err);
                res.send(400);
            } else {
                res.send(200);
            }
        });
    }
});

router.get('/resetPassword', function (req, res) {
   var accountId = req.param('account', null);
    res.render('resetPassword.ejs', {locals:{accountId:accountId }});
});

router.post('/resetPassword', function (req, res) {
    var accountId = req.param('accountId', null);
    var password = req.param('password', null);
    if(accountId != null || password!=null) {
        Account.changePassword(accountId, password);
    }
    res.render('resetPasswordSuccess.ejs');
});

//获取所有用户信息列表
router.get('/all', function (req, res) {
   Account.findAllUser(function (users) {
       if(users != null) {
           res.send({status: 200, body: users});
       } else {
           res.send(400);
       }
   })
});

//账户用户明细
router.get('/accounts/:username', function (req, res) {
    var username = req.param.username == 'me'?req.session.accountId:req.params.username;
    Account.findByName(username, function (account) {
        if(account) {
            res.send({status:200,message:account});
        } else {
            res.send(400);
        }
    });
});

//账户用户明细
router.get('/accounts/:id', function (req, res) {
   var accountId = req.param.id == 'me'?req.session.accountId:req.params.id;
    console.log(accountId);
    Account.findById({_id: accountId}, function (account) {
        console.log(account);
        res.json({status:200, message:account});
        //res.send(account);
    });
});

//获取用户状态
router.get('/accounts/status/:id', function (req, res) {
    var accountId = req.params.id == 'me'? req.session.accountId : req.params.id;
    Account.findById(accountId, function (account) {
       res.send(account.status);
    });
});

//添加关注
router.post('/accounts/focus/:name', function (req, res) {
    //var accountId = req.params.id == 'me'?req.session.accountId : req.params.id;
    var accountName = req.params.name;
    var contactName = req.param('contactName', null);
    // console.log(accountName);
    // console.log(contactName);

    if(contactName == null || accountName == null) {
        res.sendStatus(400);
        return;
    }
    Account.findByName(accountName, function (account) {
        if(account) {
            Account.findByName(contactName, function (contact) {
                Account.addFocus(account, contact, function (err) {
                    if(err) {
                        console.log('Error saving account: ' + err);
                        res.send(400);
                    }
                }, function (err) {
                    if(err) {
                        console.log('Error saving account: ' + err);
                        res.send(400);
                    }
                });
                res.send(200);
            });
        }
    });
});

//取消关注
router.post('/cancelfocus/:name', function (req, res) {
    var accountName = req.params.name;
    var contactName = req.param('contactName', null);

    if(contactName == null || accountName == null) {
        res.sendStatus(400);
        return;
    }
    Account.findByName(accountName, function (account) {
        if(account) {
            Account.findByName(contactName, function (contact) {
                Account.removeFocus(account, contact, function (err) {
                    if(err) {
                        console.log('Error remove account: ' + err);
                        res.send(400);
                    }
                }, function (err) {
                    if(err) {
                        console.log('Error remove account: ' + err);
                        res.send(400);
                    }
                });
                res.send(200);
            });
        }
    });
});

//取消关注文章
router.post('/canceltopicfocus', function (req, res) {
    var loginName = req.param('loginName', null);
    var article_title = req.param('title', null);

    if(article_title == null || loginName == null) {
        res.sendStatus(400);
        return;
    }
    Account.findByName(loginName, function (account) {
        if(account) {
            if(account.myFocus != "" || account.myFocus!=null) {
                Account.removeTopicFocus(account, article_title, function (err) {
                    if(err) {
                        console.log('Error remove account: ' + err);
                        res.send(400);
                    }
                    res.send(200);
                });
            }
        } else {
            res.send(400);
        }
    });
});

//修改用户状态
router.post('/accounts/:id/status', function (req, res) {
    var accountId = req.params.id == 'me'? req.session.accountId : req.params.id;
    Account.findById(accountId, function (account) {
       var status = {
           name: account.name,
           status: req.param('status', '')
       };
       account.status.push(status);
        account.activity.push(status);
        account.save(function (err) {
           if(err){
               console.log('Error saving account: ' + err);
           }
        });
    });
    res.send(200);
});

router.get('/accounts/:id/activity', function (req, res) {
    var accountId = req.params.id == 'me'? req.session.accountId : req.params.id;
    Account.findById(accountId, function (account) {
       res.send(account.activity);
    });
});

//用户联系人
router.get('/accounts/contacts/:id', function (req, res) {
   var accountId = req.param.id == 'me'?req.session.accountId:req.params.id;
    Account.findById(accountId, function(account){
       res.send(account.contacts);
    });
});

//获取用户是否已经关注了该浏览人
router.get('/hasfocus/:loginName/:accountName', function (req, res) {
    var username = req.params.loginName;
    var accountName = req.params.accountName;
    var flag = false;

    Account.findByName(username, function (user) {
       if(user != null) {
           //在idol列表中查找是否右accountName这个人
            user.idols.forEach(function (item) {
                if(item.username == accountName) {
                    flag = true;
                }
            });
           if(flag) {
               res.send({status:200, body: 'ok'});
           } else {
               res.send({status:200, body: 'no'});
           }
       } else {
           res.send(400);
       }
    });
});

//获取用户是否已经关注了该文章
router.get('/topic/isFocus/:title/:loginName', function (req, res) {
    var username = req.params.loginName;
    var title = req.params.title;
    var flag = false;

    if(title == "" || username == "") {
        res.send(400);
    }

    Account.findByName(username, function (user) {
        if(user != null) {
            //在idol列表中查找是否右accountName这个人
            user.myFocus.forEach(function (item) {
                if(item.topicTitle == title) {
                    flag = true;
                }
            });
            if(flag) {
                res.send({status:200, body: 'ok'});
            } else {
                res.send({status:200, body: 'no'});
            }
        } else {
            res.send(400);
        }
    });
});

//搜索联系人
router.post('/contacts/find', function (req, res) {
   var searchStr = req.param('searchStr', null);
    if(searchStr == null) {
        res.send(400);
        return;
    }
    Account.findByString(searchStr, function onSearchDone(err, accounts) {
       if(err || accounts.length == 0) {
           res.send(404);
       } else {
           res.send(accounts);
       }
    });
});

//添加联系人
router.post('/accounts/contact/:id', function (req, res) {
    var accountId = req.params.id == 'me'?req.session.accountId : req.params.id;
    var contactId = req.param('contactId', null);

    if(contactId == null) {
        res.send(400);
        return;
    }
    Account.findById(accountId, function (account) {
        if(account) {
            Account.findById(contactId, function (contact) {
                Account.addContact(contact, account);
                account.save();
            });
        }
    });
    res.send(200);
});

//删除联系人（删除好友）
router.delete('/accounts/:id/contact', function (req, res) {
    var accountId = req.params.id == 'me'?req.session.accountId:req.params.id;
    var contactId = req.param('contactId', null);

    if(contactId == null) {
        res.send(400);
        return ;
    }
    Account.findById(accountId, function (account) {
        if(!account) return;

        Account.findById(contactId, function (contact, err) {
            if(!contact) return;
            Account.removeContact(contact, contactId);
            //kill the reverse link
            Account.removeContact(contact, accountId);
        });
        res.send(200);
    });
});

/* 发布文章 */
router.post("/pubArticle",function (req, res) {
    var article_title = req.param('title', null);
    var article_con = req.param('content', null);
    var article_type = req.param('type', null);
    var author = req.param('loginName', null);
    var label = req.param('label', null);

    console.log("label:"+label);

    if(article_title==null || article_con==null || article_type==null) {
        console.log("提交article有空值！");
        res.send(400);
    } else if(author == "") {
        console.log("没查找到用户");
        res.send(400);
    }
    Account.findByName(author, function (user) {
        if(user != null) {
            Topic.publicArticle(user, article_title, article_con, article_type, label,
            function (err) {
                if(err) {
                    console.log(err);
                    res.send(400);
                } else {
                    res.send(200);
                }
            });
        } else {
            console.log("查找用户时失败！");
            res.send(400);
        }
    });
});

/* 按时间倒序获取文章 */
router.get("/articles/:page/:limit", function (req, res) {
    var page = req.params.page;
    var limit = req.params.limit;

    page = parseInt(page);
    limit = parseInt(limit);
    // Topic.findAll(function (docs) {
    //     if(docs != null) {
    //         res.send({status: 200, body: docs});
    //     }
    // });

    Topic.findAllByLimit(page, limit, function (err, docs) {
        if(err) {
            console.log(err);
            res.send(400);
        }
        res.send({status: 200, body: docs});
    });
});

/* 获取文章详情 */
router.get("/topic/:title", function (req, res) {
    var title = req.params.title;
    Topic.findArticleByTitle(title, function (doc) {
        if(doc != null) {
            Account.findByName(doc.author_name, function (user) {

            });
            res.send({status: 200, body: doc});
        } else {
            res.send(400);
        }
    })
});

/* 添加评论 */
router.post("/topic/comment", function (req, res) {
    var content = req.param('content', null);
    //评论人
    var userName = req.param('loginName', null);
    var title = req.param('title', null);

    if(content==null || userName==null || title==null) {
        console.log("提交comment有空值！");
        res.send(400);
        return;
    }

    Topic.findArticleByTitle(title, function (article) {
        if(article!=null) {
            Account.findByName(userName, function (user) {
                if(user != null) {
                    var count = article.collect_count + 1; //增加参与数量
                    Topic.addComment(article, user, content, function (err) {
                        if(err) {
                            console.log(err);
                            res.send(400);
                        }
                        Topic.addCollectCount(article.title, count, function (err) {
                            if(err) {
                                console.log(err);
                            }
                            res.send(200);
                        });
                    });
                } else {
                    res.send(400);
                }
            });
        } else {
            res.send(400);
        }
    })
});

/* 添加回复 */
router.post("/topic/reply", function (req, res) {
    var content = req.param('content', null);
    //评论人
    var userName = req.param('loginName', null);
    //被评论人
    var author = req.param('author', null);
    var title = req.param('title', null);

    if(content==null || userName==null || title==null) {
        console.log("提交comment有空值！");
        res.send(400);
        return;
    } else if(author==null){
        console.log("提交的文章作者为空");
        res.send(400);
        return;
    }

    Topic.findArticleByTitle(title, function (article) {
        if(article!=null) {
            Account.findByName(userName, function (user) {
                if(user != null) {
                    Topic.addReply(article, user, author, content, function (err) {
                        if(err) {
                            console.log(err);
                            res.send(400);
                        }
                        var count = article.collect_count + 1;
                        Topic.addCollectCount(article.title, count, function (err) {
                           if(err) {
                               console.log(err);
                               res.send(400);
                           }
                           res.send(200);
                        });
                    });
                } else {
                    res.send(400);
                }
            });
        } else {
            res.send(400);
        }
    })
});

//获取改登陆人与特定用户的聊天记录
router.get("/chat/:loginName/:accountName", function (req, res) {
    var loginName = req.params.loginName;
    var accountName = req.params.accountName;

    if(loginName=="" || accountName=="") {
        res.send(400);
    }
    Account.findByName(accountName, function (account) {
        if(account!=null) {
            Account.findByName(loginName, function (user) {
                if(user!=null) {
                    Account.findByChatUserName(loginName, accountName, function (doc) {
                        //console.log(doc);
                        res.send({status: 200, message: doc});
                    })
                } else {
                    res.send(400);
                }
            })
        } else {
            res.send(400);
        }
    })
});

router.get('/chatrecord/all/list/:loginName', function (req, res) {
    var loginName = req.params.loginName;
    var arr = [];
    var nameList = [];
    if(loginName=="") {
        res.send(400);
    }
    Account.findByName(loginName, function (user) {
        if(user!=null) {
            user.chat.forEach(function (item) {
                if(nameList.indexOf(item.withUserName)<0) {
                    nameList.push(item.withUserName);
                    arr.push(item);
                }
            });
            res.send({status: 200, message: arr});
        } else {
            res.send(400);
        }
    })
});

//获取跟当前用户有聊天记录的人 (未读的)
router.get("/chatrecord/list/:loginName", function (req, res) {
    var loginName = req.params.loginName;
    var arr = [];
    var nameList = [];

    if(loginName=="") {
        res.send(400);
    }
    Account.findByName(loginName, function (user) {
        if(user!=null) {
            user.chat.forEach(function (item) {
               if(!item.isRead && nameList.indexOf(item.withUserName)<0 && item.isActive==false) {
                   nameList.push(item.withUserName);
                   arr.push(item);
               }
            });
            res.send({status: 200, message: arr});
        } else {
            res.send(400);
        }
    })
});

//增加浏览量
router.get("/visitcount/add/:title", function (req, res) {
    var title = req.params.title;
    var count = 0;
    if(title == "") {
        res.send(400);
    }
    console.log(title);
    Topic.findArticleByTitle(title, function (topic) {
       if(topic!=null) {
           count = topic.visit_count + 1;
           console.log(count);
           Topic.addVisitCount(title,count, function (err) {
               if(err) {
                   console.log(err);
                   res.send(400);
               } else {
                   res.send(200);
               }
           });
       } else {
         res.send(400);
       }
    });
});
//获取未读的通知
router.get('/accounts/annotation/:loginName', function (req, res) {
   var loginName = req.params.loginName;
    var arr = [];
    if(loginName == null) {
        res.send(400);
    }
    Account.findByName(loginName, function (account) {
       if(account) {
           account.annotation.forEach(function (item) {
              if(!item.isReaded) {
                  arr.push(item);
              }
           });
           res.send({status: 200, message: JSON.stringify(arr)});
       } else {
           res.send(400);
       }
    });
});

//获取所有通知
router.get('/accounts/all/annotation/:loginName', function (req, res) {
    var loginName = req.params.loginName;
    if(loginName == null) {
        res.send(400);
    }
    Account.findByName(loginName, function (account) {
        if(account) {
            res.send({status: 200, message: account.annotation});
        } else {
            res.send(400);
        }
    });
});

//设置阅读所有通知
router.post('/read/all/annotation', function (req, res) {
    var loginName = req.param('loginName',null);

    if(loginName == null) {
        res.send(400);
    }

    Account.findByName(loginName, function (user) {
        if(user) {
            if(user.annotation.length > 0) {
                user.annotation.forEach(function (item, num) {
                    item.isReaded = true;
                });
                user.save(function (err) {
                    if(err) {
                        console.log(err);
                        res.send(400);
                    } else {
                        res.send(200);
                    }
                });
            } else {
                res.send({status: 200, message: 'none'});
            }
        } else {
            res.send(400);
        }
    });
});

//设置阅读通知
router.post('/read/annotation', function (req, res) {
   var loginName = req.param('loginName',null);
    var id = req.param('id', null);

    if(loginName == null || id ==null) {
        res.send(400);
    }

    Account.findByName(loginName, function (user) {
       if(user) {
           if(user.annotation.length > 0) {
               user.annotation.forEach(function (item, num) {
                   if(item._id == id) {
                       item.isReaded = true;
                   }
               });
               user.save(function (err) {
                  if(err) {
                      console.log(err);
                      res.send(400);
                  } else {
                      res.send(200);
                  }
               });
           } else {
               res.send({status: 200, message: 'none'});
           }
       } else {
           res.send(400);
       }
    });
});

//设置阅读通知
router.post('/read/chat', function (req, res) {
    var loginName = req.param('loginName',null);
    var withUserName = req.param('username', null);

    if(loginName == null || withUserName ==null) {
        res.send(400);
    }

    Account.findByName(loginName, function (user) {
        if(user) {
            if(user.chat.length > 0) {
                user.chat.forEach(function (item, num) {
                    if(item.withUserName == withUserName) {
                        item.isRead = true;
                    }
                });
                user.save(function (err) {
                    if(err) {
                        console.log(err);
                        res.send(400);
                    } else {
                        res.send(200);
                    }
                });
            } else {
                res.send({status: 200, message: 'none'});
            }
        } else {
            res.send(400);
        }
    });
});

//添加通知
router.post('/annotation', function (req, res) {
    var loginName = req.param('loginName', null);
    var title = req.param('title', null);
    var action = req.param('action', null);
    var type = req.param('type', null);


    if(loginName == null || title == null || action==null || type==null) {
        res.sendStatus(400);
        return;
    }
    Account.findByName(loginName, function (user) {
        if(user) {
            if(user.followers.length == 0) {
                res.send({status:200, message:'none'});
            }
            user.followers.forEach(function (item) {
                Account.findByName(item.username, function (account) {
                   if(account){
                        Account.addAnnotation(user, account, title, action, type, function (err) {
                           if(err) {
                               console.log(err);
                               res.send(400);
                           }
                           res.send(200);
                        });
                   } else {
                       res.send(400);
                   }
                });
            });
        } else {
            res.send(400);
        }
    });
});

//为关注文章的用户添加通知
router.post('/focustopic/annotation', function (req, res) {
    var loginName = req.param('loginName', null);
    var title = req.param('title', null);
    var action = req.param('action', null);
    var type = req.param('type', null);


    if(loginName == null || title == null || action==null || type==null) {
        res.sendStatus(400);
        return;
    }
    Account.findAllUser(function (users) {
       users.forEach(function (item, index) {
         if(item.myFocus != "" && item.myFocus != null) {
             item.myFocus.forEach(function (focus, num) {
                if(focus.topicTitle == title) {
                    Account.addTopicAnnotation(item, title, action, type, function (err) {
                        if(err) {
                            console.log(err);
                            res.send(400);
                        } else {
                            res.send(200);
                        }
                    });
                } else {
                    res.send(400);
                }
             });
         }
       });
    });
});

router.get('/tags/:tagName', function (req, res) {
   var tag = req.params.tagName;
    var result = [];

    console.log(tag);

    Topic.findAllTags(function (err, topics) {
        if(err) {
            console.log(err);
            res.send(400);
        } else {
            topics.forEach(function (item, index) {
                if(item.tab == tag) {
                    result.push(item);
                }
            });
            res.send({status: 200, message: result});
        }
    });
});

router.get('/tags', function (req, res) {
    var tagList = [];
    var result = [];
   Topic.findAllTags(function (err, topics) {
        if(err) {
            console.log(err);
            res.send(400);
        } else {
            topics.forEach(function (item, index) {
                if(tagList.indexOf(item.tab)<0 && item.tab != null && item.tab != '') {
                    tagList.push(item.tab);
                    tagList.push(1);
                } else {
                    var num = tagList.indexOf(item.tab);
                    tagList[num+1] = 2;
                }
            });
            tagList.forEach(function (item, index) {
               if((index % 2)==0) {
                    result.push({tag: item, times: tagList[index+1]});
               }
            });
            res.send({status: 200, message: result});
        }
   });
});

router.get('/daily', function (req, res) {
    var result = [];

    Topic.findAllTags(function (err, topics) {
       if(err) {
           console.log(err);
           res.send(400);
       } else {
           if(topics != null && topics != '') {
               topics.forEach(function(item, index){
                   var now = new Date(Date.now());
                   var createAt = new Date(item.create_at);
                   var year = createAt.getYear();
                   var month = createAt.getMonth();
                   var day = createAt.getDay();
                   var nyear = now.getYear();
                   var nmonth = now.getMonth();
                   var nday = now.getDay();

                   if((nyear == year) && (nmonth == month) && (nday == day)) {
                        result.push(item);
                   }
               });
               res.send({status:200, message: result});
           } else {
               res.send({status:200, message:'none'});
           }
       }
    });
});

router.get('/weekly', function (req, res) {
    var result = [];

    Topic.findAllTags(function (err, topics) {
        if(err) {
            console.log(err);
            res.send(400);
        } else {
            if(topics != null && topics != '') {
                topics.forEach(function(item, index){
                    var now = new Date(Date.now());
                    var createAt = new Date(item.create_at);
                    var year = createAt.getYear();
                    var month = createAt.getMonth();
                    var day = createAt.getDay();
                    var nyear = now.getYear();
                    var nmonth = now.getMonth();
                    var nday = now.getDay();

                    if((nyear == year) && (nmonth == month) && ((nday-day) <= 7)) {
                        result.push(item);
                    }
                });
                res.send({status:200, message: result});
            } else {
                res.send({status:200, message:'none'});
            }
        }
    });
});

router.get('/monthly', function (req, res) {
    var result = [];

    Topic.findAllTags(function (err, topics) {
        if(err) {
            console.log(err);
            res.send(400);
        } else {
            if(topics != null && topics != '') {
                topics.forEach(function(item, index){
                    var now = new Date(Date.now());
                    var createAt = new Date(item.create_at);
                    var year = createAt.getYear();
                    var month = createAt.getMonth();
                    var day = createAt.getDay();
                    var nyear = now.getYear();
                    var nmonth = now.getMonth();
                    var nday = now.getDay();

                    if((nyear == year) && (nmonth == month)) {
                        result.push(item);
                    }
                });
                res.send({status:200, message: result});
            } else {
                res.send({status:200, message:'none'});
            }
        }
    });
});

//关注文章
router.post('/accounts/topicfocus/:loginName', function (req, res) {
    var loginName = req.params.loginName;
    var article_title = req.param('title', null);

    if(loginName == '' || article_title==null) {
        res.send(400);
    }

    Account.findByName(loginName, function (user) {
        if(user!=null) {
            var topic = {
                topicTitle: article_title,
                added: new Date(),
                updated: new Date()
            };
            user.myFocus.push(topic);
            user.save(function (err) {
                if(err) {
                    console.log("error when saving add myFocus");
                    res.send(400);
                } else {
                    res.send(200);
                }
            });
        } else {
            res.send(400);
        }
    });

});

//添加回复通知
router.post('/annotation/reply', function (req, res) {
    var loginName = req.param('loginName', null);
    var title = req.param('title', null);
    var action = req.param('action', null);
    var author = req.param('author', null);


    if(loginName == null || title == null || action==null || author==null) {
        res.sendStatus(400);
        return;
    }
    Account.findByName(loginName, function (user) {
        if(user) {
            if(user.followers.length == 0) {
                res.send({status:200, message:'none'});
            }
            user.followers.forEach(function (item) {
                Account.findByName(item.username, function (account) {
                    if(account){
                        Account.addReplyAnnotation(user, account, title, action, author, function (err) {
                            if(err) {
                                console.log(err);
                                res.send(400);
                            }
                            res.send(200);
                        });
                    } else {
                        res.send(400);
                    }
                });
            });
        } else {
            res.send(400);
        }
    });
});

module.exports = router;
