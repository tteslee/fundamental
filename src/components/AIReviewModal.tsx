'use client'

import { useState } from 'react'
import { AIReview } from '@/types'

interface AIReviewModalProps {
  isOpen: boolean
  onClose: () => void
  review: AIReview | null
  isLoading: boolean
}

export default function AIReviewModal({ isOpen, onClose, review, isLoading }: AIReviewModalProps) {

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl w-full max-w-md mx-4 mb-0 transform transition-transform duration-300 ease-out max-h-[80vh] overflow-y-auto">
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
          <h2 className="text-2xl font-bold text-gray-900">AI Review</h2>
        </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">AI가 분석 중입니다...</p>
            </div>
          ) : review ? (
            <div className="space-y-6">
              {/* Overall Review */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Overall Review</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>요약:</strong> {review.overallReview.summary}</p>
                  <p><strong>긍정적 피드백:</strong> {review.overallReview.positiveReinforcement}</p>
                  <p><strong>패턴 분석:</strong> {review.overallReview.patternsNoticed}</p>
                  {review.overallReview.moodLinkages && (
                    <p><strong>기분 연관성:</strong> {review.overallReview.moodLinkages}</p>
                  )}
                </div>
              </div>

              {/* Things to Improve */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">Things to Improve</h3>
                <div className="space-y-2 text-sm text-orange-800">
                  <p><strong>습관 공백:</strong> {review.thingsToImprove.habitGaps}</p>
                  <p><strong>균형 문제:</strong> {review.thingsToImprove.balanceIssues}</p>
                  <div>
                    <strong>실행 가능한 제안:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {review.thingsToImprove.actionableSuggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Highlighted Wins */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Highlighted Wins</h3>
                <div className="space-y-2 text-sm text-green-800">
                  <p><strong>일관성 스트릭:</strong> {review.highlightedWins.consistencyStreaks}</p>
                  <p><strong>개선 트렌드:</strong> {review.highlightedWins.improvementTrends}</p>
                </div>
              </div>

              {/* Looking Ahead */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Looking Ahead</h3>
                <div className="space-y-2 text-sm text-purple-800">
                  <p><strong>동기부여:</strong> {review.lookingAhead.motivation}</p>
                  <p><strong>목표 설정:</strong> {review.lookingAhead.goalSetting}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">리뷰를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
