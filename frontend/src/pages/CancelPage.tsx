import React from "react";

const CancelPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Оплата отменена</h2>
        <p className="text-gray-700">Вы отменили оплату. Попробуйте снова, если хотите продолжить.</p>
      </div>
    </div>
  );
};

export default CancelPage;