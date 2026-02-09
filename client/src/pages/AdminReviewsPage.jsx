import { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminReviewsPage = () => {
    const [reviews, setReviews] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                };

                // Fetch All Reviews
                const { data: reviewsData } = await axios.get('/api/products/admin/allreviews', config);
                setReviews(reviewsData);

                // Fetch Top Products
                const { data: topData } = await axios.get('/api/products/top');
                setTopProducts(topData);
                
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        if(userInfo && userInfo.role === 'admin') {
            fetchData();
        }
    }, [userInfo]);

    if(loading) return <Container className="d-flex justify-content-center mt-5"><Spinner animation="border" /></Container>;
    if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container className="mt-4">
             <h1 className="mb-4 fw-bold" style={{fontFamily: 'var(--font-heading)'}}>REVIEWS & RATINGS</h1>
             
             <Row>
                 <Col lg={4} className="mb-4">
                     <Card className="border-0 shadow-sm h-100">
                         <Card.Header className="bg-white py-3">
                             <h5 className="mb-0 fw-bold text-success"><i className="fas fa-trophy me-2"></i> Highest Rated Items</h5>
                         </Card.Header>
                         <Card.Body className="p-0">
                             <Table hover responsive className="mb-0 align-middle">
                                 <tbody>
                                     {topProducts.map((product) => (
                                         <tr key={product._id}>
                                             <td className="ps-3" style={{ width: '60px' }}>
                                                 <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} className="rounded" />
                                             </td>
                                             <td>
                                                 <div className="fw-bold">{product.name}</div>
                                                 <div className="text-warning small">
                                                     {product.rating.toFixed(1)} <i className="fas fa-star"></i> <span className="text-muted">({product.numReviews})</span>
                                                 </div>
                                             </td>
                                         </tr>
                                     ))}
                                     {topProducts.length === 0 && <tr><td className="text-center p-3">No rated products yet</td></tr>}
                                 </tbody>
                             </Table>
                         </Card.Body>
                     </Card>
                 </Col>

                 <Col lg={8}>
                     <Card className="border-0 shadow-sm">
                         <Card.Header className="bg-white py-3">
                             <h5 className="mb-0 fw-bold">Recent Reviews</h5>
                         </Card.Header>
                         <Card.Body className="p-0">
                             <Table striped hover responsive className="mb-0 align-middle">
                                 <thead className="bg-light">
                                     <tr>
                                         <th className="ps-3 border-0">Product</th>
                                         <th className="border-0">User</th>
                                         <th className="border-0">Rating</th>
                                         <th className="border-0">Comment</th>
                                         <th className="border-0">Date</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {reviews.map((review, index) => (
                                         <tr key={index}>
                                             <td className="ps-3">
                                                 <Link to={`/product/${review.productId}`} className="text-decoration-none fw-bold text-dark">
                                                     {review.productName}
                                                 </Link>
                                             </td>
                                             <td>{review.userName}</td>
                                             <td>
                                                 <Badge bg={review.rating >= 4 ? 'success' : review.rating >= 3 ? 'warning' : 'danger'}>
                                                     {review.rating} <i className="fas fa-star"></i>
                                                 </Badge>
                                             </td>
                                             <td style={{ maxWidth: '300px' }} className="text-truncate" title={review.comment}>
                                                 {review.comment}
                                             </td>
                                             <td className="text-muted small">
                                                 {new Date(review.createdAt).toLocaleDateString()}
                                             </td>
                                         </tr>
                                     ))}
                                     {reviews.length === 0 && (
                                         <tr>
                                             <td colSpan="5" className="text-center py-4 text-muted">No reviews found</td>
                                         </tr>
                                     )}
                                 </tbody>
                             </Table>
                         </Card.Body>
                     </Card>
                 </Col>
             </Row>
        </Container>
    );
};

export default AdminReviewsPage;