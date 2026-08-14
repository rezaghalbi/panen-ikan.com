import midtransClient from 'midtrans-client';

const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-demo-key';
const clientKey = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-demo-key';
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

// Inisialisasi Midtrans Snap Client
export const snap = new midtransClient.Snap({
  isProduction: isProduction,
  serverKey: serverKey,
  clientKey: clientKey,
});

export const createMidtransTransaction = async (payload: {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    first_name: string;
    email: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}) => {
  const isDemoKey = serverKey.includes('demo') || !serverKey;

  // Jika menggunakan demo key / belum disetup, gunakan fallback simulation agar app tidak crash saat testing
  if (isDemoKey) {
    const demoToken = `DEMO-SNAP-${Date.now()}-${payload.orderId}`;
    return {
      token: demoToken,
      redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/${demoToken}`,
      isDemoMode: true,
    };
  }

  const parameter = {
    transaction_details: {
      order_id: payload.orderId,
      gross_amount: payload.grossAmount,
    },
    credit_card: {
      secure: true,
    },
    customer_details: payload.customerDetails,
    item_details: payload.itemDetails,
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      isDemoMode: false,
    };
  } catch (error) {
    console.error('Midtrans Transaction Error:', error);
    // Fallback if error occurs (e.g. invalid credentials)
    const fallbackToken = `SNAP-ERR-${Date.now()}-${payload.orderId}`;
    return {
      token: fallbackToken,
      redirect_url: `#`,
      isDemoMode: true,
      error: (error as any).message || 'Midtrans Error',
    };
  }
};
