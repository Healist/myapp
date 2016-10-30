/**
 * Created by Healist on 2016/10/17.
 */
var io = require('socket.io')();
var Account = require('../models').Account;

exports.listen = function (_server) {
    return io.listen(_server);
};

io.sockets.on('connection', function (socket) {
    socket.emit('connected', {time: socket.handshake.time});//发送客户端连接成功标志
    console.log("connect!");

    //执行失败触发sendFailed事件，执行失败
    socket.on('private message', function (from, to, msg) {
       console.log('received a private message by ', from, ' say to ',to, msg);
        Account.findByName(from, function (user) {
           if(user != null) {
                Account.findByName(to, function (account) {
                    if(account != null) {
                        Account.sendMessage(user, account, msg, function (err) {
                            if(err) {
                                console.log(err);
                                socket.emit('sendFailed');
                            } else {
                                console.log("save chat of user succeed!");
                                socket.emit('update:' + from, from, to, msg);
                            }
                        }, function (err) {
                            if(err) {
                                console.log(err);
                                socket.emit('sendFailed');
                            } else {
                                console.log("save chat of account succeed!");
                                socket.broadcast.emit('update:' + to, from, to, msg);
                            }
                        });
                    } else {
                        console.log("查找第二个用户失败了，应该触发客户端失败事件");
                        socket.emit('sendFailed');
                    }
                })
           } else {
               console.log("查找第一个用户失败了，应该触发客户端失败事件");
               socket.emit('sendFailed');
           }
        });
    });

    // 客户端注销、断开时触发，将断开用户从在线列表中清除
    socket.on('disconnect', function () {
        console.log("disconnect");
    });
});
