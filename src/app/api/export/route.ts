import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Export API received request:', { 
      format: body.format, 
      startDate: body.startDate, 
      endDate: body.endDate, 
      recordsCount: body.records?.length || 0 
    })
    
    const { format, startDate, endDate, records = [] } = body
    
    if (!startDate || !endDate) {
      console.error('Missing required dates:', { startDate, endDate })
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 })
    }
    
    if (!format || !['csv', 'pdf'].includes(format)) {
      console.error('Invalid format:', format)
      return NextResponse.json({ error: 'Invalid format. Must be csv or pdf' }, { status: 400 })
    }
    
    // Filter out 2024 mock data - only export 2025+ real data
    const exportRecords = records.filter((record: any) => {
      const recordDate = new Date(record.startTime)
      return recordDate.getFullYear() >= 2025
    })
    
    // Debug: Log what records we're exporting
    console.log('Raw request body records:', records.length, 'records')
    console.log('Using records:', exportRecords.length, 'records')
    console.log('First record:', exportRecords[0])
    console.log('Records type:', typeof records, Array.isArray(records))
    console.log('Date range:', { startDate, endDate })
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
        const htmlContent = generateHTML(exportRecords, startDate, endDate)
        return new NextResponse(htmlContent, {
          headers: {
            'Content-Type': 'text/html',
            'Content-Disposition': 'attachment; filename="fundamental-records.html"',
          },
        })
      } catch (error) {
        console.error('HTML generation error:', error)
        return NextResponse.json({ error: 'HTML generation failed' }, { status: 500 })
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

function generateHTML(records: any[], startDate: string, endDate: string): string {
  console.log('HTML generation - received records:', records.length)
  console.log('First record for HTML:', records[0])
  
  // Helper function to get type labels in Korean
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sleep': return '수면'
      case 'food': return '식사'
      case 'medication': return '약물'
      default: return type
    }
  }

  // Generate HTML content with print styles
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Fundamental Health Records</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Noto Sans KR', sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #ffffff;
          color: #333;
          line-height: 1.6;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #949CAF;
          padding-bottom: 20px;
        }
        
        .title {
          font-size: 24px;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .subtitle {
          font-size: 14px;
          color: #7f8c8d;
          margin-bottom: 5px;
        }
        
        .record {
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background-color: #fafafa;
          page-break-inside: avoid;
        }
        
        .record-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .record-type {
          font-weight: 500;
          color: #949CAF;
          font-size: 16px;
        }
        
        .record-time {
          font-size: 14px;
          color: #666;
        }
        
        .record-duration {
          font-size: 12px;
          color: #888;
          margin-top: 5px;
        }
        
        .record-memo {
          font-size: 14px;
          color: #333;
          margin-top: 8px;
          font-style: italic;
        }
        
        .no-records {
          text-align: center;
          color: #7f8c8d;
          font-style: italic;
          margin-top: 50px;
        }
        
        /* Print styles */
        @media print {
          body {
            margin: 0;
            padding: 15mm;
          }
          
          .record {
            background-color: #ffffff !important;
            border: 1px solid #ccc !important;
          }
          
          .header {
            border-bottom: 2px solid #000 !important;
          }
        }
        
        /* Print button */
        .print-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: #949CAF;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-family: 'Noto Sans KR', sans-serif;
          font-size: 14px;
          z-index: 1000;
        }
        
        .print-button:hover {
          background-color: #7a8499;
        }
        
        @media print {
          .print-button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <button class="print-button" onclick="window.print()">PDF로 인쇄</button>
      
      <div class="header">
        <div class="title">Fundamental Health Records</div>
        <div class="subtitle">기간: ${new Date(startDate).toLocaleDateString('ko-KR')} ~ ${new Date(endDate).toLocaleDateString('ko-KR')}</div>
        <div class="subtitle">총 ${records.length}개의 기록</div>
      </div>
      
      ${records.length === 0 ? 
        '<div class="no-records">내보낼 기록이 없습니다.</div>' :
        records.map((record, index) => {
          const startTime = new Date(record.startTime).toLocaleString('ko-KR')
          const endTime = record.endTime ? new Date(record.endTime).toLocaleString('ko-KR') : null
          const duration = record.duration ? `${Math.floor(record.duration / 60)}시간 ${record.duration % 60}분` : null
          
          return `
            <div class="record">
              <div class="record-header">
                <div class="record-type">${getTypeLabel(record.type)}</div>
                <div class="record-time">${startTime}${endTime ? ` ~ ${endTime}` : ''}</div>
              </div>
              ${duration ? `<div class="record-duration">지속시간: ${duration}</div>` : ''}
              ${record.memo ? `<div class="record-memo">메모: ${record.memo}</div>` : ''}
            </div>
          `
        }).join('')
      }
    </body>
    </html>
  `

  return htmlContent
}
