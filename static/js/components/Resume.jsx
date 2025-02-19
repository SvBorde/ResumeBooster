const Resume = ({ onUpload }) => {
    const [file, setFile] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [preview, setPreview] = React.useState('');
    const [error, setError] = React.useState('');
    const maxFileSize = 16 * 1024 * 1024; // 16MB in bytes

    const validateFile = (file) => {
        if (!file.name.endsWith('.html')) {
            return 'Please select an HTML file';
        }
        if (file.size > maxFileSize) {
            return 'File size exceeds 16MB limit';
        }
        return null;
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            e.target.value = '';
            setFile(null);
            setPreview('');
            return;
        }

        setFile(selectedFile);
        setError('');

        // Read and preview the HTML content
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                // Basic HTML validation
                if (!content.includes('<!DOCTYPE html>') && !content.includes('<html')) {
                    throw new Error('Invalid HTML format');
                }
                setPreview(content);
            } catch (error) {
                setError('Invalid HTML file format');
                setPreview('');
                setFile(null);
            }
        };
        reader.onerror = () => {
            setError('Error reading file');
            setPreview('');
            setFile(null);
        };
        reader.readAsText(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select an HTML resume file');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const html_content = e.target.result;
                try {
                    const response = await axios.post('/api/resume/upload', {
                        html_content: html_content
                    });

                    onUpload({
                        id: response.data.id,
                        content: html_content
                    });
                } catch (error) {
                    console.error('Upload error:', error);
                    setError(error.response?.data?.error || 'Error uploading resume');
                }
            };
            reader.onerror = () => {
                setError('Error reading file');
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('File reading error:', error);
            setError('Error reading the file');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title mb-4">Upload Resume</h2>

                {error && (
                    <div className="alert alert-danger" role="alert">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">
                            Upload your Resume HTML File (.html)
                        </label>
                        <div className="input-group">
                            <input
                                type="file"
                                className="form-control"
                                accept=".html"
                                onChange={handleFileChange}
                                required
                            />
                            {file && (
                                <span className="input-group-text">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                            )}
                        </div>
                        <small className="text-muted d-block mt-1">
                            Only HTML files up to 16MB are supported
                        </small>
                    </div>

                    {preview && (
                        <div className="mb-3">
                            <label className="form-label">Preview:</label>
                            <div className="resume-preview">
                                <iframe
                                    srcDoc={preview}
                                    style={{
                                        width: '100%',
                                        height: '400px',
                                        border: 'none',
                                        backgroundColor: 'white'
                                    }}
                                    title="Resume Preview"
                                    sandbox="allow-same-origin"
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading || !file}
                    >
                        {loading ? (
                            <span>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Uploading...
                            </span>
                        ) : (
                            <>
                                <i className="fas fa-upload me-2"></i>
                                Upload Resume
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

window.Resume = Resume;