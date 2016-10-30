/**
 * Created by Healist on 2016/9/19.
 */
var express = require('express');
var router  = express.Router();

router.get("/",function (req, res) {
    res.json({status: 200, message:"这是api路由json接口"});
});

module.exports = router;