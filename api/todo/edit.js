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

const edit=(req,res)=>{
    let no=Number(req.body.no);
    let star=req.body.no;
    let subject=req.body.subject;
    let content=req.body.content;
    let deadline=req.body.deadline;
    let isDone=req.body.is_done;
    const DataCheck=()=>{
        return new Promise((resolve,reject)=>{
            if(!no){
                reject({result:false,code:'empty_param'});
            }
            else{
                resolve();
            }
        });
    }
    const GetNoti=()=>{
        return new Promise((resolve,reject)=>{
            fs.readFile('./models/notification.json',(err,data)=>{
                if(err){
                    throw err;
                }
                let noti=JSON.parse(data);
                resolve(noti);
            });
        });
    }
    const EditNoti=(noti)=>{
        return new Promise((resolve,reject)=>{
            if(isDone==1){
                let newNoti={
                    nt_no:noti['nt_last_no']+1,
                    nt_type:'done',
                    td_no:no,
                    nt_registered_at:dateFormatter()
                }
                noti['rows'].push(newNoti);
                noti['nt_last_no']++;
                fs.writeFile('./models/notification.json',JSON.stringify(noti),(err,data)=>{
                    if(err){
                        throw err;
                    }
                    resolve();
                });
            }
            else if(isDone==0){
                for(let i=0;i<noti['rows'].length;i++){
                    if(noti['rows'][i]['nt_type']=='done' && noti['rows'][i]['td_no']==no){
                        noti['rows'].splice(i,1);
                    }
                }
                fs.writeFile('./models/notification.json',JSON.stringify(noti),(err)=>{
                    if(err){
                        throw err;
                    }
                    resolve();
                });
            }
            else if(subject || content || deadline){
                let newNoti={
                    nt_no:noti['nt_last_no']+1,
                    nt_type:'edit',
                    td_no:no,
                    nt_registered_at:dateFormatter()
                }
                noti['rows'].push(newNoti);
                noti['nt_last_no']++;
                fs.writeFile('./models/notification.json',JSON.stringify(noti),(err)=>{
                    if(err){
                        throw err;
                    }
                    resolve();
                });
            }
            else {
                for(let i=0;i<noti['rows'].length;i++){
                    if(noti['rows'][i]['nt_type']=='star' && noti['rows'][i]['td_no']==no){
                        noti['rows'].splice(i,1);
                        break;
                    }
                }
                let newNoti={
                    nt_no:noti['nt_last_no']+1,
                    nt_type:'star',
                    td_no:no,
                    nt_registered_at:dateFormatter()
                }
                noti['rows'].push(newNoti);
                noti['nt_last_no']++;
                fs.writeFile('./models/notification.json',JSON.stringify(noti),(err)=>{
                    if(err){
                        throw err;
                    }
                    resolve();
                });
            }
        });
    }
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
    const EditTodo=(todos)=>{
        return new Promise((resolve,reject)=>{
            for(let i=0;i<todos['rows'].length;i++){
                if(no==todos['rows'][i]['td_no']){
                    if(!subject){
                        subject=todos['rows'][i]['td_subject'];
                    }
                    if(!content){
                        content=todos['rows'][i]['td_content'];
                    }
                    if(!deadline){
                        deadline=todos['rows'][i]['td_deadline'];
                    }
                    if(!star){
                        star=todos['rows'][i]['td_star'];
                    }
                    if(!isDone){
                        isDone=todos['rows'][i]['td_is_done'];
                    }
                    todos['rows'][i]={
                        td_no:no,
                        td_subject:subject,
                        td_content:content,
                        td_deadline:deadline,
                        td_star:star,
                        td_is_done:isDone,
                        td_is_registered_at:todos['rows'][i]['td_is_registered_at']
                    }
                    fs.writeFile('./models/todo.json',JSON.stringify(todos),(err)=>{
                        if(err){
                            throw err;
                        }
                        resolve();
                    });
                    break;
                }
            }
        });
    }
    DataCheck()
    .then(GetNoti)
    .then(EditNoti)
    .then(GetTodo)
    .then(EditTodo)
    .then(()=>{
        res.status(200).json({result:true,code:'success'});
    })
    .catch((err)=>{
        console.error(err);
        res.status(500).json(err|{result:false,code:'unknown_error'});
    });
}

module.exports=edit;