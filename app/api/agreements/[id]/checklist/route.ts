import { NextRequest, NextResponse } from 'next/server';
import { agreements, generateId } from '@/lib/store/agreements';

// POST - добавить пункт в чек-лист
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { text, deadline, participantName } = await request.json();

    // Валидация
    if (!text || !participantName) {
      return NextResponse.json(
        { error: 'Текст и имя участника обязательны' },
        { status: 400 }
      );
    }

    const agreement = agreements.get(id);

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
    
    agreements.set(id, agreement);

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