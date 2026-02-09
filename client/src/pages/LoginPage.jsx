import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        '/api/auth/login',
        { email, password },
        config
      );

      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/');
      window.location.reload(); // Update header
      toast.success('Successfully Logged In');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Background Logo */}
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '900px',
            height: '900px',
            backgroundImage: "url('/images/z-logo-background.png')",
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            opacity: 0.15, 
            zIndex: 0,
            pointerEvents: 'none'
        }}></div>

        <Container style={{ position: 'relative', zIndex: 1, maxWidth: '500px' }}>
          <h1 className='text-center mb-5' style={{ fontWeight: '800', fontSize: '2.5rem', letterSpacing: '2px' }}>SIGN IN</h1>
          <Form onSubmit={submitHandler}>
            <Form.Group controlId='email' className='mb-3'>
              <Form.Label className='fw-bold small text-uppercase'>Email Address or Username</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter email or username'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='p-3 border-dark rounded-0'
                style={{ backgroundColor: 'transparent' }}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='password'>
              <Form.Label className='fw-bold small text-uppercase'>Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='p-3 border-dark rounded-0'
                style={{ backgroundColor: 'transparent' }}
              ></Form.Control>
            </Form.Group>

            <div className="d-flex justify-content-end mb-3">
                <Link to='/forgot-password' className="text-muted text-decoration-none small">Forgot Password?</Link>
            </div>

            <div className='d-grid gap-2 mt-4'>
              <Button type='submit' className='btn-black text-uppercase' size='lg' style={{ borderRadius: '0', padding: '15px' }}>
                Sign In
              </Button>
            </div>
          </Form>

          <div className="text-center mt-5">
            <span className="text-muted text-uppercase small" style={{ letterSpacing: '1px' }}>Not a member yet?</span>
            <div className="mt-3">
               <Link to='/signup' className="text-black text-decoration-none border-bottom border-dark pb-1 fw-bold text-uppercase small">Create Account</Link>
            </div>
          </div>
        </Container>
    </div>
  );
};

export default LoginPage;
