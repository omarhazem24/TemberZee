import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { getImageUrl } from '../utils/imagePath';

const AdminRevenuePage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                };
                const { data } = await axios.get('/api/orders/analytics', config);
                setAnalytics(data);
                
                // Fetch low stock products
                // Ideally this should be a separate API or included in analytics, but fetching all products to filter is okay for small scale
                // Or better, add a specific endpoint. For now, let's just fetch all products and filter locally if list is small.
                // Assuming /api/products returns all products
                const { data: allProducts } = await axios.get('/api/products');
                const lowStock = allProducts.filter(p => p.countInStock < 5);
                setLowStockProducts(lowStock);

                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        if(userInfo && userInfo.role === 'admin') {
            fetchAnalytics();
        }
    }, [userInfo]);

    if (loading) return <Container className="d-flex justify-content-center mt-5"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container className="mt-5 mb-5">
            <h1 className="mb-4 fw-bold" style={{fontFamily: 'var(--font-heading)'}}>STORE ANALYTICS</h1>
            
            {lowStockProducts.length > 0 && (
                <Alert variant="danger" className="mb-4 shadow-sm">
                    <Alert.Heading><i className="fas fa-exclamation-triangle me-2"></i> Low Stock Alert</Alert.Heading>
                    <p className="mb-0">The following products have less than 5 items in stock:</p>
                    <ul className="mt-2 mb-0">
                        {lowStockProducts.map(p => (
                            <li key={p._id}>
                                <strong>{p.name}</strong> - {p.countInStock} remaining
                            </li>
                        ))}
                    </ul>
                </Alert>
            )}
            
            {/* Main Stats Row */}
            <div className="bg-dark text-white p-5 rounded-3 text-center mb-4 shadow position-relative overflow-hidden">
                <div className="position-relative z-1">
                    <h5 className="text-white-50 text-uppercase letter-spacing-2 mb-3">Total Gross Revenue</h5>
                    <div style={{ fontSize: '4rem', fontWeight: '800' }}>
                        {analytics.totalRevenue.toFixed(2)} <span className="fs-4 fw-normal">EGP</span>
                    </div>
                    <p className="text-white-50 mt-2"><i className="fas fa-check-circle me-1"></i> Calculated from {analytics.totalOrders} active orders</p>
                </div>
            </div>
            
            <Row className="mb-4 g-4">
                <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm">
                         <Card.Body className="p-4 d-flex align-items-center">
                             <div className="bg-light p-3 rounded-circle me-3 text-primary">
                                 <i className="fas fa-shopping-bag fa-2x"></i>
                             </div>
                             <div>
                                 <h6 className="text-muted text-uppercase mb-1 fw-bold">Total Orders</h6>
                                 <h2 className="mb-0 fw-bold">{analytics.totalOrders}</h2>
                             </div>
                         </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm">
                         <Card.Body className="p-4 d-flex align-items-center">
                             <div className="bg-light p-3 rounded-circle me-3 text-success">
                                 <i className="fas fa-tshirt fa-2x"></i>
                             </div>
                             <div>
                                 <h6 className="text-muted text-uppercase mb-1 fw-bold">Products Sold</h6>
                                 <h2 className="mb-0 fw-bold">{analytics.totalProductsSold} <span className="fs-6 text-muted fw-normal">Units</span></h2>
                             </div>
                         </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="h-100 border-0 shadow-sm">
                         <Card.Body className="p-4 d-flex align-items-center">
                             <div className="bg-light p-3 rounded-circle me-3 text-warning">
                                 <i className="fas fa-box-open fa-2x"></i>
                             </div>
                             <div>
                                 <h6 className="text-muted text-uppercase mb-1 fw-bold">Pending Orders</h6>
                                 <h2 className="mb-0 fw-bold">{analytics.statusCounts.pending || 0}</h2>
                             </div>
                         </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-4">
                {/* Top Selling Chart/List */}
                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0 fw-bold">Top Selling Products</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0 ps-4">Product</th>
                                        <th className="border-0 text-center">Units Sold</th>
                                        <th className="border-0 text-end pe-4">Revenue Gen.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.topProducts.map((prod, idx) => (
                                        <tr key={idx}>
                                            <td className="ps-4">
                                                <div className="d-flex align-items-center">
                                                    <img 
                                                        src={getImageUrl(prod.image)} 
                                                        alt={prod.name} 
                                                        className="rounded me-3 border"
                                                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                    />
                                                    <span className="fw-bold">{prod.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <Badge bg="dark" className="px-3 py-2 rounded-pill">
                                                    {prod.qty}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-4 text-success fw-bold">
                                                {prod.revenue.toFixed(2)} EGP
                                            </td>
                                        </tr>
                                    ))}
                                    {analytics.topProducts.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-4 text-muted">No sales data available yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Order Status Breakdown */}
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white py-3">
                            <h5 className="mb-0 fw-bold">Order Status</h5>
                        </Card.Header>
                        <Card.Body>
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item d-flex justify-content-between align-items-center py-3 border-0">
                                    <span><i className="fas fa-clock text-warning me-2"></i> Pending</span>
                                    <span className="fw-bold fs-5">{analytics.statusCounts.pending || 0}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center py-3 border-0 bg-light rounded my-1">
                                    <span><i className="fas fa-check text-info me-2"></i> Confirmed</span>
                                    <span className="fw-bold fs-5">{analytics.statusCounts.confirmed || 0}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center py-3 border-0">
                                    <span><i className="fas fa-truck text-success me-2"></i> Delivered</span>
                                    <span className="fw-bold fs-5">{analytics.statusCounts.delivered || 0}</span>
                                </li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminRevenuePage;
