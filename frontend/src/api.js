const BASE_URL = process.env.REACT_APP_API_URL || '/api';

export async function getChats() {
  const res = await fetch(`${BASE_URL}/chats`);
  if (!res.ok) throw new Error('Failed to fetch chats');
  return res.json();
}

export async function getMessages(wa_id) {
  const res = await fetch(`${BASE_URL}/chats/${wa_id}/messages`);
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function sendMessage(wa_id, { name, number, message }) {
  const res = await fetch(`${BASE_URL}/chats/${wa_id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, number, message, wa_id }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}
