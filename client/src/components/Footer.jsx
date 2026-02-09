import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-4 mt-auto" style={{ backgroundColor: '#f8f9fa', borderTop: '1px solid #e7e7e7' }}>
      <Container>
        <Row className="align-items-start">
          {/* Contact Us Section */}
          <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
            <h5 className="mb-3">Contact Us</h5>
            <div className="d-flex gap-3 justify-content-center justify-content-md-start">
              <a 
                href="https://wa.me/201148796530" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-secondary"
              >
                <i className="fab fa-whatsapp fa-2x text-black"></i>
              </a>
              <a 
                href="mailto:timberzee3@gmail.com" 
                className="text-secondary"
              >
                <i className="fas fa-envelope fa-2x text-black"></i>
              </a>
            </div>
          </Col>

          {/* Quick Links Section */}
           <Col md={4} className="text-center mb-3 mb-md-0">
             <h5 className="mb-3">Quick Links</h5>
             <ul className="list-unstyled">
                <li><Link to="/privacy" className="text-secondary text-decoration-none">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-secondary text-decoration-none">Terms of Service</Link></li>
                <li><Link to="/returns" className="text-secondary text-decoration-none">Return Policy</Link></li>
             </ul>
           </Col>

          {/* Social Media Section */}
          <Col md={4} className="text-center text-md-end">
            <h5 className="mb-3">Follow Us</h5>
            <div>
              <a 
                href="https://www.tiktok.com/@timberzee.eg?_r=1&_t=ZS-93kkYIK2wye" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-secondary me-4"
              >
                <i className="fab fa-tiktok fa-2x"></i>
              </a>
              <a 
                href="https://www.instagram.com/timberzee_eg?igsh=MXN6NnFxOHY4cnR0cw==" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-secondary"
              >
                <i className="fab fa-instagram fa-2x"></i>
              </a>
            </div>
          </Col>
        </Row>
        
        <Row className="mt-4">
          <Col className="text-center">
            <small className="text-muted">
              &copy; {new Date().getFullYear()} TemberZee. All Rights Reserved.
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
