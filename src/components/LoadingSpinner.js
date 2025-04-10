export default function LoadingSpinner({ message = "Processing Your Model" }) {
    return (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-medium">{message}</h2>
          <p className="text-gray-400 mt-2">This may take a few moments...</p>
        </div>
      </div>
    )
  }