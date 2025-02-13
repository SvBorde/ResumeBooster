const JobAnalysis = ({ resumeData, onAnalysis }) => {
    const [jobDescription, setJobDescription] = React.useState('');
    const [analysis, setAnalysis] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [selectedSkills, setSelectedSkills] = React.useState([]);
    const [enhancing, setEnhancing] = React.useState(false);
    const [enhancedResume, setEnhancedResume] = React.useState(null);

    const analyzeJob = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/api/resume/analyze', {
                resume_id: resumeData.id,
                job_description: jobDescription
            });

            setAnalysis(response.data);
            onAnalysis(response.data);
        } catch (error) {
            alert('Error analyzing job description');
        } finally {
            setLoading(false);
        }
    };

    const enhanceResume = async () => {
        setEnhancing(true);

        try {
            const response = await axios.post('/api/resume/enhance', {
                resume_id: resumeData.id,
                selected_skills: selectedSkills
            });

            setEnhancedResume(response.data);
        } catch (error) {
            alert('Error enhancing resume');
        } finally {
            setEnhancing(false);
        }
    };

    const downloadHtml = () => {
        if (!enhancedResume) return;

        const blob = new Blob([enhancedResume.enhanced_content], {
            type: 'text/html'
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'enhanced_resume.html';
        a.click();
    };

    const renderSkillSection = (title, skills, isSelectable = false) => (
        <div className="mb-4">
            <h4 className="mb-3">{title}</h4>
            <div className="skills-list">
                {skills.map((skill, index) => (
                    isSelectable ? (
                        <div key={index} className="form-check skill-checkbox">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id={`skill-${index}`}
                                checked={selectedSkills.includes(skill)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedSkills([...selectedSkills, skill]);
                                    } else {
                                        setSelectedSkills(selectedSkills.filter(s => s !== skill));
                                    }
                                }}
                            />
                            <label className="form-check-label" htmlFor={`skill-${index}`}>
                                {skill}
                            </label>
                        </div>
                    ) : (
                        <span key={index} className="skill-tag">
                            {skill}
                        </span>
                    )
                ))}
            </div>
        </div>
    );

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title mb-4">Job Description Analysis</h2>

                <form onSubmit={analyzeJob}>
                    <div className="mb-3">
                        <label className="form-label">
                            Paste Job Description
                        </label>
                        <textarea
                            className="form-control"
                            rows="8"
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the job description here..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 mb-4"
                        disabled={loading}
                    >
                        {loading ? 'Analyzing...' : 'Analyze Job Description'}
                    </button>
                </form>

                {analysis && (
                    <div className="analysis-results">
                        <div className="match-percentage text-center mb-4">
                            <div className="display-4">
                                {Math.round(analysis.match_percentage)}%
                            </div>
                            <div className="text-muted">Match Score</div>
                        </div>

                        {renderSkillSection('Matched Technical Skills', analysis.matched_technical_skills)}
                        {renderSkillSection('Matched Qualifications', analysis.matched_qualifications)}
                        {renderSkillSection('Missing Technical Skills', analysis.missing_technical_skills, true)}
                        {renderSkillSection('Missing Qualifications', analysis.missing_qualifications, true)}

                        <div className="d-grid gap-2">
                            <button
                                className="btn btn-success"
                                onClick={enhanceResume}
                                disabled={enhancing || selectedSkills.length === 0}
                            >
                                {enhancing ? 'Enhancing...' : 'Enhance Resume'}
                            </button>

                            {enhancedResume && (
                                <>
                                    <div className="card mt-4">
                                        <div className="card-body">
                                            <h5 className="card-title">Changes Made</h5>
                                            <ul className="list-unstyled">
                                                {enhancedResume.changes_made.map((change, index) => (
                                                    <li key={index} className="mb-2">
                                                        <i className="fas fa-check-circle text-success me-2"></i>
                                                        {change}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="card mt-4">
                                        <div className="card-body">
                                            <h5 className="card-title">Resume Preview</h5>
                                            <div className="resume-preview">
                                                <iframe
                                                    srcDoc={enhancedResume.enhanced_content}
                                                    style={{
                                                        width: '100%',
                                                        height: '600px',
                                                        border: 'none',
                                                        backgroundColor: 'white'
                                                    }}
                                                    title="Enhanced Resume Preview"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary mt-3"
                                        onClick={downloadHtml}
                                    >
                                        <i className="fas fa-download me-2"></i>
                                        Download Enhanced Resume
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

window.JobAnalysis = JobAnalysis;