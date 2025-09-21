import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('Auth header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader) {
      return NextResponse.json({ 
        error: 'No authorization header',
        hint: 'Make sure you are logged in'
      }, { status: 401 })
    }

    // Create a Supabase client with the JWT token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Auth error:', error)
      return NextResponse.json({ 
        error: 'Authentication failed',
        details: error.message,
        code: error.code
      }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'No user found',
        hint: 'Make sure you are logged in'
      }, { status: 401 })
    }

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name
      }
    })

  } catch (error: any) {
    console.error('Auth test error:', error)
    return NextResponse.json({ 
      error: 'Auth test failed',
      details: error.message 
    }, { status: 500 })
  }
}
