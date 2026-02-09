import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Badge, Form, Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ConfirmationToast from '../components/ConfirmationToast';

const AdminOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

  const fetchOrders = async () => {
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('/api/orders', config);
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  const updateStatusHandler = async (id, status) => {
      try {
          const config = {
              headers: {
                  Authorization: `Bearer ${userInfo.token}`,
              },
          };
          const body = { status };

          await axios.put(`/api/orders/${id}/status`, body, config);
          fetchOrders(); // Refresh list
      } catch (error) {
          alert('Error updating status: ' + (error.response?.data?.message || error.message));
      }
  };

  const statusBadge = (status) => {
    switch (status) {
        case 'pending': return 'warning';
        case 'confirmed': return 'info';
        case 'delivered': return 'success';
        case 'canceled': return 'danger';
        default: return 'secondary';
    }
  };

  return (
    <Container className="mt-5">
      <h1 className="mb-4" style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem' }}>ADMIN - ORDERS</h1>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table striped bordered hover responsive className="table-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAYMENT</th>
              <th>STATUS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user && order.user.firstName ? `${order.user.firstName} ${order.user.lastName}` : 'N/A'}</td>
                <td>{order.createdAt.substring(0, 10)}</td>
                <td>EGP {order.totalPrice}</td>
                <td>{order.paymentMethod}</td>
                <td>
                    <Badge bg={statusBadge(order.orderStatus || 'pending')}>{order.orderStatus || 'pending'}</Badge>
                </td>
                <td>
                  <div className="d-flex gap-2">
                       <Link to={`/order/${order._id}`}>
                            <Button variant='light' className='btn-sm'>
                                Details
                            </Button>
                       </Link>
                       
                       {/* CONFIRM BUTTON - Logic: Only for pending */}
                       {(!order.orderStatus || order.orderStatus === 'pending') && (
                           <Button 
                                variant='info' 
                                className='btn-sm text-white'
                                onClick={() => updateStatusHandler(order._id, 'confirmed')}
                            >
                               Confirm
                           </Button>
                       )}

                       {/* DELIVER BUTTON - Logic: If confirmed */}
                       {order.orderStatus === 'confirmed' && (
                           <Button 
                                variant='success' 
                                className='btn-sm'
                                onClick={() => updateStatusHandler(order._id, 'delivered')}
                            >
                               Mark Delivered
                           </Button>
                       )}

                       {/* CANCEL BUTTON - Logic: Cannot cancel if Delivered */}
                       {order.orderStatus !== 'delivered' && order.orderStatus !== 'canceled' && (
                           <Button 
                                variant='danger' 
                                className='btn-sm'
                                onClick={() => {
                                    toast(<ConfirmationToast 
                                        message="Are you sure you want to cancel this order?"
                                        onConfirm={() => updateStatusHandler(order._id, 'canceled')}
                                    />, { 
                                        position: "top-center",
                                        autoClose: false,
                                        closeOnClick: false,
                                        draggable: false,
                                        closeButton: false
                                    });
                                }}
                            >
                               Cancel
                           </Button>
                       )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

    </Container>
  );
};

export default AdminOrderListPage;
