'use client';

import React, { useState } from 'react';

export default function CreateAgreementForm() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    creatorName: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания');
      }

      setMessage('Договорённость создана успешно!');
      setInviteCode(data.inviteCode);
      setFormData({ title: '', description: '', creatorName: '' });
    } catch (error: any) {
      setMessage('Ошибка: ' + (error.message || 'Что-то пошло не так'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Создать договорённость</h2>
      
      {inviteCode && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded">
          <h3 className="font-bold text-green-800">Код для присоединения:</h3>
          <p className="text-2xl font-mono text-green-900 bg-white p-2 rounded mt-2 text-center">
            {inviteCode}
          </p>
          <p className="text-sm text-green-700 mt-2">
            Скопируйте этот код и отправьте другому участнику. 
            Код показывается только один раз!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Заголовок договорённости *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Например: Покупка общего подарка"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Описание (опционально)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Детали договорённости..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="creatorName" className="block text-sm font-medium text-gray-700 mb-1">
            Ваше имя *
          </label>
          <input
            type="text"
            id="creatorName"
            name="creatorName"
            required
            value={formData.creatorName}
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
          {isLoading ? 'Создание...' : 'Создать договорённость'}
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