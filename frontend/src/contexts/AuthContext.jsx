import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () =>
{
  const context = useContext( AuthContext )
  if ( !context )
  {
    throw new Error( 'useAuth must be used within an AuthProvider' )
  }
  return context
}

export const AuthProvider = ( { children } ) =>
{
  const [ user, setUser ] = useState( null )
  const [ loading, setLoading ] = useState( true )

  useEffect( () =>
  {
    // Check for existing token on app load
    const token = localStorage.getItem( 'access_token' )
    if ( token )
    {
      // Set token in API headers
      authAPI.defaults.headers.common[ 'Authorization' ] = `Bearer ${ token }`
      // TODO: Validate token and get user info
      setLoading( false )
    } else
    {
      setLoading( false )
    }
  }, [] )

  const login = async ( email, password, showToast = true ) =>
  {
    try
    {
      const response = await authAPI.post( '/auth/login', { email, password } )
      const { user: userData, access_token, refresh_token } = response.data

      // Store tokens
      localStorage.setItem( 'access_token', access_token )
      localStorage.setItem( 'refresh_token', refresh_token )

      // Set authorization header
      authAPI.defaults.headers.common[ 'Authorization' ] = `Bearer ${ access_token }`

      setUser( userData )
      if ( showToast ) toast.success( 'Login successful!' )
      return { success: true }
    } catch ( error )
    {
      const message = error.response?.data?.error || 'Login failed'
      if ( showToast ) toast.error( message )
      return { success: false, error: message }
    }
  }

  const register = async ( name, email, password, preferences = {} ) =>
  {
    try
    {
      const response = await authAPI.post( '/auth/signup', {
        name,
        email,
        password,
        preferences
      } )
      const { user: userData, access_token, refresh_token } = response.data

      // Store tokens
      localStorage.setItem( 'access_token', access_token )
      localStorage.setItem( 'refresh_token', refresh_token )

      // Set authorization header
      authAPI.defaults.headers.common[ 'Authorization' ] = `Bearer ${ access_token }`

      setUser( userData )
      toast.success( 'Registration successful!' )
      return { success: true }
    } catch ( error )
    {
      let message = 'Registration failed'

      if ( error.response?.data )
      {
        if ( error.response.data.details && Array.isArray( error.response.data.details ) )
        {
          // Show detailed validation errors
          const validationErrors = error.response.data.details.map( detail =>
            `${ detail.field }: ${ detail.message }`
          ).join( ', ' )
          message = `Validation failed: ${ validationErrors }`
        } else if ( error.response.data.error )
        {
          message = error.response.data.error
        }
      } else if ( error.message )
      {
        message = error.message
      }

      toast.error( message )
      return { success: false, error: message }
    }
  }

  const logout = async () =>
  {
    try
    {
      const refreshToken = localStorage.getItem( 'refresh_token' )
      if ( refreshToken )
      {
        await authAPI.post( '/auth/logout', { refresh_token: refreshToken } )
      }
    } catch ( error )
    {
      console.error( 'Logout error:', error )
    } finally
    {
      // Clear local storage and state
      localStorage.removeItem( 'access_token' )
      localStorage.removeItem( 'refresh_token' )
      delete authAPI.defaults.headers.common[ 'Authorization' ]
      setUser( null )
      toast.success( 'Logged out successfully' )
    }
  }

  const refreshToken = async () =>
  {
    try
    {
      const refreshToken = localStorage.getItem( 'refresh_token' )
      if ( !refreshToken )
      {
        throw new Error( 'No refresh token available' )
      }

      const response = await authAPI.post( '/auth/refresh', {
        refresh_token: refreshToken
      } )
      const { access_token } = response.data

      localStorage.setItem( 'access_token', access_token )
      authAPI.defaults.headers.common[ 'Authorization' ] = `Bearer ${ access_token }`

      return access_token
    } catch ( error )
    {
      // Refresh failed, logout user
      logout()
      throw error
    }
  }

  const updateUser = ( userData ) =>
  {
    setUser( userData )
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    updateUser
  }

  return (
    <AuthContext.Provider value={ value }>
      { children }
    </AuthContext.Provider>
  )
}