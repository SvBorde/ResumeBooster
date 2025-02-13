export const Resume = ({ onUpload }) => {
    const [latex, setLatex] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/api/resume/upload', {
                latex_content: latex
            });

            onUpload({
                id: response.data.id,
                content: latex
            });
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
                            Paste your LaTeX Resume Content
                        </label>
                        <textarea
                            className="form-control"
                            rows="10"
                            value={latex}
                            onChange={(e) => setLatex(e.target.value)}
                            placeholder="Paste your LaTeX resume content here..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
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