import { NextRequest, NextResponse } from 'next/server';
import { agreements, generateId, generateInviteCode } from '@/lib/store/agreements';

// POST - создать новую договорённость
export async function POST(request: NextRequest) {
  try {
    const { title, description, creatorName } = await request.json();

    // Валидация
    if (!title || !creatorName) {
      return NextResponse.json(
        { error: 'Заголовок и имя создателя обязательны' },
        { status: 400 }
      );
    }

    const agreementId = generateId();
    let inviteCode = generateInviteCode();
    
    // Проверяем уникальность кода (простая проверка)
    while (Array.from(agreements.values()).some(a => a.inviteCode === inviteCode)) {
      inviteCode = generateInviteCode();
    }
    
    const agreement = {
      id: agreementId,
      title,
      description: description || '',
      participants: [{
        id: generateId(),
        name: creatorName,
        hasAgreed: false,
      }],
      checklist: [],
      chat: [],
      status: 'draft',
      inviteCode,
      createdAt: new Date().toISOString(),
    };

    agreements.set(agreementId, agreement);

    return NextResponse.json({
      message: 'Договорённость успешно создана',
      agreement,
      inviteCode, // Код показываем один раз
    });

  } catch (error: any) {
    console.error('Ошибка создания договорённости:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

 