export {};

declare global {
  namespace Express {
    interface Request {
      requestInfo?: {
        timestamp: string;
        method: string;
        path: string;
      };
      user?: {
        username: string;
        role: 'ADMIN' | 'TECHNICIAN';
      };
    }
  }
}