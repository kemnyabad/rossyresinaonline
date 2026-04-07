export default function MaintenanceView() {
  // Leemos el progreso desde la variable que pondrás en Vercel
  const progress = process.env.NEXT_PUBLIC_MAINTENANCE_PROGRESS || "0";

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-5 text-white">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-4xl font-bold text-purple-500">Rossy Resina</h1>
        <p className="text-xl text-slate-300">
          Estamos perfeccionando tu experiencia. Muy pronto nuevo catálogo.
        </p>
        
        {/* Barra de Progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Avance del mantenimiento</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <p className="text-sm text-slate-500">
          Trabajando en el taller para traerte lo mejor de la resina.
        </p>
      </div>
    </div>
  );
}
