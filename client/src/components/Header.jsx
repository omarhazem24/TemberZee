import { Navbar, Nav, Container, NavDropdown, Form, Button, Badge, ListGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/imagePath';

const Header = () => {
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  // TODO: Get real user state from context/redux
  const userInfo =  localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

  const updateCartCount = () => {
      const cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
      const count = cartItems.reduce((acc, item) => acc + item.qty, 0);
      setCartCount(count);
  };

  useEffect(() => {
      updateCartCount();
      window.addEventListener('cartUpdated', updateCartCount);
      window.addEventListener('storage', updateCartCount); // For cross-tab sync
      
      return () => {
          window.removeEventListener('cartUpdated', updateCartCount);
          window.removeEventListener('storage', updateCartCount);
      };
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (keyword.length > 1) {
        try {
          const { data } = await axios.get(`/api/products?keyword=${keyword}`);
          setSuggestions(data.slice(0, 5)); // Limit to 5 suggestions
          setShowSuggestions(true);
        } catch (error) {
          console.error(error);
        }
      } else {
        setShowSuggestions(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
        fetchSuggestions();
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [keyword]);

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
    toast.success('Logged Out Successfully');
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (keyword.trim()) {
      navigate(`/?keyword=${keyword}`);
    } else {
      navigate('/');
    }
  };

  const suggestionHandler = (id) => {
      navigate(`/product/${id}`);
      setKeyword('');
      setShowSuggestions(false);
  };

  return (
    <header>
      <Navbar expand='lg' collapseOnSelect className="navbar">
        <Container fluid>
          <Navbar.Brand as={Link} to='/' className="d-flex align-items-center">
             <img src="/images/z-logo.png" alt="TimberZee" style={{ height: '35px' }} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className="w-100 d-flex align-items-center">
              {/* Search Bar - Centered */}
              <div className="flex-grow-1 d-flex justify-content-center">
                  <Form className="d-flex position-relative" onSubmit={submitHandler} style={{ width: '500px', maxWidth: '100%' }}>
                    <Form.Control
                        type="text"
                        name="q"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Search Products"
                        className="rounded-pill w-100"
                        style={{ 
                          backgroundColor: 'rgba(230, 230, 230, 0.6)', 
                          color: 'black', 
                          borderColor: 'transparent',
                          paddingLeft: '20px',
                          paddingRight: '40px'
                        }}
                        autoComplete="off"
                    />
                    <Button type="submit" variant="light" className='rounded-circle position-absolute end-0 top-50 translate-middle-y me-1 shadow-none p-2' style={{ background: 'transparent', border: 'none', zIndex: 5 }}>
                        <i className="fas fa-search text-muted"></i>
                    </Button>
                    
                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <ListGroup className="position-absolute w-100 mt-1 shadow-sm start-0" style={{ zIndex: 1000, borderRadius: '15px', overflow: 'hidden', top: '100%' }}>
                            {suggestions.map((product) => (
                                <ListGroup.Item 
                                    key={product._id} 
                                    action 
                                    onClick={() => suggestionHandler(product._id)}
                                    className="d-flex align-items-center border-0"
                                >
                                    <img src={getImageUrl(product.image)} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px', borderRadius: '5px' }} />
                                    <div>
                                        <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{product.name}</div>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>EGP {product.price}</div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                  </Form>
              </div>

              {/* Right Side Nav */}
              <div className="d-flex align-items-center ms-auto">
                  {/* Wishlist Icon */}
                  {userInfo && userInfo.role !== 'admin' && (
                     <Nav.Link as={Link} to='/wishlist' className="position-relative me-3 text-secondary">
                        <i className="far fa-heart fa-lg"></i>
                     </Nav.Link>
                  )}

                  {!(userInfo && userInfo.role === 'admin') && (
                    <Nav.Link as={Link} to='/cart' className="position-relative me-3">
                      <i className="fas fa-shopping-cart fa-lg"></i>
                      {cartCount > 0 && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                            {cartCount}
                          </span>
                      )}
                    </Nav.Link>
                  )}
                  
                  {userInfo ? (
                    <NavDropdown title={userInfo.firstName.toUpperCase()} id='username' align="end">
                      {userInfo.role === 'admin' && (
                          <>
                            <NavDropdown.Item as={Link} to='/admin/orders'>
                              MANAGE ORDERS
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to='/admin/reviews'>
                              REVIEWS & RATINGS
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to='/admin/carousel'>
                              MANAGE SLIDES
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                          </>
                      )}

                      {userInfo.role !== 'admin' && (
                          <>
                            <NavDropdown.Item as={Link} to='/profile'>
                              MY PROFILE
                            </NavDropdown.Item>
                            <NavDropdown.Item as={Link} to='/orders'>
                              MY ORDERS
                            </NavDropdown.Item>
                          </>
                      )}
                      <NavDropdown.Item onClick={logoutHandler}>
                        LOGOUT
                      </NavDropdown.Item>
                    </NavDropdown>
                  ) : (
                    <Nav.Link as={Link} to='/login'>
                      LOGIN
                    </Nav.Link>
                  )}
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
