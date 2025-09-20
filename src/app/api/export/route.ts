import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function POST(request: NextRequest) {
  try {
    const { format, startDate, endDate } = await request.json()
    
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 })
    }

    // For demo purposes, use mock data
    const records = []

    if (format === 'csv') {
      const csv = generateCSV(records)
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="fundamental-records.csv"',
        },
      })
    } else if (format === 'pdf') {
      const pdfBytes = await generatePDF(records, startDate, endDate)
      return new NextResponse(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="fundamental-records.pdf"',
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Error exporting records:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateCSV(records: any[]): string {
  const csvData = records.map(record => ({
    Type: record.type,
    'Start Time': record.startTime,
    'End Time': record.endTime || '',
    Duration: record.duration ? `${record.duration} minutes` : '',
    Memo: record.memo || '',
    'Created At': record.createdAt,
  }))

  return Papa.unparse(csvData)
}

async function generatePDF(records: any[], startDate: string, endDate: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([600, 800])
  const { width, height } = page.getSize()

  // Add title
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

  // Add records
  let yPosition = height - 120
  records.forEach((record, index) => {
    if (yPosition < 100) {
      // Add new page if needed
      const newPage = pdfDoc.addPage([600, 800])
      yPosition = newPage.getHeight() - 50
    }

    const currentPage = yPosition > 100 ? page : pdfDoc.getPages()[pdfDoc.getPageCount() - 1]
    
    currentPage.drawText(`${record.type.toUpperCase()} - ${new Date(record.startTime).toLocaleString()}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: regularFont,
      color: rgb(0, 0, 0),
    })

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
