'use client'

import { useState } from 'react'
import { Record } from '@/types'
import { formatTime, formatDate, getRecordTypeColor, getRecordTypeLabel } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import RecordCard from './RecordCard'
import EditRecordModal from './EditRecordModal'

interface DailyViewProps {
  records: Record[]
  onAddRecord: () => void
  onEditRecord: (id: string, record: Partial<Record>) => void
  onDeleteRecord: (id: string) => void
  onAIReview: () => void
  onExport: () => void
}

export default function DailyView({ records, onAddRecord, onEditRecord, onDeleteRecord, onAIReview, onExport }: DailyViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [editingRecord, setEditingRecord] = useState<Record | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Get records for the current day
  const getRecordsForDay = (date: Date) => {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    
    return records
      .filter(record => {
        const recordDate = new Date(record.startTime)
        return recordDate >= dayStart && recordDate <= dayEnd
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }

  const dayRecords = getRecordsForDay(currentDate)

  // Calculate average sleep time for the week
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const weekStart = getWeekStart(currentDate)
  const weekRecords = records.filter(record => {
    const recordDate = new Date(record.startTime)
    return recordDate >= weekStart && recordDate <= new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
  })

  const sleepRecords = weekRecords.filter(r => r.type === 'sleep' && r.duration)
  const totalSleepMinutes = sleepRecords.reduce((sum, r) => sum + (r.duration || 0), 0)
  const averageSleepMinutes = sleepRecords.length > 0 ? totalSleepMinutes / sleepRecords.length : 0
  const averageSleepTime = `${Math.floor(averageSleepMinutes / 60).toString().padStart(2, '0')}:${Math.round(averageSleepMinutes % 60).toString().padStart(2, '0')}`

  // Convert time to position on timeline
  const getTimePosition = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const totalMinutes = hours * 60 + minutes
    return (totalMinutes / (24 * 60)) * 100
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

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const handleEditRecord = (record: Record) => {
    setEditingRecord(record)
    setIsEditModalOpen(true)
  }

  const handleUpdateRecord = (id: string, updatedRecord: Partial<Record>) => {
    onEditRecord(id, updatedRecord)
    setIsEditModalOpen(false)
    setEditingRecord(null)
  }

  const getCardBackgroundColor = (type: string) => {
    switch (type) {
      case 'sleep':
        return 'bg-purple-100'
      case 'food':
        return 'bg-pink-100'
      case 'medication':
        return 'bg-green-100'
      default:
        return 'bg-gray-100'
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header with date and navigation */}
      <div className="bg-gray-900 text-white px-6 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDay('prev')}
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
            onClick={() => navigateDay('next')}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex">
        {/* Activity list */}
        <div className="flex-1 p-6 space-y-4">
          {dayRecords.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className="text-lg mb-2">No records for this day</div>
              <div className="text-sm">Tap the + button to add your first record</div>
            </div>
          ) : (
            dayRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onEdit={handleEditRecord}
                onDelete={onDeleteRecord}
                variant="list"
              />
            ))
          )}
        </div>

        {/* Timeline */}
        <div className="w-32 p-6">
          <div className="relative h-full">
            {/* Day indicator */}
            <div className="text-center text-sm font-medium text-gray-600 mb-4">
              {formatDate(currentDate).split('.')[1]}월 {formatDate(currentDate).split('.')[2]}일
            </div>
            
            {/* Timeline bar */}
            <div className="relative h-full">
              {/* Hour labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400">
                {hourLabels.map((label, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-2 top-0 w-1 h-px bg-gray-200"></div>
                    <div className="ml-2">{label.label}</div>
                  </div>
                ))}
              </div>

              {/* Timeline visualization */}
              <div className="ml-8 h-full relative">
                {/* Records for this day */}
                {dayRecords.map((record) => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    onEdit={handleEditRecord}
                    onDelete={onDeleteRecord}
                    variant="timeline"
                  />
                ))}

                {/* Current time indicator */}
                <div
                  className="absolute left-0 right-0 flex justify-center"
                  style={{ top: `${getTimePosition(new Date())}%` }}
                >
                  <div className="w-2 h-2 bg-white rounded-full border border-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with stats and add button */}
      <div className="bg-gray-900 text-white px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-300">Average sleep time in 7 days</div>
            <div className="text-2xl font-bold">{averageSleepTime}</div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onAIReview}
              className="px-3 py-2 text-white rounded-lg hover:opacity-80 transition-opacity text-sm"
              style={{ backgroundColor: '#949CAF' }}
            >
              AI Review
            </button>
            <button
              onClick={onExport}
              className="px-3 py-2 text-white rounded-lg hover:opacity-80 transition-opacity text-sm"
              style={{ backgroundColor: '#949CAF' }}
            >
              Export
            </button>
            <button
              onClick={onAddRecord}
              className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow text-gray-900 text-2xl font-light"
            >
              +
            </button>
          </div>
        </div>
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
