import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
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
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Creating user record:', body)

    // Create user record in our users table
    const { data: userRecord, error: insertError } = await supabase
      .from('users')
      .insert({
        id: body.id,
        email: body.email,
        name: body.name
      })
      .select()
      .single()

    if (insertError) {
      // If user already exists, that's okay
      if (insertError.code === '23505') { // Unique constraint violation
        console.log('User already exists, continuing...')
        return NextResponse.json({ success: true, message: 'User already exists' })
      }
      
      console.error('Error creating user record:', insertError)
      return NextResponse.json({ 
        error: 'Failed to create user record',
        details: insertError.message,
        code: insertError.code
      }, { status: 500 })
    }

    console.log('Created user record:', userRecord)
    return NextResponse.json({ success: true, user: userRecord })

  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
