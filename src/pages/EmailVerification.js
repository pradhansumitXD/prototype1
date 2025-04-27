import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EmailVerification = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();

  const sendVerificationCode = async (e) => {
    e.preventDefault();
    setStatus('Sending verification code...');

    try {
      const response = await axios.post('http://localhost:5002/api/auth/send-verification', {
        email: email.toLowerCase()
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.message) {
        setStatus(response.data.message);
        setCodeSent(true);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus(error.response?.data?.message || 'Failed to send verification code. Please try again.');
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    setStatus('Verifying code...');

    try {
      const response = await axios.post('http://localhost:5002/api/auth/verify-otp', {
        email: email.toLowerCase(),
        verificationToken: otp
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Verification response:', response.data);

      if (response.data.success) {
        setStatus('Account verified successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Email verified successfully. Please login to continue.',
              email: email.toLowerCase()
            }
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error.response?.data?.message || 'Verification failed. Please try again.';
      setStatus(errorMessage);
    }
  };

  return (
    <div style={{ 
      textAlign: 'center', 
      marginTop: '50px',
      padding: '20px',
      maxWidth: '400px',
      margin: '50px auto',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ color: '#333', marginBottom: '20px' }}>Email Verification</h2>
      {!codeSent ? (
        <form onSubmit={sendVerificationCode} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Send Verification Code
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerification} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter verification code"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Verify Code
          </button>
        </form>
      )}
      {status && (
        <div style={{
          padding: '15px',
          marginTop: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          <p style={{ margin: 0, color: '#666' }}>{status}</p>
        </div>
      )}
    </div>
  );
};

export default EmailVerification;