import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import axios from 'axios'
import { launchBot } from './bot.js'
import db from './db.js'
import Stripe from 'stripe'
import { createInvoiceRecord, markInvoiceAsPaid, sendInvoiceEmail } from './invoiceService.js'

dotenv.config()

const app = express()
app.use(cors())

const PORT = process.env.PORT || 5000
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-10-28.endive',
})


app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('⚠️ Помилка підпису Stripe Webhook:', err.message)
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const invoiceNumber = session.metadata?.invoiceNumber

    if (invoiceNumber) {
      const updatedInvoice = await markInvoiceAsPaid(invoiceNumber)
      if (updatedInvoice) {
        const items = JSON.parse(updatedInvoice.items_json)
        await sendInvoiceEmail(updatedInvoice.invoice_number, updatedInvoice.verification_hash, {
          clientName: updatedInvoice.client_name,
          clientEmail: updatedInvoice.client_email,
          clientPhone: updatedInvoice.client_phone,
          items,
          deliveryInfo: updatedInvoice.delivery_info,
          deliveryCost: updatedInvoice.delivery_cost,
          totalPrice: updatedInvoice.total_price,
          paymentMethod: 'card',
          paymentStatus: 'paid',
        })

        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: CHAT_ID,
          text: `✅ <b>ОПЛАТУ ПІДТВЕРДЖЕНО!</b>\n🧾 Фактура: <code>${invoiceNumber}</code>\n🔐 Код перевірки: <code>${updatedInvoice.verification_hash}</code>\n📧 Чек надіслано клієнту на ${updatedInvoice.client_email}`,
          parse_mode: 'HTML',
        })
      }
    }
  }

  res.json({ received: true })
})

app.use(express.json({ limit: '10kb' }))

// 2. ОФОРМЛЕННЯ ЗАМОВЛЕННЯ + ГЕНЕРАЦІЯ ФАКТУРИ
app.post('/api/orders', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
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

    const formattedItems = cartItems.map((item: any) => {
      let productName = item.name
      try {
        const parsedName = typeof item.name === 'string' ? JSON.parse(item.name) : item.name
        if (parsedName && typeof parsedName === 'object') {
          productName = parsedName.uk || parsedName.cz || parsedName.en || item.name
        }
      } catch (e) {
        productName = item.name
      }
      return { name: productName, quantity: item.quantity, price: item.price }
    })

    const itemsList = formattedItems
      .map((item: any, index: number) => `${index + 1}. ${item.name} — ${item.quantity} шт. (x ${item.price} Kč)`)
      .join('\n')

    const deliveryText =
      deliveryType === 'delivery' ? `🚗 Доставка по Празі (${address.distanceKm || 0} км)` : '📦 Самовивіз'
    const addressText =
      deliveryType === 'delivery'
        ? `Вул. ${address.street}, буд. ${address.house}, під'їзд ${address.entrance}`
        : 'Самовивіз із студії'
    const recipientText = recipientType === 'self' ? '👤 Сам замовник' : '🎁 В подарунок'

    let paymentText = '💵 Готівкою'
    if (paymentMethod === 'card') paymentText = '💳 Карткою через Stripe (очікує оплати)'
    if (paymentMethod === 'crypto') paymentText = '🪙 Криптовалютою'

    // Зберігаємо фактуру в базу даних
    const invoiceData = {
      clientName: name,
      clientEmail: email || '',
      clientPhone: phoneNumber,
      items: formattedItems,
      deliveryInfo: `${deliveryText} (${addressText})`,
      deliveryCost: deliveryCost || 0,
      totalPrice,
      paymentMethod,
      paymentStatus: (paymentMethod === 'cash' ? 'pending_cash' : 'pending') as any,
    }

    const { invoiceNumber, verificationHash } = await createInvoiceRecord(invoiceData)

    // Якщо готівка — відправляємо фактуру на пошту одразу
    if (paymentMethod === 'cash' && email) {
      await sendInvoiceEmail(invoiceNumber, verificationHash, invoiceData)
    }

    const message = `
🌸 <b>НОВЕ ЗАМОВЛЕННЯ!</b> 🌸
🧾 <b>Фактура:</b> <code>${invoiceNumber}</code>
🔐 <b>Код перевірки:</b> <code>${verificationHash}</code>

👤 <b>Клієнт:</b> ${name}
📧 <b>Email:</b> ${email || 'Не вказано'}
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

    if (paymentMethod === 'card') {
      const session = await stripe.checkout.sessions.create({
        customer_email: email || undefined,
        line_items: [
          {
            price_data: {
              currency: 'czk',
              product_data: {
                name: `Замовлення ${invoiceNumber} (Art Studio Flowers)`,
              },
              unit_amount: Math.round(totalPrice * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin || 'https://artstudioflowers.cz'}/checkout?success=true&invoice=${invoiceNumber}`,
        cancel_url: `${req.headers.origin || 'https://artstudioflowers.cz'}/checkout?canceled=true`,
        metadata: {
          invoiceNumber,
          clientName: name,
          phone: phoneNumber,
        },
      })

      res.status(200).json({
        success: true,
        url: session.url,
        invoiceNumber,
        message: 'Сесію створено',
      })

      return
    }

    res.status(200).json({ success: true, invoiceNumber, message: 'Замовлення надіслано' })
  } catch (error) {
    console.error('Помилка сервера:', error)
    res.status(500).json({ success: false, error: 'Помилка сервера' })
  }
})

