export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  if (!TOKEN || !CHAT_ID) {
    return json({ ok: false, error: "Сервер не настроен (нет токена/chat_id)." }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const name = clean(body?.name, 80);
  const contact = clean(body?.contact, 80);
  const message = clean(body?.message, 500);

  if (!name || !contact) {
    return json({ ok: false, error: "Укажите имя и контакт." }, 400);
  }

  const text =
    `🔔 <b>Новая заявка с сайта</b>\n\n` +
    `👤 <b>Имя:</b> ${escapeHtml(name)}\n` +
    `📱 <b>Контакт:</b> ${escapeHtml(contact)}\n` +
    (message ? `💬 <b>Сообщение:</b> ${escapeHtml(message)}\n` : "") +
    `\n🕒 ${new Date().toLocaleString("ru-RU")}`;

  try {
    const tg = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" }),
    });

    if (!tg.ok) {
      const detail = await tg.text().catch(() => "");
      console.error("Telegram error:", tg.status, detail);
      return json({ ok: false, error: "Не удалось доставить заявку." }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    console.error("Fetch to Telegram failed:", err);
    return json({ ok: false, error: "Не удалось доставить заявку." }, 502);
  }
}

function clean(v, max) {
  return String(v ?? "").trim().slice(0, max);
}

function escapeHtml(s) {
  return s.replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
