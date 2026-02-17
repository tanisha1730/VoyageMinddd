import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { userAPI, handleAPIError } from '../services/api'
import { User, Save, Download, Trash2 } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Profile = () =>
{
  const { user, updateUser } = useAuth()
  const [ formData, setFormData ] = useState( {
    name: '',
    preferences: {
      budget: 'medium',
      interests: []
    }
  } )
  const [ loading, setLoading ] = useState( false )
  const [ showDeleteConfirm, setShowDeleteConfirm ] = useState( false )

  const interestOptions = [
    'art', 'food', 'history', 'nature', 'culture', 'nightlife',
    'shopping', 'adventure', 'architecture', 'music'
  ]

  useEffect( () =>
  {
    if ( user )
    {
      setFormData( {
        name: user.name || '',
        preferences: {
          budget: user.preferences?.budget || 'medium',
          interests: user.preferences?.interests || []
        }
      } )
    }
  }, [ user ] )

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
    setLoading( true )

    try
    {
      const response = await userAPI.update( user._id, formData )
      updateUser( response.data )
      toast.success( 'Profile updated successfully!' )
    } catch ( error )
    {
      handleAPIError( error, 'Failed to update profile' )
    } finally
    {
      setLoading( false )
    }
  }

  const handleExportData = async () =>
  {
    try
    {
      const response = await userAPI.export( user._id )
      const blob = new Blob( [ JSON.stringify( response.data, null, 2 ) ], {
        type: 'application/json'
      } )
      const url = window.URL.createObjectURL( blob )
      const a = document.createElement( 'a' )
      a.href = url
      a.download = `travel-data-${ new Date().toISOString().split( 'T' )[ 0 ] }.json`
      document.body.appendChild( a )
      a.click()
      window.URL.revokeObjectURL( url )
      document.body.removeChild( a )
      toast.success( 'Data exported successfully!' )
    } catch ( error )
    {
      handleAPIError( error, 'Failed to export data' )
    }
  }

  const handleDeleteAccount = async () =>
  {
    try
    {
      await userAPI.delete( user._id )
      toast.success( 'Account deleted successfully' )
      // The auth context will handle logout
    } catch ( error )
    {
      handleAPIError( error, 'Failed to delete account' )
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account and travel preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Information */ }
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </h2>
          </div>
          <div className="card-body">
            <form onSubmit={ handleSubmit } className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={ formData.name }
                  onChange={ ( e ) => setFormData( { ...formData, name: e.target.value } ) }
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={ user?.email || '' }
                  className="input bg-gray-50"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Preference
                </label>
                <select
                  value={ formData.preferences.budget }
                  onChange={ ( e ) => setFormData( {
                    ...formData,
                    preferences: {
                      ...formData.preferences,
                      budget: e.target.value
                    }
                  } ) }
                  className="input"
                >
                  <option value="low">Budget-friendly</option>
                  <option value="medium">Moderate</option>
                  <option value="high">Luxury</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Interests
                </label>
                <div className="grid grid-cols-2 gap-2">
                  { interestOptions.map( ( interest ) => (
                    <label key={ interest } className="flex items-center">
                      <input
                        type="checkbox"
                        checked={ formData.preferences.interests.includes( interest ) }
                        onChange={ () => handleInterestChange( interest ) }
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        { interest }
                      </span>
                    </label>
                  ) ) }
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={ loading }
                  className="btn-primary flex items-center"
                >
                  { loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) }
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Account Statistics */ }
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Account Statistics</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary-600">
                  { user?.saved_itineraries?.length || 0 }
                </p>
                <p className="text-sm text-gray-600">Itineraries Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  { user?.digital_memories?.length || 0 }
                </p>
                <p className="text-sm text-gray-600">Memories Saved</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Member since { new Date( user?.created_at ).toLocaleDateString() }
              </p>
            </div>
          </div>
        </div>

        {/* Data Management */ }
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold">Data Management</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Export Your Data</h3>
              <p className="text-sm text-gray-600 mb-3">
                Download all your travel data including itineraries and memories.
              </p>
              <button
                onClick={ handleExportData }
                className="btn-outline flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={ () => setShowDeleteConfirm( true ) }
                className="btn bg-red-600 text-white hover:bg-red-700 flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */ }
      { showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-red-900 mb-4">
              Delete Account
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your account? This will permanently remove:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 mb-6 space-y-1">
              <li>Your profile and preferences</li>
              <li>All saved itineraries</li>
              <li>All travel memories</li>
              <li>Account history and data</li>
            </ul>
            <p className="text-sm text-red-600 mb-6 font-medium">
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={ () => setShowDeleteConfirm( false ) }
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={ handleDeleteAccount }
                className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      ) }
    </div>
  )
}

export default Profile