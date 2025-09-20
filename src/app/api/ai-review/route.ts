import { NextRequest, NextResponse } from 'next/server'
import { AIReview } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { period, startDate, endDate } = await request.json()
    
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 })
    }

    // For demo purposes, use mock data
    const records = []

    // Generate AI review
    const review = await generateAIReview(records, period)

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error generating AI review:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function generateAIReview(records: any[], period: 'daily' | 'weekly'): Promise<AIReview> {
  // For demo purposes, return a mock review
  // In production, this would call OpenAI API
  
  const sleepRecords = records.filter(r => r.type === 'sleep')
  const foodRecords = records.filter(r => r.type === 'food')
  const medicationRecords = records.filter(r => r.type === 'medication')
  
  const totalSleepMinutes = sleepRecords.reduce((sum, r) => sum + (r.duration || 0), 0)
  const averageSleepHours = sleepRecords.length > 0 ? totalSleepMinutes / sleepRecords.length / 60 : 0

  return {
    overallReview: {
      summary: period === 'weekly' 
        ? `You had a ${sleepRecords.length > 0 ? 'productive' : 'challenging'} week with ${sleepRecords.length} sleep records and ${foodRecords.length} meal logs.`
        : `Today you logged ${records.length} activities with good consistency.`,
      positiveReinforcement: sleepRecords.length > 0 
        ? `Great job maintaining your sleep tracking! You averaged ${averageSleepHours.toFixed(1)} hours of sleep.`
        : `Keep up the good work with your daily logging!`,
      patternsNoticed: `You tend to ${foodRecords.length > 2 ? 'eat regularly' : 'have irregular meal times'}. ${medicationRecords.length > 0 ? 'Your medication adherence looks good.' : 'Consider adding medication reminders.'}`,
      moodLinkages: 'Your sleep patterns seem to correlate with your overall energy levels.'
    },
    thingsToImprove: {
      habitGaps: sleepRecords.length === 0 
        ? 'Consider adding sleep tracking to get better insights into your rest patterns.'
        : 'Your tracking consistency is good, keep it up!',
      balanceIssues: averageSleepHours < 7 
        ? 'Try to aim for 7-8 hours of sleep for better health.'
        : 'Your sleep duration looks healthy.',
      actionableSuggestions: [
        'Set a consistent bedtime routine',
        'Try to log meals within 30 minutes of eating'
      ]
    },
    highlightedWins: {
      consistencyStreaks: `You've logged ${records.length} activities ${period === 'weekly' ? 'this week' : 'today'}.`,
      improvementTrends: averageSleepHours > 7 
        ? 'Your sleep duration has been consistently good.'
        : 'Focus on improving sleep quality and duration.'
    },
    lookingAhead: {
      motivation: 'Keep up the great work! Small consistent actions lead to big improvements.',
      goalSetting: 'Next week, try to maintain your current tracking streak and add one new healthy habit.'
    }
  }
}
