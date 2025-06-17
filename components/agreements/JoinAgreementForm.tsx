'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinAgreementForm() {
  const [formData, setFormData] = useState({
    inviteCode: '',
    participantName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/agreements/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка присоединения');
      }

      setMessage('Вы успешно присоединились!');
      
      // Перенаправляем на страницу договорённости
      setTimeout(() => {
        router.push(`/agreements/${data.agreement.id}?name=${encodeURIComponent(formData.participantName)}`);
      }, 1000);

    } catch (error: any) {
      setMessage('Ошибка: ' + (error.message || 'Что-то пошло не так'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Присоединиться к договорённости</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-1">
            Код приглашения *
          </label>
          <input
            type="text"
            id="inviteCode"
            name="inviteCode"
            required
            value={formData.inviteCode}
            onChange={handleInputChange}
            placeholder="Введите код приглашения"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="participantName" className="block text-sm font-medium text-gray-700 mb-1">
            Ваше имя *
          </label>
          <input
            type="text"
            id="participantName"
            name="participantName"
            required
            value={formData.participantName}
            onChange={handleInputChange}
            placeholder="Введите ваше имя"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Присоединение...' : 'Присоединиться'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded ${
          message.includes('Ошибка') 
            ? 'bg-red-100 text-red-700 border border-red-300' 
            : 'bg-green-100 text-green-700 border border-green-300'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
} 