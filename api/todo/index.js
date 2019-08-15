const express=require('express');
const router=express.Router();

const count=require('./count');
const edit=require('./edit');
const insert=require('./insert');
const list=require('./list');
const remove=require('./remove');

router.post('/count',count);
router.post('/edit',edit);
router.post('/insert',insert);
router.post('/list',list);
router.post('/remove',remove);

module.exports=router;