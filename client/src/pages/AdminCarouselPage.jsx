import { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Row, Col, Image } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ConfirmationToast from '../components/ConfirmationToast';

const AdminCarouselPage = () => {
    const [slides, setSlides] = useState([]);
    const [image, setImage] = useState('');
    const [title, setTitle] = useState('');
    const [uploading, setUploading] = useState(false);
    
    const navigate = useNavigate();
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

    const fetchSlides = async () => {
        try {
            const { data } = await axios.get('/api/slides');
            setSlides(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchSlides();
    }, [navigate, userInfo]);

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.post('/api/upload', formData, config);
            setImage(data);
            setUploading(false);
        } catch (error) {
            console.error(error);
            setUploading(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            await axios.post('/api/slides', { image, title }, config);
            setImage('');
            setTitle('');
            fetchSlides();
        } catch (error) {
            console.error(error);
        }
    };

    const deleteHandler = (id) => {
        toast(<ConfirmationToast 
            message="Are you sure you want to delete this slide?"
            onConfirm={async () => {
                try {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${userInfo.token}`,
                        },
                    };
                    await axios.delete(`/api/slides/${id}`, config);
                    fetchSlides();
                    toast.success('Slide deleted');
                } catch (error) {
                    console.error(error);
                    toast.error('Failed to delete slide');
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

    return (
        <Container className="mt-4">
            <h2>Manage Carousel Slides</h2>
            <Row className="mb-4">
                <Col md={6}>
                    <Form onSubmit={submitHandler}>
                        <Form.Group controlId='image' className="mb-3">
                            <Form.Label>Image</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Enter image url'
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            ></Form.Control>
                            <Form.Control
                                type="file"
                                id="image-file"
                                label="Choose File"
                                onChange={uploadFileHandler}
                                className="mt-2"
                            />
                            {uploading && <div>Uploading...</div>}
                        </Form.Group>

                        <Form.Group controlId='title' className="mb-3">
                            <Form.Label>Title / Caption (Optional)</Form.Label>
                            <Form.Control
                                type='text'
                                placeholder='Enter title'
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            ></Form.Control>
                        </Form.Group>

                        <Button type='submit' variant='primary' disabled={!image}>
                            Add Slide
                        </Button>
                    </Form>
                </Col>
            </Row>

            <Table striped bordered hover responsive className='table-sm'>
                <thead>
                    <tr>
                        <th>IMAGE</th>
                        <th>TITLE</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {slides.map((slide) => (
                        <tr key={slide._id}>
                            <td style={{ width: '200px' }}>
                                <Image src={slide.image} alt={slide.title} fluid style={{ maxHeight: '100px' }} />
                            </td>
                            <td>{slide.title}</td>
                            <td>
                                <Button variant='danger' className='btn-sm' onClick={() => deleteHandler(slide._id)}>
                                    <i className='fas fa-trash'></i>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default AdminCarouselPage;
