'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Agreement } from '@/lib/types';

const translations = {
  ru: {
    loading: "Загрузка договорённости...",
    backToHome: "Вернуться на главную",
    notFound: "Договорённость не найдена",
    inviteCode: "Код приглашения:",
    participants: "Участники",
    creator: "Создатель",
    agreed: "✓ Согласился",
    waiting: "Ожидает",
    agreeButton: "✓ Я согласен с условиями",
    confirming: "Подтверждение...",
    statusAgreed: "Договорённость подтверждена",
    statusPending: "Ожидает подтверждения",
    statusDraft: "Черновик",
    checklist: "Чек-лист условий",
    addCondition: "Добавить новое условие...",
    deadline: "Срок:",
    adding: "Добавление...",
    addButton: "Добавить пункт",
    noConditions: "Пока нет условий в чек-листе",
    chat: "Чат",
    noMessages: "Пока нет сообщений",
    writeMessage: "Написать сообщение...",
    sending: "...",
    sendButton: "Отправить",
    joinToParticipate: "Присоединитесь к договорённости",
    enterName: "Введите ваше имя *",
    joinButton: "Присоединиться"
  },
  en: {
    loading: "Loading agreement...",
    backToHome: "Back to Home",
    notFound: "Agreement not found",
    inviteCode: "Invitation Code:",
    participants: "Participants",
    creator: "Creator",
    agreed: "✓ Agreed",
    waiting: "Waiting",
    agreeButton: "✓ I agree to the terms",
    confirming: "Confirming...",
    statusAgreed: "Agreement confirmed",
    statusPending: "Awaiting confirmation",
    statusDraft: "Draft",
    checklist: "Terms Checklist",
    addCondition: "Add new condition...",
    deadline: "Deadline:",
    adding: "Adding...",
    addButton: "Add Item",
    noConditions: "No conditions in the checklist yet",
    chat: "Chat",
    noMessages: "No messages yet",
    writeMessage: "Write a message...",
    sending: "...",
    sendButton: "Send",
    joinToParticipate: "Join the agreement",
    enterName: "Enter your name *",
    joinButton: "Join"
  }
};

