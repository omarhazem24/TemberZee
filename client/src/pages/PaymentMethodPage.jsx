import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const PaymentMethodPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const items = JSON.parse(localStorage.getItem('cartItems')) || [];
        const user = JSON.parse(localStorage.getItem('userInfo'));
        
        if (!user) {
            navigate('/login');
        } else if (items.length === 0) {
            navigate('/cart');
        } else {
            setCartItems(items);
            setUserInfo(user);
        }
    }, [navigate]);

    const [loading, setLoading] = useState(false);

    const calculateShipping = (address) => {
        if (!address || !address.state) return 120;
        
        const gov = address.state.trim().toLowerCase();
        const zone90 = ['Alexandria', 'Beheira', 'Kafr El Sheikh', 'Kafr El-Sheikh', 'Gharbia', 'Monufia', 'Suez', 'Qalyubia', 'Dakahlia', 'Sharqia', 'Damietta', 'Port Said', 'Ismailia', 'Matruh'];
        const zone70 = ['Cairo', 'Giza'];

        if (zone70.some(z => gov === z.toLowerCase())) return 70;
        if (zone90.some(z => gov === z.toLowerCase())) return 90;
        return 120;
    };

    const createOrder = async (paymentMethod) => {
        setLoading(true);
        try {
             const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
             const shippingPrice = calculateShipping(userInfo.address);
             const taxPrice = 0;
             let totalPrice = itemsPrice + shippingPrice + taxPrice;
             
             const orderData = {
                 orderItems: cartItems,
                 shippingAddress: userInfo.address || {
                     street: 'N/A', city: 'N/A', state: 'N/A', zip: 'N/A', country: 'N/A'
                 },
                 paymentMethod: paymentMethod,
                 itemsPrice,
                 shippingPrice,
                 taxPrice,
                 totalPrice: totalPrice.toFixed(2)
             };

             const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.post('/api/orders', orderData, config);
            
            localStorage.removeItem('cartItems');
            window.dispatchEvent(new Event('cartUpdated'));
            
            toast.success(`Order Placed via ${paymentMethod}!`);
            navigate(`/order/${data._id}`);

        } catch (error) {
             console.error(error);
             toast.error('Error creating order: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <Card className="p-4 shadow border-0" style={{ width: '100%', maxWidth: '600px' }}>
                <div className="text-center mb-4">
                    <h2 style={{ fontWeight: 'bold' }}>Complete Order</h2>
                    <p className="text-muted">Payment Method</p>
                </div>
                
                <div className="d-grid gap-3">
                    <Button 
                        variant="dark" 
                        size="lg" 
                        className="py-3 d-flex align-items-center justify-content-center px-4"
                        onClick={() => createOrder('Cash on Delivery')}
                        disabled={loading}
                    >
                         <i className="fas fa-truck me-3"></i> Place Order (Cash on Delivery)
                    </Button>
                </div>

                <div className="mt-4 text-center">
                    <Alert variant="secondary" className="small">
                        <i className="fas fa-info-circle me-2"></i>
                        You will pay in cash upon receiving your order.
                    </Alert>
                </div>
            </Card>
        </Container>
    );
};

export default PaymentMethodPage;
