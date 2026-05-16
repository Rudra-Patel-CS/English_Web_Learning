import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Initialize Supabase client for backend use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(request: Request) {
  try {
    const { studentName, studentEmail, subject, doubt, standard } = await request.json();

    // 1. Fetch the admin email from the database
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('email')
      .eq('role', 'admin')
      .limit(1)
      .single();

    if (adminError || !adminUser?.email) {
      console.error('Failed to fetch admin email', adminError);
      return NextResponse.json({ error: 'Failed to fetch admin email' }, { status: 500 });
    }

    const adminEmail = adminUser.email;

    // 2. Check if Resend API Key is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not set. Skipping email notification.');
      // Return 200 anyway so the user's form submission doesn't fail just because email isn't set up yet
      return NextResponse.json({ success: true, warning: 'Email not sent: RESEND_API_KEY missing' });
    }

    // 3. Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'EnglishMaster System <onboarding@resend.dev>', // Resend provides this test domain by default
      to: [adminEmail],
      subject: `New Student Query: ${subject}`,
      html: `
        <h2>New Doubt Submitted!</h2>
        <p><strong>Student Name:</strong> ${studentName}</p>
        <p><strong>Student Email:</strong> ${studentEmail}</p>
        <p><strong>Standard:</strong> ${standard || 'Not specified'}</p>
        <br/>
        <h3>Subject: ${subject}</h3>
        <div style="padding: 15px; background-color: #f4f4f5; border-radius: 8px;">
          <p style="white-space: pre-wrap; font-family: sans-serif;">${doubt}</p>
        </div>
        <br/>
        <p>Log in to your Admin Dashboard to answer this query.</p>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
