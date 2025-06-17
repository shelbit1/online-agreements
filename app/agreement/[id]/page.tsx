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
    sendButton: "Отправить"
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
    sendButton: "Send"
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

  // Состояние чата
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Состояние чек-листа
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [addingItem, setAddingItem] = useState(false);

  // Состояние согласия
  const [agreeing, setAgreeing] = useState(false);

  const loadAgreement = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/agreements/${agreementId}?name=${encodeURIComponent(participantName!)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка загрузки');
      }

      setAgreement(data.agreement);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [agreementId, participantName]);

  useEffect(() => {
    if (!participantName) {
      setError('Необходимо имя участника');
      return;
    }
    loadAgreement();
  }, [participantName, loadAgreement]);

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

      // Перезагружаем договорённость
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

      // Перезагружаем договорённость
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

  const currentParticipant = agreement?.participants.find(p => p.name === participantName);
  const isCreator = agreement && agreement.participants[0]?.name === participantName;

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

          {/* Участники */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">{t.participants}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agreement.participants.map((participant, index) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <div className="font-medium">{participant.name}</div>
                    {index === 0 && <div className="text-xs text-blue-600">{t.creator}</div>}
                  </div>
                  <div className="text-right">
                    {participant.hasAgreed ? (
                      <div className="text-green-600 font-medium">{t.agreed}</div>
                    ) : (
                      <div className="text-yellow-600 font-medium">{t.waiting}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Кнопка согласия */}
          {currentParticipant && !currentParticipant.hasAgreed && (
            <div className="border-t pt-4 mt-4">
              <button
                onClick={handleAgree}
                disabled={agreeing}
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {agreeing ? t.confirming : t.agreeButton}
              </button>
            </div>
          )}

          {/* Статус договорённости */}
          <div className="border-t pt-4 mt-4">
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              agreement.status === 'agreed' 
                ? 'bg-green-100 text-green-800'
                : agreement.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {agreement.status === 'agreed' && t.statusAgreed}
              {agreement.status === 'pending' && t.statusPending}
              {agreement.status === 'draft' && t.statusDraft}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Чек-лист */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t.checklist}</h2>
            
            {/* Форма добавления пункта */}
            <form onSubmit={handleAddChecklistItem} className="mb-4 p-4 bg-gray-50 rounded-md">
              <div className="space-y-3">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder={t.addCondition}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {addingItem ? t.adding : t.addButton}
                </button>
              </div>
            </form>

            {/* Список пунктов */}
            <div className="space-y-3">
              {agreement.checklist.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  {t.noConditions}
                </div>
              ) : (
                agreement.checklist.map((item) => (
                  <div key={item.id} className="p-3 border border-gray-200 rounded-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className={`${item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {item.text}
                        </div>
                        {item.deadline && (
                          <div className="text-sm text-gray-600 mt-1">
                            {t.deadline} {new Date(item.deadline).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        {item.isCompleted ? (
                          <span className="text-green-600 font-medium">✓</span>
                        ) : (
                          <span className="text-yellow-600 font-medium">○</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Чат */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">{t.chat}</h2>
            
            {/* Сообщения */}
            <div className="h-64 overflow-y-auto mb-4 border border-gray-200 rounded-md p-3 bg-gray-50">
              {agreement.chat.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  {t.noMessages}
                </div>
              ) : (
                <div className="space-y-3">
                  {agreement.chat.map((message) => (
                    <div key={message.id} className={`${
                      message.senderName === participantName 
                        ? 'text-right' 
                        : 'text-left'
                    }`}>
                      <div className={`inline-block max-w-xs lg:max-w-md p-3 rounded-lg ${
                        message.senderName === participantName
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300'
                      }`}>
                        <div className="text-sm font-medium mb-1">
                          {message.senderName}
                        </div>
                        <div>{message.content}</div>
                        <div className={`text-xs mt-1 ${
                          message.senderName === participantName 
                            ? 'text-blue-100' 
                            : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString(language === 'ru' ? 'ru-RU' : 'en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Форма отправки сообщения */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
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