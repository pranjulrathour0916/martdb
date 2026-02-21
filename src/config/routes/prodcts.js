import { Router } from "express";
import pool from "../../db.js";


const router = Router();

router.get("/getallProd", async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const category = req.query.category;
    if(category)
       {
         const result = await pool.query(`select * from get_all_prodFilter($1)`,[category])
          res.send(JSON.stringify(result.rows));
       }
   else
   {
    const result = await pool.query(`select * from get_all_prod($1)`, [
      limit,
    ]);
     res.send(JSON.stringify(result.rows));
   }
   
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;