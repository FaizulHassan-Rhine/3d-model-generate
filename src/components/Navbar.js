// components/Navbar.js
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="text-xl font-bold text-gray-800">HoloSnap</div>
      <div className="space-x-6 text-sm font-medium text-gray-600">
        <Link href="/">Home</Link>
        <Link href="/features">Features</Link>
        <Link href="/docs">Documentation</Link>
        <Link href="/api">API</Link>
      </div>
      <div className="space-x-3">
        <button className="border border-black rounded-md px-4 py-1">Sign In</button>
        <button className="bg-black text-white rounded-md px-4 py-1">Sign Up For Free</button>
      </div>
    </nav>
  )
}
