import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { supabase } from '../config/supabase';

const prisma = new PrismaClient();

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      weightGram,
      unit,
      stock,
      categoryId,
      isFresh,
      isFrozen,
      isProcessed,
    } = req.body;

    let imageUrl = req.body.imageUrl || '';

    // Upload ke Supabase Storage jika ada file
    if (req.file) {
      const file = req.file;
      const bucketName = process.env.SUPABASE_BUCKET || 'products';
      const fileName = `panenqu-${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;

      if (supabase && process.env.SUPABASE_URL) {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
          });

        if (!error) {
          const { data: publicData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);
          imageUrl = publicData.publicUrl;
        }
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        weightGram: Number(weightGram || 1000),
        unit: unit || 'kg',
        stock: Number(stock || 0),
        categoryId: Number(categoryId),
        isFresh: isFresh === 'true' || isFresh === true,
        isFrozen: isFrozen === 'true' || isFrozen === true,
        isProcessed: isProcessed === 'true' || isProcessed === true,
        imageUrl: imageUrl,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({ message: 'Product created successfully', data: product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Error creating product' });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { search, cat, type } = req.query;

    let whereClause: any = {};

    if (search) {
      whereClause.name = {
        contains: String(search),
      };
    }

    if (cat) {
      whereClause.categoryId = Number(cat);
    }

    if (type === 'fresh') {
      whereClause.isFresh = true;
    } else if (type === 'frozen') {
      whereClause.isFrozen = true;
    } else if (type === 'processed') {
      whereClause.isProcessed = true;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      message: 'Get products success',
      data: products,
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ data: product });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      weightGram,
      unit,
      stock,
      categoryId,
      isFresh,
      isFrozen,
      isProcessed,
      imageUrl,
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: price !== undefined ? Number(price) : undefined,
        weightGram: weightGram !== undefined ? Number(weightGram) : undefined,
        unit: unit || undefined,
        stock: stock !== undefined ? Number(stock) : undefined,
        categoryId: categoryId !== undefined ? Number(categoryId) : undefined,
        isFresh: isFresh !== undefined ? isFresh === 'true' || isFresh === true : undefined,
        isFrozen: isFrozen !== undefined ? isFrozen === 'true' || isFrozen === true : undefined,
        isProcessed: isProcessed !== undefined ? isProcessed === 'true' || isProcessed === true : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
      },
    });

    res.status(200).json({
      message: 'Product updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete product error:', error);
    if (error.code === 'P2003') {
      return res
        .status(400)
        .json({ message: 'Cannot delete product because it exists in existing customer orders' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
