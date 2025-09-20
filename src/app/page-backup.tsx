'use client'

import { useState, useEffect } from 'react'
import WeeklyView from '@/components/WeeklyView'
import DailyView from '@/components/DailyView'
import AddRecordModal from '@/components/AddRecordModal'
import AIReviewModal from '@/components/AIReviewModal'
import ExportModal from '@/components/ExportModal'
import { Record, RecordType, AIReview } from '@/types'

// Mock data for development
const mockRecords: Record[] = [
  // December 25th records (for daily view)
  {
    id: '1',
    type: 'sleep',
    startTime: new Date('2023-12-24T23:20:00'),
    endTime: new Date('2023-12-25T07:20:00'),
    duration: 480,
    memo: '새벽에 잤는데 적당하게 일어남',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    type: 'food',
    startTime: new Date('2023-12-25T08:10:00'),
    memo: '우유랑 빵',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    type: 'medication',
    startTime: new Date('2023-12-25T08:40:00'),
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    type: 'food',
    startTime: new Date('2023-12-25T14:30:00'),
    memo: '카레, 샐러드, 아메리카노',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    type: 'food',
    startTime: new Date('2023-12-25T19:30:00'),
    memo: '잡곡밥, 가지볶음',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    type: 'medication',
    startTime: new Date('2023-12-25T23:40:00'),
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Previous days for weekly view
  {
    id: '7',
    type: 'sleep',
    startTime: new Date('2023-12-19T23:00:00'),
    endTime: new Date('2023-12-20T07:00:00'),
    duration: 480,
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
    type: 'food',
    startTime: new Date('2023-12-19T08:00:00'),
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '9',
    type: 'medication',
    startTime: new Date('2023-12-19T07:00:00'),
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '10',
    type: 'sleep',
    startTime: new Date('2023-12-20T22:30:00'),
    endTime: new Date('2023-12-21T06:30:00'),
    duration: 480,
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '11',
    type: 'food',
    startTime: new Date('2023-12-20T12:00:00'),
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '12',
    type: 'medication',
    startTime: new Date('2023-12-20T07:30:00'),
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function Home() {
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false)
  const [records, setRecords] = useState<Record[]>(mockRecords)
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly')
  const [isAIReviewModalOpen, setIsAIReviewModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [aiReview, setAiReview] = useState<AIReview | null>(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleAddRecord = (newRecord: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>) => {
    const record: Record = {
      ...newRecord,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setRecords(prev => [...prev, record])
    setIsAddRecordModalOpen(false)
  }

  const handleEditRecord = (id: string, updatedRecord: Partial<Record>) => {
    setRecords(prev => 
      prev.map(record => 
        record.id === id 
          ? { ...record, ...updatedRecord, updatedAt: new Date() }
          : record
      )
    )
  }

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(record => record.id !== id))
  }

  const handleAIReview = async (period: 'daily' | 'weekly') => {
    setIsLoadingAI(true)
    setIsAIReviewModalOpen(true)
    
    try {
      const startDate = new Date()
      const endDate = new Date()
      
      if (period === 'weekly') {
        startDate.setDate(startDate.getDate() - 7)
      }
      
      const response = await fetch('/api/ai-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })
      
      const review = await response.json()
      setAiReview(review)
    } catch (error) {
      console.error('Error fetching AI review:', error)
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true)
    
    try {
      const startDate = new Date()
      const endDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
      
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fundamental-records.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setIsExportModalOpen(false)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* View toggle */}
      <div className="fixed top-4 right-4 z-40">
        <div className="bg-white rounded-full shadow-lg p-1">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'weekly'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'daily'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Daily
          </button>
        </div>
      </div>

      {viewMode === 'weekly' ? (
        <WeeklyView 
          records={records}
          onAddRecord={() => setIsAddRecordModalOpen(true)}
          onEditRecord={handleEditRecord}
          onDeleteRecord={handleDeleteRecord}
          onAIReview={() => handleAIReview('weekly')}
          onExport={() => setIsExportModalOpen(true)}
        />
      ) : (
        <DailyView 
          records={records}
          onAddRecord={() => setIsAddRecordModalOpen(true)}
          onEditRecord={handleEditRecord}
          onDeleteRecord={handleDeleteRecord}
          onAIReview={() => handleAIReview('daily')}
          onExport={() => setIsExportModalOpen(true)}
        />
      )}
      
      <AddRecordModal
        isOpen={isAddRecordModalOpen}
        onClose={() => setIsAddRecordModalOpen(false)}
        onAddRecord={handleAddRecord}
      />

      <AIReviewModal
        isOpen={isAIReviewModalOpen}
        onClose={() => setIsAIReviewModalOpen(false)}
        review={aiReview}
        isLoading={isLoadingAI}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        isLoading={isExporting}
      />
    </main>
  )
}
