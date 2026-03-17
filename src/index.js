import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import pool from './db.js';
const app = express();
import router from './config/routes/customer.js';
import { express as useragentMiddleware } from 'express-useragent';
import geoip from 'geoip-lite';
import prodRouter from './config/routes/prodcts.js'
import cookieParser from 'cookie-parser';

app.set("trust proxy", 1);
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(cookieParser())
const PORT = process.env.PORT || 5000;


const allowedOrigins = [
  "http://localhost:3000",
  "https://my-mart-two.vercel.app"
];

app.use(useragentMiddleware());
app.options("*", cors());

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

