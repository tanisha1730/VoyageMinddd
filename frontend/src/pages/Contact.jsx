import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Compass, User, Mail, MessageSquare, Send, Menu, X } from 'lucide-react'

// Contact page component allowing users to send messages or find support info
const Contact = () =>
{
  // State to manage form input values
  const [ formData, setFormData ] = useState( {
    fullName: '',
    email: '',
    topic: '',
    reference: '', // Optional trip reference
    message: ''
  } )
  const [ mobileMenuOpen, setMobileMenuOpen ] = useState( false )

  // Handle form submission event
  const handleSubmit = ( e ) =>
  {
    e.preventDefault() // Prevent default browser form submission

    // Log form data to console (Placeholder for actual API call)
    console.log( 'Form submitted:', formData )

    // Show simple alert to user (Should be replaced with a toast in production)
    alert( 'Message sent! We\'ll get back to you soon.' )
  }

  // Handle changes in input fields
  const handleChange = ( e ) =>
  {
    setFormData( {
      ...formData, // Keep existing state
      [ e.target.name ]: e.target.value // Update specific field based on name attribute
    } )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* --- Navigation Header --- */ }
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo and Brand Name */ }
            <div className="flex items-center space-x-3">
              <Compass className="w-7 h-7 text-gray-900" />
              <Link to="/" className="text-2xl font-bold text-gray-900">
                VoyageMind
              </Link>
            </div>

            {/* Desktop Navigation Links */ }
            <div className="hidden md:flex items-center space-x-10">
              <Link to="/" className="text-base text-gray-700 hover:text-gray-900 font-medium">Home</Link>
              <Link to="/planner" className="text-base text-gray-700 hover:text-gray-900 font-medium">Plan a Trip</Link>
              <Link to="/booking" className="text-base text-gray-700 hover:text-gray-900 font-medium">Booking</Link>
              <Link to="/dashboard" className="text-base text-gray-700 hover:text-gray-900 font-medium">My Trips</Link>
              <Link to="/recommendations" className="text-base text-gray-700 hover:text-gray-900 font-medium">Recommendations</Link>
              <Link to="/about" className="text-base text-gray-700 hover:text-gray-900 font-medium">About</Link>
              <Link to="/contact" className="text-base text-gray-900 font-bold">Contact</Link>
            </div>

            {/* User Profile / Login Link */ }
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                <User className="w-5 h-5" />
              </Link>
            </div>

            {/* Mobile Menu Button */ }
            <div className="flex md:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                onClick={ () => setMobileMenuOpen( true ) }
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Overlay */ }
        { mobileMenuOpen && (
          <div className="lg:hidden" role="dialog" aria-modal="true">
            <div className="fixed inset-0 z-50"></div>
            <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
              <div className="flex items-center justify-between">
                <Link to="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
                  <Compass className="w-6 h-6 text-orange-500" />
                  <span className="text-2xl font-bold text-gray-900">VoyageMind</span>
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded-md p-2.5 text-gray-700"
                  onClick={ () => setMobileMenuOpen( false ) }
                >
                  <span className="sr-only">Close menu</span>
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    <Link to="/" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Home</Link>
                    <Link to="/planner" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Plan a Trip</Link>
                    <Link to="/booking" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Booking</Link>
                    <Link to="/dashboard" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">My Trips</Link>
                    <Link to="/recommendations" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Recommendations</Link>
                    <Link to="/about" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">About</Link>
                    <Link to="/contact" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">Contact</Link>
                  </div>
                  <div className="py-6">
                    <Link to="/login" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                      Log in <User className="inline-block w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) }
      </header>

      {/* --- Main Content Area --- */ }
      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        {/* Page Title and Intro */ }
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact us</h1>
          <p className="text-lg text-gray-600">
            Reach out with questions, feedback, or partnership ideas. We usually respond within one business day.
          </p>
        </div>

        {/* Two-Column Layout */ }
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* --- Left Column: Support Information --- */ }
          <div>
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Here to make your planning smoother
              </h2>
              <p className="text-gray-600 mb-8">
                Whether you need help with an itinerary, found an issue, or want to explore working with us,
                our team is ready to help.
              </p>

              {/* Service Level Indicators */ }
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#FFF8F0] p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Response time</p>
                  <p className="text-lg font-semibold text-gray-900">Within 24 hours</p>
                </div>
                <div className="bg-[#FFF8F0] p-6 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Support hours</p>
                  <p className="text-lg font-semibold text-gray-900">Mon-Fri, 9am-6pm</p>
                </div>
              </div>
            </div>

            {/* Visual Banner */ }
            <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-8">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                alt="Planning"
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-gray-600">
                  Planning your next adventure? Let us know how we can help.
                </p>
              </div>
            </div>

            {/* Direct Support Channels */ }
            <div className="bg-[#FFF8F0] p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support channels</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">support@voyagemind.app</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">In-app chat</p>
                    <p className="text-sm text-gray-600">Open from your dashboard</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Contact Info */ }
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">For partners & media</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center mt-0.5">
                    <span className="text-xs">🤝</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Partnerships</p>
                    <p className="text-sm text-gray-600">partners@voyagemind.app</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-gray-200 rounded flex items-center justify-center mt-0.5">
                    <span className="text-xs">📰</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Press</p>
                    <p className="text-sm text-gray-600">press@voyagemind.app</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                FAQ: Browse common questions before you write in.
              </p>
            </div>
          </div>

          {/* --- Right Column: Contact Form --- */ }
          <div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>

              <form onSubmit={ handleSubmit } className="space-y-6">
                {/* Row 1: Name and Email */ }
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={ formData.fullName }
                      onChange={ handleChange }
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={ formData.email }
                      onChange={ handleChange }
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Topic and Reference */ }
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic
                    </label>
                    <input
                      type="text"
                      name="topic"
                      value={ formData.topic }
                      onChange={ handleChange }
                      placeholder="Account, billing, feedback..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trip reference (optional)
                    </label>
                    <input
                      type="text"
                      name="reference"
                      value={ formData.reference }
                      onChange={ handleChange }
                      placeholder="e.g., Kyoto spring itinerary"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Message Textarea */ }
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How can we help?
                  </label>
                  <textarea
                    name="message"
                    value={ formData.message }
                    onChange={ handleChange }
                    rows={ 6 }
                    placeholder="Share as much detail as you can so we can assist quickly."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17A2B8] focus:border-transparent resize-none"
                    required
                  />
                </div>

                {/* Terms Checkbox */ }
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 h-4 w-4 text-[#17A2B8] focus:ring-[#17A2B8] border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                    By submitting, you agree to our support terms.
                  </label>
                </div>

                {/* Submit Button */ }
                <button
                  type="submit"
                  className="w-full bg-[#17A2B8] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#138496] transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Send message</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* --- Footer Section --- */ }
      <footer className="bg-white border-t border-gray-200 mt-24 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Footer Logo */ }
            <div className="flex items-center space-x-3">
              <Compass className="w-6 h-6 text-gray-900" />
              <span className="text-lg font-bold text-gray-900">VoyageMind</span>
            </div>

            {/* Copyright */ }
            <p className="text-sm text-gray-600">
              © 2025 VoyageMind. All rights reserved.
            </p>

            {/* Footer Links & Socials */ }
            <div className="flex items-center space-x-8">
              <Link to="/privacy" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                Terms of Service
              </Link>
              {/* Social Media Icons */ }
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-gray-900 text-lg">
                  <span className="sr-only">Twitter</span>
                  🐦
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-lg">
                  <span className="sr-only">Instagram</span>
                  📷
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 text-lg">
                  <span className="sr-only">Facebook</span>
                  📘
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Contact
