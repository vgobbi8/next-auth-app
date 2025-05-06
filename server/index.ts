import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET!;

// Register
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const hashed = bcrypt.hashSync(password, 8);
  const user = await prisma.user.create({ data: { email, password: hashed } });
  res.json({ id: user.id, email: user.email });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Auth check
app.get('/me', async (req, res) => {
  const auth = req.headers.authorization?.split(' ')[1];
  if (!auth) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const payload = jwt.verify(auth, JWT_SECRET) as { userId: number };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ id: user.id, email: user.email });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.listen(5000, () => console.log('✅ Server running at http://localhost:5000'));
