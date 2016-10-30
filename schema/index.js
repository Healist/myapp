/**
 * Created by Healist on 2016/10/17.
 */
var mongoose = require('mongoose');
var dbpath = 'mongodb://localhost/community';

//connect mongodb
mongoose.connect(dbpath, function onMongooseError(err) {
    if(err) {
        throw err;
    }
});

// models
require('./AccountSchema');
require('./topicSchema');


exports.Account         = mongoose.model('Account');
exports.Topic        = mongoose.model('Topic');