const App = () => {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [currentStep, setCurrentStep] = React.useState('login');
    const [resumeData, setResumeData] = React.useState(null);
    const [analysis, setAnalysis] = React.useState(null);

    const handleLogin = (userData) => {
        setIsAuthenticated(true);
        setCurrentStep('resume');
    };

    const handleResumeUpload = (data) => {
        setResumeData(data);
        setCurrentStep('analysis');
    };

    const handleAnalysis = (analysisData) => {
        setAnalysis(analysisData);
    };

    return (
        <div className="container">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">
                        <i className="fas fa-file-alt me-2"></i>
                        Resume Enhancement Tool
                    </a>
                </div>
            </nav>

            {currentStep === 'login' && (
                <Login onLogin={handleLogin} />
            )}

            {currentStep === 'resume' && (
                <Resume onUpload={handleResumeUpload} />
            )}

            {currentStep === 'analysis' && (
                <JobAnalysis 
                    resumeData={resumeData}
                    onAnalysis={handleAnalysis}
                />
            )}
        </div>
    );
};

ReactDOM.render(
    React.createElement(App),
    document.getElementById('root')
);