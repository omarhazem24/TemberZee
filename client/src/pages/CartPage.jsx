import { useState, useEffect } from 'react';
import { Row, Col, Image, ListGroup, Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  
  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
  const navigate = useNavigate();

  useEffect(() => {
    const items = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
    setCartItems(items);
  }, []); 

  const removeFromCartHandler = (itemToRemove) => {
      const newItems = cartItems.filter(x => 
          !(x.product === itemToRemove.product && x.size === itemToRemove.size && x.color === itemToRemove.color)
      );
      setCartItems(newItems);
      localStorage.setItem('cartItems', JSON.stringify(newItems));
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Item removed');
  };

  const updateQtyHandler = (itemToUpdate, newQty) => {
      if (newQty < 1) {
          removeFromCartHandler(itemToUpdate);
      } else {
          const newItems = cartItems.map(x => 
              (x.product === itemToUpdate.product && x.size === itemToUpdate.size && x.color === itemToUpdate.color)
              ? { ...x, qty: newQty } 
              : x
          );
          setCartItems(newItems);
          localStorage.setItem('cartItems', JSON.stringify(newItems));
          window.dispatchEvent(new Event('cartUpdated'));
      }
  };

  const checkoutHandler = () => {
      if(!userInfo) {
          navigate('/login');
          return;
      }
      navigate('/payment');
  };

  // ... rest of component


  const calculateShipping = (address) => {
    if (!address || !address.state) return 0;
    
    const gov = address.state.trim().toLowerCase();
    const zone90 = ['Alexandria', 'Beheira', 'Kafr El Sheikh', 'Kafr El-Sheikh', 'Gharbia', 'Monufia', 'Suez', 'Qalyubia', 'Dakahlia', 'Sharqia', 'Damietta', 'Port Said', 'Ismailia', 'Matruh'];
    const zone70 = ['Cairo', 'Giza'];

    if (zone70.some(z => gov === z.toLowerCase())) return 70;
    if (zone90.some(z => gov === z.toLowerCase())) return 90;
    return 120;
  };

  const total = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);
  const shippingPrice = (userInfo && cartItems.length > 0) ? calculateShipping(userInfo.address) : 0;
  const finalTotal = (Number(total) + shippingPrice).toFixed(2);

  return (
    <div className="pt-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 'bold' }}>YOUR SHOPPING BAG</h1>
          <p className="text-muted">You have {cartItems.reduce((acc, item) => acc + item.qty, 0)} items in your cart</p>
        </Col>
      </Row>

      <Row>
        <Col lg={8}>
          {cartItems.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-3">
              <i className="fas fa-shopping-bag fa-4x mb-4 text-muted"></i>
              <h3 style={{ fontFamily: 'var(--font-heading)' }}>YOUR CART IS EMPTY</h3>
              <p className="text-muted mb-4">Looks like you haven't added any streetwear yet.</p>
              <Link to='/' className='btn btn-black px-5 py-3 rounded-0'>
                  CONTINUE SHOPPING
              </Link>
            </div>
          ) : (
            <div className="cart-items">
              {/* Header Row for Items (Desktop) */}
              <Row className="d-none d-md-flex border-bottom pb-3 mb-3 text-uppercase text-muted" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>
                <Col md={6}>Product</Col>
                <Col md={2} className="text-center">Price</Col>
                <Col md={2} className="text-center">Quantity</Col>
                <Col md={2} className="text-end">Total</Col>
              </Row>

              {cartItems.map((item) => (
                <Row key={`${item.product}-${item.size}-${item.color}`} className="mb-4 pb-4 border-bottom align-items-center">
                  <Col md={6} className="d-flex align-items-center">
                    <Link to={`/product/${item.product}`}>
                        <div style={{ width: '100px', height: '100px', overflow: 'hidden', backgroundColor: '#f9f9f9' }} className="me-3">
                            <Image src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                    </Link>
                    <div>
                      <Link to={`/product/${item.product}`} className="text-decoration-none text-dark">
                        <h5 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>{item.name}</h5>
                      </Link>
                       {/* Variant Details */}
                       <div className="text-muted small mt-1">
                                {item.size && <span className="me-3">Size: <span className="text-dark fw-semibold">{item.size}</span></span>}
                                {item.color && <span>Color: <span className="text-dark fw-semibold">{item.color}</span></span>}
                       </div>

                      <button 
                        onClick={() => removeFromCartHandler(item)}
                        className="btn btn-link p-0 text-muted text-decoration-none mt-2"
                        style={{ fontSize: '0.85rem' }}
                      >
                        <i className="fas fa-trash-alt me-1"></i> Remove
                      </button>
                    </div>
                  </Col>
                  
                  <Col md={2} className="d-none d-md-block text-center">
                    <span className="fw-bold">EGP {item.price}</span>
                  </Col>

                  <Col md={2} xs={6} className="text-center my-3 my-md-0">
                     <div className="d-flex align-items-center justify-content-center border d-inline-block">
                        <Button 
                            variant="light" 
                            size="sm" 
                            className="rounded-0 px-2 py-1 bg-white border-0"
                            onClick={() => updateQtyHandler(item, item.qty - 1)}
                        >
                            <i className="fas fa-minus" style={{ fontSize: '0.7rem' }}></i>
                        </Button>
                        <span className="fw-bold mx-3">{item.qty}</span>
                         <Button 
                            variant="light" 
                            size="sm" 
                            className="rounded-0 px-2 py-1 bg-white border-0"
                            onClick={() => updateQtyHandler(item, item.qty + 1)}
                        >
                            <i className="fas fa-plus" style={{ fontSize: '0.7rem' }}></i>
                        </Button>
                     </div>
                  </Col>

                  <Col md={2} xs={6} className="text-end">
                    <span className="fw-bold fs-5">EGP {(item.price * item.qty).toFixed(2)}</span>
                  </Col>
                </Row>
              ))}
            </div>
          )}
        </Col>

        <Col lg={4}>
          <Card className="border-0 bg-light p-4 rounded-3 sticky-top" style={{ top: '20px' }}>
            <h3 className="mb-4" style={{ fontFamily: 'var(--font-heading)' }}>ORDER SUMMARY</h3>
            
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Subtotal</span>
              <span className="fw-bold">EGP {total}</span>
            </div>
            
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Shipping</span>
              <span className="fw-bold">
                 {userInfo ? `EGP ${shippingPrice}` : <span className="small fst-italic">Login to calculate</span>}
              </span>
            </div>
            
            <hr />
            
            <div className="d-flex justify-content-between mb-4 align-items-center">
              <span className="fs-5 fw-bold">TOTAL</span>
              <span className="fs-3 fw-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  EGP {finalTotal}
              </span>
            </div>

            <Button
              type='button'
              className='btn-black w-100 py-3 rounded-0 fs-5'
              disabled={cartItems.length === 0}
              onClick={checkoutHandler}
            >
              CHECKOUT NOW
            </Button>
            
            {!userInfo && (
                <p className="mt-3 text-center text-muted small">
                    * Shipping Calculated at Checkout
                </p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartPage;
