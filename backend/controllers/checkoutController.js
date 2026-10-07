const pool = require('../db');

exports.processCheckout = async (req, res) => {
  try {
    // Assuming the payload is something like: { productId: 1, quantity: 2 }
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'productId and quantity are required' });
    }

    // Since we are mocking the order insertion, we could create an Orders table later.
    // For now, let's just log the mock order, or if the Orders table exists, we could insert.
    // Assuming the user might add an Orders table, we'll wrap it in a transaction to be safe.
    
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update the Product's sold_count and stock_quantity
      const [updateResult] = await connection.query(
        'UPDATE Products SET stock_quantity = stock_quantity - ?, sold_count = sold_count + ? WHERE product_id = ? AND stock_quantity >= ?',
        [quantity, quantity, productId, quantity]
      );

      if (updateResult.affectedRows === 0) {
        await connection.rollback();
        return res.status(400).json({ error: 'Product not found or insufficient stock' });
      }

      // Mock Order Insertion (Assuming a simple Orders table might look like this, we skip actual insertion to prevent errors if the table doesn't exist)
      console.log(`Mock Order Processed: Product ${productId}, Quantity: ${quantity}`);
      // await connection.query('INSERT INTO Orders (product_id, quantity) VALUES (?, ?)', [productId, quantity]);

      await connection.commit();
      res.json({ message: 'Checkout successful, stock and sales updated' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
