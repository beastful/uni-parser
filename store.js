// store.js
import { proxy, subscribe } from 'valtio'

const STORAGE_KEY = 'university-comparison-store'

// Helper to load initial state (safe for SSR)
const getInitialState = () => {
    // Prevent errors during server-side rendering (Next.js)
    if (typeof window === 'undefined') {
        return { universityList: [] }
    }
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            return {
                universityList: Array.isArray(parsed.universityList) ? parsed.universityList : []
            }
        }
    } catch (error) {
        console.warn('Failed to load from localStorage:', error)
    }
    return { universityList: [] }
}

// Create the proxy store with initial data
export const store = proxy(getInitialState())

// Subscribe to changes and save to localStorage (client only)
if (typeof window !== 'undefined') {
    subscribe(store, () => {
        try {
            const toStore = {
                universityList: store.universityList
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
        } catch (error) {
            console.warn('Failed to save to localStorage:', error)
        }
    })
}

// Optional: export useSnapshot for convenience
export { useSnapshot } from 'valtio'
