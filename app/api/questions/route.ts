import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const standard = searchParams.get('standard');
    const instructionType = searchParams.get('instruction_type');
    const unitId = searchParams.get('unit_id');

    let query = supabase.from('questions').select('*');

    if (standard) query = query.eq('standard', standard);
    if (instructionType) query = query.eq('instruction_type', instructionType);
    if (unitId) query = query.eq('unit_id', unitId);

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { standard, instruction_type, unit_id, unit_name, question_text, answer, marks, difficulty, options } = body;

    if (!standard || !instruction_type || !question_text || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newQuestion = {
      standard,
      instruction_type,
      unit_id: unit_id || null,
      unit_name: unit_name || null,
      question_text,
      answer,
      marks: marks || 1,
      difficulty: difficulty || 'medium',
      options: options || [],
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('questions')
      .insert([newQuestion])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
