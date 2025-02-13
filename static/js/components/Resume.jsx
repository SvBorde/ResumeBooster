const Resume = ({ onUpload }) => {
    const [file, setFile] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [preview, setPreview] = React.useState('');
    const [error, setError] = React.useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.html')) {
            setFile(selectedFile);
            setError('');
            // Read and preview the HTML content
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result);
            };
            reader.readAsText(selectedFile);
        } else {
            setError('Please select an HTML file');
            e.target.value = '';
        }
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
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">
                            Upload your Resume HTML File (.html)
                        </label>
                        <input
                            type="file"
                            className="form-control"
                            accept=".html"
                            onChange={handleFileChange}
                            required
                        />
                        <small className="text-muted">
                            Only HTML files are supported
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
                            'Upload Resume'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

window.Resume = Resume;