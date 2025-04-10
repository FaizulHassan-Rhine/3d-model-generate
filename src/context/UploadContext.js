import { createContext, useContext, useState } from 'react'

const UploadContext = createContext()

export function UploadProvider({ children }) {
  const [uploadedImages, setUploadedImages] = useState([])

  return (
    <UploadContext.Provider value={{ uploadedImages, setUploadedImages }}>
      {children}
    </UploadContext.Provider>
  )
}

export const useUpload = () => useContext(UploadContext)
