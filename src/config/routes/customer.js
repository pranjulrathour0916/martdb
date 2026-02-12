import { Router } from "express";
import pool from "../../db.js";

const router = Router();

router.get("/getallProd", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit)|| 3;
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

router.get("/login/:phone", async (req, res) => {
  try {
    const phone = req.params.phone;
    console.log("phone ", phone)
    const result = await pool.query(`SELECT * FROM get_customer($1)`, [phone])
    res.send(JSON.stringify(result.rows));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error});
  }
});


router.post("/signIn", async (req, res) => {
  try {
    const {name, phone, email, password} = req.body;
    console.log("phone ", phone)
    const result = await pool.query(`SELECT create_cust($1, $2, $3, $4)`, [name,phone,email,password])
    res.send("SigIn Successfull",JSON.stringify(result.rows));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.detail});
  }
});

export default router;
