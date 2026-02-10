import { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
                '/api/auth/forgot-password',
                { identifier },
                config
            );

            toast.success(data.data);
            setLoading(false);
            // Navigate to OTP verification page, passing identifier
            navigate('/forgot-password-otp', { state: { identifier } });

        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div style={{ maxWidth: '500px', width: '100%', padding: '20px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
                <h1 className="text-center mb-4">Forgot Password</h1>
                <p className="text-center mb-4">Enter your phone number or username to receive a verification code on WhatsApp.</p>
                <Form onSubmit={submitHandler}>
                    <Form.Group className="mb-3" controlId='identifier'>
                        <Form.Label>Phone Number or Username</Form.Label>
                        <Form.Control
                            type='text'
                            placeholder='Enter username or phone'
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button variant='primary' type='submit' className="w-100" disabled={loading}>
                        {loading ? 'Sending...' : 'Send WhatsApp OTP'}
                    </Button>
                </Form>
                <div className="text-center mt-3">
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </Container>
    );
};

export default ForgotPasswordPage;