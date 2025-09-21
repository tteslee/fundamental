'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/Providers'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import WeeklyView from '@/components/WeeklyView'
import DailyView from '@/components/DailyView'
import AddRecordModal from '@/components/AddRecordModal'
import AIReviewModal from '@/components/AIReviewModal'
import ExportModal from '@/components/ExportModal'
import { Record, RecordType, AIReview } from '@/types'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false)
  const [records, setRecords] = useState<Record[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly')
  const [isAIReviewModalOpen, setIsAIReviewModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [aiReview, setAiReview] = useState<AIReview | null>(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  // Fetch records from database
  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          console.error('No access token')
          setIsLoading(false)
          return
        }

        // Debug: Check user info
        console.log('Current user:', user)
        console.log('User ID:', user.id)

        const response = await fetch('/api/records', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched records from API:', data)
          console.log('Number of records fetched:', data.length)
          setRecords(data)
        } else {
          console.error('Failed to fetch records')
        }
      } catch (error) {
        console.error('Error fetching records:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecords()
  }, [user])

  const handleAddRecord = async (newRecord: Omit<Record, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('No access token')
        return
      }

      // Serialize dates properly
      const serializedRecord = {
        ...newRecord,
        startTime: newRecord.startTime.toISOString(),
        endTime: newRecord.endTime ? newRecord.endTime.toISOString() : null,
        userId: user?.id,
      }

      console.log('Sending record:', serializedRecord)

      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(serializedRecord),
      })

      if (response.ok) {
        const createdRecord = await response.json()
        console.log('Created record response:', createdRecord)
        console.log('Current records before adding:', records.length)
        setRecords(prev => {
          const newRecords = [...prev, createdRecord]
          console.log('New records after adding:', newRecords.length)
          return newRecords
        })
        setIsAddRecordModalOpen(false)
      } else {
        const errorText = await response.text()
        console.error('Failed to create record:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error creating record:', error)
    }
  }

  const handleAddRecordWithDate = (currentDate?: Date) => {
    setSelectedDate(currentDate || null)
    setIsAddRecordModalOpen(true)
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

  const handleDeleteRecord = async (id: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        console.error('No access token')
        return
      }

      console.log('Deleting record:', id)

      const response = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        console.log('Record deleted successfully')
        setRecords(prev => prev.filter(record => record.id !== id))
      } else {
        const errorText = await response.text()
        console.error('Failed to delete record:', response.status, errorText)
        alert('기록 삭제에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('Error deleting record:', error)
      alert('기록 삭제 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const handleAIReview = async (period: 'daily' | 'weekly') => {
    setIsLoadingAI(true)
    setIsAIReviewModalOpen(true)
    
    try {
      // Filter records to only include 2025+ data (real data)
      const realRecords = records.filter(record => {
        const recordDate = new Date(record.startTime)
        return recordDate.getFullYear() >= 2025
      })

      console.log('Sending AI review request for', realRecords.length, 'real records')

      const response = await fetch('/api/ai-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          period,
          records: realRecords,
        }),
      })

      if (!response.ok) {
        throw new Error(`AI review failed: ${response.status}`)
      }

      const aiReview = await response.json()
      console.log('AI review received:', aiReview)
      setAiReview(aiReview)
    } catch (error) {
      console.error('Error fetching AI review:', error)
      // Set a fallback review if API fails
      setAiReview({
        overallReview: {
          summary: 'AI 분석을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.',
          positiveReinforcement: '기록을 꾸준히 하시는 모습이 훌륭합니다.',
          patternsNoticed: '더 많은 데이터가 필요합니다.',
          moodLinkages: '패턴 분석을 위해 더 많은 기록을 추가해주세요.'
        },
        thingsToImprove: {
          habitGaps: 'AI 분석을 위해 더 많은 기록을 추가해주세요.',
          balanceIssues: '데이터가 부족하여 분석이 어렵습니다.',
          actionableSuggestions: ['더 많은 기록을 추가해주세요', '정기적으로 기록해주세요']
        },
        highlightedWins: {
          consistencyStreaks: '현재 기록을 유지하고 있습니다.',
          improvementTrends: '더 많은 데이터가 필요합니다.'
        },
        lookingAhead: {
          motivation: '계속해서 기록을 추가해주세요.',
          goalSetting: '더 많은 데이터로 더 나은 분석을 받아보세요.'
        }
      })
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    console.log('Export triggered with format:', format)
    console.log('Current records state at export time:', records.length, 'records')
    console.log('Records data:', records)
    
    setIsExporting(true)
    
    try {
      // Calculate date range for export (last 30 days)
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      
      // If no records, fetch them first
      if (records.length === 0) {
        console.log('No records in state, fetching from API...')
        try {
          const response = await fetch('/api/records')
          if (response.ok) {
            const data = await response.json()
            console.log('Fetched records from API:', data.length, 'records')
            setRecords(data)
            // Use the fetched data for export
            const serializedRecords = data.map((record: any) => ({
              ...record,
              startTime: record.startTime instanceof Date ? record.startTime.toISOString() : record.startTime,
              endTime: record.endTime ? (record.endTime instanceof Date ? record.endTime.toISOString() : record.endTime) : null,
              createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : record.createdAt,
              updatedAt: record.updatedAt instanceof Date ? record.updatedAt.toISOString() : record.updatedAt,
            }))
            
            console.log('Using fetched records for export:', serializedRecords.length, 'records')
            await performExport(format, serializedRecords, startDate, endDate)
            return
          }
        } catch (error) {
          console.error('Error fetching records for export:', error)
        }
      }
      
      // Serialize records properly for JSON
      const serializedRecords = records.map(record => ({
        ...record,
        startTime: record.startTime instanceof Date ? record.startTime.toISOString() : record.startTime,
        endTime: record.endTime ? (record.endTime instanceof Date ? record.endTime.toISOString() : record.endTime) : null,
        createdAt: record.createdAt instanceof Date ? record.createdAt.toISOString() : record.createdAt,
        updatedAt: record.updatedAt instanceof Date ? record.updatedAt.toISOString() : record.updatedAt,
      }))
      
      console.log('Using existing records for export:', serializedRecords.length, 'records')
      console.log('First record:', serializedRecords[0])
      console.log('Sending export request:', { format, startDate: startDate.toISOString(), endDate: endDate.toISOString(), recordsCount: serializedRecords.length })
      
      await performExport(format, serializedRecords, startDate, endDate)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('내보내기에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsExporting(false)
    }
  }

  const performExport = async (format: string, serializedRecords: any[], startDate: Date, endDate: Date) => {
    const response = await fetch('/api/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        records: serializedRecords,
      }),
    })
    
    console.log('Export response status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Export error response:', errorText)
      throw new Error(`Export failed: ${response.status} ${response.statusText}`)
    }
    
    if (format === 'pdf') {
      // For PDF, open in new tab
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      window.URL.revokeObjectURL(url)
    } else {
      // For CSV, download directly
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fundamental-records.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
    
    setIsExportModalOpen(false)
  }

  // Show loading state
  if (isLoading || loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">기록을 불러오는 중...</p>
        </div>
      </main>
    )
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">로그인 페이지로 이동 중...</p>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <main className="w-full max-w-md bg-white min-h-screen relative">
        {/* Header with user info and controls */}
        <div className="fixed top-4 right-4 z-40 flex items-center gap-4">
        {/* User info and logout */}
        <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-3">
          <div className="text-sm">
            <p className="font-medium text-gray-900">{user?.user_metadata?.name || user?.email}</p>
            <p className="text-gray-500 text-xs">다시 오신 것을 환영합니다!</p>
          </div>
          <button
            onClick={() => signOut()}
            className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            로그아웃
          </button>
        </div>

        {/* View toggle */}
        <div className="bg-white rounded-full shadow-lg p-1">
          <button
            onClick={() => setViewMode('weekly')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'weekly'
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{ backgroundColor: viewMode === 'weekly' ? '#949CAF' : 'transparent' }}
          >
            주간
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'daily'
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={{ backgroundColor: viewMode === 'daily' ? '#949CAF' : 'transparent' }}
          >
            일간
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
          onAddRecord={handleAddRecordWithDate}
          onEditRecord={handleEditRecord}
          onDeleteRecord={handleDeleteRecord}
          onAIReview={() => handleAIReview('daily')}
          onExport={() => setIsExportModalOpen(true)}
        />
      )}
      
      <AddRecordModal
        isOpen={isAddRecordModalOpen}
        onClose={() => {
          setIsAddRecordModalOpen(false)
          setSelectedDate(null)
        }}
        onAddRecord={handleAddRecord}
        defaultDate={selectedDate}
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
    </div>
  )
}
