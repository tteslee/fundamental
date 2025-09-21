'use client'

import { useState, useEffect } from 'react'
import { Record, RecordType } from '@/types'
import { formatTime, getRecordTypeColor, getRecordTypeLabel } from '@/lib/utils'
import TimeSelector from './TimeSelector'
import DateSelector from './DateSelector'
import MemoInput from './MemoInput'

interface AddRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onAddRecord: (record: Omit<Record, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void
  defaultDate?: Date | null
}

export default function AddRecordModal({ isOpen, onClose, onAddRecord, defaultDate }: AddRecordModalProps) {
  const [selectedType, setSelectedType] = useState<RecordType | null>(null)
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState(defaultDate || new Date())
  const [memo, setMemo] = useState('')
  const [showTimeSelector, setShowTimeSelector] = useState(false)
  const [showDateSelector, setShowDateSelector] = useState(false)
  const [showMemoInput, setShowMemoInput] = useState(false)
  
  // Store time components separately to preserve them
  const [startTimeComponents, setStartTimeComponents] = useState({ hours: 0, minutes: 0 })
  const [endTimeComponents, setEndTimeComponents] = useState<{ hours: number, minutes: number } | null>(null)

  // Update selectedDate when defaultDate changes
  useEffect(() => {
    if (defaultDate) {
      setSelectedDate(defaultDate)
    }
  }, [defaultDate])

  const handleTypeSelect = (type: RecordType) => {
    setSelectedType(type)
    if (type === 'sleep') {
      // For sleep, we need both start and end time
      setShowTimeSelector(true)
    } else {
      // For food and medication, just start time
      setShowTimeSelector(true)
    }
  }

  const handleTimeConfirm = (start: Date, end: Date | null) => {
    console.log('Time confirmed:', { start, end, selectedType })
    setStartTime(start)
    setEndTime(end)
    
    // Store time components for preservation
    setStartTimeComponents({ hours: start.getHours(), minutes: start.getMinutes() })
    if (end) {
      setEndTimeComponents({ hours: end.getHours(), minutes: end.getMinutes() })
    } else {
      setEndTimeComponents(null)
    }
    
    console.log('Time components set:', { 
      startTimeComponents: { hours: start.getHours(), minutes: start.getMinutes() },
      endTimeComponents: end ? { hours: end.getHours(), minutes: end.getMinutes() } : null
    })
    
    setShowTimeSelector(false)
    setShowDateSelector(true)
  }

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date)
    setShowDateSelector(false)
    setShowMemoInput(true)
  }

  const handleMemoConfirm = (memoText: string) => {
    setMemo(memoText)
    setShowMemoInput(false)
    
    // Create the record with proper date/time combination using stored components
    const recordStartTime = new Date(selectedDate)
    recordStartTime.setHours(startTimeComponents.hours, startTimeComponents.minutes, 0, 0)
    
    const recordEndTime = endTimeComponents ? new Date(selectedDate) : undefined
    if (recordEndTime && endTimeComponents) {
      recordEndTime.setHours(endTimeComponents.hours, endTimeComponents.minutes, 0, 0)
      
      // Handle sleep that spans to next day (e.g., 11 PM to 7 AM)
      if (endTimeComponents.hours < startTimeComponents.hours) {
        recordEndTime.setDate(recordEndTime.getDate() + 1)
      }
    }
    
    if (!selectedType) {
      console.error('No record type selected')
      return
    }

    // Calculate duration for sleep records
    let duration: number | undefined = undefined
    if (selectedType === 'sleep' && endTimeComponents) {
      const startMinutes = startTimeComponents.hours * 60 + startTimeComponents.minutes
      const endMinutes = endTimeComponents.hours * 60 + endTimeComponents.minutes
      
      // Handle sleep that spans to next day (e.g., 11 PM to 7 AM)
      if (endTimeComponents.hours < startTimeComponents.hours) {
        duration = (24 * 60) - startMinutes + endMinutes
      } else {
        duration = endMinutes - startMinutes
      }
    }

    const record: Omit<Record, 'id' | 'createdAt' | 'updatedAt'> = {
      type: selectedType,
      startTime: recordStartTime,
      endTime: recordEndTime || undefined,
      duration: duration,
      memo: memoText || undefined,
      userId: 'cmfs3fans0000me40mimwsht2', // Demo user ID
    }

    console.log('Creating record:', record)
    
    onAddRecord(record)
    handleClose()
  }

  const handleClose = () => {
    setSelectedType(null)
    setStartTime(new Date())
    setEndTime(null)
    setSelectedDate(new Date())
    setMemo('')
    setStartTimeComponents({ hours: 0, minutes: 0 })
    setEndTimeComponents(null)
    setShowTimeSelector(false)
    setShowDateSelector(false)
    setShowMemoInput(false)
    onClose()
  }

  // Force close function for emergency cases
  const forceClose = () => {
    setSelectedType(null)
    setStartTime(new Date())
    setEndTime(null)
    setSelectedDate(new Date())
    setMemo('')
    setStartTimeComponents({ hours: 0, minutes: 0 })
    setEndTimeComponents(null)
    setShowTimeSelector(false)
    setShowDateSelector(false)
    setShowMemoInput(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" key={`modal-${isOpen}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={forceClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl w-full max-w-md mx-4 mb-0 transform transition-transform duration-300 ease-out">
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Cancel button */}
        <button
          onClick={forceClose}
          className="absolute top-4 left-4 text-gray-400 text-sm"
        >
          cancel
        </button>

        {/* Content */}
        <div className="px-6 pb-8">
          {!selectedType && (
            <>
              {/* Current time display */}
              <div className="text-center py-8">
                <div className="text-3xl font-bold text-gray-900">
                  {formatTime(new Date())}
                </div>
                <div className="text-sm text-gray-500 mt-1">Now</div>
              </div>

              {/* Time range display */}
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <div className="text-gray-400 text-sm">{formatTime(new Date())}</div>
                  <div className="text-gray-300 text-xs">today</div>
                </div>
                <div className="mx-4 text-gray-300">→</div>
                <div className="text-center">
                  <div className="text-gray-400 text-sm">{formatTime(new Date())}</div>
                  <div className="text-gray-300 text-xs">today</div>
                </div>
              </div>

              {/* Record type selection */}
              <div className="flex justify-center space-x-8 py-8">
                {(['food', 'sleep', 'medication'] as RecordType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeSelect(type)}
                    className="flex flex-col items-center space-y-2"
                  >
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow text-white text-2xl font-light"
                      style={{ backgroundColor: getRecordTypeColor(type) }}
                    >
                      +
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {getRecordTypeLabel(type)}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

            {selectedType && showTimeSelector && !showDateSelector && !showMemoInput && (
              <TimeSelector
                selectedType={selectedType}
                startTime={startTime}
                endTime={endTime}
                onTimeConfirm={handleTimeConfirm}
                onBack={() => {
                  setSelectedType(null)
                  setShowTimeSelector(false)
                }}
              />
            )}

            {selectedType && showDateSelector && !showTimeSelector && !showMemoInput && (
              <DateSelector
                selectedDate={new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), startTimeComponents.hours, startTimeComponents.minutes)}
                selectedType={selectedType}
                startTime={new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), startTimeComponents.hours, startTimeComponents.minutes)}
                endTime={endTimeComponents ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), endTimeComponents.hours, endTimeComponents.minutes) : null}
                onDateConfirm={handleDateConfirm}
                onBack={() => {
                  setShowDateSelector(false)
                  setShowTimeSelector(true)
                }}
              />
            )}

            {selectedType && showMemoInput && !showTimeSelector && !showDateSelector && (
              <MemoInput
                selectedType={selectedType}
                memo={memo}
                startTime={new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), startTimeComponents.hours, startTimeComponents.minutes)}
                endTime={endTimeComponents ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), endTimeComponents.hours, endTimeComponents.minutes) : null}
                selectedDate={selectedDate}
                onMemoConfirm={handleMemoConfirm}
                onBack={() => {
                  setShowMemoInput(false)
                  setShowDateSelector(true)
                }}
              />
            )}
        </div>
      </div>
    </div>
  )
}
