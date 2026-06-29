export default function ReservasOnline({ negocio }) {
  const enlace = `${window.location.origin}/reservar/${negocio?.slug}`

  const copiar = () => {
    navigator.clipboard.writeText(enlace)
    alert('Enlace copiado')
  }

  const abrir = () => {
    window.open(enlace, '_blank')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 bg-white border-b border-slate-200 flex-shrink-0">
        <h1 className="text-base font-semibold text-slate-900">Reservas online</h1>
        <p className="text-xs text-slate-400 mt-0.5">Comparte este enlace con tus clientes</p>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-lg flex flex-col gap-4">

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-medium text-slate-500 mb-2">Tu página de reservas</p>
            <div className="flex items-center gap-2">
              <p className="flex-1 text-sm text-nexio-violet font-mono bg-nexio-violet-soft rounded-lg px-3 py-2 truncate">
                {enlace}
              </p>
              <button
                onClick={copiar}
                className="flex-shrink-0 border border-slate-200 text-slate-600 text-xs font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Copiar
              </button>
            </div>
            <button
              onClick={abrir}
              className="mt-3 text-xs text-nexio-violet hover:underline text-left"
            >
              Abrir página de reservas →
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-medium text-slate-500 mb-3">¿Cómo usarlo?</p>
            <div className="flex flex-col gap-3">
              {[
                { n: '1', texto: 'Copia el enlace y compártelo por WhatsApp, Instagram o donde quieras.' },
                { n: '2', texto: 'Tu cliente abre el enlace, elige el servicio, fecha y hora.' },
                { n: '3', texto: 'La reserva aparece automáticamente en tu agenda de Citas.' },
                { n: '4', texto: 'El cliente recibe un email de confirmación al momento.' },
              ].map(({ n, texto }) => (
                <div key={n} className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-nexio-violet-soft flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-semibold text-nexio-violet">{n}</span>
                  </div>
                  <p className="text-sm text-slate-600">{texto}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}