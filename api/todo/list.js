const fs=require('fs');

const list=(req,res)=>{
    const star=req.body.star;
    const isImpending=req.body.is_impending;
    const isDone=req.body.is_done;
    const now=new Date();

    const GetTodo=()=>{
        return new Promise((resolve,reject)=>{
            fs.readFile('./models/todo.json',(err,data)=>{
                if(err){
                    throw err;
                }
                let todos=JSON.parse(data);
                resolve(todos);
            });
        });
    }
    const Filter=(todos)=>{
        return new Promise((resolve,reject)=>{
            let data=[];
            try{
                for(let i=0;i<todos['rows'].length;i++){
                    let diff=new Date(todos['rows'][i]['td_deadline'].replace(/-/g,'/'))-now;
                    let remainder=(diff/1000/84600).toFixed(0);
                    if(remainder<0){
                        remainder="마감";
                    }
                    else if(remainder>=0 && remainder<1){
                        remainder="오늘"
                    }
                    else{
                        remainder=`${remainder}일`
                    }
                    let temp={
                        no:todos['rows'][i]['td_no'],
                        subject:todos['rows'][i]['td_subject'],
                        content:todos['rows'][i]['td_content'],
                        star:todos['rows'][i]['td_star'],
                        is_done:todos['rows'][i]['td_is_done'],
                        remainder:remainder
                    }
                    if(star){
                        if(temp.star==star){
                            data.push(temp);
                        }
                    }
                    else if(isImpending && isDone==0){
                        if(isImpending=='impending'){
                            if( (temp.remainder=="오늘" || temp.remainder=="1일") && temp.is_done==isDone){
                                data.push(temp);
                            }
                        }
                        else{
                            if(temp.remainder=="마감" && temp.is_done==isDone){
                                data.push(temp);
                            }
                        }
                    }
                    else if(!isImpending && isDone){
                        if(temp.is_done==isDone){
                            data.push(temp);
                        }
                    }
                    else{
                        data.push(temp);
                    }
                }
            }
            catch (err){
                reject(err);
            }
            data.sort((a,b)=>{a.star>b.star});
            resolve(data);
        });
    }

    GetTodo()
    .then(Filter)
    .then((data)=>{
        res.status(200).json({result:true,code:'success',data:{list:data}});
    })
    .catch((err)=>{
        console.error(err);
        res.status(500).json(err|err.message);
    });
}

module.exports=list;

