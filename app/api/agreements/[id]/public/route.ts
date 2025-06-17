import { NextRequest, NextResponse } from 'next/server';
import { agreements } from '@/lib/store/agreements';

// GET - получить основную информацию о договорённости (публично)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const agreement = agreements.get(id);

    if (!agreement) {
      return NextResponse.json(
        { error: 'Договорённость не найдена' },
        { status: 404 }
      );
    }

    // Возвращаем только основную информацию
    const publicAgreement = {
      id: agreement.id,
      title: agreement.title,
      description: agreement.description,
      inviteCode: agreement.inviteCode,
      status: agreement.status,
      participants: agreement.participants.map((p: any) => ({
        id: p.id,
        name: p.name,
        hasAgreed: p.hasAgreed
      })),
      createdAt: agreement.createdAt
    };

    return NextResponse.json({ agreement: publicAgreement });

  } catch (error: any) {
    console.error('Ошибка получения договорённости:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 