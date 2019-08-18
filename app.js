const bodyParser=require('body-parser');
const express=require('express');
const path=require('path');
const morgan=require('morgan');
const app=express();

app.use(morgan('[:date[iso]] :method :status :url :response-time(ms) :user-agent'));
app.use(express.static(path.join(__dirname,'static')));
app.use(bodyParser.urlencoded({extended:false}));

app.use('/api',require('./api'));
app.use('/',require('./router'));

app.listen(80,()=>{
    console.log('Server is running on port 80!');
});