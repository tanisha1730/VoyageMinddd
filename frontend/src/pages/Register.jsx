import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Compass } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import PageTransition from '../components/PageTransition'
import AnimatedSection from '../components/AnimatedSection'
import toast from 'react-hot-toast'

const Register = () =>
{
  const [ formData, setFormData ] = useState( {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    preferences: {
      budget: 'medium',
      interests: []
    }
  } )
  const [ showPassword, setShowPassword ] = useState( false )
  const [ loading, setLoading ] = useState( false )
  const { register } = useAuth()
  const navigate = useNavigate()

  const interestOptions = [
    'art', 'food', 'history', 'nature', 'culture', 'nightlife',
    'shopping', 'adventure', 'architecture', 'music'
  ]

  const handleChange = ( e ) =>
  {
    const { name, value } = e.target
    if ( name.startsWith( 'preferences.' ) )
    {
      const prefKey = name.split( '.' )[ 1 ]
      setFormData( {
        ...formData,
        preferences: {
          ...formData.preferences,
          [ prefKey ]: value
        }
      } )
    } else
    {
      setFormData( {
        ...formData,
        [ name ]: value
      } )
    }
  }

  const handleInterestChange = ( interest ) =>
  {
    const currentInterests = formData.preferences.interests
    const newInterests = currentInterests.includes( interest )
      ? currentInterests.filter( i => i !== interest )
      : [ ...currentInterests, interest ]

    setFormData( {
      ...formData,
      preferences: {
        ...formData.preferences,
        interests: newInterests
      }
    } )
  }

  const handleSubmit = async ( e ) =>
  {
    e.preventDefault()

    if ( formData.password !== formData.confirmPassword )
    {
      toast.error( 'Passwords do not match' )
      return
    }

    setLoading( true )

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.preferences
    )

    if ( result.success )
    {
      navigate( '/dashboard' )
    }

    setLoading( false )
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo and Header */ }
          <AnimatedSection className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <Compass className="w-8 h-8 text-gray-900" />
              <span className="text-2xl font-semibold text-gray-900">VoyageMind</span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-gray-600">
              Or{ ' ' }
              <Link
                to="/login"
                className="font-medium text-[#17A2B8] hover:text-[#138496]"
              >
                sign in to existing account
              </Link>
            </p>
          </AnimatedSection>

          {/* Register Form Card */ }
          <AnimatedSection delay={ 0.2 } className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <form className="space-y-6" onSubmit={ handleSubmit }>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={ formData.name }
                  onChange={ handleChange }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

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
                    autoComplete="new-password"
                    required
                    value={ formData.password }
                    onChange={ handleChange }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] focus:border-transparent pr-12"
                    placeholder="Create a password"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={ formData.confirmPassword }
                  onChange={ handleChange }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>

              {/* Preferences */ }
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Travel Preferences</h3>

                <div>
                  <label htmlFor="preferences.budget" className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Level
                  </label>
                  <select
                    name="preferences.budget"
                    value={ formData.preferences.budget }
                    onChange={ handleChange }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] focus:border-transparent"
                  >
                    <option value="low">Budget-friendly</option>
                    <option value="medium">Moderate</option>
                    <option value="high">Luxury</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Interests (select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    { interestOptions.map( ( interest ) => (
                      <label key={ interest } className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={ formData.preferences.interests.includes( interest ) }
                          onChange={ () => handleInterestChange( interest ) }
                          className="rounded border-gray-300 text-[#17A2B8] focus:ring-[#17A2B8] w-4 h-4"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          { interest }
                        </span>
                      </label>
                    ) ) }
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={ loading }
                className="w-full bg-[#17A2B8] text-white py-3 rounded-lg font-semibold hover:bg-[#138496] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                { loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Create Account'
                ) }
              </button>
            </form>
          </AnimatedSection>

          {/* Back to Home Link */ }
          <AnimatedSection delay={ 0.4 } className="text-center mt-6">
            <Link
              to="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to home
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </PageTransition>
  )
}

export default Register