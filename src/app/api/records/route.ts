import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
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
    
    console.log('Fetching records for user:', user.id)

    // Use Supabase directly instead of Prisma
    const { data: records, error: recordsError } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false })

    if (recordsError) {
      console.error('Error fetching records from Supabase:', recordsError)
      return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 })
    }

    return NextResponse.json(records || [])
  } catch (error) {
    console.error('Error fetching records:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    
    console.log('Creating record for user:', user.id)

    const body = await request.json()
    console.log('Request body:', body)

    // Prepare record data for Supabase
    const recordData = {
      type: body.type,
      start_time: body.startTime,
      end_time: body.endTime,
      duration: body.duration,
      memo: body.memo,
      user_id: user.id,
    }

    console.log('Processed record data:', recordData)

    // Use Supabase directly instead of Prisma
    const { data: record, error: insertError } = await supabase
      .from('records')
      .insert(recordData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating record in Supabase:', insertError)
      console.error('Record data that failed:', recordData)
      return NextResponse.json({ 
        error: 'Failed to create record', 
        details: insertError.message,
        code: insertError.code 
      }, { status: 500 })
    }

    console.log('Created record:', record)
    return NextResponse.json(record)
  } catch (error) {
    console.error('Error creating record:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
