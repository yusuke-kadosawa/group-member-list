import { loginApiLogic } from '../../lib/loginApiLogic';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    verificationToken: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));
jest.mock('@/lib/mailer', () => ({
  sendEmail: jest.fn(),
}));

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/mailer';

describe('loginApiLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('有効なメールで正常レスポンス', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: 1, email: 'valid@example.com' });
    (prisma.verificationToken.deleteMany as jest.Mock).mockResolvedValue();
    (prisma.verificationToken.create as jest.Mock).mockResolvedValue();
    (sendEmail as jest.Mock).mockResolvedValue();
    const res = await loginApiLogic('valid@example.com');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(sendEmail).toHaveBeenCalled();
  });

  it('email未指定は400', async () => {
    const res = await loginApiLogic(undefined as any);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('メール送信失敗は500', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 1, email: 'valid@example.com' });
    (prisma.verificationToken.deleteMany as jest.Mock).mockResolvedValue();
    (prisma.verificationToken.create as jest.Mock).mockResolvedValue();
    (sendEmail as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await loginApiLogic('valid@example.com');
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });
});
