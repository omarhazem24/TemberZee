import { useEffect, useState } from 'react';
import { Button, Row, Col, Container, Card, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderListPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else {
            const fetchOrders = async () => {
                try {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${userInfo.token}`,
                        },
                    };
                    const { data } = await axios.get('/api/orders/myorders', config);
                    setOrders(data);
                    setLoading(false);
                } catch (error) {
                    console.error(error);
                    setLoading(false);
                }
            };
            fetchOrders();
        }
    }, [navigate, userInfo]);

    return (
        <Container className="mt-5">
            <h1 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem' }}>MY ORDERS</h1>
            
            {loading ? (
                <div className="text-center">Loading...</div>
            ) : orders.length === 0 ? (
                 <div className="text-center py-5 bg-light rounded-3">
                    <i className="fas fa-box-open fa-3x mb-3 text-muted"></i>
                    <h3 style={{ fontFamily: 'var(--font-heading)' }}>NO ORDERS FOUND</h3>
                    <p className="text-muted">You haven't placed any orders yet.</p>
                    <Link to='/' className='btn btn-black mt-3 rounded-0 px-4'>
                        START SHOPPING
                    </Link>
                </div>
            ) : (
                <Row>
                    {orders.map((order) => (
                        <Col key={order._id} md={6} lg={4} className="mb-4">
                            <Card className="h-100 border-0 shadow-sm" style={{ transition: 'all 0.3s ease' }}>
                                <Card.Header className="bg-white border-bottom-0 pt-3 px-3 d-flex justify-content-between align-items-center">
                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </span>
                                    <Badge 
                                        bg={
                                            order.orderStatus === 'delivered' ? 'success' :
                                            order.orderStatus === 'canceled' ? 'danger' :
                                            order.orderStatus === 'confirmed' ? 'info' :
                                            'warning'
                                        } 
                                        text="light" 
                                        className="rounded-1 fw-normal text-uppercase"
                                    >
                                        {order.orderStatus || 'PENDING'}
                                    </Badge>
                                </Card.Header>
                                <Card.Body className="px-3 py-2">
                                     <h5 className="mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                                        Order #{order._id.substring(order._id.length - 6).toUpperCase()}
                                     </h5>
                                     <p className="text-muted small mb-3">ID: {order._id}</p>
                                     
                                     <div className="d-flex justify-content-between align-items-center mb-2">
                                         <span className="text-muted small">Total Amount</span>
                                         <span className="fw-bold fs-5">EGP {order.totalPrice.toFixed(2)}</span>
                                     </div>
                                     <div className="d-flex justify-content-between align-items-center">
                                         <span className="text-muted small">Payment</span>
                                         <span className={`fw-bold small`}>
                                             {order.paymentMethod}
                                         </span>
                                     </div>
                                </Card.Body>
                                <Card.Footer className="bg-white border-top-0 pb-3 px-3">
                                    <Link to={`/order/${order._id}`} className="btn btn-black w-100 rounded-0">
                                        VIEW DETAILS <i className="fas fa-arrow-right ms-2 small"></i>
                                    </Link>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default OrderListPage;
