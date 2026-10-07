const pool = require('./db');

async function seedProducts() {
  const products = [
    {
      name: 'Wireless Noise-Canceling Headphones',
      base_price: 299.99,
      current_price: 299.99,
      stock_quantity: 50,
      views_count: 0,
      sold_count: 0
    },
    {
      name: 'Smart Home Security Camera',
      base_price: 149.99,
      current_price: 135.00,
      stock_quantity: 120,
      views_count: 50,
      sold_count: 10
    },
    {
      name: 'Ultra-Slim 4K Monitor',
      base_price: 399.50,
      current_price: 420.00, // higher demand/low stock example
      stock_quantity: 15,
      views_count: 300,
      sold_count: 45
    },
    {
      name: 'Mechanical Gaming Keyboard',
      base_price: 129.99,
      current_price: 129.99,
      stock_quantity: 80,
      views_count: 10,
      sold_count: 2
    }
  ];

  try {
    for (const product of products) {
      await pool.query(
        'INSERT INTO Products (name, base_price, current_price, stock_quantity, views_count, sold_count) VALUES (?, ?, ?, ?, ?, ?)',
        [product.name, product.base_price, product.current_price, product.stock_quantity, product.views_count, product.sold_count]
      );
    }
    console.log('✅ Products seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
  } finally {
    process.exit(0);
  }
}

seedProducts();
