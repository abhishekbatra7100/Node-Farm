const mongoose=require('mongoose');
const dotenv=require('dotenv');
const { Double } = require('bson');

dotenv.config({path:'./config.env'});
const db=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

var app=require('./index2');

mongoose.connect(db,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true
}).then( () => {
//   console.log(con.connections);
  console.log('DB sucessfully connected');  
});

const port=process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`port is running on the port i.e. ${port}...`);
})