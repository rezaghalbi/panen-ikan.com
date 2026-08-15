import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Fitur Register User
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Nama, email, dan password wajib diisi!' });
    }

    // Validasi panjang password minimal 6 karakter
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password minimal harus 6 karakter!' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar!' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'CUSTOMER',
      },
    });

    res.status(201).json({
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error('❌ REGISTER DATABASE ERROR:', error);
    res.status(500).json({
      message: error.message || 'Gagal mendaftar ke database',
      errorDetail: error.code || String(error),
    });
  }
};

// Fitur Login User
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: 'Email atau password salah!' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Email atau password salah!' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string || 'panenqu-secret-jwt-key-2026',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: token,
      },
    });
  } catch (error: any) {
    console.error('❌ LOGIN DATABASE ERROR:', error);
    res.status(500).json({
      message: error.message || 'Gagal login ke database',
      errorDetail: error.code || String(error),
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    res.json({
      message: 'Profil user',
      user: user,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error' });
  }
};
