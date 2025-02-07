const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  
  try {
    const response = await fetch('/api/generate-proposal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate proposal');
    }
    
    // Check if the response is empty
    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('Received empty response from server');
    }
    
    // Create and click download link
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