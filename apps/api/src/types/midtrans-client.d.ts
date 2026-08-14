declare module 'midtrans-client' {
  export class Snap {
    constructor(options: {
      isProduction?: boolean;
      serverKey: string;
      clientKey: string;
    });
    createTransaction(parameter: any): Promise<{
      token: string;
      redirect_url: string;
    }>;
    transaction: {
      notification(orderId: string): Promise<any>;
      status(orderId: string): Promise<any>;
      approve(orderId: string): Promise<any>;
      cancel(orderId: string): Promise<any>;
      expire(orderId: string): Promise<any>;
    };
  }
}
