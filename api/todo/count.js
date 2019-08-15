const fs=require('fs');

const count=(req,res)=>{
    let all=0,dead=0,done=0,impending=0,star0=0,star1=0,star2=0,undone=0;
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
    const All=(todos)=>{
        return new Promise((resolve,reject)=>{
            all=todos['rows'].length;
            resolve(todos);
        });
    }
    const Dead=(todos)=>{
        return new Promise((resolve,reject)=>{
            for(let i=0;i<todos['rows'].length;i++){
                if(todos['rows'][i]['td_is_done']==0 && todos['rows'][i]['td_deadline'].replace(/-/g,'/')-new Date()<0){
                    dead++;
                }
            }
            resolve(todos);
        });
    }
    const Done=(todos)=>{
        return new Promise((resolve,reject)=>{
            for(let i=0;i<todos['rows'].length;i++){
                if(todos['rows'][i]['td_is_done']==1){
                    done++;
                }
            }
            resolve(todos);
        });
    }
    const Impending=(todos)=>{
        return new Promise((resolve,reject)=>{
            for(let i=0;i<todos['rows'].length;i++){
                if(todos['rows'][i]['td_deadline'].replace(/-/g,'/')-new Date()>=0 && todos['rows'][i]['td_is_done']==0){
                    impending++
                }
            }
            resolve(todos);
        });
    }
    const Star=(todos)=>{
        return new Promise((resolve,reject)=>{
            for(let i=0;i<todos['rows'].length;i++){
                if(todos['rows'][i]['td_star']==0){
                    star0++;
                }
                else if(todos['rows'][i]['td_star']==1){
                    star1++;
                }
                else{
                    star2++;
                }
            }
            resolve(todos);
        });
    }
    const Undone=(todos)=>{
        return new Promise((resolve,reject)=>{
            for(let i=0;i<todos['rows'].length;i++){
                if(todos['rows'][i]['td_is_done']==0){
                    undone++;
                }
            }
            resolve();
        });
    }

    GetTodo()
    .then(All)
    .then(Dead)
    .then(Done)
    .then(Impending)
    .then(Star)
    .then(Undone)
    .then(()=>{
        res.status(200).json({result:true,code:'success',data:{all:all,dead:dead,done:done,impending:impending,star0:star0,star1:star1,star2:star2,undone:undone}});
    })
    .catch((err)=>{
        res.status(500).json(err|{result:false,code:'unknown_error',data:[]});
    });

}

module.exports=count;