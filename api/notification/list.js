const fs=require('fs');

const list=(req,res)=>{
    const GetNoti=()=>{
        return new Promise((resolve,reject)=>{
            fs.readFile('./models/notification.json',(err,data)=>{
                if(err){
                    throw err;
                }
                resolve(JSON.parse(data));
            });
        });
    }
    const GetTodo=(noti)=>{
        return new Promise((resolve,reject)=>{
            fs.readFile('./models/todo.json',(err,data)=>{
                if(err){
                    throw err;
                }
                let todo=JSON.parse(data);
                let result=[];
                for(let i=0;i<noti['rows'].length;i++){
                    for(let j=0;j<todo['rows'].length;j++){
                        if(noti['rows'][i]['td_no']==todo['rows'][j]['td_no']){
                            result.push({
                                type:noti['rows'][i]['nt_type'],
                                subject:todo['rows'][j]['td_subject'],
                                star:todo['rows'][j]['td_star']
                            });
                            break;
                        }
                    }
                }
                resolve(result);
            });
        });
    }
    GetNoti()
    .then(GetTodo)
    .then((data)=>{
        res.status(200).json({result:true,code:'success',data:{list:data}});
    })
    .catch((err)=>{
        res.status(500).json({result:false,code:'unknown_error',data:[]});
    })
}

module.exports=list;