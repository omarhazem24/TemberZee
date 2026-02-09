import { Container } from 'react-bootstrap';

const ReturnPolicyPage = () => {
    return (
        <Container className="my-5" style={{ maxWidth: '800px' }}>
            <h1 className="mb-4 text-center fw-bold" style={{ fontFamily: 'var(--font-heading)' }}>Return Policy</h1>
            <p className="text-muted text-center mb-5">Last updated: February 09, 2026</p>
            
            <section className="mb-4">
                <h4>1. Returns</h4>
                <p>We have a 14-day return policy, which means you have 7 days after receiving your item to request a return. To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging.</p>
            </section>

            <section className="mb-4">
                <h4>2. Damages and Issues</h4>
                <p>Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.</p>
            </section>

             <section className="mb-4">
                <h4>3. Exchanges</h4>
                <p>The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item. We can also handle size exchanges directly if stock permits.</p>
            </section>

             <section className="mb-4">
                <h4>4. Refunds</h4>
                <p>We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you will be refunded to your original payment method. Please remember it can take some time for your bank or credit card company to process and post the refund.</p>
            </section>
        </Container>
    );
};

export default ReturnPolicyPage;