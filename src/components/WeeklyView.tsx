'use client'

import { useState } from 'react'
import { Record } from '@/types'
import { getWeekStart, getWeekEnd, formatDate, formatDuration, getRecordTypeColor } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import RecordCard from './RecordCard'
import EditRecordModal from './EditRecordModal'

interface WeeklyViewProps {
  records: Record[]
  onAddRecord: () => void
  onEditRecord: (id: string, record: Partial<Record>) => void
  onDeleteRecord: (id: string) => void
  onAIReview: () => void
  onExport: () => void
}

export default function WeeklyView({ records, onAddRecord, onEditRecord, onDeleteRecord, onAIReview, onExport }: WeeklyViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [editingRecord, setEditingRecord] = useState<Record | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const weekStart = getWeekStart(currentDate)
  const weekEnd = getWeekEnd(currentDate)
  
  // Generate week days
  const weekDays = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    weekDays.push(date)
  }

  // Calculate average sleep time
  const sleepRecords = records.filter(r => r.type === 'sleep' && r.duration)
  const totalSleepMinutes = sleepRecords.reduce((sum, r) => sum + (r.duration || 0), 0)
  const averageSleepMinutes = sleepRecords.length > 0 ? totalSleepMinutes / sleepRecords.length : 0
  const averageSleepTime = formatDuration(Math.round(averageSleepMinutes))

  // Get records for each day
  const getRecordsForDay = (date: Date) => {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    
    console.log('Checking day:', date.toDateString())
    console.log('Day range:', dayStart.toISOString(), 'to', dayEnd.toISOString())
    console.log('All records:', records.map(r => ({ id: r.id, startTime: r.startTime, type: r.type })))
    
    const dayRecords = records.filter(record => {
      try {
        const recordDate = new Date(record.startTime)
        if (isNaN(recordDate.getTime())) {
          console.error('Invalid date for record', record.id, 'startTime:', record.startTime)
          return false
        }
        const isInRange = recordDate >= dayStart && recordDate <= dayEnd
        console.log('Record', record.id, 'startTime:', record.startTime, 'parsed:', recordDate.toISOString(), 'in range:', isInRange)
        return isInRange
      } catch (error) {
        console.error('Error parsing date for record', record.id, 'startTime:', record.startTime, error)
        return false
      }
    })
    
    console.log('Records for day', date.toDateString(), ':', dayRecords.length, dayRecords)
    return dayRecords
  }

  // Calculate sleep duration for a day
  const getSleepDuration = (date: Date) => {
    const dayRecords = getRecordsForDay(date)
    const sleepRecords = dayRecords.filter(r => r.type === 'sleep' && r.duration)
    const totalMinutes = sleepRecords.reduce((sum, r) => sum + (r.duration || 0), 0)
    return formatDuration(totalMinutes)
  }

  // Convert time to position on timeline
  const getTimePosition = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const totalMinutes = hours * 60 + minutes
    return (totalMinutes / (24 * 60)) * 100 // Percentage of day
  }

  // Get hour labels for timeline
  const getHourLabels = () => {
    const labels = []
    for (let hour = 0; hour < 24; hour += 2) {
      labels.push({
        hour,
        label: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`
      })
    }
    return labels
  }

  const hourLabels = getHourLabels()

  const handleEditRecord = (record: Record) => {
    setEditingRecord(record)
    setIsEditModalOpen(true)
  }

  const handleUpdateRecord = (id: string, updatedRecord: Partial<Record>) => {
    onEditRecord(id, updatedRecord)
    setIsEditModalOpen(false)
    setEditingRecord(null)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header with current date and navigation */}
      <div className="bg-gray-900 text-white px-6 pt-16 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <div className="text-3xl font-bold">
              {formatDate(currentDate).split('.')[1]}월 {formatDate(currentDate).split('.')[2]}일
            </div>
            <div className="text-lg text-gray-300 mt-1">
              {currentDate.getFullYear()}
            </div>
          </div>
          
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Week days */}
      <div className="bg-white px-6 pb-4">
        <div className="flex justify-between">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center">
              <div className={`text-sm font-medium ${
                day.toDateString() === currentDate.toDateString() 
                  ? 'text-blue-600' 
                  : 'text-gray-500'
              }`}>
                {day.getDate()} {day.toLocaleDateString('ko-KR', { weekday: 'short' }).charAt(0)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="flex-1 px-6 pt-4 pb-4 bg-white">
        <div className="relative h-full">
          {/* Time labels */}
          <div className="absolute left-0 top-0 h-full w-20 text-xs text-gray-400">
            {hourLabels.map((label, index) => (
              <div 
                key={index} 
                className="absolute flex items-center"
                style={{ 
                  top: `${(index / (hourLabels.length - 1)) * 100}%`,
                  transform: 'translateY(-8px)'
                }}
              >
                <div className="w-2 h-px bg-gray-200 mr-2"></div>
                <div className="text-xs">{label.label}</div>
                {label.hour === 6 && (
                  <div className="ml-1 text-yellow-500 text-xs">☀️</div>
                )}
                {label.hour === 12 && (
                  <div className="ml-1 text-yellow-500 text-xs">☀️</div>
                )}
                {label.hour === 0 && (
                  <div className="ml-1 text-blue-500 text-xs">🌙</div>
                )}
              </div>
            ))}
          </div>

          {/* Timeline grid */}
          <div className="ml-20 h-full relative">
            {/* Vertical lines for each day */}
            <div className="absolute inset-0 flex">
              {weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className="flex-1 relative">
                  {/* Hour lines */}
                  {hourLabels.map((_, hourIndex) => (
                    <div
                      key={hourIndex}
                      className="absolute w-full h-px bg-gray-100"
                      style={{ top: `${(hourIndex / (hourLabels.length - 1)) * 100}%` }}
                    />
                  ))}
                  
                  {/* Records for this day */}
                  {getRecordsForDay(day).map((record) => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      onEdit={handleEditRecord}
                      onDelete={onDeleteRecord}
                      variant="timeline"
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Daily sleep duration */}
      <div className="px-6 pb-4">
        <div className="flex justify-between text-sm text-gray-600">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center">
              {getSleepDuration(day)}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom section with stats and add button */}
      <div className="bg-gray-900 text-white px-6 py-6 rounded-t-3xl">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-300 mb-1">7일 평균 수면 시간</div>
          <div className="text-2xl font-bold">{averageSleepTime}</div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={onAIReview}
            className="px-4 py-2 text-white rounded-lg hover:opacity-80 transition-opacity text-sm"
            style={{ backgroundColor: '#949CAF' }}
          >
            AI 분석
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 text-white rounded-lg hover:opacity-80 transition-opacity text-sm"
            style={{ backgroundColor: '#949CAF' }}
          >
            내보내기
          </button>
        </div>
        
        <button
          onClick={onAddRecord}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg hover:shadow-xl transition-shadow text-gray-900 text-2xl font-light"
        >
          +
        </button>
      </div>

      {/* Edit Record Modal */}
      <EditRecordModal
        isOpen={isEditModalOpen}
        record={editingRecord}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingRecord(null)
        }}
        onUpdateRecord={handleUpdateRecord}
        onDeleteRecord={onDeleteRecord}
      />
    </div>
  )
}
