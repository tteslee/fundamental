'use client'

import { useState } from 'react'
import { RecordType } from '@/types'
import { getRecordTypeColor, getRecordTypeLabel } from '@/lib/utils'

interface DateSelectorProps {
  selectedDate: Date
  startTime?: Date
  endTime?: Date | null
  onDateConfirm: (date: Date) => void
  onBack: () => void
}

export default function DateSelector({ selectedDate, startTime, endTime, onDateConfirm, onBack }: DateSelectorProps) {
  const [selectedMonth, setSelectedMonth] = useState(selectedDate.getMonth())
  const [selectedDay, setSelectedDay] = useState(selectedDate.getDate())

  // Generate month options
  const getMonthOptions = () => {
    const months = []
    const currentDate = new Date()
    for (let i = -2; i <= 2; i++) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
      months.push({
        value: month.getMonth(),
        label: month.toLocaleDateString('ko-KR', { month: 'short' }),
        year: month.getFullYear()
      })
    }
    return months
  }

  // Generate day options for selected month
  const getDayOptions = () => {
    const days = []
    const year = new Date().getFullYear()
    const daysInMonth = new Date(year, selectedMonth + 1, 0).getDate()
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, selectedMonth, day)
      days.push({
        value: day,
        label: `${day}일`,
        isWeekend: date.getDay() === 0 || date.getDay() === 6
      })
    }
    return days
  }

  const monthOptions = getMonthOptions()
  const dayOptions = getDayOptions()

  const handleConfirm = () => {
    const year = new Date().getFullYear()
    const date = new Date(year, selectedMonth, selectedDay)
    
    // Preserve the time from the original selectedDate
    date.setHours(selectedDate.getHours(), selectedDate.getMinutes(), selectedDate.getSeconds(), selectedDate.getMilliseconds())
    
    onDateConfirm(date)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900">
          {startTime ? startTime.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : selectedDate.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
        <div className="text-sm text-gray-500 mt-1">Selected Time</div>
      </div>

      {/* Time range display */}
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-sm">
            {startTime ? startTime.toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : selectedDate.toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          <div className="text-gray-300 text-xs">start</div>
        </div>
        <div className="mx-4 text-gray-300">→</div>
        <div className="text-center">
          <div className="text-gray-400 text-sm">
            {endTime ? endTime.toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : (startTime ? startTime.toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : selectedDate.toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }))}
          </div>
          <div className="text-gray-300 text-xs">end</div>
        </div>
      </div>

      {/* Date display */}
      <div className="text-center">
        <div className="text-gray-400 text-sm">
          {selectedDate.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          })}
        </div>
      </div>

      {/* Month selector */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex justify-between items-center overflow-x-auto">
          {monthOptions.map((month, index) => (
            <button
              key={index}
              onClick={() => setSelectedMonth(month.value)}
              className={`text-sm font-medium transition-colors whitespace-nowrap px-2 py-1 rounded ${
                month.value === selectedMonth
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {month.label}
            </button>
          ))}
        </div>
      </div>

      {/* Day selector */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex justify-between items-center overflow-x-auto">
          {dayOptions.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDay(day.value)}
              className={`text-sm font-medium transition-colors whitespace-nowrap px-2 py-1 rounded ${
                day.value === selectedDay
                  ? 'bg-gray-200 text-gray-900'
                  : day.isWeekend
                  ? 'text-red-400 hover:text-red-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center space-x-8">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 rounded-full text-white font-medium transition-colors"
          style={{ backgroundColor: getRecordTypeColor('food') }}
        >
          Confirm
        </button>
      </div>
    </div>
  )
}
