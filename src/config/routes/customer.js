import { Router } from "express";
import pool from "../../db.js";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../generateToken.js";
import { validateLogin, validateSignUP } from "../../middleware/validators.js";
import cypto from "crypto";

const router = Router();




// SignIn User api require name, phone, email and password

router.post("/signUp", validateSignUP, async (req, res) => {
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
      error: "An unexpected error occurred during registration",
    });
  }
});

// Login user with phone number and password

router.post("/login", validateLogin, async (req, res) => {
  try {
    const { phone, password } = req.body;
    //Fteching password from DB 
    const pass = await pool.query(`select (cust_pass($1)).*`, [phone]);
    if (pass.rowCount > 0) {
      //Comapring password
      const compPass = await bcrypt.compare(password, pass.rows[0].password);
      if (compPass) {
        // Geerating access and referesh tokens
        const accessToken = generateAccessToken(pass);
        const refreshToken = generateRefreshToken(pass.rows[0]);

        // For security reasons first hash the refresh token and then save it in DB
        const hashedRefreshToken = cypto
          .createHash("sha256") // sha256 is an algorithm
          .update(refreshToken) // updating what we are storing 
          .digest("hex"); // using hex for more readable format
        const saveToken = await pool.query(`select inserttoken ($1 ,$2)`, [
          pass.rows[0].id,
          hashedRefreshToken,
        ]);
        // Saving refreshtoken in cookie
        res.cookie("refreshtoken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // it becomes 7 days
        });
        res.status(200).json({
          message: "Login Successful",
          accessToken,
        });
      } else res.status(400).send("Inavlid Credetials");
    } else res.status(400).send("Inavlid Credetials");
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.detail });
  }
});

// Refresh route 

router.post('/refreshToke', async(req, res)=>{
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).send("No refresh token");
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res.status(403).send("Invalid refresh token");
    }

    //  Hash incoming token
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Check DB
    const tokenResult = await pool.query(
      `SELECT * FROM refresh_tokens WHERE token_hash = $1`,
      [hashedToken]
    );

    if (tokenResult.rowCount === 0) {
      return res.status(403).send("Refresh token not found");
    }

    // Delete old token (rotation)
    await pool.query(
      `DELETE FROM refresh_tokens WHERE token_hash = $1`,
      [hashedToken]
    );

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      id: decoded.id
    });

    const newRefreshToken = generateRefreshToken({
      id: decoded.id
    });

    const newHashedToken = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    //  Store new refresh token
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash)
       VALUES ($1, $2)`,
      [decoded.id, newHashedToken]
    );

    // Send new cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      accessToken: newAccessToken
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }

})

//Logout route pending

export default router;
