import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Card, Button, Form, Container, Badge, Alert, Modal, Table } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getImageUrl } from '../utils/imagePath';

const ProductPage = () => {
  const [product, setProduct] = useState({});
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [inWishlist, setInWishlist] = useState(false);
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);
  
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();
  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await axios.get(`/api/products/${id}`);
      setProduct(data);
      if (data.image) setActiveImage(data.image);
      if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0]);
      if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0]);
    };

    fetchProduct();
  }, [id, loadingReview]); // Re-fetch on review submit

  // ... (wishlist effect)

  const submitReviewHandler = async (e) => {
      e.preventDefault();
      if (!rating) {
          toast.error('Please select a rating');
          return;
      }
      setLoadingReview(true);
      try {
          const config = {
              headers: {
                  Authorization: `Bearer ${userInfo.token}`,
              },
          };
          await axios.post(`/api/products/${id}/reviews`, { rating, comment }, config);
          toast.success('Review Submitted');
          setRating(0);
          setComment('');
          setLoadingReview(false);
      } catch (error) {
          toast.error(error.response && error.response.data.message ? error.response.data.message : error.message);
          setLoadingReview(false);
      }
  };

  useEffect(() => {
    const checkWishlistStatus = async () => {
        if (userInfo) {
            try {
               const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
               const { data } = await axios.get(`/api/users/wishlist/${id}`, config);
               setInWishlist(data.exists);
            } catch (error) {
               console.error(error);
            }
        }
    };
    checkWishlistStatus();
  }, [id]);

  const addToWishlistHandler = async () => {
      if (!userInfo) {
          navigate('/login');
          return;
      }
      try {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          if (inWishlist) {
              await axios.delete(`/api/users/wishlist/${id}`, config);
              setInWishlist(false);
              toast.success('Removed from Wishlist');
          } else {
              await axios.post(`/api/users/wishlist`, { productId: id }, config);
              setInWishlist(true);
              toast.success('Added to Wishlist');
          }
      } catch (error) {
          toast.error('Error updating wishlist');
      }
  };

  const addToCartHandler = () => {
       if (!userInfo) {
           navigate('/login');
           return;
       }
       
       let cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
       const existItem = cartItems.find((x) => 
           x.product === product._id && 
           x.size === selectedSize && 
           x.color === selectedColor
       );
       
       if (existItem) {
         cartItems = cartItems.map((x) => 
            (x.product === existItem.product && x.size === existItem.size && x.color === existItem.color)
            ? { ...existItem, qty: existItem.qty + qty } 
            : x
         );
       } else {
         cartItems.push({ 
             ...product, 
             price: product.isSaleActive && product.saleSold < product.saleLimit ? product.salePrice : product.price,
             product: product._id, 
             qty: qty, 
             size: selectedSize, 
             color: selectedColor,
             image: activeImage || product.image 
         });
       }
       
       localStorage.setItem('cartItems', JSON.stringify(cartItems));
       window.dispatchEvent(new Event('cartUpdated')); 
       toast.success('Added to Cart!');
       // navigate('/cart'); // Stay on page or navigate? Usually users like staying unless it's a "Buy Now". Simple add to cart.
  };

  return (
    <Container className="mt-4" style={{ maxWidth: '1400px' }}>
      <Button variant="link" className='text-dark mb-2 p-0 text-decoration-none' onClick={() => navigate('/')}>
        <i className="fas fa-chevron-left fa-lg"></i>
      </Button>
      
      <Row>
        {/* Thumbnails Column */}
        <Col md={1} className="d-none d-md-flex flex-column gap-2">
            {product.images && product.images.length > 0 ? (
                product.images.map((img, index) => (
                    <div 
                        key={index} 
                        className="border rounded p-1" 
                        style={{ 
                            cursor: 'pointer', 
                            borderColor: activeImage === img ? '#000' : '#ddd',
                            borderWidth: activeImage === img ? '2px' : '1px'
                        }}
                        onMouseEnter={() => setActiveImage(img)}
                        onClick={() => setActiveImage(img)}
                    >
                         <Image 
                            src={getImageUrl(img)} 
                            fluid 
                            onError={(e) => { e.target.src = "https://placehold.co/100" }} 
                        />
                    </div>
                ))
            ) : (
                // Fallback main image thumbnail
                product.image && (
                     <div className="border rounded p-1 border-dark" style={{ cursor: 'pointer' }}>
                         <Image src={getImageUrl(product.image)} fluid />
                    </div>
                )
            )}
        </Col>

        {/* Main Image Column */}
        <Col md={5}>
          <div className="position-relative">
             <Image 
                src={getImageUrl(activeImage || product.image)} 
                alt={product.name} 
                fluid 
                className="w-100" 
                style={{ minHeight: '400px', objectFit: 'contain', backgroundColor: '#fff' }}
             />
             <div className="position-absolute top-0 end-0 p-3">
                <Button variant="light" className="rounded-circle shadow-sm border">
                    <i className="fas fa-share-alt"></i>
                </Button>
             </div>
          </div>
        </Col>
        
        {/* Product Details Column */}
        <Col md={6} lg={5} className="ps-md-5">
            <div className="border-bottom pb-3 mb-3">
                <h1 className="mb-1" style={{ fontSize: '24px', fontWeight: '500', fontFamily: 'var(--font-body)' }}>{product.name}</h1>
                <div className="mb-2">
                     <span className="text-warning me-2">
                         {[...Array(5)].map((_, i) => (
                             <i key={i} className={product.rating >= i + 1 ? 'fas fa-star' : product.rating >= i + 0.5 ? 'fas fa-star-half-alt' : 'far fa-star'}></i>
                         ))}
                     </span>
                     <span className="text-muted small">({product.numReviews} reviews)</span>
                </div>
                {userInfo && userInfo.role === 'admin' && (
                    <Button 
                        variant="outline-dark" 
                        size="sm" 
                        className="mt-2" 
                        onClick={() => navigate(`/admin/product/${product._id}/edit`)}
                    >
                        <i className="fas fa-edit me-1"></i> Edit Product
                    </Button>
                )}
            </div>

            <div className="mb-3">
                <div className="d-flex align-items-end">
                    {product.isSaleActive && product.saleSold < product.saleLimit ? (
                        <>
                             <div className="me-3 text-decoration-line-through text-muted d-flex align-items-start">
                                <span style={{ fontSize: '14px', position: 'relative', top: '5px' }}>EGP</span>
                                <span style={{ fontSize: '24px', fontWeight: '500', lineHeight: '1' }}>{product.price}</span>
                             </div>
                             <div className="d-flex align-items-start text-danger">
                                <span style={{ fontSize: '14px', position: 'relative', top: '5px' }}>EGP</span>
                                <span style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: '1' }}>{product.salePrice}</span>
                                <span style={{ fontSize: '14px', position: 'relative', top: '5px' }}>00</span>
                             </div>
                             <Badge bg="danger" className="ms-2 mb-2">SALE</Badge>
                        </>
                    ) : (
                        <div className="d-flex align-items-start">
                            <span style={{ fontSize: '14px', position: 'relative', top: '5px' }}>EGP</span>
                            <span style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: '1' }}>{product.price}</span>
                            <span style={{ fontSize: '14px', position: 'relative', top: '5px' }}>00</span>
                        </div>
                    )}
                </div>
                <div className="text-muted small mt-1">All prices include VAT.</div>
            </div>

            <div className="mb-4" style={{ maxWidth: '400px' }}>
                
                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                    <div className="mb-3">
                        <span className="fw-bold d-block mb-2">Color: <span className="fw-normal">{selectedColor}</span></span>
                        <div className="d-flex gap-2 flex-wrap">
                            {product.colors.map((c, idx) => (
                                <Button 
                                    key={idx}
                                    variant={selectedColor === c ? 'dark' : 'outline-dark'}
                                    className="rounded-pill btn-sm px-3"
                                    onClick={() => setSelectedColor(c)}
                                >
                                    {c}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sizes */}
                 {product.sizes && product.sizes.length > 0 && (
                    <Form.Group className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                            <Form.Label className="fw-bold fs-6 mb-0">Size: <span className="fw-normal">{selectedSize}</span></Form.Label>
                            <Button variant="link" size="sm" className="text-muted text-decoration-underline p-0" onClick={() => setShowSizeGuide(true)}>
                                <i className="fas fa-ruler-horizontal me-1"></i> Size Guide
                            </Button>
                        </div>
                        <Form.Select 
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            className="shadow-sm border-secondary"
                            style={{ backgroundColor: '#f0f2f2' }}
                        >
                            {product.sizes.map((s, idx) => (
                                <option key={idx} value={s}>{s}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                )}


                <Form.Group className="mb-3">
                     <Form.Label className="fw-bold fs-6">Quantity:</Form.Label>
                     <Form.Select 
                        value={qty} 
                        onChange={(e) => setQty(Number(e.target.value))}
                        className="shadow-sm border-secondary w-50"
                         style={{ backgroundColor: '#f0f2f2' }}
                     >
                        {[...Array(10).keys()].map(x => (
                            <option key={x + 1} value={x + 1}>
                                {x + 1}
                            </option>
                        ))}
                     </Form.Select>
                </Form.Group>

                {product.countInStock > 0 ? (
                    <div className="d-grid gap-2 d-md-flex">
                        {userInfo && userInfo.role === 'admin' ? (
                             <Button 
                                className="btn-black rounded-pill py-2 flex-grow-1" 
                                style={{ backgroundColor: '#6c757d', borderColor: '#6c757d', color: 'white', cursor: 'not-allowed' }}
                                disabled
                             >
                                Admin View Only
                             </Button>
                        ) : (
                             <Button 
                                className="btn-black rounded-pill py-2 flex-grow-1" 
                                style={{ backgroundColor: 'black', borderColor: 'black', color: 'white' }}
                                onClick={addToCartHandler}
                             >
                                Add to Cart
                            </Button>
                        )}
                        
                        {!(userInfo && userInfo.role === 'admin') && (
                            <Button
                                variant="outline-secondary"
                                className="rounded-circle py-2 shadow-none d-flex align-items-center justify-content-center"
                                style={{ width: '45px', height: '45px' }}
                                onClick={addToWishlistHandler}
                            >
                                <i className={`${inWishlist ? 'fas' : 'far'} fa-heart fa-lg text-danger`}></i>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="text-danger fw-bold fs-4">Currently Unavailable</div>
                )}
            </div>

            <hr />
            
            <div className="mt-4">
                <h4 className="mb-3">About this item</h4>
                <p style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    {product.description || "Premium quality shoes designed for comfort and style."}
                </p>
            </div>
            
        </Col>
      </Row>

      <Row className="mt-5">
        <Col md={6}>
            <h2 className="mb-4">Reviews</h2>
            {product.reviews && product.reviews.length === 0 && <Alert variant="info">No Reviews</Alert>}
            <ListGroup variant="flush">
                {product.reviews && product.reviews.map((review) => (
                    <ListGroup.Item key={review._id} className="bg-light mb-3 rounded shadow-sm border-0">
                        <strong>{review.name}</strong>
                        <div className="text-warning mb-2">
                             {[...Array(5)].map((_, i) => (
                                 <i key={i} className={review.rating >= i + 1 ? 'fas fa-star' : review.rating >= i + 0.5 ? 'fas fa-star-half-alt' : 'far fa-star'}></i>
                             ))}
                        </div>
                        <p>{review.createdAt.substring(0, 10)}</p>
                        <p>{review.comment}</p>
                    </ListGroup.Item>
                ))}
                
                <ListGroup.Item className="border-0 px-0">
                    <h2 className="mb-3">Write a Customer Review</h2>
                    {userInfo ? (
                        userInfo.role !== 'admin' ? (
                            <Form onSubmit={submitReviewHandler}>
                                <Form.Group controlId="rating" className="mb-3">
                                    <Form.Label>Rating</Form.Label>
                                    <Form.Control as="select" value={rating} onChange={(e) => setRating(e.target.value)}>
                                        <option value="">Select...</option>
                                        <option value="1">1 - Poor</option>
                                        <option value="2">2 - Fair</option>
                                        <option value="3">3 - Good</option>
                                        <option value="4">4 - Very Good</option>
                                        <option value="5">5 - Excellent</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="comment" className="mb-3">
                                    <Form.Label>Comment</Form.Label>
                                    <Form.Control as="textarea" row="3" value={comment} onChange={(e) => setComment(e.target.value)}></Form.Control>
                                </Form.Group>
                                <Button disabled={loadingReview} type="submit" variant="primary" className="btn-black">
                                    Submit
                                </Button>
                            </Form>
                        ) : (
                            <Alert variant="secondary">Admins cannot rate products.</Alert>
                        )
                    ) : (
                        <Alert variant="info">Please <Button variant="link" className="p-0" onClick={() => navigate('/login')}>sign in</Button> to write a review</Alert>
                    )}
                </ListGroup.Item>
            </ListGroup>
        </Col>
      </Row>

      {/* Size Guide Modal */}
      <Modal show={showSizeGuide} onHide={() => setShowSizeGuide(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Size Guide</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p className="mb-4">Use this chart to find your perfect fit.</p>
          <Table striped bordered hover responsive>
            <thead>
              <tr className="bg-dark text-white">
                <th>Size (EU)</th>
                <th>US Men</th>
                <th>US Women</th>
                <th>UK</th>
                <th>Foot Length (cm)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>36</td><td>4</td><td>5.5</td><td>3</td><td>23.0</td></tr>
              <tr><td>37</td><td>4.5</td><td>6</td><td>3.5</td><td>23.5</td></tr>
              <tr><td>38</td><td>5</td><td>6.5</td><td>4</td><td>24.0</td></tr>
              <tr><td>39</td><td>6</td><td>7.5</td><td>5</td><td>24.5</td></tr>
              <tr><td>40</td><td>7</td><td>8.5</td><td>6</td><td>25.0</td></tr>
              <tr><td>41</td><td>8</td><td>9.5</td><td>7</td><td>26.0</td></tr>
              <tr><td>42</td><td>8.5</td><td>10</td><td>7.5</td><td>26.5</td></tr>
              <tr><td>43</td><td>9.5</td><td>11</td><td>8.5</td><td>27.5</td></tr>
              <tr><td>44</td><td>10</td><td>11.5</td><td>9</td><td>28.0</td></tr>
              <tr><td>45</td><td>11</td><td>12.5</td><td>10</td><td>29.0</td></tr>
            </tbody>
          </Table>
          <div className="mt-3 text-muted text-start">
              <small>
                  <strong>How to measure:</strong><br/>
                  1. Place your foot on a piece of paper.<br/>
                  2. Mark the tip of your toe and the back of your heel.<br/>
                  3. Measure the distance between the marks.
              </small>
          </div>
        </Modal.Body>
      </Modal>

    </Container>
  );
};

export default ProductPage;
