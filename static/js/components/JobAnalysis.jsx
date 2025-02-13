export const JobAnalysis = ({ resumeData, onAnalysis }) => {
    const [jobDescription, setJobDescription] = React.useState('');
    const [analysis, setAnalysis] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [selectedSkills, setSelectedSkills] = React.useState([]);
    const [enhancing, setEnhancing] = React.useState(false);

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

            const blob = new Blob([response.data.enhanced_content], {
                type: 'application/x-latex'
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'enhanced_resume.tex';
            a.click();
        } catch (error) {
            alert('Error enhancing resume');
        } finally {
            setEnhancing(false);
        }
    };

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
                            {Math.round(analysis.match_percentage)}% Match
                        </div>

                        <div className="matched-skills mb-4">
                            <h4>Matched Skills</h4>
                            <div className="skills-list">
                                {analysis.matched_skills.map((skill, index) => (
                                    <span key={index} className="skill-tag">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="missing-skills mb-4">
                            <h4>Missing Skills</h4>
                            <div className="skills-list">
                                {analysis.missing_skills.map((skill, index) => (
                                    <div key={index} className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`skill-${index}`}
                                            checked={selectedSkills.includes(skill)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedSkills([...selectedSkills, skill]);
                                                } else {
                                                    setSelectedSkills(selectedSkills.filter(
                                                        s => s !== skill
                                                    ));
                                                }
                                            }}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor={`skill-${index}`}
                                        >
                                            {skill}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            className="btn btn-success w-100"
                            onClick={enhanceResume}
                            disabled={enhancing || selectedSkills.length === 0}
                        >
                            {enhancing ? 'Enhancing...' : 'Enhance Resume'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};