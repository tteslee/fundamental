import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createRecord, getRecordsByUser } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // For demo purposes, use demo user ID if no session
    const userId = (session?.user as any)?.id || 'cmfs3fans0000me40mimwsht2'
    
    console.log('Fetching records for user:', userId)

    const records = await getRecordsByUser(userId)
    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching records:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // For demo purposes, use demo user ID if no session
    const userId = (session?.user as any)?.id || 'cmfs3fans0000me40mimwsht2'
    
    console.log('Creating record for user:', userId)

    const body = await request.json()
    console.log('Request body:', body)

    // Convert ISO strings back to Date objects
    const recordData = {
      ...body,
      startTime: new Date(body.startTime),
      endTime: body.endTime ? new Date(body.endTime) : undefined,
      userId: userId,
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
