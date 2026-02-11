import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { fileToBase64 } from '../utils/fileToBase64';

const EditProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [images, setImages] = useState([]);
    const [colors, setColors] = useState('');
    const [sizes, setSizes] = useState('');
    const [description, setDescription] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [uploading, setUploading] = useState(false);
    
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'admin') {
            navigate('/login');
            return;
        }

        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`/api/products/${id}`);
                setName(data.name);
                setPrice(data.price);
                setImage(data.image);
                setImages(data.images || []);
                setColors(data.colors ? data.colors.join(', ') : '');
                setSizes(data.sizes ? data.sizes.join(', ') : '');
                setDescription(data.description);
                setCountInStock(data.countInStock);
            } catch (error) {
                console.error(error);
            }
        };

        fetchProduct();
    }, [id, navigate]);

    const uploadFileHandler = async (e) => {
        const files = Array.from(e.target.files);
        setUploading(true);

        try {
            const uploadedUrls = [];
            for (const file of files) {
                const base64 = await fileToBase64(file);
                uploadedUrls.push(base64);
            }
            
            setImages(prev => [...prev, ...uploadedUrls]);
            if (!image && uploadedUrls.length > 0) {
                setImage(uploadedUrls[0]);
            }
            // If we had no images before, set the first new one as main
            if (!image && images.length === 0 && uploadedUrls.length > 0) {
                 setImage(uploadedUrls[0]);
            }

            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
            alert('Image upload failed');
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            await axios.put(
                `/api/products/${id}`,
                {
                    name,
                    price,
                    image: image || images[0],
                    images,
                    colors: colors.split(',').map(c => c.trim()).filter(Boolean),
                    sizes: sizes.split(',').map(s => s.trim()).filter(Boolean),
                    description,
                    countInStock
                },
                config
            );

            navigate(`/product/${id}`);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Error updating product');
        }
    };

    return (
        <Container className='mt-5'>
            <Link to={`/product/${id}`} className='btn btn-light my-3 rounded-circle' style={{ width: '40px', height: '40px', padding: '6px 0', textAlign: 'center' }}>
                <i className="fas fa-arrow-left"></i>
            </Link>
            <Row className='justify-content-md-center'>
                <Col md={8}>
                    <h1>EDIT PRODUCT</h1>
                    <Form onSubmit={submitHandler}>
                        <Form.Group controlId='name' className='mb-3'>
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Enter name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group controlId='price' className='mb-3'>
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type='number'
                                placeholder='Enter price'
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group controlId='image' className='mb-3'>
                            <Form.Label>Images (Select multiple)</Form.Label>
                            <div 
                                className="border p-3 text-center"
                                style={{ 
                                    border: '2px dashed #ccc', 
                                    cursor: 'pointer',
                                    borderRadius: '5px',
                                    backgroundColor: '#f8f9fa' 
                                }}
                            >
                                <input
                                    type="file"
                                    id="image-file"
                                    onChange={uploadFileHandler}
                                    style={{ display: 'none' }}
                                    multiple
                                />
                                <label htmlFor="image-file" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                                    <div>
                                        <i className="fas fa-cloud-upload-alt fa-2x mb-2 text-muted"></i>
                                        <p className="mb-0 text-muted">Click to Upload More Images</p>
                                    </div>
                                </label>
                            </div>
                            
                            <div className="d-flex flex-wrap gap-2 mt-2">
                                {images.map((img, idx) => (
                                    <div key={idx} className="position-relative" style={{ width: '80px', height: '80px' }}>
                                        <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="img-thumbnail" />
                                        {image === img && (
                                            <div className="position-absolute bottom-0 start-0 bg-dark text-white text-center w-100" style={{ fontSize: '10px' }}>Main</div>
                                        )}
                                        <div 
                                            className="position-absolute top-0 end-0 bg-danger text-white rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px', transform: 'translate(30%, -30%)' }}
                                            onClick={() => {
                                                const newImages = images.filter((_, i) => i !== idx);
                                                setImages(newImages);
                                                if(img === image && newImages.length > 0) setImage(newImages[0]);
                                                if(newImages.length === 0) setImage('');
                                            }}
                                        >x</div>
                                        <div 
                                            className="position-absolute top-0 start-0 bg-success text-white rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px', transform: 'translate(-30%, -30%)' }}
                                            onClick={() => setImage(img)}
                                            title="Set Main"
                                        >★</div>
                                    </div>
                                ))}
                            </div>
                            {uploading && <div className="text-muted mt-1">Uploading...</div>}
                        </Form.Group>

                        <Form.Group controlId='colors' className='mb-3'>
                            <Form.Label>Colors (Comma separated)</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='e.g. Red, Blue, Black'
                                value={colors}
                                onChange={(e) => setColors(e.target.value)}
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group controlId='sizes' className='mb-3'>
                            <Form.Label>Sizes (Comma separated)</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='e.g. 40, 41, 42, 43'
                                value={sizes}
                                onChange={(e) => setSizes(e.target.value)}
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group controlId='countInStock' className='mb-3'>
                            <Form.Label>Count In Stock</Form.Label>
                            <Form.Control
                                type='number'
                                placeholder='Enter stock quantity'
                                value={countInStock}
                                onChange={(e) => setCountInStock(e.target.value)}
                                required
                            ></Form.Control>
                        </Form.Group>

                        <Form.Group controlId='description' className='mb-3'>
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as='textarea'
                                rows={3}
                                placeholder='Enter description'
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            ></Form.Control>
                        </Form.Group>

                        <Button type='submit' className='btn-black' size='lg'>
                            UPDATE ITEM
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default EditProductPage;