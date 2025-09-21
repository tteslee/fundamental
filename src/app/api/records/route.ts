import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createRecord, getRecordsByUser } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('Fetching records for user:', user.id)

    const records = await getRecordsByUser(user.id)
    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching records:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('Creating record for user:', user.id)

    const body = await request.json()
    console.log('Request body:', body)

    // Convert ISO strings back to Date objects
    const recordData = {
      ...body,
      startTime: new Date(body.startTime),
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      userId: user.id,
    }

    console.log('Processed record data:', recordData)

    const record = await createRecord(recordData)

    console.log('Created record:', record)
    return NextResponse.json(record)
  } catch (error) {
    console.error('Error creating record:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
