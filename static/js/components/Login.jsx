export const Login = ({ onLogin }) => {
    const [isLogin, setIsLogin] = React.useState(true);
    const [formData, setFormData] = React.useState({
        email: '',
        password: '',
        username: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isLogin ? '/api/login' : '/api/register';
            const response = await axios.post(endpoint, formData);
            onLogin(response.data);
        } catch (error) {
            alert(error.response?.data?.error || 'An error occurred');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = '/google_login';
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title text-center mb-4">
                    {isLogin ? 'Login' : 'Register'}
                </h2>

                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.username}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    username: e.target.value
                                })}
                                required
                            />
                        </div>
                    )}

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => setFormData({
                                ...formData,
                                email: e.target.value
                            })}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={(e) => setFormData({
                                ...formData,
                                password: e.target.value
                            })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mb-3">
                        {isLogin ? 'Login' : 'Register'}
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-secondary w-100 mb-3"
                        onClick={handleGoogleLogin}
                    >
                        <i className="fab fa-google me-2"></i>
                        Continue with Google
                    </button>

                    <p className="text-center">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <a href="#" onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Register' : 'Login'}
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};