'use client'

import { useState } from 'react'
import { RecordType } from '@/types'
import { formatTime, getRecordTypeColor, getRecordTypeLabel } from '@/lib/utils'

interface TimeSelectorProps {
  selectedType: RecordType
  startTime: Date
  endTime: Date | null
  onTimeConfirm: (startTime: Date, endTime: Date | null) => void
  onBack: () => void
}

export default function TimeSelector({ 
  selectedType, 
  startTime, 
  endTime, 
  onTimeConfirm, 
  onBack 
}: TimeSelectorProps) {
  const [selectedStartTime, setSelectedStartTime] = useState(startTime)
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(endTime)
  const [isSelectingEndTime, setIsSelectingEndTime] = useState(false)

  // Generate time slots for 24 hours
  const getTimeSlots = () => {
    const slots = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) { // 15-minute intervals
        const time = new Date()
        time.setHours(hour, minute, 0, 0)
        slots.push({
          hour,
          minute,
          label: hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`,
          time,
          displayTime: time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })
        })
      }
    }
    return slots
  }

  const timeSlots = getTimeSlots()
  const currentTime = isSelectingEndTime ? selectedEndTime : selectedStartTime
  const currentHour = currentTime?.getHours() || 0
  const currentMinute = currentTime?.getMinutes() || 0

  const handleTimeSelect = (hour: number, minute: number = 0) => {
    const newTime = new Date(currentTime || new Date())
    newTime.setHours(hour, minute, 0, 0)
    
    if (isSelectingEndTime) {
      setSelectedEndTime(newTime)
    } else {
      setSelectedStartTime(newTime)
    }
  }

  const handleStartTimeSelect = () => {
    setIsSelectingEndTime(false)
  }

  const handleEndTimeSelect = () => {
    setIsSelectingEndTime(true)
  }

  const handleConfirm = () => {
    onTimeConfirm(selectedStartTime, selectedEndTime)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900">
          {isSelectingEndTime ? '종료 시간' : '시작 시간'}
        </div>
        <div className="text-3xl font-bold text-gray-900 mt-2">
          {currentTime?.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}
        </div>
      </div>

      {/* Time range display */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleStartTimeSelect}
          className={`text-center p-3 rounded-lg transition-colors ${
            !isSelectingEndTime 
              ? 'bg-blue-100 border-2 border-blue-500' 
              : 'bg-gray-100 border-2 border-transparent'
          }`}
        >
          <div className={`text-sm font-medium ${
            !isSelectingEndTime ? 'text-blue-700' : 'text-gray-600'
          }`}>
            시작
          </div>
          <div className={`text-lg ${
            !isSelectingEndTime ? 'text-blue-900' : 'text-gray-700'
          }`}>
            {selectedStartTime.toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}
          </div>
        </button>
        
        <div className="mx-4 text-gray-300">→</div>
        
        <button
          onClick={handleEndTimeSelect}
          className={`text-center p-3 rounded-lg transition-colors ${
            isSelectingEndTime 
              ? 'bg-blue-100 border-2 border-blue-500' 
              : 'bg-gray-100 border-2 border-transparent'
          }`}
        >
          <div className={`text-sm font-medium ${
            isSelectingEndTime ? 'text-blue-700' : 'text-gray-600'
          }`}>
            종료
          </div>
          <div className={`text-lg ${
            isSelectingEndTime ? 'text-blue-900' : 'text-gray-700'
          }`}>
            {selectedEndTime 
              ? selectedEndTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })
              : '--:-- --'
            }
          </div>
        </button>
      </div>

      {/* Date display */}
      <div className="text-center">
        <div className="text-gray-400 text-sm">
          {selectedStartTime.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          })}
        </div>
      </div>

      {/* 24-hour time selector */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="text-center text-sm text-gray-600 mb-3">시간 선택</div>
        
        {/* Hour selector */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">시간</div>
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {Array.from({ length: 24 }, (_, hour) => (
              <button
                key={hour}
                onClick={() => handleTimeSelect(hour, currentMinute)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  hour === currentHour
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </button>
            ))}
          </div>
        </div>

        {/* Minute selector */}
        <div>
          <div className="text-xs text-gray-500 mb-2">분</div>
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {[0, 15, 30, 45].map((minute) => (
              <button
                key={minute}
                onClick={() => handleTimeSelect(currentHour, minute)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  minute === currentMinute
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-200'
                }`}
              >
                {minute.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center space-x-8">
        <button
          onClick={onBack}
          className="px-6 py-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 rounded-full text-white font-medium transition-colors"
          style={{ backgroundColor: getRecordTypeColor(selectedType) }}
        >
          확인
        </button>
      </div>
    </div>
  )
}
