export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Genererar ordset...
        </h2>
        <p className="text-gray-600">
          Claude skapar nya ordgrupper åt er
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Detta kan ta upp till en minut
        </p>
      </div>
    </div>
  );
}
