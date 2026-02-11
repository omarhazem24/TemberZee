import { useEffect, useState } from 'react';
import { Row, Col, ListGroup, Image, Card, Container, Badge, Alert, Button } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/imagePath';

const OrderPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get(`/api/orders/${id}`, config);
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    if (userInfo) {
      fetchOrder();
    }
  }, [id, userInfo]);

  const requestCancellation = async () => {
    if(!window.confirm('Are you sure you want to request cancellation for this order?')) return;
    
    try {
       await axios.post(`/api/orders/${id}/cancel`, {}, {
         headers: { Authorization: `Bearer ${userInfo.token}` }
       });
       toast.success('Cancellation request sent to admin');
    } catch (err) {
       toast.error(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <Container className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}><div className="spinner-border" role="status"></div></Container>;
  if (error) return <Container className='mt-5'><Alert variant='danger'>{error}</Alert></Container>;

  return (
    <Container className='py-5'>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
           <h4 className="text-muted mb-0">Order Details</h4>
           <h2 style={{ fontWeight: '700' }}>#{order._id.substring(order._id.length - 8).toUpperCase()}</h2>
        </div>
        <div className="mt-3 mt-md-0">
             <Badge bg={order.isDelivered ? 'success' : 'warning'} className="px-3 py-2 rounded-pill" style={{fontSize: '1rem'}}>
                {order.isDelivered ? 'Delivered' : (order.orderStatus || 'Pending')}
            </Badge>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={8}>
            {/* Status Cards */}
            <Row className="mb-4 g-3">
                <Col md={6}>
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-light rounded-circle p-3 me-3 text-primary d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                                <i className="fas fa-truck fa-lg"></i>
                            </div>
                            <div>
                                <h6 className="mb-1 text-muted text-uppercase small fw-bold">Delivery Status</h6>
                                {order.isDelivered ? (
                                    <h5 className="mb-0 text-success fw-bold">Delivered</h5>
                                ) : (
                                    <h5 className="mb-0 text-warning fw-bold">Processing</h5>
                                )}
                                <small className="text-muted">{order.isDelivered && order.deliveredAt ? order.deliveredAt.substring(0,10) : 'On the way'}</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="h-100 border-0 shadow-sm">
                        <Card.Body className="d-flex align-items-center p-4">
                            <div className="bg-light rounded-circle p-3 me-3 text-success d-flex align-items-center justify-content-center" style={{width: '60px', height: '60px'}}>
                                <i className="fas fa-wallet fa-lg"></i>
                            </div>
                            <div>
                                <h6 className="mb-1 text-muted text-uppercase small fw-bold">Payment Status</h6>
                                {order.isPaid ? (
                                    <h5 className="mb-0 text-success fw-bold">Paid</h5>
                                ) : (
                                    <h5 className="mb-0 text-danger fw-bold">Unpaid</h5>
                                )}
                                <small className="text-muted">{order.paymentMethod}</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Items List */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white py-3 border-bottom-0">
                    <h5 className="mb-0 fw-bold"><i className="fas fa-box me-2 text-secondary"></i> Order Items</h5>
                </Card.Header>
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index} className="py-3 px-4 border-top">
                      <Row className="align-items-center">
                        <Col xs={3} md={2}>
                          <Image src={getImageUrl(item.image)} alt={item.name} fluid rounded className="border" />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`} className="text-decoration-none text-dark fw-bold h6">
                            {item.name}
                          </Link>
                          {item.size && <div className="text-muted small">Size: {item.size}</div>}
                          {item.color && <div className="text-muted small">Color: {item.color}</div>}
                        </Col>
                        <Col md={4} className="text-md-end mt-2 mt-md-0">
                          <div className="text-muted">{item.qty} x {item.price} EGP</div>
                          <div className="fw-bold fs-5 text-dark">{(item.qty * item.price).toFixed(2)} EGP</div>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
            </Card>

            {/* Shipping Info */}
           <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-bottom-0">
                    <h5 className="mb-0 fw-bold"><i className="fas fa-map-marker-alt me-2 text-secondary"></i> Shipping Details</h5>
                </Card.Header>
                <Card.Body className="p-4 pt-2">
                    <Row>
                        <Col md={6} className="mb-3 mb-md-0">
                            <h6 className="text-muted mb-2 text-uppercase small fw-bold">Customer</h6>
                            <p className="mb-1 fw-bold fs-5">{order.user.firstName} {order.user.lastName}</p>
                            <p className="mb-1"><a href={`mailto:${order.user.email}`} className="text-decoration-none text-secondary"><i className="fas fa-envelope me-2"></i>{order.user.email}</a></p>
                            <p className="mb-0 text-secondary"><i className="fas fa-phone me-2"></i>{order.user.phoneNumber}</p>
                        </Col>
                        <Col md={6}>
                            <h6 className="text-muted mb-2 text-uppercase small fw-bold">Delivery Address</h6>
                            <p className="mb-0 fs-6 text-dark" style={{lineHeight: '1.6'}}>
                                {order.shippingAddress.street}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.zip}<br />
                                {order.shippingAddress.country}
                            </p>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Col>

        {/* Sidebar Summary */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-black text-white py-4 text-center">
                <h4 className="mb-0 fw-bold letter-spacing-1">ORDER SUMMARY</h4>
            </Card.Header>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                  <span className="text-muted">Subtotal</span>
                  <span className="fw-bold">{order.itemsPrice.toFixed(2)} EGP</span>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                  <span className="text-muted">Shipping</span>
                  <span className="fw-bold">{order.shippingPrice.toFixed(2)} EGP</span>
              </div>
              <div className="d-flex justify-content-between mb-3 border-bottom pb-3">
                  <span className="text-muted">Tax</span>
                  <span className="fw-bold">{order.taxPrice.toFixed(2)} EGP</span>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mt-3">
                  <span className="fw-bold fs-5">TOTAL</span>
                  <span className="fw-bold fs-3 text-success">{order.totalPrice.toFixed(2)} EGP</span>
              </div>

              {/* Cancel Button */}
              {!order.isDelivered && order.orderStatus !== 'canceled' && (
                  <div className="d-grid mt-4">
                      <Button variant="outline-danger" onClick={requestCancellation}>
                          Request Cancellation
                      </Button>
                  </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderPage;
