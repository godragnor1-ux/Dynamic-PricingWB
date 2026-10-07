const checkout = require('./controllers/checkoutController');
const pool = require('./db');

async function test() {
  const req = { body: { productId: 405, quantity: 2 } };
  const res = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { console.log('Response:', this.statusCode || 200, data); }
  };
  
  console.log("Before checkout:");
  const [before] = await pool.query('SELECT stock_quantity, sold_count FROM Products WHERE product_id = 405');
  console.log(before[0]);
  
  await checkout.processCheckout(req, res);
  
  console.log("After checkout:");
  const [after] = await pool.query('SELECT stock_quantity, sold_count FROM Products WHERE product_id = 405');
  console.log(after[0]);
  
  process.exit(0);
}

test();
