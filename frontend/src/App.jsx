import { useState, useEffect } from 'react';

// Simple Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-blue-500';

  return (
    <div className={`${bgColor} text-white px-4 py-3 rounded shadow-lg flex items-center justify-between mb-2 transition-all duration-300 transform translate-y-0 opacity-100`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold text-xl leading-none hover:text-gray-200">&times;</button>
    </div>
  );
};

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter(toast => toast.id !== id));
  };

  const fetchProducts = () => {
    setLoading(true);
    fetch('http://localhost:5001/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching products:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleViewDetails = async (productId, productName) => {
    try {
      const response = await fetch(`http://localhost:5001/api/products/${productId}/view`, {
        method: 'POST',
      });
      if (response.ok) {
        addToast(`Viewed: ${productName}. Demand tracked!`, 'info');
        // Refresh products to show updated views or price
        fetchProducts();
      }
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const handleBuyNow = (product) => {
    setCheckoutProduct(product);
  };

  const confirmPurchase = async () => {
    if (!checkoutProduct) return;
    try {
      const response = await fetch(`http://localhost:5001/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: checkoutProduct.product_id, quantity: 1 }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        addToast(`Successfully purchased 1x ${checkoutProduct.name}!`, 'success');
        // Refresh products to show updated stock, sales, and price
        fetchProducts();
      } else {
        addToast(`Purchase failed: ${data.error}`, 'error');
      }
    } catch (err) {
      console.error('Error checking out:', err);
    } finally {
      setCheckoutProduct(null);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
        {toasts.map(toast => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      {/* Checkout Modal */}
      {checkoutProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="p-6 text-center sm:text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Purchase</h3>
              <p className="text-gray-500 mb-6">Are you sure you want to buy 1x <span className="font-semibold text-gray-800">{checkoutProduct.name}</span>?</p>
              
              <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium text-indigo-900">Total Price:</span>
                  <span className="text-2xl font-black text-indigo-600">₹{parseFloat(checkoutProduct.current_price).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={() => setCheckoutProduct(null)}
                  className="flex-1 bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 py-3 px-4 rounded-xl font-bold transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmPurchase}
                  className="flex-1 bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 py-3 px-4 rounded-xl font-bold transition-all duration-200"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Dynamic Pricing Store
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Prices adapt in real-time based on supply and demand. Watch prices change as items get viewed and bought!
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {products.map((product) => {
            const basePrice = parseFloat(product.base_price);
            const currentPrice = parseFloat(product.current_price);
            
            // Determine price color based on algorithm
            let priceColorClass = "text-gray-900";
            if (currentPrice < basePrice) {
              priceColorClass = "text-green-600"; // Lower than base (sale/low demand)
            } else if (currentPrice > basePrice) {
              priceColorClass = "text-red-500"; // Higher than base (high demand/low stock)
            }

            return (
              <div key={product.product_id} className="group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
                <div className="p-8 flex-grow flex flex-col">
                  
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight pr-4">
                      {product.name}
                    </h3>
                    <div className="flex flex-col items-end">
                      {currentPrice !== basePrice && (
                        <span className="text-sm text-gray-400 line-through mb-1">
                          ₹{basePrice.toFixed(2)}
                        </span>
                      )}
                      <span className={`text-3xl font-black tracking-tight ${priceColorClass}`}>
                        ₹{currentPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm font-medium uppercase tracking-wider mb-6">
                    {product.stock_quantity > 0 ? (
                      <span className="text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                        {product.stock_quantity} Left
                      </span>
                    ) : (
                      <span className="text-red-700 bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                        Out of stock
                      </span>
                    )}
                    <span className="text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                      {product.sold_count} Sold
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-6 flex gap-3">
                    <button 
                      onClick={() => handleViewDetails(product.product_id, product.name)}
                      className="flex-1 bg-white text-indigo-600 border-2 border-indigo-100 hover:border-indigo-600 py-3 px-4 rounded-xl font-bold transition-colors duration-200"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => handleBuyNow(product)}
                      disabled={product.stock_quantity <= 0}
                      className="flex-1 bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 py-3 px-4 rounded-xl font-bold transition-all duration-200 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                      Buy Now
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
        
        {products.length === 0 && !loading && (
          <div className="text-center text-gray-500 mt-20 text-xl font-medium">
            No products found. Add some to your database!
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
