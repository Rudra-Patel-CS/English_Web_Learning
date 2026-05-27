import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY || '');

// Initialize Supabase client for backend use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey);

export async function POST(request: Request) {
    if (!supabaseUrl || (!supabaseServiceRoleKey && !supabaseAnonKey)) {
      return NextResponse.json(
        { error: 'Supabase backend is not configured. Add SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.' },
        { status: 500 }
      );
    }
  try {
    const { studentName, studentEmail, subject, doubt, standard } = await request.json();

    const adminConfigEmail = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
    const resendTestRecipient = process.env.RESEND_TEST_RECIPIENT?.trim();
    const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim() || 'onboarding@resend.dev';

    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('notification_email, email')
      .eq('role', 'admin')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (adminError) {
      console.warn('Failed to fetch admin user; falling back to env admin email if available.', adminError);
    }

    // Use ADMIN_NOTIFICATION_EMAIL if configured. Otherwise use the admin record.
    const resolvedAdminEmail = adminConfigEmail || adminUser?.notification_email?.trim() || adminUser?.email?.trim();
    const effectiveRecipient = resendTestRecipient || resolvedAdminEmail;

    if (!effectiveRecipient) {
      return NextResponse.json({ error: 'Admin notification email not configured' }, { status: 500 });
    }

    if (resendTestRecipient && resendTestRecipient !== resolvedAdminEmail) {
      console.warn('Using RESEND_TEST_RECIPIENT for mail delivery because the current Resend account is in test mode.');
    }

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set. Please configure it in your environment variables.');
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    // 3. Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: `EnglishMaster System <${resendFromEmail}>`,
      to: [effectiveRecipient],
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
