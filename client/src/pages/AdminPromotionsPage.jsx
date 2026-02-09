import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmationToast from '../components/ConfirmationToast';

const AdminPromotionsPage = () => {
    // Offer State
    const [products, setProducts] = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [salePrice, setSalePrice] = useState('');
    const [saleLimit, setSaleLimit] = useState('');
    
    const navigate = useNavigate();
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

    const fetchProducts = async () => {
        try {
             // simplified search fetch
             const { data } = await axios.get(`/api/products?keyword=${productSearch}`);
             setProducts(data);
        } catch (error) {
             console.error(error);
        }
    }

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'admin') {
            navigate('/login');
        }
    }, [navigate, userInfo]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(timeout);
    }, [productSearch]);

    const submitOfferHandler = async (e) => {
        e.preventDefault();
        if (!selectedProduct) return;
        
        try {
             const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
             await axios.put(`/api/products/${selectedProduct._id}/sale`, {
                 salePrice: Number(salePrice),
                 saleLimit: Number(saleLimit),
                 isSaleActive: true
             }, config);
             toast.success('Offer Activated!');
             setSelectedProduct(null);
             setSalePrice('');
             setSaleLimit('');
             fetchProducts();
        } catch (error) {
             toast.error('Error updating offer');
        }
    };

    const disableOfferHandler = (product) => {
        toast(<ConfirmationToast 
            message={`Disable offer for ${product.name}?`}
            onConfirm={async () => {
                 try {
                     const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                     await axios.put(`/api/products/${product._id}/sale`, {
                         salePrice: 0,
                         saleLimit: 0,
                         isSaleActive: false
                     }, config);
                     toast.success('Offer Disabled');
                     fetchProducts(); // Refresh search list
                } catch (error) {
                     console.error(error);
                     toast.error('Error disabling offer');
                }
            }}
        />, { 
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            draggable: false, 
            closeButton: false
        });
    }

    return (
        <Container className="mt-5">
            <h1 className="mb-4">MANAGE OFFERS</h1>
            <Row>
                <Col md={12}>
                    <h3 className="mb-3">Product Specific Offers</h3>
                    <Row>
                        <Col md={5}>
                             <Card className="p-3 border-0 shadow-sm">
                                 <h4>Set Product Offer</h4>
                                 <Form.Control 
                                     type="text" 
                                     placeholder="Search product..." 
                                     className="mb-3"
                                     value={productSearch}
                                     onChange={(e) => setProductSearch(e.target.value)}
                                 />
                                 
                                 <div className="list-group mb-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                     {products.map(p => (
                                         <button 
                                            key={p._id}
                                            className={`list-group-item list-group-item-action ${selectedProduct?._id === p._id ? 'active' : ''}`}
                                            onClick={() => setSelectedProduct(p)}
                                         >
                                             <div className="d-flex justify-content-between">
                                                <span>{p.name}</span>
                                                <small>{p.isSaleActive ? 'SALE ACTIVE' : `EGP ${p.price}`}</small>
                                             </div>
                                         </button>
                                     ))}
                                 </div>

                                 {selectedProduct && (
                                     <Form onSubmit={submitOfferHandler}>
                                         <Alert variant="info">
                                             Selected: <strong>{selectedProduct.name}</strong><br/>
                                             Original Price: EGP {selectedProduct.price}
                                         </Alert>
                                         <Form.Group className="mb-3">
                                             <Form.Label>Sale Price (EGP)</Form.Label>
                                             <Form.Control 
                                                type="number" 
                                                value={salePrice}
                                                onChange={(e) => setSalePrice(e.target.value)}
                                                required
                                             />
                                         </Form.Group>
                                         <Form.Group className="mb-3">
                                             <Form.Label>Quantity Limit (Units)</Form.Label>
                                             <Form.Control 
                                                type="number" 
                                                value={saleLimit}
                                                onChange={(e) => setSaleLimit(e.target.value)}
                                                required
                                             />
                                         </Form.Group>
                                         <Button type="submit" className="btn-black w-100">ACTIVATE OFFER</Button>
                                         {selectedProduct.isSaleActive && (
                                             <Button 
                                                variant="outline-danger" 
                                                className="w-100 mt-2"
                                                onClick={() => disableOfferHandler(selectedProduct)}
                                                type="button"
                                             >
                                                 DISABLE CURRENT OFFER
                                             </Button>
                                         )}
                                     </Form>
                                 )}
                             </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminPromotionsPage;
