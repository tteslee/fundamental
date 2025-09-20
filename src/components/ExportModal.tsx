'use client'

import { useState } from 'react'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: 'csv' | 'pdf') => void
  isLoading: boolean
}

export default function ExportModal({ isOpen, onClose, onExport, isLoading }: ExportModalProps) {

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl w-full max-w-md mx-4 mb-0 transform transition-transform duration-300 ease-out">
        {/* Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 text-sm"
        >
          cancel
        </button>

        {/* Content */}
        <div className="px-6 pb-8">
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold text-gray-900">Export Data</h2>
          <p className="text-gray-600 mt-2">데이터를 내보낼 형식을 선택하세요</p>
        </div>

          <div className="space-y-4">
            {/* CSV Export */}
            <button
              onClick={() => onExport('csv')}
              disabled={isLoading}
              className="w-full text-white py-4 px-6 rounded-lg hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              style={{ backgroundColor: '#949CAF' }}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                  <span className="text-blue-500 font-bold text-sm">CSV</span>
                </div>
                <span className="font-medium">Download CSV</span>
              </div>
            </button>

            {/* PDF Export */}
            <button
              onClick={() => onExport('pdf')}
              disabled={isLoading}
              className="w-full text-white py-4 px-6 rounded-lg hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              style={{ backgroundColor: '#949CAF' }}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                  <span className="text-red-500 font-bold text-sm">PDF</span>
                </div>
                <span className="font-medium">Download PDF</span>
              </div>
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600 text-sm">내보내는 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
