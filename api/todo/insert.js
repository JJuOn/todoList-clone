const fs=require('fs');

const dateFormatter=()=>{
    const now=new Date();
    const year=now.getFullYear();
    let month=now.getMonth()+1;
    if(month.toString().length==1){
        month='0'+month;
    }
    let date=now.getDate();
    if(date.toString().length==1){
        date='0'+date;
    }
    let hour=now.getHours();
    if(hour.toString().length==1){
        hour='0'+hour;
    }
    let minute=now.getMinutes();
    if(minute.toString().length==1){
        minute='0'+minute;
    }
    let second=now.getSeconds();
    if(second.toString().length==1){
        second='0'+second;
    }
    return `${year}-${month}-${date} ${hour}:${minute}:${second}`
}

const insert=(req,res)=>{
    let star=req.body.star;
    let subject=req.body.subject;
    let content=req.body.content;
    let deadline=req.body.deadline;
    if(!deadline){
        const now=new Date();
        const year=now.getFullYear();
        let month=now.getMonth()+1;
        if(month.toString().length==1){
        month='0'+month;
        }
        let date=now.getDate();
        if(date.toString().length==1){
            date='0'+date;
        }
        deadline=`${year}-${month}-${date}`;
    }
    const currentTime=dateFormatter();

    const DataCheck=()=>{
        return new Promise((resolve,reject)=>{
            if(!subject || !content || !deadline){
                if(!subject){
                    reject({result:false,code:'empty_param',data:'subject'});
                }
                else if(!content){
                    reject({result:false,code:'empty_param',data:'content'});
                }
                else{
                    reject({result:false,code:'empty_param',data:'deadline'});
                }
            }
            resolve();
        });
    }

    const GetTodo=()=>{
        return new Promise((resolve,reject)=>{
            let todos;
            fs.readFile('./models/todo.json',(err,data)=>{
                if(err){
                    throw err;
                }
                else{
                    todos=JSON.parse(data);
                    resolve(todos);
                }
            });
        });
    }

    const DoInsert=(todos)=>{
        return new Promise((resolve,reject)=>{
            if(!star){
                star="0";
            }
            const newTodo={
                td_no:todos.td_last_no+1,
                td_subject:subject,
                td_content:content,
                td_deadline:deadline,
                td_star:star,
                td_is_done:0,
                td_registerd_at:currentTime
            };
            todos['rows'].push(newTodo);
            todos['td_last_no']++;
            resolve(todos);
        });
    }

    const Save=(todos)=>{
        return new Promise((resolve,reject)=>{
            fs.writeFile('./models/todo.json',JSON.stringify(todos,null,4),(err)=>{
                if(err){
                    throw err;
                }
                resolve(todos);
            });
        });
    }

    const InsertIntoNoti=(todos)=>{
        return new Promise((resolve,reject)=>{
            fs.readFile('./models/notification.json',(err,data)=>{
                if(err){
                    throw err;
                }
                let noti=JSON.parse(data);
                let newNoti={
                    nt_no:noti['nt_last_no']+1,
                    nt_type:'insert',
                    td_no:todos['td_last_no'],
                    nt_registerd_at:currentTime
                };
                noti['rows'].push(newNoti);
                noti['nt_last_no']++;
                fs.writeFile('./models/notification.json',JSON.stringify(noti,null,4),(err)=>{
                    if(err){
                        throw err;
                    }
                    resolve();
                });
            });
        });
    }

    DataCheck()
    .then(GetTodo)
    .then(DoInsert)
    .then(Save)
    .then(InsertIntoNoti)
    .then(()=>{
        res.status(200).json({result:true,data:[],code:'success'});
    })
    .catch((err)=>{
        console.error(err);
        res.status(500).json(err|{result:false,data:[],code:'unknown_error'});
    });
}

module.exports=insert;