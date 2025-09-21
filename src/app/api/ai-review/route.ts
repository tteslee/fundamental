import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  let period = 'daily' // Default value
  let records = []
  
  try {
    const requestData = await request.json()
    period = requestData.period || 'daily'
    records = requestData.records || []
    
    if (!records || records.length === 0) {
      return NextResponse.json({ error: 'No records provided' }, { status: 400 })
    }

    // Prepare records data for AI analysis
    const recordsData = records.map((record: any) => ({
      type: record.type,
      startTime: new Date(record.startTime).toLocaleString('ko-KR'),
      endTime: record.endTime ? new Date(record.endTime).toLocaleString('ko-KR') : null,
      duration: record.duration ? `${Math.floor(record.duration / 60)}시간 ${record.duration % 60}분` : null,
      memo: record.memo || '',
    }))

    // Create prompt for AI analysis
    const prompt = `당신은 건강 관리 전문가입니다. 다음 건강 기록을 분석하여 한국어로 상세한 리뷰를 제공해주세요.

기록 데이터:
${JSON.stringify(recordsData, null, 2)}

분석 기간: ${period === 'daily' ? '일일' : '주간'}

다음 형식으로 JSON 응답을 제공해주세요:
{
  "overallReview": {
    "summary": "전체적인 요약 (2-3문장)",
    "positiveReinforcement": "긍정적인 격려 메시지",
    "patternsNoticed": "발견된 패턴들",
    "moodLinkages": "수면, 식사, 약물 복용 간의 연관성"
  },
  "thingsToImprove": {
    "habitGaps": "개선이 필요한 습관들",
    "balanceIssues": "균형 문제점들",
    "actionableSuggestions": ["구체적인 개선 제안 1", "구체적인 개선 제안 2", "구체적인 개선 제안 3"]
  },
  "highlightedWins": {
    "consistencyStreaks": "일관성 있는 부분들",
    "improvementTrends": "개선 추세"
  },
  "lookingAhead": {
    "motivation": "동기부여 메시지",
    "goalSetting": "다음 목표 설정"
  }
}

응답은 반드시 유효한 JSON 형식이어야 하며, 한국어로 작성해주세요.`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 건강 관리 전문가입니다. 사용자의 건강 기록을 분석하여 도움이 되는 인사이트를 제공합니다. 항상 한국어로 응답하고, JSON 형식을 정확히 지켜주세요."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No response from OpenAI')
    }

    // Parse AI response
    let aiReview
    try {
      aiReview = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse)
      throw new Error('Invalid AI response format')
    }

    return NextResponse.json(aiReview)
  } catch (error) {
    console.error('Error generating AI review:', error)
    
    // Fallback to mock data if OpenAI fails
    const mockReview = {
      overallReview: {
        summary: period === 'weekly' 
          ? `이번 주 ${records.length}개의 활동을 기록하셨습니다. 꾸준한 기록이 건강한 습관 형성에 도움이 됩니다.`
          : `오늘 ${records.length}개의 활동을 기록하셨습니다. 좋은 시작입니다!`,
        positiveReinforcement: records.length > 0 
          ? `기록을 꾸준히 하시는 모습이 훌륭합니다. 작은 습관이 큰 변화를 만들어냅니다.`
          : `건강한 습관을 위한 첫 걸음을 내딛어보세요.`,
        patternsNoticed: `수면 패턴과 식사 시간을 관찰해보세요. 규칙적인 생활이 건강의 기본입니다.`,
        moodLinkages: '수면의 질이 하루의 에너지와 기분에 큰 영향을 미칩니다.'
      },
      thingsToImprove: {
        habitGaps: records.length === 0 
          ? '더 많은 기록을 추가하여 패턴을 파악해보세요.'
          : '현재 기록을 바탕으로 더 나은 습관을 만들어가세요.',
        balanceIssues: '수면, 영양, 운동의 균형을 맞춰보세요.',
        actionableSuggestions: [
          '매일 같은 시간에 잠자리에 들어보세요',
          '식사 후 30분 내에 기록해보세요',
          '하루에 하나씩 새로운 건강 습관을 추가해보세요'
        ]
      },
      highlightedWins: {
        consistencyStreaks: `현재 ${records.length}개의 기록을 유지하고 있습니다.`,
        improvementTrends: '꾸준한 기록이 건강한 변화의 시작입니다.'
      },
      lookingAhead: {
        motivation: '작은 변화가 큰 결과를 만들어냅니다. 계속해서 노력해주세요!',
        goalSetting: '다음 주에는 더 구체적인 목표를 설정해보세요.'
      }
    }

    return NextResponse.json(mockReview)
  }
}