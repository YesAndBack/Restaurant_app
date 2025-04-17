import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    const token = localStorage.getItem("booking_access_token");

    try {
      const response = await fetch("http://localhost:8001/rest/restaurants/create-checkout-session/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);
      window.location.href = data.checkout_url; // Перенаправление на Stripe Checkout
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при запуске оплаты");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-6">Оплатите 10 USD</h2>
        <p className="text-gray-600 mb-4">Нажмите кнопку ниже, чтобы перейти к оплате.</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Загрузка..." : "Оплатить через Stripe"}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;