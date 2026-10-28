jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { createLocalBackend, DEMO_EMAIL, DEMO_PASSWORD } from '../src/backend/localBackend';

describe('local backend', () => {
  it('signs in the demo account', async () => {
    const b = createLocalBackend();
    await b.signIn(DEMO_EMAIL, DEMO_PASSWORD);
    expect((await b.getUser())?.email).toBe(DEMO_EMAIL);
  });

  it('signs up, saves best progress and issues one certificate per level', async () => {
    const b = createLocalBackend();
    await b.signUp('new@example.com', 'secret1', 'Priya');
    expect((await b.getUser())?.fullName).toBe('Priya');
    await b.saveProgress({ level: 'A1', lessonSlug: 'greetings', lessonCompleted: true, quizScore: 83 });
    await b.saveProgress({ level: 'A1', lessonSlug: 'greetings', lessonCompleted: false, quizScore: 50 });
    expect(await b.listProgress()).toEqual([
      expect.objectContaining({ lessonSlug: 'greetings', lessonCompleted: true, quizScore: 83 }),
    ]);
    const c1 = await b.issueCertificate('A1', 90);
    const c2 = await b.issueCertificate('A1', 95);
    expect(c2.id).toBe(c1.id);
    expect(c1.publicSlug.length).toBeGreaterThanOrEqual(8);
  });

  it('rejects bad credentials, short passwords and wrong reset codes', async () => {
    const b = createLocalBackend();
    await expect(b.signIn(DEMO_EMAIL, 'wrong')).rejects.toMatchObject({ code: 'invalidCredentials' });
    await expect(b.signUp('a@b.co', '123', 'A')).rejects.toMatchObject({ code: 'weakPassword' });
    await expect(b.signUp(DEMO_EMAIL, 'secret1', 'A')).rejects.toMatchObject({ code: 'emailTaken' });
    await expect(b.verifyResetCode(DEMO_EMAIL, '000000')).rejects.toMatchObject({ code: 'invalidCode' });
    await b.verifyResetCode(DEMO_EMAIL, '123456');
    expect((await b.getUser())?.email).toBe(DEMO_EMAIL);
  });
});
