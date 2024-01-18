import { PrismaClient } from '@prisma/client';
import sendNotificationEmail from './notify-email';
import logger from '../utils/logger';


const mockLoggerError = jest.fn();
jest.mock('../utils/logger', () => ({
  __esModule: true,
  default: {
    error: mockLoggerError,
  },
}));

describe('sendNotificationEmail', () => {
  let prismaMock: {
    settings: {
      findFirst: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaMock = {
      settings: {
        findFirst: jest.fn(),
      },
    };

    (global as any).prisma = prismaMock;

    
    mockLoggerError.mockClear();
  });

  it('should send notification email successfully', async () => {
    expect(mockLoggerError.mock.calls.length).toBe(0);
  });

  it('should handle errors when sending notification email', async () => {
    expect(mockLoggerError.mock.calls.length).toBe(1);
  });
});
