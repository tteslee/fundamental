import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Test if we can connect to Supabase
    console.log('Testing Supabase connection...')
    
    // Test if users table exists
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (usersError) {
      console.error('Users table error:', usersError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: usersError.message,
        code: usersError.code,
        hint: 'Make sure you have run the SQL script in Supabase dashboard'
      }, { status: 500 })
    }

    // Test if records table exists
    const { data: records, error: recordsError } = await supabase
      .from('records')
      .select('count')
      .limit(1)

    if (recordsError) {
      console.error('Records table error:', recordsError)
      return NextResponse.json({ 
        error: 'Records table not found',
        details: recordsError.message,
        code: recordsError.code,
        hint: 'Make sure you have run the SQL script in Supabase dashboard'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database tables exist and are accessible',
      usersTable: 'OK',
      recordsTable: 'OK'
    })

  } catch (error: any) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      error: 'Database test failed',
      details: error.message 
    }, { status: 500 })
  }
}
