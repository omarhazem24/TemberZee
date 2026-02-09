import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Accordion, Badge } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [sortOption, setSortOption] = useState('newest');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  
  // Derived lists
  const [availableColors, setAvailableColors] = useState(['All']);
  const [availableSizes, setAvailableSizes] = useState(['All']);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/products'); // Fetch all
        setProducts(data);
        setFilteredProducts(data);
        
        // Extract unique options
        const colors = new Set(['All']);
        const sizes = new Set(['All']);
        
        data.forEach(p => {
            if(p.colors) p.colors.forEach(c => colors.add(c));
            if(p.sizes) p.sizes.forEach(s => sizes.add(s));
        });
        
        setAvailableColors(Array.from(colors));
        setAvailableSizes(Array.from(sizes));
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
      let result = [...products];

      // 1. Filter by Color
      if (selectedColor !== 'All') {
          result = result.filter(p => p.colors && p.colors.includes(selectedColor));
      }

      // 2. Filter by Size
      if (selectedSize !== 'All') {
          result = result.filter(p => p.sizes && p.sizes.includes(selectedSize));
      }

      // 3. Sort
      if (sortOption === 'low-high') {
          result.sort((a, b) => a.price - b.price);
      } else if (sortOption === 'high-low') {
          result.sort((a, b) => b.price - a.price);
      } else if (sortOption === 'newest') {
          // Assuming createdAt or _id (Mongodb IDs have timestamps)
          // Simple string comparison for ID works for "roughly" created time if no date field
          result.sort((a, b) => b._id.localeCompare(a._id));
      }

      setFilteredProducts(result);
  }, [products, sortOption, selectedColor, selectedSize]);

  // Helper for cart (simplified version of Home/Product page logic)
  const addToCartHandler = (product) => {
       let cartItems = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')) : [];
       const existItem = cartItems.find((x) => x.product === product._id);
       
       if (existItem) {
         cartItems = cartItems.map((x) => x.product === existItem.product ? { ...existItem, qty: existItem.qty + 1 } : x);
       } else {
         cartItems.push({ ...product, product: product._id, qty: 1 });
       }
       
       localStorage.setItem('cartItems', JSON.stringify(cartItems));
       window.dispatchEvent(new Event('cartUpdated'));
       navigate('/cart');
  };

  return (
    <Container className="mt-5">
      <h2 className="mb-4 text-center" style={{ fontFamily: 'var(--font-heading)', letterSpacing: '2px' }}>SHOP ALL</h2>
      
      <Row>
        {/* Sidebar Filters */}
        <Col md={3} className="mb-4">
            <div className="p-3 bg-light rounded shadow-sm sticky-top" style={{ top: '20px', zIndex: 1 }}>
                <h5 className="mb-3">Filters</h5>
                
                {/* Sort */}
                <Form.Group className="mb-4">
                    <Form.Label className="fw-bold">Sort By</Form.Label>
                    <Form.Select 
                        value={sortOption} 
                        onChange={(e) => setSortOption(e.target.value)}
                        className="shadow-sm border-0"
                    >
                        <option value="newest">Newest Arrivals</option>
                        <option value="low-high">Price: Low to High</option>
                        <option value="high-low">Price: High to Low</option>
                    </Form.Select>
                </Form.Group>

                {/* Colors */}
                <div className="mb-4">
                    <label className="fw-bold mb-2 d-block">Color</label>
                    <div className="d-flex flex-wrap gap-2">
                        {availableColors.map(c => (
                            <Badge 
                                key={c}
                                bg={selectedColor === c ? 'dark' : 'secondary'}
                                className={`p-2 cursor-pointer ${selectedColor !== c ? 'opacity-50' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedColor(c)}
                            >
                                {c}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Sizes */}
                <div className="mb-4">
                    <label className="fw-bold mb-2 d-block">Size</label>
                    <div className="d-flex flex-wrap gap-2">
                        {availableSizes.map(s => (
                            <Badge 
                                key={s}
                                bg={selectedSize === s ? 'dark' : 'secondary'}
                                className={`p-2 cursor-pointer ${selectedSize !== s ? 'opacity-50' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => setSelectedSize(s)}
                            >
                                {s}
                            </Badge>
                        ))}
                    </div>
                </div>
                
                {/* Reset Filters */}
                <Button 
                    variant="outline-dark" 
                    className="w-100 mt-2"
                    onClick={() => {
                        setSelectedColor('All');
                        setSelectedSize('All');
                        setSortOption('newest');
                    }}
                >
                    Reset Filters
                </Button>
            </div>
        </Col>

        {/* Product Grid */}
        <Col md={9}>
            <Row>
                {loading ? (
                    <div className="text-center w-100 py-5">Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center w-100 py-5">No products found matching filters.</div>
                ) : (
                    filteredProducts.map((product) => (
                        <Col key={product._id} sm={12} md={6} lg={4} className="mb-4">
                            <Card 
                                className="h-100 border-0 shadow-sm product-card-hover"
                                onClick={() => navigate(`/product/${product._id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: '110%', backgroundColor: '#f8f9fa' }}>
                                    <Card.Img 
                                        variant="top" 
                                        src={product.image} 
                                        onError={(e) => { e.target.src = "https://placehold.co/600x600?text=No+Image"; }}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </div>
                                <Card.Body className="d-flex flex-column">
                                    <Card.Title as="h6" className="mb-2 text-truncate">{product.name}</Card.Title>
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
                                    <Button 
                                        variant="dark" 
                                        className="btn-black btn-sm w-100 mt-auto rounded-0"
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            const priceToUse = product.isSaleActive && product.saleSold < product.saleLimit ? product.salePrice : product.price;
                                            addToCartHandler({ ...product, price: priceToUse }); 
                                        }}
                                    >
                                        ADD TO CART
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default ShopPage;
