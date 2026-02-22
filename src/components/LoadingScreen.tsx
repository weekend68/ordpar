export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Laddar spel...
        </h2>
      </div>
    </div>
  );
}
