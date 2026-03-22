import { useState, useEffect } from 'react'
import { memoriesAPI, mlAPI, handleAPIError } from '../services/api'
import { Camera, Upload, Plus, Trash2, Download, Search, Share2, Edit, MapPin, Calendar } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const MemoryStudio = () =>
{
  const [ memories, setMemories ] = useState( [] )
  const [ loading, setLoading ] = useState( true )
  const [ uploading, setUploading ] = useState( false )
  const [ showUploadForm, setShowUploadForm ] = useState( false )
  const [ selectedMemory, setSelectedMemory ] = useState( null )
  const [ searchQuery, setSearchQuery ] = useState( '' )
  const [ activeFilter, setActiveFilter ] = useState( 'All' )
  const [ layoutStyle, setLayoutStyle ] = useState( 'Polaroid' )
  const [ quickCreateData, setQuickCreateData ] = useState( {
    tripTitle: '',
    datesLocation: '',
    highlightSentence: ''
  } )
  const [ generatedStory, setGeneratedStory ] = useState( '' )
  const [ generatingStory, setGeneratingStory ] = useState( false )
  const [ formData, setFormData ] = useState( {
    title: '',
    note: '',
    tags: '',
    weather: 'sunny',
    location: {
      name: '',
      lat: '',
      lng: ''
    }
  } )
  const [ selectedFile, setSelectedFile ] = useState( null )
  const [ fileError, setFileError ] = useState( '' )

  const filters = [ 'All', 'Recent', 'City breaks', 'Beach', 'Road trips' ]

  useEffect( () =>
  {
    loadMemories()
  }, [] )

  const loadMemories = async () =>
  {
    try
    {
      const response = await memoriesAPI.list( { limit: 50 } )
      setMemories( response.data.memories || [] )
    } catch ( error )
    {
      handleAPIError( error, 'Failed to load memories' )
    } finally
    {
      setLoading( false )
    }
  }

  const handleGenerateStory = async () =>
  {
    // Use formData.title instead of quickCreateData.tripTitle
    if ( !formData.title || !formData.title.trim() )
    {
      toast.error( 'Please enter a trip title' )
      return
    }
    if ( !quickCreateData.highlightSentence || !quickCreateData.highlightSentence.trim() )
    {
      toast.error( 'Please enter a highlight sentence' )
      return
    }

    setGeneratingStory( true )
    try
    {
      // Create the prompt based on layout style
      const toneMap = {
        'Polaroid': 'soft, nostalgic, cozy, like a cherished snapshot',
        'Magazine': 'descriptive, detailed, elegant, and curated',
        'Collage': 'lively, energetic, quick-paced, like pieces of moments stitched together'
      }

      const prompt = `You are a travel-memory writer. Write a single vivid, emotional travel story in 4-7 sentences.

Trip: ${ formData.title }
${ quickCreateData.datesLocation ? `When & Where: ${ quickCreateData.datesLocation }` : '' }
Highlight: ${ quickCreateData.highlightSentence }
Style: ${ toneMap[ layoutStyle ] }

Make it warm, cinematic, nostalgic, and sensory (smell, sound, weather, colors, atmosphere, feelings). Focus on the highlight as the emotional center. Write naturally as a flowing paragraph. No bullet points, no titles.`

      // Call OpenAI or your AI service
      const response = await mlAPI.generateStory( prompt )

      const data = response.data
      setGeneratedStory( data.text || data.story || 'Story generated successfully!' )
      toast.success( 'Story generated!' )
    } catch ( error )
    {
      console.error( 'Story generation error:', error )
      // Fallback to a simple story
      const fallbackStory = `${ quickCreateData.highlightSentence } The air was filled with the scent of adventure, and every moment felt like a page from a cherished diary. Golden light painted the streets, and laughter echoed through the winding paths. Time seemed to slow down, letting us savor each precious second. It was the kind of trip that stays with you forever, a memory etched in warmth and wonder.`
      setGeneratedStory( fallbackStory )
      toast.success( 'Story created!' )
    } finally
    {
      setGeneratingStory( false )
    }
  }

  const handleFileSelect = ( e ) =>
  {
    setFileError( '' )
    const file = e.target.files[ 0 ]
    if ( file )
    {
      if ( file.size > 10 * 1024 * 1024 )
      { // 10MB limit
        setFileError( 'Size should be smaller than 10MB' )
        e.target.value = null
        setSelectedFile( null )
        return
      }

      const validTypes = [ 'image/png', 'image/jpeg', 'image/jpg' ]
      if ( !validTypes.includes( file.type ) )
      {
        setFileError( 'Upload only PNG or JPG Image' )
        e.target.value = null
        setSelectedFile( null )
        return
      }

      setSelectedFile( file )
    }
  }

  const handleSubmit = async ( e ) =>
  {
    e.preventDefault()

    // Validation
    if ( !selectedFile )
    {
      toast.error( 'Please select an image' )
      return
    }

    if ( !formData.title || !formData.title.trim() )
    {
      toast.error( 'Please enter a title' )
      return
    }

    setUploading( true )
    try
    {
      const formDataToSend = new FormData()

      // Required fields
      formDataToSend.append( 'image', selectedFile )
      formDataToSend.append( 'title', formData.title.trim() )

      // Layout style - IMPORTANT: Save the selected layout
      formDataToSend.append( 'layout', layoutStyle )

      // Optional fields - only add if they have values
      // Combine AI story and manual notes if both exist
      let storyToSave = ''

      if ( generatedStory && generatedStory.trim() && formData.note && formData.note.trim() )
      {
        // Both AI story and manual notes exist - combine them
        storyToSave = `${ generatedStory.trim() }\n\n${ formData.note.trim() }`
      } else if ( formData.note && formData.note.trim() )
      {
        // Only manual notes
        storyToSave = formData.note.trim()
      } else if ( generatedStory && generatedStory.trim() )
      {
        // Only AI story
        storyToSave = generatedStory.trim()
      }

      if ( storyToSave )
      {
        formDataToSend.append( 'note', storyToSave )
      }

      if ( formData.weather )
      {
        formDataToSend.append( 'weather', formData.weather )
      }

      // Tags - parse and send as JSON array
      if ( formData.tags && formData.tags.trim() )
      {
        const tagsArray = formData.tags.split( ',' ).map( tag => tag.trim() ).filter( tag => tag.length > 0 )
        if ( tagsArray.length > 0 )
        {
          formDataToSend.append( 'tags', JSON.stringify( tagsArray ) )
        }
      }

      // Location - only send if name is provided
      if ( formData.location.name && formData.location.name.trim() )
      {
        const locationData = {
          name: formData.location.name.trim()
        }
        formDataToSend.append( 'location', JSON.stringify( locationData ) )
      }

      console.log( 'Submitting memory with data:', {
        title: formData.title.trim(),
        note: formData.note,
        weather: formData.weather,
        tags: formData.tags,
        location: formData.location.name
      } )

      const response = await memoriesAPI.create( formDataToSend )
      setMemories( [ response.data, ...memories ] )

      // Reset form
      setFormData( {
        title: '',
        note: '',
        tags: '',
        weather: 'sunny',
        location: { name: '', lat: '', lng: '' }
      } )
      setSelectedFile( null )
      setShowUploadForm( false )

      toast.success( 'Memory created successfully!' )
    } catch ( error )
    {
      handleAPIError( error, 'Failed to create memory' )
    } finally
    {
      setUploading( false )
    }
  }

  // Helper to get correct audio/image URL
  const getImageUrl = ( url ) =>
  {
    if ( !url ) return '';
    if ( url.startsWith( 'http' ) ) return url;
    return `${ API_BASE_URL }${ url }`;
  }

  const handleDelete = async ( id ) =>
  {
    if ( !confirm( 'Are you sure you want to delete this memory?' ) ) return

    try
    {
      await memoriesAPI.delete( id )
      setMemories( memories.filter( memory => memory._id !== id ) )
      toast.success( 'Memory deleted successfully' )
    } catch ( error )
    {
      handleAPIError( error, 'Failed to delete memory' )
    }
  }

  const handleExportPDF = () =>
  {
    window.print();
  }

  const handleDownloadImage = async ( memory ) =>
  {
    try
    {
      const imageUrl = getImageUrl( memory.image_url );
      const response = await fetch( imageUrl );
      const blob = await response.blob();
      const url = window.URL.createObjectURL( blob );
      const link = document.createElement( 'a' );
      link.href = url;
      link.download = `memory-${ memory.title.replace( /\s+/g, '-' ).toLowerCase() }.jpg`;
      document.body.appendChild( link );
      link.click();
      document.body.removeChild( link );
      window.URL.revokeObjectURL( url );
      toast.success( 'Image downloaded!' );
    } catch ( error )
    {
      console.error( 'Download failed:', error );
      toast.error( 'Failed to download image' );
    }
  }

  const handleShareLink = async ( memoryToShare ) =>
  {
    const targetMemory = memoryToShare || selectedMemory;
    const url = window.location.href; // In a real app this would be a unique link to the memory

    if ( navigator.share )
    {
      try
      {
        await navigator.share( {
          title: targetMemory?.title || 'Travel Memory',
          text: targetMemory?.note || 'Check out my travel memory!',
          url: url
        } );
        toast.success( 'Shared successfully!' );
      } catch ( error )
      {
        if ( error.name !== 'AbortError' )
        {
          console.error( 'Error sharing:', error );
          copyToClipboard( url );
        }
      }
    } else
    {
      copyToClipboard( url );
    }
  }

  const copyToClipboard = ( text ) =>
  {
    navigator.clipboard.writeText( text )
      .then( () => toast.success( 'Link copied to clipboard!' ) )
      .catch( () => toast.error( 'Failed to copy link' ) );
  }

  if ( loading )
  {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const filteredMemories = memories.filter( memory =>
  {
    const matchesSearch = ( memory.title?.toLowerCase().includes( searchQuery.toLowerCase() ) ||
      memory.note?.toLowerCase().includes( searchQuery.toLowerCase() ) )
    const matchesFilter = activeFilter === 'All' ||
      memory.tags?.includes( activeFilter.toLowerCase() ) ||
      ( activeFilter === 'Recent' && new Date( memory.created_on ) > new Date( Date.now() - 30 * 24 * 60 * 60 * 1000 ) )
    return matchesSearch && matchesFilter
  } )

  // Render memory card based on layout style
  const renderMemoryCard = ( memory ) =>
  {
    const imageUrl = getImageUrl( memory.image_url )
    const layoutType = memory.layout || 'Magazine'

    // Polaroid Layout - Like a vintage photo print
    if ( layoutType === 'Polaroid' )
    {
      return (
        <div
          onClick={ () => setSelectedMemory( memory ) }
          className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
          style={ { maxWidth: '280px' } }
        >
          <div className="bg-gray-100 p-2 rounded">
            <img src={ imageUrl } alt={ memory.title } className="w-full aspect-square object-cover rounded" />
          </div>
          <div className="mt-3 text-center px-2">
            <h4 className="font-handwriting text-lg text-gray-900 mb-1">{ memory.title }</h4>
            <p className="text-xs text-gray-500">{ new Date( memory.created_on ).toLocaleDateString() }</p>
            <p className="text-xs text-gray-400 mt-1">Polaroid layout</p>
          </div>
          <div className="flex items-center justify-center space-x-3 mt-3 pt-3 border-t border-gray-200">
            <button
              onClick={ ( e ) => { e.stopPropagation(); setSelectedMemory( memory ); } }
              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              Open
            </button>
            <button
              onClick={ ( e ) => { e.stopPropagation(); handleShareLink( memory ); } }
              className="text-xs text-gray-600 hover:text-gray-900"
            >
              Share
            </button>
          </div>
        </div>
      )
    }

    // Magazine Layout - Editorial style with full-width image
    if ( layoutType === 'Magazine' )
    {
      return (
        <div
          onClick={ () => setSelectedMemory( memory ) }
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer"
        >
          <img src={ imageUrl } alt={ memory.title } className="w-full h-48 object-cover" />
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">{ new Date( memory.created_on ).toLocaleDateString() }</span>
              <span className="text-xs text-gray-400">Magazine layout</span>
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-2">{ memory.title }</h4>
            <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">{ memory.note || 'No description' }</p>
            <div className="flex items-center space-x-3 mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={ ( e ) => { e.stopPropagation(); setSelectedMemory( memory ); } }
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                Open
              </button>
              <button
                onClick={ ( e ) => { e.stopPropagation(); handleShareLink( memory ); } }
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Collage Layout - Multiple images in a grid
    if ( layoutType === 'Collage' )
    {
      return (
        <div
          onClick={ () => setSelectedMemory( memory ) }
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer"
        >
          <div className="grid grid-cols-2 gap-1 p-1">
            <img src={ imageUrl } alt={ memory.title } className="w-full h-32 object-cover rounded col-span-2" />
            <img src={ imageUrl } alt="" className="w-full h-24 object-cover rounded" />
            <img src={ imageUrl } alt="" className="w-full h-24 object-cover rounded" />
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-gray-900 text-sm">{ memory.title }</h4>
              <span className="text-xs text-gray-400">Collage</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{ new Date( memory.created_on ).toLocaleDateString() }</p>
            <p className="text-xs text-gray-600 line-clamp-2">{ memory.note || 'No description' }</p>
            <div className="flex items-center space-x-3 mt-3 pt-2 border-t border-gray-200">
              <button
                onClick={ ( e ) => { e.stopPropagation(); setSelectedMemory( memory ); } }
                className="text-xs text-orange-600 hover:text-orange-700 font-medium"
              >
                Open
              </button>
              <button
                onClick={ ( e ) => { e.stopPropagation(); handleShareLink( memory ); } }
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Default fallback
    return null
  }

  return (
    <div className="space-y-6">
      <style>
        { `
          @media print {
            body * {
              visibility: hidden;
            }
            #memory-content, #memory-content * {
              visibility: visible;
            }
            #memory-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            /* Hide buttons in print view */
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>
      {/* Page Header */ }
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">Your travel storybook</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Memories</h1>
          <p className="text-gray-600">
            Browse past trips, then open any memory into a magazine-style story or start a new one.
          </p>
        </div>
        <button
          onClick={ () =>
          {
            setSelectedMemory( null ) // Clear any selected memory to show the create form
            setShowUploadForm( false ) // Make sure modal is closed
          } }
          className="flex items-center space-x-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors font-medium"
        >
          <Camera className="h-4 w-4" />
          <span>Create new memory</span>
        </button>
      </div>

      {/* Quick Actions Bar */ }
      <div className="flex items-center space-x-4 text-sm">
        <button className="flex items-center space-x-1 text-orange-600 hover:text-orange-700">
          <span>✈️ Take off</span>
        </button>
        <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
          <MapPin className="h-4 w-4" />
          <span>Map view</span>
        </button>
        <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
          <Calendar className="h-4 w-4" />
          <span>Timeline</span>
        </button>
        <button className="flex items-center space-x-1 text-red-600 hover:text-red-700">
          <span>🗺️ Land in memories</span>
        </button>
      </div>

      {/* Search and Filters */ }
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search or filter memories"
            value={ searchQuery }
            onChange={ ( e ) => setSearchQuery( e.target.value ) }
            className="flex-1 outline-none text-gray-900"
          />
        </div>
        <div className="flex items-center space-x-2">
          { filters.map( ( filter ) => (
            <button
              key={ filter }
              onClick={ () => setActiveFilter( filter ) }
              className={ `px-4 py-1.5 rounded-full text-sm transition-colors ${ activeFilter === filter
                ? 'bg-orange-100 text-orange-700 font-medium'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }` }
            >
              { filter }
            </button>
          ) ) }
        </div>
      </div>

      {/* Upload Form Modal */ }
      { showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Create New Memory</h2>

            <form onSubmit={ handleSubmit } className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={ handleFileSelect }
                  className="input"
                  required
                />
                { selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: { selectedFile.name }
                  </p>
                ) }
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={ formData.title }
                  onChange={ ( e ) => setFormData( { ...formData, title: e.target.value } ) }
                  className="input"
                  placeholder="Give your memory a title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note
                </label>
                <textarea
                  value={ formData.note }
                  onChange={ ( e ) => setFormData( { ...formData, note: e.target.value } ) }
                  className="input"
                  rows="3"
                  placeholder="Share your thoughts about this moment..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Name
                </label>
                <input
                  type="text"
                  value={ formData.location.name }
                  onChange={ ( e ) => setFormData( {
                    ...formData,
                    location: { ...formData.location, name: e.target.value }
                  } ) }
                  className="input"
                  placeholder="Where was this taken?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weather
                </label>
                <select
                  value={ formData.weather }
                  onChange={ ( e ) => setFormData( { ...formData, weather: e.target.value } ) }
                  className="input"
                >
                  <option value="sunny">Sunny</option>
                  <option value="cloudy">Cloudy</option>
                  <option value="rainy">Rainy</option>
                  <option value="snowy">Snowy</option>
                  <option value="windy">Windy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={ formData.tags }
                  onChange={ ( e ) => setFormData( { ...formData, tags: e.target.value } ) }
                  className="input"
                  placeholder="vacation, beach, sunset"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={ () => setShowUploadForm( false ) }
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={ uploading }
                  className="btn-primary flex-1 flex items-center justify-center"
                >
                  { uploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Create
                    </>
                  ) }
                </button>
              </div>
            </form>
          </div>
        </div>
      ) }

      {/* Main Content Area */ }
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Memory List Only */ }
        <div className="lg:col-span-1 space-y-6">
          {/* Your Memories List */ }
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Your memories</h3>
              <span className="text-sm text-orange-600">{ filteredMemories.length } trips saved</span>
            </div>

            { filteredMemories.length === 0 ? (
              <div className="text-center py-8">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-4">No memories yet</p>
                <button
                  onClick={ () => setShowUploadForm( true ) }
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Create your first memory
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                { filteredMemories.map( ( memory ) => (
                  <div key={ memory._id }>
                    { renderMemoryCard( memory ) }
                  </div>
                ) ) }
              </div>
            ) }

            { filteredMemories.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                  <Plus className="h-4 w-4" />
                  <span>Create new memory</span>
                </button>
              </div>
            ) }
          </div>
        </div>

        {/* Right Column - Expanded Quick Create OR Magazine View */ }
        <div className="lg:col-span-2">
          { selectedMemory ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Memory Header */ }
              <div id="memory-content">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Magazine view - { selectedMemory.title }
                      </h2>
                      <p className="text-sm text-gray-600">
                        A full-bleed hero, gallery, story, and map — ready to print or share.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-600 hover:text-gray-900">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={ () => handleShareLink( selectedMemory ) }
                        className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm">
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Magazine Content */ }
                <div className="p-6">
                  {/* Hero Image - Fixed to not crop heads */ }
                  <div className="mb-6 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={ getImageUrl( selectedMemory.image_url ) }
                      alt={ selectedMemory.title }
                      className="w-full h-96 object-contain"
                    />
                  </div>

                  {/* Story Details */ }
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{ selectedMemory.title }</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      { new Date( selectedMemory.created_on ).toLocaleDateString() }
                      { selectedMemory.location?.name && ` • ${ selectedMemory.location.name }` }
                    </p>

                    {/* Story Text - Shows the actual note/story from the memory */ }
                    <div className="prose prose-sm max-w-none">
                      { selectedMemory.note ? (
                        selectedMemory.note.split( '\n\n' ).map( ( paragraph, index ) => (
                          <p key={ index } className="text-gray-700 leading-relaxed mb-4">
                            { paragraph }
                          </p>
                        ) )
                      ) : selectedMemory.caption ? (
                        <p className="text-gray-700 leading-relaxed mb-4">
                          { selectedMemory.caption }
                        </p>
                      ) : (
                        <p className="text-gray-500 italic">No story available for this memory.</p>
                      ) }
                    </div>
                  </div>

                  {/* Map Snippet */ }
                  <div className="bg-gray-100 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Map snippet</h4>
                    <div className="bg-white rounded h-48 flex items-center justify-center overflow-hidden">
                      { selectedMemory.location?.name ? (
                        <iframe
                          width="100%"
                          height="100%"
                          style={ { border: 0 } }
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={ `https://maps.google.com/maps?q=${ encodeURIComponent( selectedMemory.location.name ) }&t=&z=13&ie=UTF8&iwloc=&output=embed` }
                        ></iframe>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <MapPin className="h-8 w-8 mb-2" />
                          <span className="text-sm">No location added</span>
                        </div>
                      ) }
                    </div>
                  </div>

                  {/* Export Actions */ }
                  <div className="border-t border-gray-200 pt-6 no-print">
                    <h4 className="font-semibold text-gray-900 mb-4">Export & actions</h4>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={ handleExportPDF }
                        className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        <Download className="h-4 w-4" />
                        <span>Export as PDF</span>
                      </button>
                      <button
                        onClick={ () => handleDownloadImage( selectedMemory ) }
                        className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">
                        <Download className="h-4 w-4" />
                        <span>Download cover image</span>
                      </button>
                      <button
                        onClick={ () => handleShareLink( selectedMemory ) }
                        className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">
                        <Share2 className="h-4 w-4" />
                        <span>Copy share link</span>
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={ () => handleDelete( selectedMemory._id ) }
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete memory</span>
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-4">
                      Changes here stay synced with your itinerary highlights for this trip.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick-create memory</h2>
              <p className="text-gray-600 mb-6">Upload an image and fill in the details to create your travel memory</p>

              <form onSubmit={ handleSubmit } className="space-y-6">
                {/* Image Upload */ }
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Image *
                    { fileError && <span className="text-red-500 text-xs ml-2">{ fileError }</span> }
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={ handleFileSelect }
                      className="hidden"
                      id="image-upload"
                      required
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      { selectedFile ? (
                        <div>
                          <Camera className="h-12 w-12 text-teal-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-900 font-medium">{ selectedFile.name }</p>
                          <p className="text-xs text-gray-500 mt-1">Click to change image</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      ) }
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Trip Title */ }
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trip title *
                    </label>
                    <input
                      type="text"
                      value={ formData.title }
                      onChange={ ( e ) => setFormData( { ...formData, title: e.target.value } ) }
                      placeholder="Spring in Paris"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  {/* Dates & Location */ }
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dates & location
                    </label>
                    <input
                      type="text"
                      value={ quickCreateData.datesLocation }
                      onChange={ ( e ) => setQuickCreateData( { ...quickCreateData, datesLocation: e.target.value } ) }
                      placeholder="April 2024 - Paris, France"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Highlight Sentence */ }
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Highlight sentence
                  </label>
                  <input
                    type="text"
                    value={ quickCreateData.highlightSentence }
                    onChange={ ( e ) => setQuickCreateData( { ...quickCreateData, highlightSentence: e.target.value } ) }
                    placeholder="Croissants at sunrise, Seine walks at sunset..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Notes */ }
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={ formData.note }
                    onChange={ ( e ) => setFormData( { ...formData, note: e.target.value } ) }
                    rows="4"
                    placeholder="Share your thoughts about this moment..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Name */ }
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location name
                    </label>
                    <input
                      type="text"
                      value={ formData.location.name }
                      onChange={ ( e ) => setFormData( {
                        ...formData,
                        location: { ...formData.location, name: e.target.value }
                      } ) }
                      placeholder="Paris, France"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Weather */ }
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weather
                    </label>
                    <select
                      value={ formData.weather }
                      onChange={ ( e ) => setFormData( { ...formData, weather: e.target.value } ) }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="sunny">☀️ Sunny</option>
                      <option value="cloudy">☁️ Cloudy</option>
                      <option value="rainy">🌧️ Rainy</option>
                      <option value="snowy">❄️ Snowy</option>
                      <option value="windy">💨 Windy</option>
                    </select>
                  </div>
                </div>

                {/* Layout Style */ }
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Layout style
                  </label>
                  <div className="flex space-x-3">
                    { [ 'Polaroid', 'Magazine', 'Collage' ].map( ( style ) => (
                      <button
                        key={ style }
                        type="button"
                        onClick={ () => setLayoutStyle( style ) }
                        className={ `flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${ layoutStyle === style
                          ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                          }` }
                      >
                        { style }
                      </button>
                    ) ) }
                  </div>
                </div>

                {/* Generated Story Display */ }
                { generatedStory && (
                  <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                    <p className="text-sm font-medium text-teal-900 mb-2">✨ AI Generated Story:</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{ generatedStory }</p>
                  </div>
                ) }

                {/* Action Buttons */ }
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={ handleGenerateStory }
                    disabled={ generatingStory }
                    className="flex items-center space-x-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    { generatingStory ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Let AI draft story</span>
                      </>
                    ) }
                  </button>

                  <button
                    type="submit"
                    disabled={ uploading }
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    { uploading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="h-4 w-4" />
                        <span>Create Memory</span>
                      </>
                    ) }
                  </button>
                </div>
              </form>
            </div>
          ) }
        </div>
      </div>
    </div>
  )
}

export default MemoryStudio