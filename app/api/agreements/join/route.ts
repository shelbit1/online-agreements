import { NextRequest, NextResponse } from 'next/server';

// Импортируем хранилище из основного API
let agreements: Map<string, any>;

// Получаем ссылку на хранилище
try {
  const store = require('../route');
  agreements = store.agreements;
} catch {
  // Fallback если модуль не загружен
  agreements = new Map();
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 12);
}

// POST - присоединиться к договорённости по коду
export async function POST(request: NextRequest) {
  try {
    const { inviteCode, participantName } = await request.json();

    // Валидация
    if (!inviteCode || !participantName) {
      return NextResponse.json(
        { error: 'Код приглашения и имя обязательны' },
        { status: 400 }
      );
    }

    // Поиск договорённости по коду
    const agreement = Array.from(agreements.values()).find(a => a.inviteCode === inviteCode.toUpperCase());

    if (!agreement) {
      return NextResponse.json(
        { error: 'Договорённость с таким кодом не найдена' },
        { status: 404 }
      );
    }

    // Проверка, не участвует ли уже пользователь
    const existingParticipant = agreement.participants.find(
      (p: any) => p.name === participantName
    );

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'Участник с таким именем уже есть в договорённости' },
        { status: 400 }
      );
    }

    // Добавление нового участника
    agreement.participants.push({
      id: generateId(),
      name: participantName,
      hasAgreed: false,
    });

    // Если договорённость была в черновике, переводим в статус "ожидание"
    if (agreement.status === 'draft') {
      agreement.status = 'pending';
    }

    // Сохраняем обновленную договорённость
    agreements.set(agreement.id, agreement);

    return NextResponse.json({
      message: 'Вы успешно присоединились к договорённости',
      agreement,
    });

  } catch (error: any) {
    console.error('Ошибка присоединения к договорённости:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 