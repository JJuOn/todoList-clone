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
    const star=req.body.star;
    const subject=req.body.subject;
    const content=req.body.content;
    const deadline=req.body.deadline;
    const currentTime=dateFormatter();
    console.log(currentTime);

    const DataCheck=()=>{
        return new Promise((resolve,reject)=>{
            if(!star || !subject || !content || !deadline){
                reject({message:'Request body is undefined.'});
            }
            else{
                resolve()
            }
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
                    console.log(todos);
                    resolve(todos);
                }
            });
        });
    }

    const DoInsert=(todos)=>{
        return new Promise((resolve,reject)=>{
            const newTodo={
                td_no:todos.td_last_no+1,
                td_subject:subject,
                td_content:content,
                td_deadline:deadline,
                td_star:star,
                td_is_done:0,
                td_registerd_at:currentTime
            }
            todos['rows'].push(newTodo);
            todos['td_last_no']++;
            resolve(todos);
        });
    }

    const Save=(todos)=>{
        return new Promise((resolve,reject)=>{
            fs.writeFile('./models/todo.json',JSON.stringify(todos),(err)=>{
                if(err){
                    throw err;
                }
                resolve();
            });
        });
    }

    DataCheck()
    .then(GetTodo)
    .then(DoInsert)
    .then(Save)
    .then(()=>{
        res.status(200).json({message:'Success'});
    })
    .catch((err)=>{
        res.status(500).json(err | err.message);
    });
}

module.exports=insert;