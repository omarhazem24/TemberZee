import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Container } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const SignupPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+20');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // OTP Logic
  const [step, setStep] = useState('signup'); // 'signup' or 'otp'
  const [otp, setOtp] = useState('');
  const [serverMsg, setServerMsg] = useState('');
  
  // Address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('Egypt');

  const egyptianGovernorates = [
    "Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo", 
    "Dakahlia", "Damietta", "Faiyum", "Gharbia", "Giza", "Ismailia", 
    "Kafr El Sheikh", "Luxor", "Matruh", "Minya", "Monufia", 
    "New Valley", "North Sinai", "Port Said", "Qalyubia", "Qena", 
    "Red Sea", "Sharqia", "Sohag", "South Sinai", "Suez"
  ];

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setPasswordError(''); // Clear previous error
    
    if (step === 'signup') {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
        if (!passwordRegex.test(password)) {
            setPasswordError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one symbol.');
            return;
        }

        try {
          const config = {
            headers: {
              'Content-Type': 'application/json',
            },
          };

          const address = { street, city, state, zip, country };

          const { data } = await axios.post(
            '/api/auth/signup',
            { firstName, lastName, username, email, phoneNumber, countryCode, password, address },
            config
          );

          if (data.requiresOtp) {
              setStep('otp');
              setServerMsg(`OTP sent to ${data.phoneNumber}`);
              toast.success('OTP sent to your phone');
          } else {
             // Fallback if logic changes
              localStorage.setItem('userInfo', JSON.stringify(data));
              navigate('/');
              window.location.reload();
              toast.success('Account created successfully');
          }

        } catch (error) {
          console.error(error);
          toast.error(error.response?.data?.message || error.message);
        }
    } else {
        // OTP Step
        try {
             const { data } = await axios.post('/api/auth/verify-otp', { email, otp });
             localStorage.setItem('userInfo', JSON.stringify(data));
             navigate('/');
             window.location.reload();
             toast.success('Verified! Welcome!');
        } catch (error) {
             toast.error('OTP Verification Failed: ' + (error.response?.data?.message || 'Invalid OTP'));
        }
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

      <Container style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <h1 className='text-center mb-5' style={{ fontWeight: '800', fontSize: '2.5rem', letterSpacing: '2px' }}>
              {step === 'signup' ? 'CREATE ACCOUNT' : 'VERIFY PHONE'}
          </h1>
          
          {serverMsg && <div className="alert alert-info text-center">{serverMsg}</div>}

          <Form onSubmit={submitHandler}>
            {step === 'signup' ? (
            <>
            <Row>
                <Col md={6}>
                    <Form.Group controlId='firstName' className='mb-3'>
                    <Form.Label className='fw-bold small text-uppercase'>First Name</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='First Name'
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className='p-3 border-dark rounded-0'
                        style={{ backgroundColor: 'transparent' }}
                    ></Form.Control>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId='lastName' className='mb-3'>
                    <Form.Label className='fw-bold small text-uppercase'>Last Name</Form.Label>
                    <Form.Control
                        type='text'
                        placeholder='Last Name'
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className='p-3 border-dark rounded-0'
                        style={{ backgroundColor: 'transparent' }}
                    ></Form.Control>
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group controlId='username' className='mb-3'>
              <Form.Label className='fw-bold small text-uppercase'>Username</Form.Label>
              <Form.Control
                type='text'
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className='p-3 border-dark rounded-0'
                style={{ backgroundColor: 'transparent' }}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='email' className='mb-3'>
              <Form.Label className='fw-bold small text-uppercase'>Email Address (Verification Required)</Form.Label>
              <Form.Control
                type='email'
                placeholder='Enter email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='p-3 border-dark rounded-0'
                style={{ backgroundColor: 'transparent' }}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId='phoneNumber' className='mb-3'>
              <Form.Label className='fw-bold small text-uppercase'>Phone Number</Form.Label>
              <div className="d-flex">
                 <Form.Select 
                    value={countryCode} 
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{ width: '100px', marginRight: '10px' }}
                    className="border-dark rounded-0 p-3 bg-transparent"
                 >
                    <option value="+20">+20 (EG)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+966">+966 (SA)</option>
                    <option value="+971">+971 (AE)</option>
                 </Form.Select>
                 <Form.Control
                    type='tel'
                    placeholder='Enter phone number'
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className='p-3 border-dark rounded-0 w-100'
                    style={{ backgroundColor: 'transparent' }}
                 ></Form.Control>
              </div>
            </Form.Group>

            <Form.Group controlId='password' className='mb-3'>
              <Form.Label className='fw-bold small text-uppercase'>Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`p-3 border-dark rounded-0 ${passwordError ? 'is-invalid' : ''}`}
                style={{ backgroundColor: 'transparent' }}
              ></Form.Control>
               {passwordError && (
                  <div className="text-danger small mt-1">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      {passwordError}
                  </div>
              )}
            </Form.Group>

            <h4 className='mt-4 mb-3 text-uppercase fw-bold h5'>Shipping Address</h4>
            <Form.Group controlId='street' className='mb-3'>
              <Form.Label className='fw-bold small text-uppercase'>Street</Form.Label>
              <Form.Control 
                type='text' 
                value={street} 
                onChange={(e) => setStreet(e.target.value)} 
                required 
                className='p-3 border-dark rounded-0'
                style={{ backgroundColor: 'transparent' }}
              />
            </Form.Group>
            
            <Row>
                <Col md={6}>
                    <Form.Group controlId='city' className='mb-3'>
                      <Form.Label className='fw-bold small text-uppercase'>City</Form.Label>
                      <Form.Control 
                        type='text' 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)} 
                        required 
                        className='p-3 border-dark rounded-0'
                        style={{ backgroundColor: 'transparent' }}
                      />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId='state' className='mb-3'>
                      <Form.Label className='fw-bold small text-uppercase'>Governorate</Form.Label>
                      <Form.Select 
                        value={state} 
                        onChange={(e) => setState(e.target.value)} 
                        required 
                        className='p-3 border-dark rounded-0'
                        style={{ backgroundColor: 'transparent' }}
                      >
                         <option value="">Select Governorate</option>
                         {egyptianGovernorates.map((gov) => (
                             <option key={gov} value={gov}>{gov}</option>
                         ))}
                      </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
             <Row>
                <Col md={6}>
                    <Form.Group controlId='zip' className='mb-3'>
                      <Form.Label className='fw-bold small text-uppercase'>Zip Code</Form.Label>
                      <Form.Control 
                        type='text' 
                        value={zip} 
                        onChange={(e) => setZip(e.target.value)} 
                        required 
                        className='p-3 border-dark rounded-0'
                        style={{ backgroundColor: 'transparent' }}
                      />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId='country' className='mb-3'>
                      <Form.Label className='fw-bold small text-uppercase'>Country</Form.Label>
                      <Form.Control 
                        type='text' 
                        value={country} 
                        onChange={(e) => setCountry(e.target.value)} 
                        required 
                        className='p-3 border-dark rounded-0'
                        style={{ backgroundColor: 'transparent' }}
                        readOnly
                      />
                    </Form.Group>
                </Col>
            </Row>

            <div className='d-grid gap-2 mt-5'>
                <Button type='submit' className='btn-black text-uppercase' size='lg' style={{ borderRadius: '0', padding: '15px' }}>
                    Sign Up
                </Button>
            </div>
            </>
            ) : (
                <div className="text-center mt-5">
                    <p className="mb-4 text-muted">
                        We sent a <strong className="text-success"><i className="fab fa-whatsapp me-1"></i>WhatsApp message</strong> with your code to {countryCode} {phoneNumber}
                    </p>
                    <Form.Group controlId='otp' className='mb-4'>
                        <Form.Label className='fw-bold small text-uppercase'>Enter 6-Digit Code</Form.Label>
                        <Form.Control
                            type='text'
                            placeholder='000000'
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            className='p-3 border-dark rounded-0 text-center fs-3'
                            style={{ backgroundColor: 'transparent', letterSpacing: '8px' }}
                            maxLength={6}
                        />
                    </Form.Group>
                    <div className='d-grid gap-2'>
                        <Button type='submit' className='btn-black text-uppercase' size='lg' style={{ borderRadius: '0', padding: '15px' }}>
                            Verify & Login
                        </Button>
                         <Button variant="link" onClick={() => setStep('signup')} className="text-muted text-uppercase text-decoration-none">
                            Change Phone Number
                        </Button>
                    </div>
                </div>
            )}
          </Form>

          {step === 'signup' && (
          <Row className='py-4'>
            <Col className='text-center'>
              <span className="text-muted text-uppercase small" style={{ fontSize: '0.9rem' }}>Already have an account?</span> 
              <Link 
                to='/login'
                className="text-black text-decoration-none border-bottom border-dark pb-1 fw-bold text-uppercase small ms-2"
              >
                Sign In
              </Link>
            </Col>
          </Row>
          )}
      </Container>
    </div>
  );
};

export default SignupPage;
