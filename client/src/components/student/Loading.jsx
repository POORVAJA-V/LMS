import React from 'react'

const Loading = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-lg font-semibold text-blue-600 animate-pulse">Loading...</div>
            </div>
        </div>
    )
}

export default Loading