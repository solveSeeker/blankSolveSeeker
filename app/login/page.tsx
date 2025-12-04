import LoginForm from '@/features/auth/components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
