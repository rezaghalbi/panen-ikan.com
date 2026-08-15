import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

import { hash, genSalt } from 'bcryptjs';

const prisma = new PrismaClient();

// 1. GET MY PROFILE
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const id = req.user?.id;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 2. GET ALL USERS (Khusus Admin)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      message: 'Get users success',
      data: users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 3. UPDATE PROFILE (Nama, Telepon, Alamat, Password)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const id = req.user?.id; // Ambil ID dari Token
    const { name, password, phone, address } = req.body;

    let updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;

    // Jika user kirim password baru, kita hash dulu
    if (password && password.trim() !== '') {
      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
