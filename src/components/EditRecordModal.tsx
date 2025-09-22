'use client'

import { useState, useEffect } from 'react'
import { Record, RecordType } from '@/types'
import { formatTime, getRecordTypeColor, getRecordTypeLabel } from '@/lib/utils'
import TimeSelector from './TimeSelector'
import DateSelector from './DateSelector'
import MemoInput from './MemoInput'

interface EditRecordModalProps {
  isOpen: boolean
  record: Record | null
  onClose: () => void
  onUpdateRecord: (id: string, record: Partial<Record>) => void
  onDeleteRecord: (id: string) => void
}

export default function EditRecordModal({ isOpen, record, onClose, onUpdateRecord, onDeleteRecord }: EditRecordModalProps) {
  const [selectedType, setSelectedType] = useState<RecordType | null>(null)
  const [startTime, setStartTime] = useState(new Date())
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [memo, setMemo] = useState('')
  const [showTimeSelector, setShowTimeSelector] = useState(false)
  const [showDateSelector, setShowDateSelector] = useState(false)
  const [showMemoInput, setShowMemoInput] = useState(false)

  useEffect(() => {
    if (record) {
      setSelectedType(record.type as RecordType)
      setStartTime(new Date(record.startTime))
      setEndTime(record.endTime ? new Date(record.endTime) : null)
      setSelectedDate(new Date(record.startTime))
      setMemo(record.memo || '')
    }
  }, [record])

  const handleTimeConfirm = (start: Date, end: Date | null) => {
    setStartTime(start)
    setEndTime(end)
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
    
    if (record) {
      // Create the record with proper date/time combination
      const recordStartTime = new Date(selectedDate)
      recordStartTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0)
      
      const recordEndTime = endTime ? new Date(selectedDate) : undefined
      if (recordEndTime && endTime) {
        recordEndTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0)
        
        // Handle sleep that spans to next day (e.g., 11 PM to 7 AM)
        if (endTime.getHours() < startTime.getHours()) {
          recordEndTime.setDate(recordEndTime.getDate() + 1)
        }
      }
      
      // Update the record
      const updatedRecord: Partial<Record> = {
        type: selectedType!,
        startTime: recordStartTime,
        endTime: recordEndTime,
        duration: endTime ? 
          Math.round(((endTime.getHours() * 60 + endTime.getMinutes()) - (startTime.getHours() * 60 + startTime.getMinutes()) + (endTime.getHours() < startTime.getHours() ? 24 * 60 : 0)) * 60 * 1000) / (1000 * 60) : 
          undefined,
        memo: memoText || undefined,
      }
      
      console.log('EditRecordModal - sending updatedRecord:', updatedRecord)
      console.log('EditRecordModal - recordStartTime:', recordStartTime)
      console.log('EditRecordModal - recordEndTime:', recordEndTime)
      
      onUpdateRecord(record.id, updatedRecord)
    }
    
    handleClose()
  }

  const handleDelete = () => {
    if (record) {
      onDeleteRecord(record.id)
      handleClose()
    }
  }

  const handleClose = () => {
    setSelectedType(null)
    setStartTime(new Date())
    setEndTime(null)
    setSelectedDate(new Date())
    setMemo('')
    setShowTimeSelector(false)
    setShowDateSelector(false)
    setShowMemoInput(false)
    onClose()
  }

  if (!isOpen || !record) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl w-full max-w-md mx-4 mb-0 transform transition-transform duration-300 ease-out">
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Cancel button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 text-gray-400 text-sm"
        >
          취소
        </button>

        {/* Content */}
        <div className="px-6 pb-8">
          {!showTimeSelector && !showDateSelector && !showMemoInput && (
            <>
              {/* Current time display */}
              <div className="text-center py-8">
                <div className="text-3xl font-bold text-gray-900">
                  {formatTime(new Date(record.startTime))}
                </div>
                <div className="text-sm text-gray-500 mt-1">기록 편집</div>
              </div>

              {/* Time range display */}
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <div className="text-gray-400 text-sm">{formatTime(new Date(record.startTime))}</div>
                  <div className="text-gray-300 text-xs">오늘</div>
                </div>
                <div className="mx-4 text-gray-300">→</div>
                <div className="text-center">
                  <div className="text-gray-400 text-sm">
                    {record.endTime ? formatTime(new Date(record.endTime)) : formatTime(new Date(record.startTime))}
                  </div>
                  <div className="text-gray-300 text-xs">오늘</div>
                </div>
              </div>

              {/* Record type display */}
              <div className="flex justify-center py-8">
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg text-white text-2xl font-light"
                    style={{ backgroundColor: getRecordTypeColor(record.type as any) }}
                  >
                    +
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {getRecordTypeLabel(record.type as any)}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowTimeSelector(true)}
                  className="px-6 py-2 rounded-full text-white font-medium transition-colors"
                  style={{ backgroundColor: getRecordTypeColor(record.type as any) }}
                >
                  편집
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 rounded-full text-white font-medium transition-opacity hover:opacity-80"
                  style={{ backgroundColor: '#949CAF' }}
                >
                  삭제
                </button>
              </div>
            </>
          )}

          {showTimeSelector && (
            <TimeSelector
              selectedType={record.type as RecordType}
              startTime={startTime}
              endTime={endTime}
              onTimeConfirm={handleTimeConfirm}
              onBack={() => setShowTimeSelector(false)}
            />
          )}

          {showDateSelector && (
            <DateSelector
              selectedDate={selectedDate}
              selectedType={record.type as RecordType}
              startTime={startTime}
              endTime={endTime}
              onDateConfirm={handleDateConfirm}
              onBack={() => setShowTimeSelector(true)}
            />
          )}

          {showMemoInput && (
            <MemoInput
              selectedType={record.type as RecordType}
              memo={memo}
              startTime={startTime}
              endTime={endTime}
              selectedDate={selectedDate}
              onMemoConfirm={handleMemoConfirm}
              onBack={() => setShowDateSelector(true)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
