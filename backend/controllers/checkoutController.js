const pool = require('../db');

exports.processCheckout = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'productId and quantity are required' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Get the current price and check stock
      const [products] = await connection.query(
        'SELECT current_price, stock_quantity FROM Products WHERE product_id = ?',
        [productId]
      );

      if (products.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Product not found' });
      }

      const product = products[0];
      if (product.stock_quantity < quantity) {
        await connection.rollback();
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      const totalAmount = product.current_price * quantity;

      // 2. Insert into Orders (leaving user_id NULL for mock checkout)
      const [orderResult] = await connection.query(
        'INSERT INTO Orders (total_amount) VALUES (?)',
        [totalAmount]
      );
      const orderId = orderResult.insertId;

      // 3. Insert into Order_Items (this will fire the trigger to update Products)
      await connection.query(
        'INSERT INTO Order_Items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
        [orderId, productId, quantity, product.current_price]
      );

      // 4. Immediately update prices based on new stock/sales metrics
      await connection.query('CALL UpdateDynamicPrices()');

      await connection.commit();
      res.json({ message: 'Checkout successful, order placed and inventory updated via triggers!' });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
    
  } catch (err) {
    console.error('Checkout Error:', err);
    res.status(500).json({ error: 'Server error during checkout' });
  }
};
