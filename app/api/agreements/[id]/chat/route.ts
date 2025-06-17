import { NextRequest, NextResponse } from 'next/server';

// Импортируем хранилище из основного API
let agreements: Map<string, any>;

// Получаем ссылку на хранилище
try {
  const store = require('../../route');
  agreements = store.agreements;
} catch {
  // Fallback если модуль не загружен
  agreements = new Map();
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}

// POST - добавить сообщение в чат
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { content, senderName } = await request.json();

    // Валидация
    if (!content || !senderName) {
      return NextResponse.json(
        { error: 'Содержание сообщения и имя отправителя обязательны' },
        { status: 400 }
      );
    }

    const agreement = agreements.get(params.id);

    if (!agreement) {
      return NextResponse.json(
        { error: 'Договорённость не найдена' },
        { status: 404 }
      );
    }

    // Проверка доступа
    const hasAccess = agreement.participants.some(
      (p: any) => p.name === senderName
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Доступ запрещён. Вы не являетесь участником этой договорённости' },
        { status: 403 }
      );
    }

    // Создание нового сообщения
    const newMessage = {
      id: generateId(),
      senderName,
      content,
      timestamp: new Date().toISOString(),
    };

    // Добавляем сообщение в чат
    agreement.chat.push(newMessage);
    
    agreements.set(params.id, agreement);

    return NextResponse.json({
      message: 'Сообщение добавлено',
      newMessage,
    });

  } catch (error: any) {
    console.error('Ошибка добавления сообщения:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 