const Resume = ({ onUpload }) => {
    const [file, setFile] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [preview, setPreview] = React.useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.tex')) {
            setFile(selectedFile);
            // Read and preview the file content
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsText(selectedFile);
        } else {
            alert('Please select a .tex file');
            e.target.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert('Please select a LaTeX file');
            return;
        }

        setLoading(true);
        try {
            // Read file content
            const reader = new FileReader();
            reader.onload = async (e) => {
                const latex_content = e.target.result;
                const response = await axios.post('/api/resume/upload', {
                    latex_content: latex_content
                });

                onUpload({
                    id: response.data.id,
                    content: latex_content
                });
            };
            reader.readAsText(file);
        } catch (error) {
            alert('Error uploading resume');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title mb-4">Upload Resume</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">
                            Upload your LaTeX Resume File (.tex)
                        </label>
                        <input
                            type="file"
                            className="form-control"
                            accept=".tex"
                            onChange={handleFileChange}
                            required
                        />
                        <small className="text-muted">
                            Only .tex files are supported
                        </small>
                    </div>

                    {preview && (
                        <div className="mb-3">
                            <label className="form-label">Preview:</label>
                            <div className="resume-preview">
                                <pre className="text-light">
                                    {preview.slice(0, 200)}...
                                </pre>
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