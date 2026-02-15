import { Router } from "express";
import pool from "../../db.js";
import bcrypt, { genSalt, hash } from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../generateToken.js";
import { validateLogin, validateSignUP } from "../../middleware/validators.js";

const router = Router();

router.get("/getallProd", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const result = await pool.query(`select * from get_all_prod() LIMIT $1`, [
      limit,
    ]);
    res.send(JSON.stringify(result.rows));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Ftech Customers details for login

router.get("/cust/:phone", async (req, res) => {
  try {
    const phone = req.params.phone;
    console.log("phone ", phone);
    const result = await pool.query(`SELECT * FROM get_customer($1)`, [phone]);
    res.send(JSON.stringify(result.rows));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
});

// SignIn User api require name, phone, email and password

router.post("/signUp", validateSignUP,async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    const chkphn = await pool.query(`SELECT verify_existcust($1)`, [phone]);
    const chkmail = await pool.query(`SELECT verify_existcust($1)`, [email]);
    if (chkphn.rows[0].verify_existcust || chkmail.rows[0].verify_existcust)
      return res.status(400).send("Mobile number or email already exist");
    const salt = await bcrypt.genSalt(10);
    const hashpass = await bcrypt.hash(password, salt);
    const user = await pool.query(`SELECT create_cust($1, $2, $3, $4)`, [
      name,
      phone,
      email,
      hashpass,
    ]);
   return res.status(201).send({ message: "User created" });
  } catch (error) {
    console.error("SignUp Error:", error.message);
    return res.status(500).json({ 
      error: "An unexpected error occurred during registration" 
    });
  }
});

// Login user with phone number and password

router.get("/login", validateLogin,async (req, res) => {
  try {
   const {phone, password} = req.body;
   const pass = await pool.query(`select cust_pass($1)`,[phone]);
   console.log(pass.rows[0].cust_pass)
    if (pass.rowCount>0) 
    {  const compPass = await bcrypt.compare(password,pass.rows[0].cust_pass)
      console.log("bcrrpt",compPass);
      if(compPass)
      {
        generateAccessToken();
        const token = generateRefreshToken();
        console.log("refresh token", token)
        // const saveToken = await pool.query(`select insertToken{$1},{$2}`[])
        res.status(200).send("Login Successfull");
      }
      else
        res.status(400).send("Inavlid Credetials");
    }
     else
        res.status(400).send("Inavlid Credetials");
 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.detail });
  }
});

export default router;
