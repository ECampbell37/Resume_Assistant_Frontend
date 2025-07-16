/**
 * checkApiAllowance.ts – Checks if user can make an API call based on usage.
 * @param userId - The Supabase user ID
 * @param cost - How many usage points the action requires (default = 1)
 * @returns boolean indicating whether the request is allowed
 */

export async function checkApiAllowance(userId: string, cost: number = 1): Promise<boolean> {
  try {
    const res = await fetch('/api/usage/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, cost }),
    });

    const data = await res.json();
    return data.allowed === true;
  } catch (err) {
    console.error('Usage check failed:', err);
    return false;
  }
}
