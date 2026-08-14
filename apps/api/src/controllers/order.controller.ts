import { Request, Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { createMidtransTransaction } from '../config/midtrans';

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, shippingAddress, shippingMethod, notes } = req.body;
    const user = (req as any).user;
    const userId = user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items cannot be empty' });
    }

    let calculatedTotal = 0;
    const orderItemData = [];
    const midtransItemDetails = [];

    // Validasi Stok & Hitung Subtotal
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(400).json({ message: `Product with ID ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stok untuk ${product.name} tidak mencukupi (Tersedia: ${product.stock}, Diminta: ${item.quantity})`,
        });
      }

      const subTotal = product.price * item.quantity;
      calculatedTotal += subTotal;

      orderItemData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      midtransItemDetails.push({
        id: product.id,
        price: product.price,
        quantity: item.quantity,
        name: product.name.substring(0, 50),
      });

      // Kurangi stok produk
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: product.stock - item.quantity,
        },
      });
    }

    // 1. Simpan Order ke Database
    const newOrder = await prisma.order.create({
      data: {
        userId,
        totalPrice: calculatedTotal,
        shippingAddress: shippingAddress || 'Alamat Utama',
        shippingMethod: shippingMethod || 'Instant Cold-Chain',
        notes: notes || '',
        status: OrderStatus.PENDING,
        items: {
          create: orderItemData,
        },
      },
      include: {
        items: {
          include: { product: true },
        },
        user: true,
      },
    });

    // 2. Generate Token Midtrans Snap
    const midtransResult = await createMidtransTransaction({
      orderId: newOrder.id,
      grossAmount: calculatedTotal,
      customerDetails: {
        first_name: newOrder.user?.name || 'Pelanggan PanenQu',
        email: newOrder.user?.email || 'user@panenqu.com',
      },
      itemDetails: midtransItemDetails,
    });

    // 3. Update Order dengan Snap Token
    const updatedOrder = await prisma.order.update({
      where: { id: newOrder.id },
      data: {
        snapToken: midtransResult.token,
        snapRedirectUrl: midtransResult.redirect_url,
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    res.status(201).json({
      message: 'Order created successfully',
      data: updatedOrder,
      snapToken: midtransResult.token,
      snapRedirectUrl: midtransResult.redirect_url,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ data: orders });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ data: order });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });

    res.status(200).json({
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const handleMidtransNotification = async (req: Request, res: Response) => {
  try {
    const statusResponse = req.body;
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(`🔔 Midtrans Notification Callback for Order ${orderId}: ${transactionStatus}`);

    let newStatus: OrderStatus = OrderStatus.PENDING;

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || !fraudStatus) {
        newStatus = OrderStatus.PAID;
      }
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      newStatus = OrderStatus.CANCELLED;
    } else if (transactionStatus === 'pending') {
      newStatus = OrderStatus.PENDING;
    }

    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });
    }

    res.status(200).json({ message: 'Notification processed' });
  } catch (error) {
    console.error('Midtrans Notification Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
