const fs=require('fs');
const remove=(req,res)=>{
    const no=Number(req.body.no);
    const DataCheck=()=>{
        return new Promise((resolve,reject)=>{
            if(!no){
                reject({result:false,code:'empty_param'});
            }
            resolve();
        });
    }
    const GetTodo=()=>{
        return new Promise((resolve,reject)=>{
            fs.readFile('./models/todo.json',(err,data)=>{
                if(err){
                    throw err;
                }
                resolve(JSON.parse(data));
            });
        });
    }
    const RemoveTodo=(todos)=>{
        return new Promise((resolve,reject)=>{
            for(let i=0;i<todos['rows'].length;i++){
                if(todos['rows'][i]['td_no']==no){
                    todos['rows'].splice(i,1);
                    i=-1;
                }
            }
            fs.writeFile('./models/todo.json',JSON.stringify(todos),(err)=>{
                if(err){
                    throw err;
                }
                resolve();
            });
        });
    }
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
    const RemoveNoti=(noti)=>{
        return new Promise((resolve,reject)=>{
            for(let i=0;i<noti['rows'].length;i++){
                if(noti['rows'][i]['td_no']==no){
                    noti['rows'].splice(i,1);
                    i=-1;
                }
            }
            fs.writeFile('./models/notification.json',JSON.stringify(noti),(err)=>{
                if(err){
                    throw err;
                }
                resolve();
            });
        });
    }
    DataCheck()
    .then(GetTodo)
    .then(RemoveTodo)
    .then(GetNoti)
    .then(RemoveNoti)
    .then(()=>{
        res.status(200).json({result:true,code:'success'});
    })
    .catch((err)=>{
        res.staus(500).json(err|{result:false,code:'unknown_error'});
    });
}

module.exports=remove;