// src/app/page.tsx
// Replace this with your first page once brand tokens are extracted.

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded border border-gray-200 p-8 max-w-md w-full shadow">
        <h1 className="text-gray-900 font-medium text-xl mb-2">Ready to build</h1>
        <p className="text-gray-600 text-sm mb-6">
          Share a Figma URL to extract brand tokens, then start building features.
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <div>1. Share your Figma URL in Claude Code</div>
          <div>2. Run <code className="bg-gray-100 px-1 rounded text-gray-700">pnpm db:types</code> after setting up Supabase</div>
          <div>3. Say "scaffold [feature name]" to start building</div>
        </div>
      </div>
    </main>
  )
}
