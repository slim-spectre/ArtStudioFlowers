import nodemailer from 'nodemailer'
import crypto from 'crypto'
import db from './db.js'
import dotenv from 'dotenv'

dotenv.config()

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE,
      verification_hash TEXT UNIQUE,
      client_name TEXT,
      client_email TEXT,
      client_phone TEXT,
      items_json TEXT,
      delivery_info TEXT,
      delivery_cost REAL,
      total_price REAL,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface InvoiceData {
  clientName: string
  clientEmail: string
  clientPhone: string
  items: { name: string; quantity: number; price: number }[]
  deliveryInfo: string
  deliveryCost: number
  totalPrice: number
  paymentMethod: string
  paymentStatus: 'paid' | 'pending_cash'
}

// 1. Зберігаємо фактуру в базу даних
export const createInvoiceRecord = (data: InvoiceData): Promise<{ invoiceNumber: string; verificationHash: string }> => {
  return new Promise((resolve, reject) => {
    const year = new Date().getFullYear()
    const randomNum = Math.floor(10000 + Math.random() * 90000)
    const invoiceNumber = `ASF-${year}-${randomNum}`
    const verificationHash = crypto.randomBytes(6).toString('hex').toUpperCase() // 12-символьний унікальний код

    const query = `
      INSERT INTO invoices (
        invoice_number, verification_hash, client_name, client_email, client_phone,
        items_json, delivery_info, delivery_cost, total_price, payment_method, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    db.run(
      query,
      [
        invoiceNumber,
        verificationHash,
        data.clientName,
        data.clientEmail,
        data.clientPhone,
        JSON.stringify(data.items),
        data.deliveryInfo,
        data.deliveryCost || 0,
        data.totalPrice,
        data.paymentMethod,
        data.paymentStatus,
      ],
      function (err) {
        if (err) return reject(err)
        resolve({ invoiceNumber, verificationHash })
      }
    )
  })
}

// 2. Оновлюємо статус після оплати Stripe
export const markInvoiceAsPaid = (invoiceNumber: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE invoices SET payment_status = 'paid' WHERE invoice_number = ?`,
      [invoiceNumber],
      (err) => {
        if (err) return reject(err)
        db.get(`SELECT * FROM invoices WHERE invoice_number = ?`, [invoiceNumber], (err, row) => {
          if (err) return reject(err)
          resolve(row)
        })
      }
    )
  })
}

// 3. Генеруємо HTML-фактуру і відправляємо на Email клієнту
export const sendInvoiceEmail = async (invoiceNumber: string, verificationHash: string, data: InvoiceData) => {
  if (!data.clientEmail) return

  const dateStr = new Date().toLocaleDateString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const statusLabel =
    data.paymentStatus === 'paid'
      ? '<span style="color: #16a34a; font-weight: bold;">ZAPLACENO / ОПЛАЧЕНО</span>'
      : '<span style="color: #d97706; font-weight: bold;">PLATBA PŘI PŘEVZETÍ / ОПЛАТА ПРИ ОТРИМАННІ</span>'

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f3e8ee; color: #333;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3e8ee; text-align: center; color: #555;">${item.quantity} ks</td>
        <td style="padding: 10px; border-bottom: 1px solid #f3e8ee; text-align: right; color: #333;">${item.price * item.quantity} Kč</td>
      </tr>
    `
    )
    .join('')

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; border: 2px solid #F1569E; background-color: #ffffff; padding: 30px;">
      <div style="text-align: center; border-bottom: 1px solid #F1569E; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #F1569E; margin: 0; letter-spacing: 3px; font-size: 26px;">ART STUDIO FLOWERS</h1>
        <p style="color: #AA6181; margin: 5px 0 0; font-size: 13px;">Faktura / Potvrzení objednávky</p>
      </div>

      <table style="width: 100%; margin-bottom: 20px; font-size: 14px; color: #444;">
        <tr>
          <td>
            <strong>Číslo faktury:</strong> ${invoiceNumber}<br/>
            <strong>Datum vystavení:</strong> ${dateStr}<br/>
            <strong>Stav platby:</strong> ${statusLabel}
          </td>
          <td style="text-align: right; vertical-align: top;">
            <strong>Odběratel (Клієнт):</strong><br/>
            ${data.clientName}<br/>
            ${data.clientPhone}<br/>
            ${data.clientEmail}
          </td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
        <thead>
          <tr style="background-color: #fdf2f8; color: #AA6181;">
            <th style="padding: 10px; text-align: left; border-bottom: 1px solid #F1569E;">Položka / Товар</th>
            <th style="padding: 10px; text-align: center; border-bottom: 1px solid #F1569E;">Množství</th>
            <th style="padding: 10px; text-align: right; border-bottom: 1px solid #F1569E;">Cena</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f3e8ee; color: #555;" colspan="2">
              Doprava (${data.deliveryInfo})
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #f3e8ee; text-align: right; color: #333;">
              ${data.deliveryCost} Kč
            </td>
          </tr>
        </tbody>
      </table>

      <div style="text-align: right; font-size: 18px; color: #F1569E; font-weight: bold; margin-bottom: 25px;">
        CELKEM K ÚHRADĚ: ${data.totalPrice} Kč
      </div>

      <div style="background-color: #f9f9fb; border: 1px dashed #AA6181; padding: 12px; text-align: center; font-size: 12px; color: #666;">
        Unikátní ověřovací kód dokladu (Код перевірки автентичності):<br/>
        <strong style="font-size: 15px; color: #AA6181; letter-spacing: 2px;">${verificationHash}</strong>
      </div>

      <p style="text-align: center; color: #AA6181; font-size: 12px; margin-top: 25px;">
        Děkujeme za vaši objednávku! 🌸<br/>
        artstudioflowers.cz
      </p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"Art Studio Flowers" <${process.env.SMTP_USER}>`,
      to: data.clientEmail,
      subject: `Faktura ${invoiceNumber} — Art Studio Flowers 🌸`,
      html,
    })
    console.log(`📧 Фактуру ${invoiceNumber} успішно надіслано на ${data.clientEmail}`)
  } catch (error) {
    console.error('❌ Помилка відправки фактури на email:', error)
  }
}