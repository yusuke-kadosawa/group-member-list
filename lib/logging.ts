export function createRenderLogMessage(page: string, email: string | undefined, duration: number): string {
  return `[${page}] render for ${email || 'unknown'} completed in ${duration}ms`;
}

export function logRenderDuration(page: string, session: any, startTime: number): void {
  const duration = Date.now() - startTime;
  const userEmail = session?.user?.email || "unknown";
  console.log(`[${page}] render for ${userEmail} completed in ${duration}ms`);
}