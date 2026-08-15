import { Request, Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { createMidtransTransaction, snap } from '../config/midtrans';

const prisma = new PrismaClient();

// Helper untuk mengembalikan stok saat pesanan dibatalkan
const restoreOrderStock = async (orderId: string) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;

    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }
    console.log(`📦 Stock restored for cancelled order ${orderId}`);
  } catch (err) {
    console.error(`Error restoring stock for order ${orderId}:`, err);
  }
};

// Helper untuk menyinkronkan status pesanan dengan Midtrans API
const syncOrderPaymentWithMidtrans = async (orderId: string): Promise<OrderStatus> => {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-demo-key';
    const authHeader = `Basic ${Buffer.from(serverKey + ':').toString('base64')}`;
    const baseUrl = process.env.MIDTRANS_IS_PRODUCTION === 'true'
      ? 'https://api.midtrans.com'
      : 'https://api.sandbox.midtrans.com';

    const res = await fetch(`${baseUrl}/v2/${orderId}/status`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    });

    const statusResponse = await res.json();
    const transactionStatus = statusResponse?.transaction_status;
    const fraudStatus = statusResponse?.fraud_status;

    console.log(`🔍 Midtrans Live Check for ${orderId}:`, transactionStatus);

    let updatedStatus: OrderStatus = OrderStatus.PENDING;

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || !fraudStatus) {
        updatedStatus = OrderStatus.PAID;
      }
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      updatedStatus = OrderStatus.CANCELLED;
    }

    if (updatedStatus !== OrderStatus.PENDING) {
      const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
      await prisma.order.update({
        where: { id: orderId },
        data: { status: updatedStatus },
      });

      if (updatedStatus === OrderStatus.CANCELLED && existingOrder?.status !== OrderStatus.CANCELLED) {
        await restoreOrderStock(orderId);
      }
    }

    return updatedStatus;
  } catch (err) {
    console.error(`Error syncing order ${orderId} with Midtrans:`, err);
    return OrderStatus.PENDING;
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, shippingAddress, shippingMethod, notes } = req.body;
    const user = (req as any).user;
    const userId = user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart items cannot be empty' });
    }

    // Atomic transaction for checking stock, deducting stock, and creating order
    const newOrder = await prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;
      const orderItemData = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Stok untuk ${product.name} tidak mencukupi (Tersedia: ${product.stock}, Diminta: ${item.quantity})`
          );
        }

        const subTotal = product.price * item.quantity;
        calculatedTotal += subTotal;

        orderItemData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });

        // Kurangi stok produk secara atomik
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: product.stock - item.quantity,
          },
        });
      }

      const createdOrder = await tx.order.create({
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

      return createdOrder;
    });

    const midtransItemDetails = newOrder.items.map((item) => ({
      id: item.product.id,
      price: item.price,
      quantity: item.quantity,
      name: item.product.name.substring(0, 50),
    }));

    // Generate Token Midtrans Snap
    const midtransResult = await createMidtransTransaction({
      orderId: newOrder.id,
      grossAmount: newOrder.totalPrice,
      customerDetails: {
        first_name: newOrder.user?.name || 'Pelanggan PanenQu',
        email: newOrder.user?.email || 'user@panenqu.com',
      },
      itemDetails: midtransItemDetails,
    });

    // Update Order dengan Snap Token
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
    res.status(500).json({ message: error.message || 'Internal Server Error' });
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

    // Auto-sync status untuk order yang masih PENDING
    for (const order of orders) {
      if (order.status === OrderStatus.PENDING) {
        const latestStatus = await syncOrderPaymentWithMidtrans(order.id);
        if (latestStatus !== OrderStatus.PENDING) {
          order.status = latestStatus;
        }
      }
    }

    res.status(200).json({ data: orders });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
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

    // Auto-sync status PENDING untuk admin dashboard
    for (const order of orders) {
      if (order.status === OrderStatus.PENDING) {
        const latestStatus = await syncOrderPaymentWithMidtrans(order.id);
        if (latestStatus !== OrderStatus.PENDING) {
          order.status = latestStatus;
        }
      }
    }

    res.status(200).json({ data: orders });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    let order = await prisma.order.findUnique({
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

    if (order.status === OrderStatus.PENDING) {
      const latestStatus = await syncOrderPaymentWithMidtrans(order.id);
      if (latestStatus !== OrderStatus.PENDING) {
        order.status = latestStatus;
      }
    }

    res.status(200).json({ data: order });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const syncPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedStatus = await syncOrderPaymentWithMidtrans(id);
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
      },
    });

    res.status(200).json({
      message: `Status order ${id} disinkronkan ke ${updatedStatus}`,
      data: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Gagal sinkronkan pembayaran' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingOrder = await prisma.order.findUnique({ where: { id } });

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
    });

    if (status === 'CANCELLED' && existingOrder?.status !== 'CANCELLED') {
      await restoreOrderStock(id);
    }

    res.status(200).json({
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

export const handleMidtransNotification = async (req: Request, res: Response) => {
  try {
    const statusResponse = req.body;
    const orderId = statusResponse.order_id || statusResponse.orderId;
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
    }

    if (orderId && newStatus !== OrderStatus.PENDING) {
      const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
      await prisma.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      if (newStatus === OrderStatus.CANCELLED && existingOrder?.status !== OrderStatus.CANCELLED) {
        await restoreOrderStock(orderId);
      }
    }

    res.status(200).json({ message: 'Notification processed', status: newStatus });
  } catch (error: any) {
    console.error('Midtrans Notification Error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};
