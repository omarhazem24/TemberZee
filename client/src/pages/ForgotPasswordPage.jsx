import { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
        { email },
        config
      );

      toast.success(data.data);
      setLoading(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div style={{ maxWidth: '500px', width: '100%', padding: '20px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
            <h1 className="text-center mb-4">Forgot Password</h1>
            <p className="text-center mb-4">Enter your email address and we'll send you a link to reset your password.</p>
            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId='email'>
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                        type='email'
                        placeholder='Enter email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button variant='primary' type='submit' className="w-100" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
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