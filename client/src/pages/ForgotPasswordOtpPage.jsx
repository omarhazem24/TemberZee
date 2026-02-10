import { useState, useEffect } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

const ForgotPasswordOtpPage = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get identifier passed from previous page
    const identifier = location.state?.identifier;

    useEffect(() => {
        if (!identifier) {
            toast.error('No user information provided. Please start over.');
            navigate('/forgot-password');
        }
    }, [identifier, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            const { data } = await axios.post(
                '/api/auth/verify-reset-otp',
                { identifier, otp },
                config
            );

            if (data.success) {
                toast.success('OTP Verified');
                // Navigate to reset password page with the token
                navigate(`/reset-password/${data.resetToken}`);
            }
            setLoading(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div style={{ maxWidth: '500px', width: '100%', padding: '20px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <h1 className="text-center mb-4">Verify OTP</h1>
                <p className="text-center mb-4">Enter the code sent to your WhatsApp number associated with {identifier}.</p>
                <Form onSubmit={submitHandler}>
                    <Form.Group className="mb-3" controlId='otp'>
                        <Form.Label>OTP Code</Form.Label>
                        <Form.Control
                            type='text'
                            placeholder='Enter 6-digit code'
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button variant='primary' type='submit' className="w-100" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </Button>
                </Form>
            </div>
        </Container>
    );
};

export default ForgotPasswordOtpPage;