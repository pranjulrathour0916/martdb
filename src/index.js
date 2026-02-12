import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import pool from './db.js';
const app = express();
import router from './config/routes/customer.js';

app.use(express.json());

app.use(cors());


app.get('/mart', async(req, res)=>{
    const result = await pool.query('SELECT NOW()');
    res.send(result.rows);
})
app.use('/', router);
app.listen(process.env.PORT,()=>{
    console.log(`Server is runnning on port ${process.env.PORT}`)
})

