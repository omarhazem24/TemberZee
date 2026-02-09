import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProfilePage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Address
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('');

    const navigate = useNavigate();
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

    const egyptianGovernorates = [
        "Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo", 
        "Dakahlia", "Damietta", "Faiyum", "Gharbia", "Giza", "Ismailia", 
        "Kafr El Sheikh", "Luxor", "Matruh", "Minya", "Monufia", 
        "New Valley", "North Sinai", "Port Said", "Qalyubia", "Qena", 
        "Red Sea", "Sharqia", "Sohag", "South Sinai", "Suez"
      ];

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                const { data } = await axios.get('/api/users/profile', config);
                
                setFirstName(data.firstName);
                setLastName(data.lastName);
                setUsername(data.username);
                setEmail(data.email);
                setPhoneNumber(data.phoneNumber);
                
                if (data.address) {
                    setStreet(data.address.street);
                    setCity(data.address.city);
                    setState(data.address.state);
                    setZip(data.address.zip);
                    setCountry(data.address.country);
                }
            } catch (error) {
                console.error(error);
                toast.error('Failed to load profile');
            }
        };

        fetchProfile();
    }, [navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const updatedUser = {
                firstName,
                lastName,
                email,
                phoneNumber,
                address: {
                    street,
                    city,
                    state,
                    zip,
                    country
                }
            };

            const { data } = await axios.put('/api/users/profile', updatedUser, config);
            
            // Update local storage with new info (keep existing token)
            const newInfo = { ...data, token: userInfo.token };
            localStorage.setItem('userInfo', JSON.stringify(newInfo));
            
            toast.success('Profile Updated Successfully');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-white border-bottom-0 pt-4 pb-0">
                            <h2 className="text-center fw-bold">My Profile</h2>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Form onSubmit={submitHandler}>
                                <h5 className="mb-3 text-muted border-bottom pb-2">Account Info</h5>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={username} 
                                        disabled 
                                        className="bg-light"
                                    />
                                    <Form.Text className="text-muted">Username cannot be changed.</Form.Text>
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>First Name</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={firstName} 
                                                onChange={(e) => setFirstName(e.target.value)} 
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Last Name</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={lastName} 
                                                onChange={(e) => setLastName(e.target.value)} 
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email Address</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Phone Number</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={phoneNumber} 
                                        onChange={(e) => setPhoneNumber(e.target.value)} 
                                    />
                                </Form.Group>

                                <h5 className="mt-4 mb-3 text-muted border-bottom pb-2">Shipping Address</h5>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Street Address</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        value={street} 
                                        onChange={(e) => setStreet(e.target.value)} 
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>City</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={city} 
                                                onChange={(e) => setCity(e.target.value)} 
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Governorate</Form.Label>
                                            <Form.Select 
                                                value={state} 
                                                onChange={(e) => setState(e.target.value)}
                                            >
                                                <option value="">Select Governorate</option>
                                                {egyptianGovernorates.map(gov => (
                                                    <option key={gov} value={gov}>{gov}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Zip Code</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={zip} 
                                                onChange={(e) => setZip(e.target.value)} 
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Country</Form.Label>
                                            <Form.Control 
                                                type="text" 
                                                value={country} 
                                                disabled
                                                className="bg-light"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-grid mt-4">
                                    <Button type="submit" variant="dark" size="lg">
                                        Update Profile
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ProfilePage;
