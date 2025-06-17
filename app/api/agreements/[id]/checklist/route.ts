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

// POST - добавить пункт в чек-лист
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { text, deadline, participantName } = await request.json();

    // Валидация
    if (!text || !participantName) {
      return NextResponse.json(
        { error: 'Текст и имя участника обязательны' },
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
      (p: any) => p.name === participantName
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Доступ запрещён. Вы не являетесь участником этой договорённости' },
        { status: 403 }
      );
    }

    // Создание нового пункта
    const newItem = {
      id: generateId(),
      text,
      deadline: deadline || undefined,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    // Добавляем в чек-лист
    agreement.checklist.push(newItem);
    
    agreements.set(params.id, agreement);

    return NextResponse.json({
      message: 'Пункт добавлен в чек-лист',
      newItem,
    });

  } catch (error: any) {
    console.error('Ошибка добавления пункта в чек-лист:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 