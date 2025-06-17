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

// GET - получить договорённость по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const participantName = searchParams.get('name');

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

    return NextResponse.json({ agreement });

  } catch (error: any) {
    console.error('Ошибка получения договорённости:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// PUT - обновить договорённость
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { title, description, participantName } = await request.json();

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

    // Проверка прав на редактирование (только первый участник - создатель)
    if (agreement.participants[0]?.name !== participantName) {
      return NextResponse.json(
        { error: 'Только создатель может редактировать договорённость' },
        { status: 403 }
      );
    }

    // Обновляем договорённость
    agreement.title = title;
    agreement.description = description;
    
    agreements.set(params.id, agreement);

    return NextResponse.json({
      message: 'Договорённость обновлена',
      agreement,
    });

  } catch (error: any) {
    console.error('Ошибка обновления договорённости:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 