app.get('/api/products', (req: Request, res: Response) => {
  db.all('SELECT * FROM products ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.get('/api/categories', (req: Request, res: Response) => {
  db.all('SELECT * FROM categories ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.get('/api/addons', (req: Request, res: Response) => {
  db.all('SELECT * FROM addons ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.get('/api/banners', (req: Request, res: Response) => {
  db.all('SELECT * FROM banners ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(rows)
  })
})

app.get('/api/status', (req: Request, res: Response) => {
  db.all('SELECT * FROM settings', [], (err, rows: any[]) => {
    if (err || !rows) {
      return res.json({ isOpen: true, closedMessage: {} })
    }
    const isOpenRow = rows.find((r) => r.key === 'is_shop_open')
    const msgRow = rows.find((r) => r.key === 'closed_message')

    let parsedMessage = {}
    try {
      parsedMessage = msgRow ? JSON.parse(msgRow.value) : {}
    } catch {}

    res.json({
      isOpen: isOpenRow ? isOpenRow.value === 'true' : true,
      closedMessage: parsedMessage,
    })
  })
})

app.get('/api/image/:fileId', async (req: Request, res: Response): Promise<void> => {
  try {
    const fileId = req.params.fileId

    const tgFileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`)
    const tgFileData = await tgFileRes.json()

    if (!tgFileData.ok) {
      res.status(404).send('Фото не знайдено')
      return
    }

    const filePath = tgFileData.result.file_path
    const imageRes = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`)

    res.setHeader('Content-Type', imageRes.headers.get('content-type') || 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400')

    if (imageRes.body) {
      const buffer = await imageRes.arrayBuffer()
      res.send(Buffer.from(buffer))
    } else {
      res.status(500).send('Помилка завантаження фото')
    }
  } catch (error) {
    console.error('Помилка проксі зображення:', error)
    res.status(500).send('Внутрішня помилка')
  }
})

app.post('/api/products', (req: Request, res: Response) => {
  const { name, price, image, category } = req.body
  const query = `INSERT INTO products (name, price, image, category) VALUES (?, ?, ?, ?)`

  db.run(query, [name, Number(price), image, category], function (err) {
    if (err) return res.status(500).json({ error: err.message })
    res.status(201).json({ id: this.lastID, name, price, image, category })
  })
})

app.listen(PORT, () => {
  console.log(`Сервер працює на http://localhost:${PORT}`)
  launchBot()
})