export default function AgreementPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const agreementId = params.id as string;
  const participantName = searchParams.get('name');
  const language = (searchParams.get('lang') as 'ru' | 'en') || 'ru';
  const t = translations[language];

  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  // Состояние чата
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Состояние чек-листа
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  // Состояние согласия
  const [agreeing, setAgreeing] = useState(false);

  // Форма присоединения
  const [joinName, setJoinName] = useState('');
  const [joining, setJoining] = useState(false);

  const loadAgreement = useCallback(async () => {
    try {
      setLoading(true);
      
      // Если есть имя участника - проверяем полный доступ
      if (participantName) {
        const response = await fetch(`/api/agreements/${agreementId}?name=${encodeURIComponent(participantName)}`);
        const data = await response.json();

        if (response.ok) {
          setAgreement(data.agreement);
          setShowJoinForm(false);
          return;
        }
      }

      // Иначе получаем публичную информацию
      const publicResponse = await fetch(`/api/agreements/${agreementId}/public`);
      const publicData = await publicResponse.json();

      if (!publicResponse.ok) {
        throw new Error(publicData.error || 'Ошибка загрузки');
      }

      setAgreement(publicData.agreement);
      setShowJoinForm(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [agreementId, participantName]);

  useEffect(() => {
    loadAgreement();
  }, [loadAgreement]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName.trim() || joining) return;

    setJoining(true);
    try {
      const response = await fetch('/api/agreements/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode: agreement?.inviteCode,
          participantName: joinName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка присоединения');
      }

      // Обновляем URL с именем участника
      const url = new URL(window.location.href);
      url.searchParams.set('name', joinName.trim());
      window.history.pushState({}, '', url.toString());
      
      // Перезагружаем страницу
      window.location.reload();

    } catch (error: any) {
      alert('Ошибка: ' + (error.message || 'Что-то пошло не так'));
    } finally {
      setJoining(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage || !participantName) return;

    setSendingMessage(true);
    try {
      const response = await fetch(`/api/agreements/${agreementId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage.trim(),
          senderName: participantName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка отправки');
      }

      await loadAgreement();
      setNewMessage('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка отправки сообщения');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleAddChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistItem.trim() || addingItem || !participantName) return;

    setAddingItem(true);
    try {
      const response = await fetch(`/api/agreements/${agreementId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newChecklistItem.trim(),
          deadline: newDeadline || undefined,
          participantName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка добавления');
      }

      await loadAgreement();
      setNewChecklistItem('');
      setNewDeadline('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка добавления пункта');
    } finally {
      setAddingItem(false);
    }
  };

  const handleAgree = async () => {
    if (agreeing || !participantName) return;

    setAgreeing(true);
    try {
      const response = await fetch(`/api/agreements/${agreementId}/agree`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка согласия');
      }

      alert(language === 'ru' ? 'Ваше согласие записано!' : 'Your agreement has been recorded!');
      await loadAgreement();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка согласия');
    } finally {
      setAgreeing(false);
    }
  };

  const setLanguage = (newLang: 'ru' | 'en') => {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLang);
    window.history.pushState({}, '', url.toString());
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t.loading}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t.notFound}</div>
      </div>
    );
  }

  // Показать форму присоединения
  if (showJoinForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {agreement.title}
            </h1>
            {agreement.description && (
              <p className="text-gray-600 mb-4">
                {agreement.description}
              </p>
            )}
            <p className="text-sm text-gray-500">
              {t.joinToParticipate}
            </p>
          </div>
          
          <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {t.joinToParticipate}
            </h2>
            
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.inviteCode}
                </label>
                <input
                  type="text"
                  value={agreement.inviteCode}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.enterName}
                </label>
                <input
                  type="text"
                  required
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="Введите ваше имя"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={joining}
              >
                {joining ? 'Присоединение...' : t.joinButton}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Показать полный интерфейс для участников
  const currentParticipant = agreement?.participants.find(p => p.name === participantName);
  const isCreator = agreement && agreement.participants[0]?.name === participantName;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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

        {/* Заголовок */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{agreement.title}</h1>
              {agreement.description && (
                <p className="text-gray-600">{agreement.description}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">{t.inviteCode}</div>
              <div className="font-mono text-lg font-bold text-blue-600">{agreement.inviteCode}</div>
            </div>
          </div>

          {/* Статус */}
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              agreement.status === 'agreed' 
                ? 'bg-green-100 text-green-800'
                : agreement.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {agreement.status === 'agreed' ? t.statusAgreed : 
               agreement.status === 'pending' ? t.statusPending : t.statusDraft}
            </span>
          </div>

          {/* Участники */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{t.participants}</h3>
            <div className="space-y-2">
              {agreement.participants.map((participant: any, index: number) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <span className="font-medium">{participant.name}</span>
                    {index === 0 && (
                      <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {t.creator}
                      </span>
                    )}
                  </div>
                  <span className={`text-sm ${
                    participant.hasAgreed ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {participant.hasAgreed ? t.agreed : t.waiting}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопка согласия */}
          {currentParticipant && !currentParticipant.hasAgreed && (
            <div className="mt-6">
              <button
                onClick={handleAgree}
                disabled={agreeing}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {agreeing ? t.confirming : t.agreeButton}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Чек-лист условий */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">{t.checklist}</h2>
            
            {agreement.checklist && agreement.checklist.length > 0 ? (
              <div className="space-y-3 mb-4">
                {agreement.checklist.map((item: any) => (
                  <div key={item.id} className="flex items-start p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <div className="font-medium">{item.text}</div>
                      {item.deadline && (
                        <div className="text-sm text-gray-600 mt-1">
                          {t.deadline} {new Date(item.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">{t.noConditions}</p>
            )}

            <form onSubmit={handleAddChecklistItem} className="space-y-3">
              <textarea
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder={t.addCondition}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
              
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <button
                type="submit"
                disabled={addingItem || !newChecklistItem.trim()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {addingItem ? t.adding : t.addButton}
              </button>
            </form>
          </div>

          {/* Чат */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">{t.chat}</h2>
            
            {agreement.chat && agreement.chat.length > 0 ? (
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {agreement.chat.map((message: any) => (
                  <div key={message.id} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-sm">{message.senderName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-gray-800">{message.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">{t.noMessages}</p>
            )}

            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t.writeMessage}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessage.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {sendingMessage ? t.sending : t.sendButton}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 