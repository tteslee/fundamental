export type RecordType = 'sleep' | 'food' | 'medication'

export type PrismaRecordType = 'SLEEP' | 'FOOD' | 'MEDICATION'

export interface Record {
  id: string
  type: RecordType
  startTime: Date
  endTime?: Date
  duration?: number // in minutes
  memo?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

export interface WeeklyViewData {
  weekStart: Date
  weekEnd: Date
  dailyRecords: DailyRecords[]
  averageSleepTime: string
}

export interface DailyRecords {
  date: Date
  sleepDuration: string
  records: Record[]
}

export interface TimeSlot {
  hour: number
  minute: number
  label: string
}

export interface DateRange {
  start: Date
  end: Date
}

export interface AIReview {
  overallReview: {
    summary: string
    positiveReinforcement: string
    patternsNoticed: string
    moodLinkages?: string
  }
  thingsToImprove: {
    habitGaps: string
    balanceIssues: string
    actionableSuggestions: string[]
  }
  highlightedWins: {
    consistencyStreaks: string
    improvementTrends: string
  }
  lookingAhead: {
    motivation: string
    goalSetting: string
  }
}

export interface ExportData {
  records: Record[]
  period: 'daily' | 'weekly'
  dateRange: DateRange
}
