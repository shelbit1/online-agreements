'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const translations = {
  ru: {
    title: "Онлайн-договорённости",
    subtitle: "Создавайте и подтверждайте договорённости без участия юриста",
    agreementCreated: "Договорённость создана!",
    copyCode: "Скопируйте этот код и отправьте другому участнику. Через 3 секунды вы перейдете к договорённости.",
    createTab: "Создать договорённость",
    joinTab: "Присоединиться",
    createTitle: "Создать новую договорённость",
    joinTitle: "Присоединиться к договорённости",
    agreementName: "Название договорённости *",
    agreementNamePlaceholder: "Например: Покупка общего подарка",
    description: "Описание",
    descriptionPlaceholder: "Краткое описание договорённости...",
    yourName: "Ваше имя *",
    yourNamePlaceholder: "Иван Иванов",
    inviteCode: "Код приглашения *",
    inviteCodePlaceholder: "Введите код приглашения",
    participantNamePlaceholder: "Мария Петрова",
    creating: "Создание...",
    createButton: "Создать договорённость",
    joining: "Присоединение...",
    joinButton: "Присоединиться",
    infoText: "Создавайте неформальные договорённости между двумя сторонами.",
    infoText2: "Никаких регистраций - только имена и коды приглашений."
  },
  en: {
    title: "Online Agreements",
    subtitle: "Create and confirm agreements without lawyer involvement",
    agreementCreated: "Agreement created!",
    copyCode: "Copy this code and send it to the other participant. You will be redirected to the agreement in 3 seconds.",
    createTab: "Create Agreement",
    joinTab: "Join Agreement",
    createTitle: "Create New Agreement",
    joinTitle: "Join Agreement",
    agreementName: "Agreement Name *",
    agreementNamePlaceholder: "e.g., Buying a shared gift",
    description: "Description",
    descriptionPlaceholder: "Brief description of the agreement...",
    yourName: "Your Name *",
    yourNamePlaceholder: "John Doe",
    inviteCode: "Invitation Code *",
    inviteCodePlaceholder: "Enter invitation code",
    participantNamePlaceholder: "Jane Smith",
    creating: "Creating...",
    createButton: "Create Agreement",
    joining: "Joining...",
    joinButton: "Join Agreement",
    infoText: "Create informal agreements between two parties.",
    infoText2: "No registration required - just names and invitation codes."
  }
};

export default function HomePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const t = translations[language];

  // Состояние для создания договорённости
  const [createData, setCreateData] = useState({
    title: '',
    description: '',
    creatorName: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  // Состояние для присоединения
  const [joinData, setJoinData] = useState({
    inviteCode: '',
    participantName: '',
  });
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      const response = await fetch('/api/agreements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка создания');
      }

      setInviteCode(data.inviteCode);
      // Переходим к договорённости
      setTimeout(() => {
        router.push(`/agreement/${data.agreement.id}?name=${encodeURIComponent(createData.creatorName)}&lang=${language}`);
      }, 3000);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Ошибка создания');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinLoading(true);
    setJoinError('');

    try {
      const response = await fetch('/api/agreements/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(joinData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка присоединения');
      }

      // Переходим к договорённости
      router.push(`/agreement/${data.agreement.id}?name=${encodeURIComponent(joinData.participantName)}&lang=${language}`);
    } catch (err) {
      setJoinError(err instanceof Error ? err.message : 'Ошибка присоединения');
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Переключатель языка */}
        <div className="flex justify-end mb-4">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200">
            <button
              onClick={() => setLanguage('ru')}
              className={`px-3 py-1 text-sm font-medium rounded-l-lg ${
                language === 'ru' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-sm font-medium rounded-r-lg ${
                language === 'en' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.title}
          </h1>
          <p className="text-gray-600">
            {t.subtitle}
          </p>
        </div>

        {/* Код приглашения (показываем если создали) */}
        {inviteCode && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded">
            <h3 className="font-bold text-green-800">{t.agreementCreated}</h3>
            <p className="text-2xl font-mono text-green-900 bg-white p-2 rounded mt-2 text-center">
              {inviteCode}
            </p>
            <p className="text-sm text-green-700 mt-2">
              {t.copyCode}
            </p>
          </div>
        )}

        {/* Вкладки */}
        <div className="flex rounded-lg bg-gray-200 p-1 mb-6">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.createTab}
          </button>
          <button
            onClick={() => setActiveTab('join')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'join'
                ? 'bg-white text-gray-900 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t.joinTab}
          </button>
        </div>

        {/* Форма создания */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t.createTitle}</h2>
            
            {createError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {createError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.agreementName}
                </label>
                <input
                  type="text"
                  value={createData.title}
                  onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.agreementNamePlaceholder}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.description}
                </label>
                <textarea
                  value={createData.description}
                  onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={t.descriptionPlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.yourName}
                </label>
                <input
                  type="text"
                  value={createData.creatorName}
                  onChange={(e) => setCreateData({ ...createData, creatorName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.yourNamePlaceholder}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={createLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {createLoading ? t.creating : t.createButton}
              </button>
            </div>
          </form>
        )}

        {/* Форма присоединения */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">{t.joinTitle}</h2>
            
            {joinError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {joinError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.inviteCode}
                </label>
                <input
                  type="text"
                  value={joinData.inviteCode}
                  onChange={(e) => setJoinData({ ...joinData, inviteCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.inviteCodePlaceholder}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.yourName}
                </label>
                <input
                  type="text"
                  value={joinData.participantName}
                  onChange={(e) => setJoinData({ ...joinData, participantName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.participantNamePlaceholder}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={joinLoading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                {joinLoading ? t.joining : t.joinButton}
              </button>
            </div>
          </form>
        )}

        {/* Информация */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            {t.infoText}
            <br />
            {t.infoText2}
          </p>
        </div>
      </div>
    </div>
  );
}
