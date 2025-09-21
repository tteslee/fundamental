'use client'

import { useState } from 'react'
import { RecordType } from '@/types'
import { getRecordTypeColor, getRecordTypeLabel } from '@/lib/utils'

interface MemoInputProps {
  selectedType: RecordType
  memo: string
  startTime?: Date
  endTime?: Date | null
  selectedDate?: Date
  onMemoConfirm: (memo: string) => void
  onBack: () => void
}

export default function MemoInput({ selectedType, memo, startTime, endTime, selectedDate, onMemoConfirm, onBack }: MemoInputProps) {
  const [memoText, setMemoText] = useState(memo)

  const handleConfirm = () => {
    onMemoConfirm(memoText)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900">
          {startTime ? startTime.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }) : new Date().toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
        <div className="text-sm text-gray-500 mt-1">선택된 시간</div>
      </div>

      {/* Time range display */}
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-sm">
            {startTime ? startTime.toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : new Date().toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          <div className="text-gray-300 text-xs">시작</div>
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
            }) : new Date().toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }))}
          </div>
          <div className="text-gray-300 text-xs">종료</div>
        </div>
      </div>

      {/* Date display */}
      <div className="text-center">
        <div className="text-gray-400 text-sm">
          {selectedDate ? selectedDate.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          }) : new Date().toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          })}
        </div>
      </div>

      {/* Memo input */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">메모</label>
        <input
          type="text"
          value={memoText}
          onChange={(e) => setMemoText(e.target.value)}
          placeholder="메모를 입력하세요..."
          className="w-full px-0 py-2 border-0 border-b border-gray-200 focus:border-gray-400 focus:outline-none text-gray-900 placeholder-gray-400"
          autoFocus
        />
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
          기록 추가
        </button>
      </div>
    </div>
  )
}
