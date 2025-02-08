import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Don't send the password back
    const { password: _, ...userWithoutPassword } = user;

    await prisma.$disconnect();
    
    return res.status(200).json({ 
      message: 'User created successfully', 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Registration error:', error);
    await prisma.$disconnect();
    return res.status(500).json({ 
      message: 'Error creating user', 
      error: error.message 
    });
  }
}