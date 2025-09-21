import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const body = await request.json()
    
    console.log('Updating record:', id, 'with data:', body)

    // Update record in Supabase
    const { data: record, error: updateError } = await supabase
      .from('records')
      .update({
        type: body.type,
        start_time: body.startTime,
        end_time: body.endTime,
        duration: body.duration,
        memo: body.memo,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating record in Supabase:', updateError)
      return NextResponse.json({ error: 'Failed to update record' }, { status: 500 })
    }

    // Transform the data to match frontend expectations
    const transformedRecord = {
      ...record,
      startTime: record.start_time,
      endTime: record.end_time,
      userId: record.user_id,
      createdAt: record.created_at,
      updatedAt: record.updated_at
    }

    console.log('Successfully updated record:', transformedRecord)
    return NextResponse.json(transformedRecord)
  } catch (error) {
    console.error('Error updating record:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    
    console.log('Deleting record:', id, 'for user:', user.id)

    // Delete record from Supabase
    const { error: deleteError } = await supabase
      .from('records')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting record in Supabase:', deleteError)
      return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 })
    }

    console.log('Successfully deleted record:', id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting record:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
