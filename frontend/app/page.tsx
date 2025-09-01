'use client'

// If you're using Next.js with TypeScript, you do not need to explicitly import React at the top of your file.
// Remove the line: import React from 'react'
// Next.js automatically handles the JSX transform.
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'pdf' | 'youtube' | 'text'>('pdf')
  const [isLoading, setIsLoading] = useState(false)
  interface ExplanationResult {
    explanation: string;
    complexity_level: string;
  }
  const [result, setResult] = useState<ExplanationResult | null>(null)
  const [complexityLevel, setComplexityLevel] = useState('student')

  // YouTube form state
  const [youtubeUrl, setYoutubeUrl] = useState('')

  // Text form state
  const [textInput, setTextInput] = useState('')

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('complexity_level', complexityLevel)

      const response = await axios.post(`${API_BASE_URL}/upload-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setResult(response.data)
    } catch (error) {
      console.error('Error uploading PDF:', error)
      alert('Error uploading PDF. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [complexityLevel])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  const handleYouTubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!youtubeUrl.trim()) return

    setIsLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/youtube-link`, {
        youtube_url: youtubeUrl,
        complexity_level: complexityLevel
      })

      setResult(response.data)
    } catch (error) {
      console.error('Error processing YouTube video:', error)
      alert('Error processing YouTube video. Please check the URL and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!textInput.trim()) return

    setIsLoading(true)
    try {
      const response = await axios.post(`${API_BASE_URL}/explain-text`, {
        text: textInput,
        complexity_level: complexityLevel
      })

      setResult(response.data)
    } catch (error) {
      console.error('Error explaining text:', error)
      alert('Error explaining text. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const complexityOptions = [
    { value: 'child', label: 'Explain like I\'m 12' },
    { value: 'student', label: 'High School/College Level' },
    { value: 'expert', label: 'Expert Level' }
  ]

  return (
    <div className="px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explain Dis</h1>
          <p className="text-lg text-gray-600">
            Upload PDFs, paste YouTube links, or enter text to get simplified explanations
          </p>
        </div>

        {/* Production Notice Banner */}
        {IS_PRODUCTION && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Demo Mode - Backend Required
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    This is a frontend demo. To use the full functionality, you need to run the backend server locally. 
                    Check out the <a href="https://github.com/DemonFlare9970/Explain-Dis" className="font-medium underline hover:text-blue-600">GitHub repository</a> for setup instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Complexity Level Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation Level
          </label>
          <select
            value={complexityLevel}
            onChange={(e) => setComplexityLevel(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            {complexityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'pdf', label: 'Upload PDF' },
              { id: 'youtube', label: 'YouTube Link' },
              { id: 'text', label: 'Enter Text' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          {activeTab === 'pdf' && (
            <div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-gray-600">
                  {isDragActive ? (
                    <p>Drop the PDF here...</p>
                  ) : (
                    <div>
                      <p className="text-lg mb-2">📄 Drag and drop a PDF here, or click to select</p>
                      <p className="text-sm">Only PDF files are supported</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'youtube' && (
            <form onSubmit={handleYouTubeSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Explain Video'}
              </button>
            </form>
          )}

          {activeTab === 'text' && (
            <form onSubmit={handleTextSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text to Explain
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your text here..."
                  rows={8}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Explain Text'}
              </button>
            </form>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Processing your request...</p>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Explanation</h2>
              <p className="text-sm text-gray-600">
                Complexity Level: {complexityOptions.find(opt => opt.value === result.complexity_level)?.label}
              </p>
            </div>
            
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{result.explanation}</p>
              </div>
              {/* Action Buttons */}
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(result.explanation)
                      alert('Explanation copied to clipboard!')
                    } catch (err) {
                      alert('Failed to copy explanation.')
                    }
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Copy Explanation
                </button>
                <button
                  onClick={() => setResult(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Clear Results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}