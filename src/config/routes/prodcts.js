import { Router } from "express";
import pool from "../../db.js";
import { authenticateUser } from "../../middleware/authenticate.js";

const router = Router();

// API for fecthing alll products with filter or limit

router.get("/getallProd", async (req, res) => {
  try {
    const limit = req.query.limit || 20;
    const category = req.query.category;
    if (category) {
      const result = await pool.query(`select * from get_all_prodFilter($1)`, [
        category,
      ]);
      res.send(JSON.stringify(result.rows));
    } else {
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

// API for orders using middleware for authenticting user

router.get("/getorders", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("requested user ", userId);
    const result = await pool.query(`SELECT * FROM get_orders($1)`, [userId]);
    if (result.rowCount > 0) return res.status(200).send(result.rows[0]);
    else return res.status(200).json({ messgae: "No orders placed yet" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
