'use client'

import { useState } from 'react'
import { Record } from '@/types'
import { formatTime, getRecordTypeColor, getRecordTypeLabel } from '@/lib/utils'
import { Edit3, Trash2 } from 'lucide-react'

interface RecordCardProps {
  record: Record
  onEdit: (record: Record) => void
  onDelete: (id: string) => void
  variant?: 'list' | 'timeline'
}

export default function RecordCard({ record, onEdit, onDelete, variant = 'list' }: RecordCardProps) {
  const [isSwiped, setIsSwiped] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX)
    setCurrentX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - startX
    setCurrentX(e.touches[0].clientX)
    
    // Only allow swiping left (negative deltaX)
    if (deltaX < 0) {
      setIsSwiped(true)
    }
  }

  const handleTouchEnd = () => {
    const deltaX = currentX - startX
    
    // If swiped far enough, keep it open
    if (deltaX < -50) {
      setIsSwiped(true)
    } else {
      setIsSwiped(false)
    }
  }

  const handleEdit = () => {
    onEdit(record)
    setIsSwiped(false)
  }

  const handleDelete = () => {
    onDelete(record.id)
    setIsSwiped(false)
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

  if (variant === 'timeline') {
    // For timeline view, just show the dot/bar
    const startTime = new Date(record.startTime)
    const topPosition = (startTime.getHours() * 60 + startTime.getMinutes()) / (24 * 60) * 100
    const height = record.type === 'sleep' && record.duration ? (record.duration / (24 * 60)) * 100 : 8
    
    console.log('Timeline record:', {
      type: record.type,
      duration: record.duration,
      startTime: record.startTime,
      topPosition,
      height,
      isSleep: record.type === 'sleep'
    })
    
    return (
      <div
        className="absolute left-0 right-0 cursor-pointer group"
        style={{ 
          top: `${topPosition}%`,
          height: `${height}%`
        }}
        onClick={() => onEdit(record)}
      >
        <div 
          className="w-3 h-full rounded-full mx-auto opacity-80 hover:opacity-100 transition-opacity"
          style={{ backgroundColor: getRecordTypeColor(record.type as any) }}
        />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      {/* Swipe actions */}
      <div className={`absolute inset-0 flex transition-transform duration-300 ${
        isSwiped ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Edit button */}
        <div className="w-20 flex items-center justify-center" style={{ backgroundColor: '#949CAF' }}>
          <button
            onClick={handleEdit}
            className="p-2 text-white hover:opacity-80 transition-opacity"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
        
        {/* Delete button */}
        <div className="w-20 flex items-center justify-center" style={{ backgroundColor: '#949CAF' }}>
          <button
            onClick={handleDelete}
            className="p-2 text-white hover:opacity-80 transition-opacity"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main card */}
      <div
        className={`${getCardBackgroundColor(record.type)} rounded-2xl p-4 flex items-center space-x-4 cursor-pointer hover:shadow-md transition-all duration-300 ${
          isSwiped ? 'transform -translate-x-40' : 'transform translate-x-0'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => !isSwiped && onEdit(record)}
      >
        {/* Color dot */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: getRecordTypeColor(record.type as any) }}
        />
        
        {/* Record content */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="font-medium text-gray-900">
              {getRecordTypeLabel(record.type as any)}
            </div>
            <div className="text-sm text-gray-500">
              {formatTime(new Date(record.startTime))}
              {record.endTime && ` – ${formatTime(new Date(record.endTime))}`}
            </div>
          </div>
          {record.memo && (
            <div className="text-sm text-gray-600 mt-1">
              {record.memo}
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}
