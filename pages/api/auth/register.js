import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Received registration request:', req.body); // Debug log

    const { name, email, password } = req.body;

    if (!email || !password) {
      console.log('Missing fields:', { email: !!email, password: !!password }); // Debug log
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('User already exists:', email); // Debug log
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Attempting to create user...'); // Debug log

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    console.log('User created successfully:', user.id); // Debug log

    // Don't send the password back
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({ 
      message: 'User created successfully', 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Detailed registration error:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    
    return res.status(500).json({ 
      message: 'Error creating user', 
      error: error.message,
      details: error.code 
    });
  }
}