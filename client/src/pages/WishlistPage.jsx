import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

  useEffect(() => {
    if (!userInfo) {
       navigate('/login?redirect=wishlist');
       return;
    }
    
    const fetchWishlist = async () => {
       try {
         const config = {
            headers: { Authorization: `Bearer ${userInfo.token}` }
         };
         const { data } = await axios.get('/api/users/wishlist', config);
         setWishlistItems(data);
         setLoading(false);
       } catch (err) {
         setError(err.response && err.response.data.message ? err.response.data.message : err.message);
         setLoading(false);
       }
    };
    
    fetchWishlist();
  }, [navigate]);

  const removeFromWishlistHandler = async (id) => {
      try {
         const config = {
            headers: { Authorization: `Bearer ${userInfo.token}` }
         };
         await axios.delete(`/api/users/wishlist/${id}`, config);
         // Refresh list locally
         setWishlistItems(wishlistItems.filter(item => item._id !== id));
         toast.success('Removed from Wishlist');
      } catch (err) {
         toast.error(err.message);
      }
  };

  const addToCartHandler = (product) => {
       // Similar to logic in other pages
       let cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
       const existItem = cartItems.find((x) => x.product === product._id);
       
       if (existItem) {
         cartItems = cartItems.map((x) => x.product === existItem.product ? { ...existItem, qty: existItem.qty + 1 } : x);
       } else {
         cartItems.push({ ...product, product: product._id, qty: 1 });
       }
       
       localStorage.setItem('cartItems', JSON.stringify(cartItems));
       window.dispatchEvent(new Event('cartUpdated'));
       toast.success('Moved to Cart');
       // navigate('/cart'); // Stay here to move more items?
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4">My Wishlist</h2>
      {loading ? (
          <div>Loading...</div>
      ) : error ? (
          <Alert variant='danger'>{error}</Alert>
      ) : wishlistItems.length === 0 ? (
          <Alert variant='info'>Your wishlist is empty. <Link to="/">Go shopping</Link></Alert>
      ) : (
          <Row>
              {wishlistItems.map((product) => (
                  <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="mb-3">
                      <Card className="h-100 shadow-sm border-0 position-relative">
                          {/* Remove Button */}
                          <Button 
                             variant="light" 
                             className="position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
                             style={{ zIndex: 10, width: '35px', height: '35px', padding: 0 }}
                             onClick={() => removeFromWishlistHandler(product._id)}
                          >
                             <i className="fas fa-times text-danger"></i>
                          </Button>

                          <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
                              <Card.Img variant="top" src={product.image} style={{ height: '200px', objectFit: 'cover' }} />
                              <Card.Body className="d-flex flex-column">
                                  <Card.Title as="div" className="mb-2"><strong>{product.name}</strong></Card.Title>
                                  <Card.Text as="h5" className="mb-3">EGP {product.price}</Card.Text>
                              </Card.Body>
                          </Link>
                          <Card.Footer className="bg-white border-0">
                               <Button 
                                  className="w-100 rounded-pill" 
                                  variant="dark"
                                  onClick={() => addToCartHandler(product)}
                                  disabled={product.countInStock === 0}
                               >
                                  {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                               </Button>
                          </Card.Footer>
                      </Card>
                  </Col>
              ))}
          </Row>
      )}
    </Container>
  );
};

export default WishlistPage;
