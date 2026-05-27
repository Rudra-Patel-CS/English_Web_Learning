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

    let query = supabase.from('question_units').select('*');

    if (standard) query = query.eq('standard', standard);
    if (instructionType) query = query.eq('instruction_type', instructionType);

    const { data, error } = await query.order('unit_name', { ascending: true });

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
    const { standard, instruction_type, unit_name, chapter_name } = body;

    if (!standard || !instruction_type || !unit_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if unit already exists
    const { data: existing } = await supabase
      .from('question_units')
      .select('*')
      .eq('standard', standard)
      .eq('instruction_type', instruction_type)
      .eq('unit_name', unit_name)
      .single();

    if (existing) {
      return NextResponse.json({ success: true, data: existing });
    }

    const newUnit = {
      standard,
      instruction_type,
      unit_name,
      chapter_name: chapter_name || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('question_units')
      .insert([newUnit])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
