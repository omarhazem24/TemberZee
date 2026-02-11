import { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Toast, ToastContainer, Carousel, Image, Container } from 'react-bootstrap';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmationToast from '../components/ConfirmationToast';
import { getImageUrl } from '../utils/imagePath';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [slides, setSlides] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const userInfo =  localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
  const location = useLocation();
  const navigate = useNavigate();

  const fetchSlides = async () => {
       try {
           const { data } = await axios.get('/api/slides');
           setSlides(data);
       } catch (err) {
           console.error(err);
       }
  };

  const fetchProducts = async () => {
    const keyword = new URLSearchParams(location.search).get('keyword') || '';
    const { data } = await axios.get(`/api/products?keyword=${keyword}`);
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchSlides();
  }, [location.search]);

  const deleteHandler = (id) => {
    toast(<ConfirmationToast 
        message="Are you sure you want to delete this product?"
        onConfirm={async () => {
            try {
                const config = {
                   headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                   }
                }
                await axios.delete(`/api/products/${id}`, config);
                fetchProducts();
                toast.success('Product deleted successfully');
            } catch (error) {
                toast.error(error.message);
            }
        }}
    />, { 
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false
    });
  };
  
  const addToCartHandler = (product) => {
       // Simple cart logic using localStorage
       let cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
       const existItem = cartItems.find((x) => x.product === product._id);
       
       if (existItem) {
         cartItems = cartItems.map((x) => x.product === existItem.product ? { ...existItem, qty: existItem.qty + 1 } : x);
       } else {
         cartItems.push({ ...product, product: product._id, qty: 1 });
       }
       
       localStorage.setItem('cartItems', JSON.stringify(cartItems));
       window.dispatchEvent(new Event('cartUpdated'));
       setShowToast(true);
  };

  // Admin Dashboard View
  if (userInfo && userInfo.role === 'admin') {
      return (
        <div className="admin-dashboard text-center mt-5">
            <h1 className="mb-5">ADMIN DASHBOARD</h1>
            <Row className="justify-content-center">
                <Col md={4} className="mb-4">
                    <Link to="/admin/product/create" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-5">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>+</div>
                                <Card.Title>CREATE ITEM</Card.Title>
                                <Card.Text>Add a new product to the store</Card.Text>
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>
                <Col md={4} className="mb-4">
                    <Link to="/admin/promotions" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-5">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>%</div>
                                <Card.Title>PROMOTIONS</Card.Title>
                                <Card.Text>Manage promo codes & discounts</Card.Text>
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>
                <Col md={4} className="mb-4">
                    <Link to="/admin/revenue" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-5">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>EGP</div>
                                <Card.Title>TOTAL REVENUE</Card.Title>
                                <Card.Text>View sales analytics</Card.Text>
                            </Card.Body>
                        </Card>
                    </Link>
                </Col>
            </Row>

            <h3 className="mt-5 text-start" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '2px' }}>CURRENT INVENTORY</h3>
             <Row className="mt-4 text-start">
                    {products.map((product) => (
                    <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                        <Card 
                            className="h-100 border-0 shadow product-card-hover" 
                            style={{ overflow: 'hidden', cursor: 'pointer' }}
                            onClick={() => navigate(`/product/${product._id}`)}
                        >
                            <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: '100%', backgroundColor: '#f8f9fa' }}>
                                <Card.Img 
                                    variant="top" 
                                    src={getImageUrl(product.image)} 
                                    onError={(e) => {
                                      e.target.onerror = null; 
                                      e.target.src = "https://placehold.co/600x600?text=No+Image";
                                    }}
                                    style={{ 
                                        position: 'absolute', 
                                        top: 0, 
                                        left: 0, 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover'
                                    }} 
                                />
                                <div 
                                    className="position-absolute top-0 end-0 p-2"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteHandler(product._id); }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '35px', height: '35px' }}>
                                        <i className="fas fa-trash text-danger"></i>
                                    </div>
                                </div>
                            </div>
                            <Card.Body className="d-flex flex-column">
                                <Card.Title as="h5" className="mb-1 text-uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
                                    {product.name}
                                </Card.Title>
                                <Card.Text className="text-muted fw-bold mb-3">
                                    EGP {product.price}
                                </Card.Text>
                                
                                <div className="mt-auto">
                                     <Button 
                                        variant="dark" 
                                        className="btn-black btn-sm w-100 rounded-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCartHandler(product);
                                        }}
                                     >
                                        <i className="fas fa-shopping-bag me-2"></i>ADD TO CART
                                     </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    ))}
            </Row>
        </div>
      );
  }

  return (
    <>
      {slides.length > 0 ? (
          <div className="position-relative mb-5">
              <Carousel className="custom-carousel" prevIcon={<span className="carousel-control-prev-icon" aria-hidden="true" />} nextIcon={<span className="carousel-control-next-icon" aria-hidden="true" />}>
                  {slides.map(slide => (
                      <Carousel.Item key={slide._id}>
                          <div className="d-flex align-items-center justify-content-center bg-light" style={{ height: '500px', width: '100%', overflow: 'hidden' }}>
                                <Image
                                  className="d-block w-100 h-100"
                                  src={getImageUrl(slide.image)}
                                  alt={slide.title}
                                  style={{ objectFit: 'cover' }}
                                />
                          </div>
                      </Carousel.Item>
                  ))}
              </Carousel>
              
              {/* Overlay Content */}
              <div className="position-absolute top-50 start-50 translate-middle text-center text-white p-4 rounded" style={{ zIndex: 10, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <h1 className="display-3 fw-bold mb-3" style={{ letterSpacing: '3px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>NEW ARRIVALS</h1>
                    <p className="lead mb-4" style={{ letterSpacing: '1px', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>SUMMER COLLECTION 2026</p>
                    <Link to="/shop">
                        <Button variant="light" size="lg" className='px-5 py-3 rounded-0 fw-bold' style={{ letterSpacing: '2px' }}>SHOP NOW</Button>
                    </Link>
              </div>
          </div>
      ) : (
          <div className="hero-banner mb-5 d-flex align-items-center justify-content-center text-center text-black" style={{ height: '400px', backgroundColor: '#f5f5f5' }}>
            <Container>
                <h1 className="display-3 fw-bold mb-3" style={{ letterSpacing: '3px' }}>NEW ARRIVALS</h1>
                <p className="lead text-muted mb-4" style={{ letterSpacing: '1px' }}>SUMMER COLLECTION 2026</p>
                <Link to="/shop">
                     <Button variant="dark" size="lg" className='px-5 py-3 rounded-0' style={{ letterSpacing: '2px' }}>SHOP NOW</Button>
                </Link>
            </Container>
          </div>
      )}

      <Row className='align-items-center mb-4 mt-5'>
        <Col>
          <h2 style={{ fontFamily: 'var(--font-heading)', letterSpacing: '2px' }}>LATEST DROPS</h2>
        </Col>
        {userInfo && userInfo.role === 'admin' && (
          <Col className='text-end'>
            <Button className='btn-black' onClick={createProductHandler}>
              + CREATE PRODUCT
            </Button>
          </Col>
        )}
      </Row>
      <Row>
        {products.map((product) => (
          <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
            <Card 
                className="h-100 border-0 shadow product-card-hover" 
                style={{ overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => navigate(`/product/${product._id}`)}
            >
                <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: '100%', backgroundColor: '#f8f9fa' }}>
                    <Card.Img 
                        variant="top" 
                        src={getImageUrl(product.image)} 
                        onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = "https://placehold.co/600x600?text=No+Image";
                        }}
                        style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                        }} 
                    />
                </div>
                <Card.Body className="d-flex flex-column">
                    <Card.Title as="h5" className="mb-1 text-uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
                        {product.name}
                    </Card.Title>
                    <Card.Text className="text-muted fw-bold mb-3">
                        {product.isSaleActive && product.saleSold < product.saleLimit ? (
                            <>
                                <span className="text-decoration-line-through me-2 text-secondary">EGP {product.price}</span>
                                <span className="text-danger">EGP {product.salePrice}</span>
                            </>
                        ) : (
                            `EGP ${product.price}`
                        )}
                    </Card.Text>
                    
                    <div className="mt-auto">
                            <Button 
                            variant="dark" 
                            className="btn-black btn-sm w-100 rounded-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                const priceToUse = product.isSaleActive && product.saleSold < product.saleLimit ? product.salePrice : product.price;
                                addToCartHandler({ ...product, price: priceToUse });
                            }}
                            >
                            <i className="fas fa-shopping-bag me-2"></i>ADD TO CART
                            </Button>
                    </div>
                </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <ToastContainer className="p-3" position="top-end" style={{ zIndex: 9999, position: 'fixed' }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="dark">
          <Toast.Header closeButton={false} className="d-flex justify-content-between">
            <img
              src="/images/z-logo.png"
              className="rounded me-2"
              alt=""
              style={{ height: '20px' }}
            />
            <strong className="me-auto text-dark">TimberZee</strong>
            <button type="button" className="btn-close" onClick={() => setShowToast(false)}></button>
          </Toast.Header>
          <Toast.Body className="text-white">
            Added to cart successfully!
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default HomePage;
