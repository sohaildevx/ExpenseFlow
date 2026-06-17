import React, { useState } from 'react';
import { useRazorpay } from '../context/razorpayContext';

const SupportButton = () => {
  const { createOrder, verifyPayment, loading } = useRazorpay();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    supportName: '',
    supportMsg: ''
  });

  const handlePayment = async () => {
    try {
      
      const orderResult = await createOrder(formData.supportName, formData.supportMsg);

      if (!orderResult.success) {
        alert(orderResult.message);
        return;
      }

      const { order, key } = orderResult;

      
      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: 'ExpenseFlow',
        description: 'Support Developer',
        order_id: order.id,
        handler: async function (response) {
          const verifyResult = await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          if (verifyResult.success) {
            alert('Thank you for your support! 🎉');
            setShowModal(false);
            setFormData({ supportName: '', supportMsg: '' });
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.supportName,
        },
        theme: {
          color: '#FACC15' 
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        alert('Payment failed. Please try again.');
      });

      rzp.open();
    } catch (error) {
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <>
      
      <button
        onClick={() => setShowModal(true)}
        className="w-full font-black text-lg uppercase text-yellow-400 bg-black border-4 border-black py-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
      >
        Support the Project
      </button>

    
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
            
            <div className="bg-yellow-400 border-b-4 border-black p-4">
              <h2 className="font-black text-2xl uppercase">Support Developer</h2>
            </div>

            
            <div className="p-6 space-y-4">
              <div className="bg-yellow-100 border-2 border-black p-4">
                <p className="font-bold text-center text-3xl">₹49</p>
                <p className="font-bold text-center text-sm mt-1">One-time support</p>
              </div>

              
              <div>
                <label className="block font-black text-sm uppercase mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.supportName}
                  onChange={(e) => setFormData({ ...formData, supportName: e.target.value })}
                  placeholder="Anonymous"
                  className="w-full border-4 border-black px-4 py-2 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                />
              </div>

              
              <div>
                <label className="block font-black text-sm uppercase mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={formData.supportMsg}
                  onChange={(e) => setFormData({ ...formData, supportMsg: e.target.value })}
                  placeholder="Leave a message..."
                  rows="3"
                  className="w-full border-4 border-black px-4 py-2 font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 resize-none"
                />
              </div>

              
              <div className="bg-black text-yellow-400 border-2 border-black p-3">
                <p className="font-bold text-xs leading-relaxed">
                  Your support helps keep ExpenseFlow free and running for everyone. Thank you!
                </p>
              </div>

              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 font-black uppercase text-black bg-white border-4 border-black py-2 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 font-black uppercase text-yellow-400 bg-black border-4 border-black py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Pay ₹49'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportButton;