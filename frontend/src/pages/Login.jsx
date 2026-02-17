import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Compass, AlertCircle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Login = () =>
{
  const [ formData, setFormData ] = useState( {
    email: '',
    password: ''
  } )
  const [ error, setError ] = useState( '' )
  const [ showPassword, setShowPassword ] = useState( false )
  const [ loading, setLoading ] = useState( false )
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = ( e ) =>
  {
    setFormData( {
      ...formData,
      [ e.target.name ]: e.target.value
    } )
  }

  const handleSubmit = async ( e ) =>
  {
    e.preventDefault()
    setLoading( true )
    setError( '' )

    const result = await login( formData.email, formData.password, false )

    if ( result.success )
    {
      navigate( '/' )
    } else
    {
      setError( result.error )
    }

    setLoading( false )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo and Header */ }
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <Compass className="w-8 h-8 text-gray-900" />
            <span className="text-2xl font-semibold text-gray-900">VoyageMind</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Sign in to your account
          </h2>
          <p className="text-gray-600">
            Or{ ' ' }
            <Link
              to="/register"
              className="font-medium text-[#17A2B8] hover:text-[#138496]"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Login Form Card */ }
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form className="space-y-6" onSubmit={ handleSubmit }>
            { error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700">{ error }</p>
                </div>
              </div>
            ) }
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={ formData.email }
                onChange={ handleChange }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={ showPassword ? 'text' : 'password' }
                  autoComplete="current-password"
                  required
                  value={ formData.password }
                  onChange={ handleChange }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] focus:border-transparent pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={ () => setShowPassword( !showPassword ) }
                >
                  { showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) }
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={ loading }
              className="w-full bg-[#17A2B8] text-white py-3 rounded-lg font-semibold hover:bg-[#138496] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              { loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Sign in'
              ) }
            </button>
          </form>
        </div>

        {/* Back to Home Link */ }
        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login