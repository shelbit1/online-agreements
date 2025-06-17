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

// POST - выразить согласие с договорённостью
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { participantName } = await request.json();

    // Валидация
    if (!participantName) {
      return NextResponse.json(
        { error: 'Необходимо имя участника' },
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

    // Поиск участника
    const participant = agreement.participants.find(
      (p: any) => p.name === participantName
    );

    if (!participant) {
      return NextResponse.json(
        { error: 'Доступ запрещён. Вы не являетесь участником этой договорённости' },
        { status: 403 }
      );
    }

    // Проверка, уже согласился или нет
    if (participant.hasAgreed) {
      return NextResponse.json(
        { error: 'Вы уже согласились с этой договорённостью' },
        { status: 400 }
      );
    }

    // Отметка о согласии
    participant.hasAgreed = true;
    participant.agreedAt = new Date().toISOString();

    // Проверка, все ли участники согласились
    const allAgreed = agreement.participants.every((p: any) => p.hasAgreed);

    if (allAgreed) {
      agreement.status = 'agreed';
    }

    agreements.set(params.id, agreement);

    return NextResponse.json({
      message: 'Ваше согласие записано',
      agreement,
      allAgreed,
    });

  } catch (error: any) {
    console.error('Ошибка записи согласия:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 