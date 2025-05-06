'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function DashboardPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/me', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setEmail(res.data.email);
    }).catch(() => {
      setEmail(null);
    });
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {email ? <p>Welcome, {email}</p> : <p>Unauthorized</p>}
    </div>
  );
}
