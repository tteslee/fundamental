import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const { format, startDate, endDate, records = [] } = await request.json()
    
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 })
    }
    
    // If no records provided, use some mock data for demo
    const mockRecords = [
      {
        id: '1',
        type: 'sleep',
        startTime: new Date('2024-01-15T23:00:00Z'),
        endTime: new Date('2024-01-16T07:00:00Z'),
        duration: 480,
        memo: 'Good sleep',
        createdAt: new Date('2024-01-15T23:00:00Z'),
      },
      {
        id: '2',
        type: 'food',
        startTime: new Date('2024-01-16T08:00:00Z'),
        endTime: null,
        duration: null,
        memo: 'Breakfast - oatmeal',
        createdAt: new Date('2024-01-16T08:00:00Z'),
      },
      {
        id: '3',
        type: 'medication',
        startTime: new Date('2024-01-16T09:00:00Z'),
        endTime: null,
        duration: null,
        memo: 'Vitamin D',
        createdAt: new Date('2024-01-16T09:00:00Z'),
      },
    ]
    
    const exportRecords = records.length > 0 ? records : mockRecords
    
    // Debug: Log what records we're exporting
    console.log('Raw request body records:', records.length, 'records')
    console.log('Using records:', exportRecords.length, 'records')
    console.log('First record:', exportRecords[0])
    console.log('Records type:', typeof records, Array.isArray(records))
    console.log('Full request body:', JSON.stringify({ format, startDate, endDate, recordsCount: records.length }))

    if (format === 'csv') {
      try {
        const csv = generateCSV(exportRecords)
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="fundamental-records.csv"',
          },
        })
      } catch (error) {
        console.error('CSV generation error:', error)
        return NextResponse.json({ error: 'CSV generation failed' }, { status: 500 })
      }
    } else if (format === 'pdf') {
      try {
        const pdfBytes = await generatePDF(exportRecords, startDate, endDate)
        return new NextResponse(pdfBytes, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="fundamental-records.pdf"',
          },
        })
      } catch (error) {
        console.error('PDF generation error:', error)
        return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Error exporting records:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateCSV(records: any[]): string {
  const csvData = records.map(record => ({
    '유형': record.type === 'sleep' ? '수면' : record.type === 'food' ? '식사' : '약물',
    '시작 시간': new Date(record.startTime).toLocaleString('ko-KR'),
    '종료 시간': record.endTime ? new Date(record.endTime).toLocaleString('ko-KR') : '',
    '지속 시간': record.duration ? `${Math.floor(record.duration / 60)}시간 ${record.duration % 60}분` : '',
    '메모': record.memo || '',
    '생성일': new Date(record.createdAt).toLocaleString('ko-KR'),
  }))

  return Papa.unparse(csvData)
}

async function generatePDF(records: any[], startDate: string, endDate: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([600, 800])
  const { width, height } = page.getSize()

  // Add title in Korean
  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  page.drawText('Fundamental Health Records', {
    x: 50,
    y: height - 50,
    size: 20,
    font: titleFont,
    color: rgb(0, 0, 0),
  })

  // Add date range
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  page.drawText(`Period: ${startDate} to ${endDate}`, {
    x: 50,
    y: height - 80,
    size: 12,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  })

  // Add records count in Korean
  page.drawText(`Total ${records.length} records`, {
    x: 50,
    y: height - 110,
    size: 12,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  // Add records
  let yPosition = height - 140
  
  // Helper function to get type labels
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sleep': return 'Sleep'
      case 'food': return 'Food'
      case 'medication': return 'Medication'
      default: return type
    }
  }
  
  records.forEach((record, index) => {
    if (yPosition < 100) {
      // Add new page if needed
      const newPage = pdfDoc.addPage([600, 800])
      yPosition = newPage.getHeight() - 50
    }

    const currentPage = yPosition > 100 ? page : pdfDoc.getPages()[pdfDoc.getPageCount() - 1]
    
    // Format time
    const startTime = new Date(record.startTime).toISOString()
    const endTime = record.endTime ? new Date(record.endTime).toISOString() : null
    
    // Record display
    const typeLabel = getTypeLabel(record.type)
    const timeText = endTime ? `${startTime} ~ ${endTime}` : startTime
    const recordText = `${index + 1}. ${typeLabel} - ${timeText}`
    
    currentPage.drawText(recordText, {
      x: 50,
      y: yPosition,
      size: 12,
      font: regularFont,
      color: rgb(0, 0, 0),
    })
    
    // Duration for sleep records
    if (record.duration && record.type === 'sleep') {
      const hours = Math.floor(record.duration / 60)
      const minutes = record.duration % 60
      currentPage.drawText(`Duration: ${hours}h ${minutes}m`, {
        x: 70,
        y: yPosition - 20,
        size: 10,
        font: regularFont,
        color: rgb(0.2, 0.2, 0.2),
      })
      yPosition -= 20
    }
    
    // Memo
    if (record.memo) {
      currentPage.drawText(`Memo: ${record.memo}`, {
        x: 70,
        y: yPosition - 20,
        size: 10,
        font: regularFont,
        color: rgb(0.3, 0.3, 0.3),
      })
      yPosition -= 40
    } else {
      yPosition -= 25
    }
  })

  return await pdfDoc.save()
}
