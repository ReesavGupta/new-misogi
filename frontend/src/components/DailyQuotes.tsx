import { useState, useEffect } from 'react'
import { MessageSquareQuote, Loader2 } from 'lucide-react'

interface QuoteData {
  q: string
  a: string
}
const API_URL = import.meta.env.VITE_API_URL
// Custom toggle switch component
const Toggle: React.FC<{
  checked: boolean
  onChange: (checked: boolean) => void
}> = ({ checked, onChange }) => {
  return (
    <label className="inline-flex items-center cursor-pointer">
      <div
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </div>
    </label>
  )
}

export const DailyQuote: React.FC = () => {
  const [quote, setQuote] = useState<string>('')
  const [author, setAuthor] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isEnabled, setIsEnabled] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Function to get today's date in YYYY-MM-DD format
  const getTodayDateString = (): string => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(today.getDate()).padStart(2, '0')}`
  }

  // Load the quote toggle state from localStorage
  useEffect(() => {
    const savedToggleState = localStorage.getItem('quoteToggleState')
    if (savedToggleState !== null) {
      setIsEnabled(JSON.parse(savedToggleState))
    }
  }, [])

  // Save toggle state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('quoteToggleState', JSON.stringify(isEnabled))
  }, [isEnabled])

  // Fetch or load quote based on the date
  useEffect(() => {
    console.log(`helllloooooo from the component`)
    const fetchQuote = async (): Promise<void> => {
      if (!isEnabled) return

      setIsLoading(true)
      setError(null)

      const today = getTodayDateString()
      const savedQuoteDate = localStorage.getItem('quoteDate')
      const savedQuote = localStorage.getItem('dailyQuote')
      const savedAuthor = localStorage.getItem('quoteAuthor')

      console.log('hello')
      // If we have a saved quote from today, use it
      if (savedQuoteDate === today && savedQuote) {
        setQuote(savedQuote)
        setAuthor(savedAuthor || '')
        setIsLoading(false)
        return
      }

      console.log('this is the savedQuote', savedQuote)

      try {
        // Fetch a new quote
        const response = await fetch(`${API_URL}/quote`)
        console.log(`this is response:`, response)
        if (!response.ok) throw new Error('Failed to fetch quote')

        const data: QuoteData[] = await response.json()
        console.log('data: ', data)
        // Save to state and localStorage
        setQuote(data[0].q)
        setAuthor(data[0].a)
        localStorage.setItem('quoteDate', today)
        localStorage.setItem('dailyQuote', data[0].q)
        localStorage.setItem('quoteAuthor', data[0].a)
      } catch (err) {
        console.error('Error fetching quote:', err)
        setError('Failed to load motivational quote')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuote()
  }, [isEnabled])

  const handleToggleChange = (checked: boolean): void => {
    setIsEnabled(checked)
  }

  if (!isEnabled) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Daily quote disabled
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Show quotes</span>
          <Toggle
            checked={isEnabled}
            onChange={handleToggleChange}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="w-5 h-5 text-indigo-500" />
          <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Daily Motivation
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Show quotes</span>
          <Toggle
            checked={isEnabled}
            onChange={handleToggleChange}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-sm text-red-500 py-2">{error}</div>
      ) : (
        <div className="py-1">
          <p className="text-gray-700 dark:text-gray-300 text-sm italic">
            "{quote}"
          </p>
          {author && (
            <p className="text-gray-500 dark:text-gray-400 text-xs text-right mt-1">
              — {author}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
