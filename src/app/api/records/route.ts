import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createRecord, getRecordsByUser } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const records = await getRecordsByUser(session.user.id)
    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching records:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const record = await createRecord({
      ...body,
      userId: session.user.id,
    })

    return NextResponse.json(record)
  } catch (error) {
    console.error('Error creating record:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
