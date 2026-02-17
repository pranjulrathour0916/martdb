Query 

CREATE OR REPLACE FUNCTION get_all_prodbyid(id INT)
RETURNS TABLE (
    p_id INT,
    p_name TEXT,
    price NUMERIC,
    cat_id INT,
    stock INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.p_id,
        p.p_name::TEXT,
        p.price,
        p.cat_id,
        p.stock
    FROM products p WHERE p.p_id = id;
END;
$$;

===================================================================================================================================================

CREATE OR REPLACE FUNCTION get_customer_orders(id INT)
RETURNS TABLE (
   cust_id INT,
   cust_name VARCHAR(100),
   phone NUMERIC,
   ord_id INT,
   ord_date DATE,
   status VARCHAR(50),
   total_amt NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.cust_id,
        c.cust_name,
        c.phone,
        o.ord_id,
        o.ord_date,
        o.status,
        o.total_amt
    FROM orders o JOIN customers c ON c.cust_id = o.cust_id
    WHERE c.cust_id = id;
END;
$$;

===================================================================================================================================================

CREATE OR REPLACE FUNCTION get_cart_items(id INT)
RETURNS TABLE (
   cust_id INT, 
   cart_id INT, 
   p_id INT,
   cust_name VARCHAR(50),
   p_name VARCHAR(50), 
   price NUMERIC,
   quantity NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.cust_id, 
       ca.cart_id, 
       ca.p_id,
       cu.cust_name,
       p.p_name,
       p.price, 
       ca.quantity
    FROM caitems ca JOIN cart c ON c.cart_id = ca.cart_id
JOIN products p ON p.p_id = ca.p_id
JOIN customers cu ON cu.cust_id = c.cust_id
    WHERE cu.cust_id = id;
END;
$$;

===================================================================================================================================================


CREATE OR REPLACE FUNCTION get_customer(phn NUMERIC)
RETURNS TABLE (
   id INT,
   name VARCHAR(50),
   phone NUMERIC,
   email VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.cust_id,
        c.cust_name,
        c.phone,
        c.email
    FROM customers c WHERE c.phone = phn;
END;
$$;

===================================================================================================================================================


CREATE OR REPLACE FUNCTION create_cust(name VARCHAR,phn NUMERIC, email VARCHAR, password VARCHAR)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
new_id INT;
BEGIN
    IF LENGTH (password) < 5 THEN 
    RAISE EXCEPTION 'Password must be at least 5 characters';
    END IF;
    INSERT INTO customers  (cust_name,phone, email, password)
    VALUES (name, phn, email, password)
    RETURNING cust_id INTO new_id;

    RETURN new_id;
END;
$$;

===================================================================================================================================================


CREATE OR REPLACE FUNCTION verfify_cust(phn NUMERIC, pass VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$

BEGIN
    RETURN EXISTS
    (
        SELECT 1 FROM customers c
        WHERE c.phone = phn AND
        c.password = pass
    );
END;
$$;

===================================================================================================================================================

CREATE OR REPLACE FUNCTION verify_existcust(identifier VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$

BEGIN
    RETURN EXISTS
    (
        SELECT 1 FROM customers c
        WHERE c.phone::TEXT = identifier OR
        c.email = identifier
    );
END;
$$;

===================================================================================================================================================


CREATE OR REPLACE FUNCTION cust_pass(identifier VARCHAR)
RETURNS TABLE (
    id INT,
   password VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.cust_id,
        c.password
    FROM customers c WHERE c.phone::TEXT = identifier
    OR c.email = identifier ;
END;
$$;

===================================================================================================================================================


CREATE OR REPLACE FUNCTION insertToken(t_id INT, t_hash TEXT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
new_id INT;
BEGIN
    INSERT INTO refresh_token  (user_id, tokenhash)
    VALUES (t_id, t_hash)
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$;
