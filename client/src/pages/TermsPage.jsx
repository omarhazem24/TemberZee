import { Container } from 'react-bootstrap';

const TermsPage = () => {
    return (
        <Container className="my-5" style={{ maxWidth: '800px' }}>
            <h1 className="mb-4 text-center fw-bold" style={{ fontFamily: 'var(--font-heading)' }}>Terms of Service</h1>
            <p className="text-muted text-center mb-5">Last updated: February 09, 2026</p>
            
            <section className="mb-4">
                <h4>1. Agreement to Terms</h4>
                <p>These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity, and TemberZee, concerning your access to and use of our website.</p>
            </section>

            <section className="mb-4">
                <h4>2. Products</h4>
                <p>We make every effort to display as accurately as possible the colors, features, specifications, and details of the products available on the Site. However, we do not guarantee that the colors, features, specifications, and details of the products will be accurate, complete, reliable, current, or free of other errors.</p>
            </section>

             <section className="mb-4">
                <h4>3. Purchases and Payment</h4>
                <p>We accept various forms of payment. You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Site. Sales tax will be added to the price of purchases as deemed required by us.</p>
            </section>

             <section className="mb-4">
                <h4>4. Return Policy</h4>
                <p>Please review our Return Policy posted on the Site prior to making any purchases.</p>
            </section>
        </Container>
    );
};

export default TermsPage;