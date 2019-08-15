const express=require('express');
const router=express.Router();

const list=require('./list');

router.post('/list',list);

module.exports=router;