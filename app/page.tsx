export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sistema de Gestión de Pedidos
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Multi-Tenant Order Management System
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    </main>
  )
}
