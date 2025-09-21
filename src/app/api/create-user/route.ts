import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, name } = body

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log('Creating user record manually:', { userId, email, name })

    // Create user record in our users table
    const { data: userRecord, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email,
        name: name || email.split('@')[0]
      })
      .select()
      .single()

    if (insertError) {
      // If user already exists, that's okay
      if (insertError.code === '23505') { // Unique constraint violation
        console.log('User already exists, fetching existing record...')
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        
        return NextResponse.json({ 
          success: true, 
          message: 'User already exists',
          user: existingUser
        })
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
