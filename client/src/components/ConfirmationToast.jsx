import React from 'react';
import { Button } from 'react-bootstrap';

const ConfirmationToast = ({ message, onConfirm, onCancel, closeToast }) => {
  return (
    <div>
      <p className="mb-2 text-dark" style={{ fontSize: '14px', fontWeight: '500' }}>
        {message || 'Are you sure?'}
      </p>
      <div className="d-flex justify-content-end gap-2">
        <Button 
            variant="danger" 
            size="sm" 
            style={{ fontSize: '12px' }}
            onClick={() => {
                onConfirm();
                closeToast();
            }}
        >
            Yes
        </Button>
        <Button 
            variant="secondary" 
            size="sm" 
            style={{ fontSize: '12px' }}
            onClick={() => {
                if (onCancel) onCancel();
                closeToast();
            }}
        >
            No
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationToast;
