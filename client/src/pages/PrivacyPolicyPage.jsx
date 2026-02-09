import { Container } from 'react-bootstrap';

const PrivacyPolicyPage = () => {
    return (
        <Container className="my-5" style={{ maxWidth: '800px' }}>
            <h1 className="mb-4 text-center fw-bold" style={{ fontFamily: 'var(--font-heading)' }}>Privacy Policy</h1>
            <p className="text-muted text-center mb-5">Last updated: February 09, 2026</p>
            
            <section className="mb-4">
                <h4>1. Introduction</h4>
                <p>Welcome to TimberZee. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
            </section>

            <section className="mb-4">
                <h4>2. The Data We Collect</h4>
                <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                <ul>
                    <li><strong>Identity Data:</strong> First name, last name, username.</li>
                    <li><strong>Contact Data:</strong> Billing address, delivery address, email address and telephone numbers.</li>
                    <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products you have purchased from us.</li>
                </ul>
            </section>

             <section className="mb-4">
                <h4>3. How We Use Your Data</h4>
                <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                <ul>
                    <li>To register you as a new customer.</li>
                    <li>To process and deliver your order including managing payments, fees and charges.</li>
                    <li>To manage our relationship with you which will include notifying you about changes to our terms or privacy policy.</li>
                </ul>
            </section>

             <section className="mb-4">
                <h4>4. Data Security</h4>
                <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
            </section>
        </Container>
    );
};

export default PrivacyPolicyPage;