import { useState } from 'react';

const Home = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    departureAirport: '',
    destinationAirport: '',
    departureDate: '',
    airplaneOption1: '',
    airplaneOption2: ''
  });
  
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setTemplate(file);
      setError('');
    } else {
      setError('Please upload a valid Word document (.docx)');
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!template) {
      setError('Please upload a template document first');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('template', template);
      // Add all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        body: formDataToSend, // Send as FormData instead of JSON
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate proposal');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formData.customerName}-charter-proposal.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating proposal:', error);
      setError(`Failed to generate proposal: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Private Jet Charter Proposal Generator
          </h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Template Document (.docx)
                </label>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isLoading}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Use placeholders like &#123;&#123;CUSTOMER&#125;&#125;, &#123;&#123;DEPARTURE&#125;&#125;, &#123;&#123;DESTINATION&#125;&#125;, &#123;&#123;DATE&#125;&#125;, &#123;&#123;OPTION1&#125;&#125;, &#123;&#123;OPTION2&#125;&#125; in your template
                </p>
              </div>

              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="departureAirport" className="block text-sm font-medium text-gray-700 mb-1">
                    Airport of Departure
                  </label>
                  <input
                    type="text"
                    id="departureAirport"
                    name="departureAirport"
                    value={formData.departureAirport}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="destinationAirport" className="block text-sm font-medium text-gray-700 mb-1">
                    Airport of Destination
                  </label>
                  <input
                    type="text"
                    id="destinationAirport"
                    name="destinationAirport"
                    value={formData.destinationAirport}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Departure
                </label>
                <input
                  type="date"
                  id="departureDate"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="airplaneOption1" className="block text-sm font-medium text-gray-700 mb-1">
                    Airplane Option 1
                  </label>
                  <input
                    type="text"
                    id="airplaneOption1"
                    name="airplaneOption1"
                    value={formData.airplaneOption1}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label htmlFor="airplaneOption2" className="block text-sm font-medium text-gray-700 mb-1">
                    Airplane Option 2
                  </label>
                  <input
                    type="text"
                    id="airplaneOption2"
                    name="airplaneOption2"
                    value={formData.airplaneOption2}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !template}
              className={`w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md 
                ${(isLoading || !template) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'} 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              {isLoading ? 'Generating...' : 'Generate Proposal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;