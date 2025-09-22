'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | undefined>()
  const captcha = useRef<HCaptcha>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (isRegister) {
        // Registration
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            captchaToken,
            data: {
              name: name || email.split('@')[0],
            }
          }
        })

        if (error) {
          setError(error.message)
        } else if (data.user) {
          // User created successfully - create user record in our database
          try {
            const response = await fetch('/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.session?.access_token}`
              },
              body: JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || name || (email ? email.split('@')[0] : 'User')
              })
            })
            
            if (!response.ok) {
              const errorData = await response.json()
              console.error('Failed to create user record:', errorData)
            } else {
              console.log('User record created successfully')
            }
          } catch (error) {
            console.error('Error creating user record:', error)
          }
          
          // Reset captcha after successful signup
          captcha.current?.resetCaptcha()
          
          router.push('/')
        }
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setError(error.message)
        } else if (data.user) {
          // User logged in successfully - ensure user record exists
          try {
            const response = await fetch('/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.session?.access_token}`
              },
              body: JSON.stringify({
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || (data.user.email ? data.user.email.split('@')[0] : 'User')
              })
            })
            
            if (!response.ok) {
              const errorData = await response.json()
              console.error('Failed to create/verify user record:', errorData)
            } else {
              console.log('User record created/verified successfully')
            }
          } catch (error) {
            console.error('Error creating/verifying user record:', error)
          }
          
          router.push('/')
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fundamental</h1>
          <p className="text-gray-600 mt-2">건강한 삶을 위한 일상 기록</p>
        </div>

        {/* Toggle between Login and Register */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              !isRegister
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              isRegister
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            계정 만들기
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="이메일을 입력하세요"
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name (Optional)
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="이름을 입력하세요"
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          <div className="flex justify-center">
            <HCaptcha
              ref={captcha}
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || ''}
              onVerify={(token) => {
                setCaptchaToken(token)
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading 
              ? (isRegister ? '계정 생성 중...' : '로그인 중...') 
              : (isRegister ? '계정 만들기' : '로그인')
            }
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isRegister 
              ? '이미 계정이 있으신가요? 로그인하세요.'
              : "계정이 없으신가요? 습관 기록을 시작하려면 계정을 만드세요."
            }
          </p>
        </div>
      </div>
    </div>
  )
}
