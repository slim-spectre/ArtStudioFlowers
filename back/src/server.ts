import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'
import { launchBot } from './bot.js';
import db from './db.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 5000
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID


app.post('/api/orders', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      phoneNumber,
      deliveryType,
      address,
      deliveryDate,
      deliveryTime,
      recipientType,
      paymentMethod,
      comment,
      cartItems,
      totalPrice,
      totalItems,
      deliveryCost,
    } = req.body

    const itemsList = cartItems
      .map((item: any, index: number) => `${index + 1}. ${item.name} — ${item.quantity} шт. (x ${item.price} Kč)`)
      .join('\n')

    const deliveryText = deliveryType === 'delivery' ? `🚗 Доставка по Празі (${address.distanceKm || 0} км)` : '📦 Самовивіз'
    const addressText = deliveryType === 'delivery'
        ? `Вул. ${address.street}, буд. ${address.house}, під'їзд ${address.entrance}`
        : 'Самовивіз із студії'
    const recipientText = recipientType === 'self' ? '👤 Сам замовник' : '🎁 В подарунок'

    let paymentText = '💵 Готівкою'
    if (paymentMethod === 'card') paymentText = '💳 Карткою'
    if (paymentMethod === 'crypto') paymentText = '🪙 Криптовалютою'

    const message = `
🌸 <b>НОВЕ ЗАМОВЛЕННЯ!</b> 🌸

👤 <b>Клієнт:</b> ${name}
📞 <b>Телефон:</b> ${phoneNumber}
🎁 <b>Отримувач:</b> ${recipientText}

🚚 <b>Спосіб отримання:</b> ${deliveryText}
📍 <b>Адреса:</b> ${addressText}
📅 <b>Дата:</b> ${deliveryDate}
⏰ <b>Час:</b> ${deliveryTime}

💳 <b>Оплата:</b> ${paymentText}
📝 <b>Коментар:</b> ${comment || 'Немає'}

🛍 <b>Кошик (${totalItems} шт.):</b>
${itemsList}

📦 <b>Вартість доставки:</b> ${deliveryCost || 0} Kč
💰 <b>ЗАГАЛЬНА СУМА: ${totalPrice} Kč</b>
`

    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'HTML',
    })

    res.status(200).json({ success: true, message: 'Замовлення надіслано' })
  } catch (error) {
    console.error('Помилка відправки в Telegram:', error)
    res.status(500).json({ success: false, error: 'Помилка сервера' })
  }
})

app.get('/api/products', (req: Request, res: Response) => {
  db.all('SELECT * FROM products ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


app.get('/api/categories', (req: Request, res: Response) => {
  db.all('SELECT * FROM categories ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/addons', (req: Request, res: Response) => {
  db.all('SELECT * FROM addons ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/banners', (req: Request, res: Response) => {
  db.all('SELECT * FROM banners ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});


app.get('/api/image/:fileId', async (req: Request, res: Response): Promise<void> => {
  try {
    const fileId = req.params.fileId;
    
    
    const tgFileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
    const tgFileData = await tgFileRes.json();
    
    if (!tgFileData.ok) {
      res.status(404).send('Фото не знайдено');
      return;
    }

    
    const filePath = tgFileData.result.file_path;
    const imageRes = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`);
    
    res.setHeader('Content-Type', imageRes.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    if (imageRes.body) {
      const buffer = await imageRes.arrayBuffer();
      res.send(Buffer.from(buffer));
    } else {
      res.status(500).send('Помилка завантаження фото');
    }
  } catch (error) {
    console.error('Помилка проксі зображення:', error);
    res.status(500).send('Внутрішня помилка');
  }
});


app.post('/api/products', (req: Request, res: Response) => {
  const { name, price, image, category } = req.body;
  const query = `INSERT INTO products (name, price, image, category) VALUES (?, ?, ?, ?)`;
  
  db.run(query, [name, Number(price), image, category], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name, price, image, category });
  });
});

app.listen(PORT, () => {
  console.log(`Сервер працює на http://localhost:${PORT}`)
  launchBot();
})