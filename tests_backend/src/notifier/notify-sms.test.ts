import { PrismaClient } from '@prisma/client';
import sendNotificationSMS from './notify-sms';
import logger from '../utils/logger';

describe('sendNotificationSMS', () => {
  let prismaMock: {
    settings: {
      findFirst: jest.Mock;
    };
  };


  let mockLoggerError: jest.Mock;

  beforeEach(() => {
    mockLoggerError = jest.fn();
    jest.mock('../utils/logger', () => ({
      __esModule: true,
      default: {
        error: mockLoggerError,
      },
    }));

    prismaMock = {
      settings: {
        findFirst: jest.fn(),
      },
    };

    (global as any).prisma = prismaMock;


    mockLoggerError.mockClear();
  });

  it('should send SMS successfully', async () => {

    const to = '123456789';
    const message = 'Test message';


    prismaMock.settings.findFirst.mockResolvedValueOnce({ key: 'ovhSMS.account', value: 'testAccount' });
    prismaMock.settings.findFirst.mockResolvedValueOnce({ key: 'ovhSMS.login', value: 'testLogin' });
    prismaMock.settings.findFirst.mockResolvedValueOnce({ key: 'ovhSMS.password', value: 'testPassword' });
    prismaMock.settings.findFirst.mockResolvedValueOnce({ key: 'ovhSMS.from', value: 'testFrom' });


    const result = await sendNotificationSMS(to, message);


    expect(result).toBe(true);


    expect(mockLoggerError.mock.calls.length).toBe(0);
  });

  it('should handle errors when sending SMS', async () => {

    const to = '123456789';
    const message = 'Test message';


    prismaMock.settings.findFirst.mockRejectedValueOnce(new Error('Prisma Error'));


    const result = await sendNotificationSMS(to, message);


    expect(result).toBe(false);


    expect(mockLoggerError.mock.calls.length).toBe(1);
  });


});
