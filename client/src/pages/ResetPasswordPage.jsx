import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetToken } = useParams();
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    // Simple client-side validation for password match
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    // Simple client-side validation for password complexity to match backend requirement
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
     if (!passwordRegex.test(password)) {
        toast.error('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one symbol.');
        return;
    }

    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.put(
        `/api/auth/reset-password/${resetToken}`,
        { password },
        config
      );

      toast.success(data.data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
      window.location.reload(); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
       <div style={{ maxWidth: '500px', width: '100%', padding: '20px', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
            <h1 className="text-center mb-4">Reset Password</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId='password'>
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                        type='password'
                        placeholder='Enter new password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                 <Form.Group className="mb-3" controlId='confirmPassword'>
                    <Form.Label>Confirm New Password</Form.Label>
                    <Form.Control
                        type='password'
                        placeholder='Confirm new password'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button variant='primary' type='submit' className="w-100" disabled={loading}>
                    {loading ? 'Reseting...' : 'Reset Password'}
                </Button>
            </Form>
       </div>
    </Container>
  );
};

export default ResetPasswordPage;