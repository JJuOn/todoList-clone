const express=require('express');
const router=express.Router();

router.use('/notification',require('./notification'));
router.use('/todo',require('./todo'));

module.exports=router;