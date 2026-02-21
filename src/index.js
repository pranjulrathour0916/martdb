import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import pool from './db.js';
const app = express();
import router from './config/routes/customer.js';
import { express as useragentMiddleware } from 'express-useragent';
import geoip from 'geoip-lite';
import prodRouter from './config/routes/prodcts.js'

app.set('trust proxy', true);
app.use(express.json());

app.use(cors());
app.use(useragentMiddleware());



app.get('/mart', async(req, res)=>{
    const result = await pool.query('SELECT NOW()');
    res.send(result.rows);
})

app.post("/getDevice", async (req, res) => {
  const ip = req.ip;
console.log("working")
  const deviceInfo = {
    browser: req.useragent.browser,
    os: req.useragent.os,
    platform: req.useragent.platform
  };

const geo = geoip.lookup(ip) || { country: 'Local/Unknown', city: 'Local' };

  const loginDetails = {
    ip,
    deviceInfo,
    location: geo
  };

  console.log("login details are",loginDetails);

 res.json({ 
    message: "Login attempt recorded",
    data: loginDetails 
  });
});

app.use('/', router);
app.use('/prod',prodRouter )
app.listen(process.env.PORT,()=>{
    console.log(`Server is runnning on port ${process.env.PORT}`)
})

