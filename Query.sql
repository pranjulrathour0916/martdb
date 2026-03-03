Query 

CREATE OR REPLACE FUNCTION get_all_prod(lim INT)
RETURNS TABLE (
    p_id INT,
    p_name TEXT,
    price NUMERIC,
    cat_id INT,
    img TEXT,
    descrip TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name::TEXT,
        p.price,
        p.cat_id,
        p.image,
        p.description
    FROM products LIMIT lim;
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

==============================================================================================================================================

CREATE OR REPLACE FUNCTION get_all_prodFilter(identifier TEXT )
RETURNS TABLE (
    p_id INT,
    p_name TEXT,
    price NUMERIC,
    cat_id INT,
    img TEXT,
    descrip TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.title::TEXT,
        p.price,
        p.cat_id,
        p.image,
        p.description
    FROM products p JOIN category c on p.cat_id = c.cat_id 
    WHERE p.cat_id :: TEXT = identifier 
    OR c.category = identifier;
END;
$$;

==============================================================================================================================================

select c.cust_name, o.total_amt, o.date, o.id, p.image, p.description, p.title, oi.id
from orders o 
left join customers c on c.cust_id = o.cust_id
left join orditems oi on oi.ord_id = o.id
left join products p on p.id = oi.p_id where c.cust_id = 1;

==============================================================================================================================================

CREATE OR REPLACE FUNCTION get_orders(identifier INT )
RETURNS TABLE (
    name VARCHAR,
    totalamt NUMERIC,
    ordDate TIMESTAMP,
    id INT,
    img TEXT,
    descrip TEXT,
    prodName TEXT,
    orderID INT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT c.cust_name, 
       o.total_amt, 
       o.date, 
       o.id, 
       p.image, 
       p.description, 
       p.title, 
       oi.id
FROM customers c
LEFT JOIN orders o ON c.cust_id = o.cust_id
LEFT JOIN orditems oi ON oi.ord_id = o.id
LEFT JOIN products p ON p.id = oi.p_id
WHERE c.cust_id = 1;
END;
$$;

===================================================================================================================================================



create table cart ( id serial primary key, cust_id int, p_id int, quantity numeric,
foreign key (cust_id) references customer (cust_id),
foreign key (p_id) references products (p_id));
CREATE TABLE

================================================================================================================================================


CREATE OR REPLACE FUNCTION prodbyid(identifier INT)
RETURNS TABLE (
    p_id INT,
    title TEXT,
    price NUMERIC,
    cat_id INT,
    img TEXT,
    descrip TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.title::TEXT,
        p.price,
        p.cat_id,
        p.image,
        p.description
    FROM products p WHERE p.id = identifier;
END;
$$;

===================================================================================================================================================


CREATE OR REPLACE FUNCTION addtocart( c_id INT,prod_id INT, quantity NUMERIC)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
new_id INT;
BEGIN
    INSERT INTO cart (cust_id, p_id, quantity)
    VALUES (c_id, prod_id, quantity)
    ON CONFLICT (cust_id, p_id)
    DO UPDATE
    SET quantity = cart.quantity + EXCLUDED.quantity
    RETURNING cust_id INTO new_id;

    RETURN new_id;
END;
$$;


===================================================================================================================================================
CREATE OR REPLACE FUNCTION cartItem(identifier INT)
RETURNS TABLE (
    prod_id INT,
    prod_title TEXT,
    prod_price NUMERIC,
    prod_img TEXT,
    prod_descrip TEXT,
    prod_quantity NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.title::TEXT,
        p.price,
        p.image,
        p.description,
        c.quantity
    FROM cart c JOIN products p on p.id = c.p_id
    WHERE cust_id = identifier;
END;
$$;