import { Telegraf, Scenes, session, Markup } from 'telegraf'
import dotenv from 'dotenv'
import db from './db.js'
import * as translateModule from 'google-translate-api-x';
const translate = (translateModule as any).default || (translateModule as any).translate || translateModule;
dotenv.config()

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN не задано в .env')

// ==========================================
// МАГІЯ: АВТОМАТИЧНИЙ ПЕРЕКЛАДАЧ
// ==========================================
const translateText = async (text: string, targetLang: string) => {
  try {
    const res: any = await translate(text, { to: targetLang });
    return res.text;
  } catch (error) {
    console.error(`Помилка перекладу на ${targetLang}:`, error);
    return text;
  }
};

const translateToAll = async (text: string) => {
  const [uk, cz, en, ru] = await Promise.all([
    translateText(text, 'uk'),
    translateText(text, 'cs'),
    translateText(text, 'en'),
    translateText(text, 'ru')
  ]);
  return JSON.stringify({ uk, cz, en, ru });
};

const getUaName = (str: string) => {
  try { return JSON.parse(str).uk; } catch { return str; }
}

// ==========================================
// 1. РОБОТА З БАЗОЮ ДАНИХ ТА НАЛАШТУВАННЯМИ
// ==========================================
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
  db.run(`ALTER TABLE products ADD COLUMN is_available INTEGER DEFAULT 1`, () => {});
  const defaultMsg = JSON.stringify({
    uk: 'Наразі всі святкові букети розброньовані. Незабаром ми знову відкриємо прийом замовлень!',
    cz: 'Momentálně jsou všechny sváteční kytice rezervované. Brzy opět otevřeme příjem objednávek!',
    en: 'All holiday bouquets are currently booked. We will reopen orders soon!',
    ru: 'На данный момент все праздничные букеты забронированы. Скоро мы снова откроем прием заказов!'
  });
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('is_shop_open', 'true')`);
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('closed_message', ?)`, [defaultMsg]);
});

const getShopSettings = (): Promise<{ isOpen: boolean; closedMessage: string }> => {
  return new Promise((res) => {
    db.all('SELECT * FROM settings', [], (err, rows: any[]) => {
      if (err || !rows) return res({ isOpen: true, closedMessage: '{}' });
      const isOpenRow = rows.find(r => r.key === 'is_shop_open');
      const msgRow = rows.find(r => r.key === 'closed_message');
      res({
        isOpen: isOpenRow ? isOpenRow.value === 'true' : true,
        closedMessage: msgRow ? msgRow.value : '{}'
      });
    });
  });
};

const setSetting = (key: string, value: string): Promise<void> => {
  return new Promise((res, rej) => {
    db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, value], (err) => err ? rej(err) : res());
  });
};

const getCategories = (): Promise<any[]> => new Promise((res, rej) => db.all('SELECT * FROM categories ORDER BY id DESC', [], (err, rows) => err ? rej(err) : res(rows)))
const getProductsByCategory = (categoryJson: string): Promise<any[]> => new Promise((res, rej) => db.all('SELECT * FROM products WHERE category = ? ORDER BY id DESC', [categoryJson], (err, rows) => err ? rej(err) : res(rows)))
const getAddons = (): Promise<any[]> => new Promise((res, rej) => db.all('SELECT * FROM addons ORDER BY id DESC', [], (err, rows) => err ? rej(err) : res(rows)))
const getBanners = (): Promise<any[]> => new Promise((res, rej) => db.all('SELECT * FROM banners ORDER BY id DESC', [], (err, rows) => err ? rej(err) : res(rows)))
const updateItemField = (table: string, id: number, field: string, value: any): Promise<void> => new Promise((res, rej) => db.run(`UPDATE ${table} SET ${field} = ? WHERE id = ?`, [value, id], (err) => err ? rej(err) : res()))

// ==========================================
// 2. СЦЕНИ ДОДАВАННЯ (WIZARDS)
// ==========================================
const categoryWizard = new Scenes.WizardScene(
  'add-category-scene',
  async (ctx: any) => {
    ctx.scene.state = {} as any
    await ctx.reply('📁 <b>Крок 1/2.</b> Введи НАЗВУ категорії (на будь-якій мові, я сам перекладу):', { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('❌ Скасувати', 'admin_home')]]) })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (ctx.callbackQuery) { await ctx.answerCbQuery().catch(() => {}); return ctx.scene.leave() }
    if (!ctx.message?.text) return
    
    await ctx.reply('⏳ Перекладаю назву...');
    ctx.scene.state.name = await translateToAll(ctx.message.text);
    
    await ctx.reply('🖼 <b>Крок 2/2.</b> Надішли ФОТОГРАФІЮ для цієї категорії:', { parse_mode: 'HTML' })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (!ctx.message?.photo) return ctx.reply('❌ Це не фото. Надішли картинку.')
    ctx.scene.state.image = ctx.message.photo.pop().file_id
    const { name, image } = ctx.scene.state
    
    db.run(`INSERT INTO categories (name, image) VALUES (?, ?)`, [name, image], async (err) => {
      if (err) await ctx.reply('❌ Помилка збереження.')
      else await ctx.replyWithPhoto(image, {
        caption: `✅ <b>КАТЕГОРІЮ ДОДАНО!</b>\n\n📁 Назва: <b>${getUaName(name)}</b>`, parse_mode: 'HTML',
        ...Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]])
      })
    })
    return ctx.scene.leave()
  }
)

const productWizard = new Scenes.WizardScene(
  'add-product-scene',
  async (ctx: any) => {
    const categories = await getCategories()
    if (categories.length === 0) {
      await ctx.reply('⚠️ Спочатку створи категорію.', { ...Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]]) })
      return ctx.scene.leave()
    }
    ctx.scene.state = {} as any
    await ctx.reply('🌸 <b>Крок 1/4.</b> Введи НАЗВУ товару (на будь-якій мові):', { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('❌ Скасувати', 'admin_home')]]) })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (ctx.callbackQuery) { await ctx.answerCbQuery().catch(() => {}); return ctx.scene.leave() }
    if (!ctx.message?.text) return
    
    await ctx.reply('⏳ Перекладаю назву...');
    ctx.scene.state.name = await translateToAll(ctx.message.text);
    
    await ctx.reply('💵 <b>Крок 2/4.</b> Введи ціну товару (цифри):', { parse_mode: 'HTML' })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (!ctx.message?.text || isNaN(Number(ctx.message.text))) return ctx.reply('❌ Введи коректну ціну.')
    ctx.scene.state.price = Number(ctx.message.text)
    const categories = await getCategories()
    const buttons = categories.map((cat) => [Markup.button.callback(`📁 ${getUaName(cat.name)}`, `cat_${cat.id}`)])
    await ctx.reply('📂 <b>Крок 3/4.</b> Вибери категорію:', { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (ctx.callbackQuery && ctx.callbackQuery.data.startsWith('cat_')) {
      await ctx.answerCbQuery().catch(() => {})
      const catId = ctx.callbackQuery.data.replace('cat_', '')
      const cats = await getCategories()
      const selected = cats.find(c => c.id === Number(catId))
      ctx.scene.state.category = selected ? selected.name : ''
    } else return

    await ctx.reply(`✅ Категорія обрана\n\n🖼 <b>Крок 4/4.</b> Надішли фотографію букета:`, { parse_mode: 'HTML' })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (!ctx.message?.photo) return ctx.reply('❌ Це не фото.')
    ctx.scene.state.image = ctx.message.photo.pop().file_id
    const { name, price, category, image } = ctx.scene.state
    db.run(`INSERT INTO products (name, price, image, category) VALUES (?, ?, ?, ?)`, [name, price, image, category], async (err) => {
      if (err) await ctx.reply('❌ Помилка збереження.')
      else await ctx.replyWithPhoto(image, {
        caption: `✅ <b>ТОВАР ДОДАНО!</b>\n\n🌸 ${getUaName(name)}\n💵 ${price} Kč\n📂 ${getUaName(category)}`, parse_mode: 'HTML',
        ...Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]])
      })
    })
    return ctx.scene.leave()
  }
)

const addonWizard = new Scenes.WizardScene(
  'add-addon-scene',
  async (ctx: any) => {
    ctx.scene.state = {} as any
    await ctx.reply('🎁 <b>Крок 1/3.</b> Введи НАЗВУ додатку (на будь-якій мові):', { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('❌ Скасувати', 'admin_home')]]) })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (ctx.callbackQuery) { await ctx.answerCbQuery().catch(() => {}); return ctx.scene.leave() }
    if (!ctx.message?.text) return
    
    await ctx.reply('⏳ Перекладаю назву...');
    ctx.scene.state.name = await translateToAll(ctx.message.text);
    
    await ctx.reply('💵 <b>Крок 2/3.</b> Введи ціну (цифри):', { parse_mode: 'HTML' })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (!ctx.message?.text || isNaN(Number(ctx.message.text))) return ctx.reply('❌ Введи коректну ціну.')
    ctx.scene.state.price = Number(ctx.message.text)
    await ctx.reply('🖼 <b>Крок 3/3.</b> Надішли фотографію:', { parse_mode: 'HTML' })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (!ctx.message?.photo) return ctx.reply('❌ Це не фото.')
    ctx.scene.state.image = ctx.message.photo.pop().file_id
    const { name, price, image } = ctx.scene.state
    db.run(`INSERT INTO addons (name, price, image) VALUES (?, ?, ?)`, [name, price, image], async (err) => {
      if (err) await ctx.reply('❌ Помилка збереження.')
      else await ctx.replyWithPhoto(image, {
        caption: `✅ <b>ДОДАТОК ДОДАНО!</b>\n\n🎁 ${getUaName(name)}\n💵 ${price} Kč`, parse_mode: 'HTML',
        ...Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]])
      })
    })
    return ctx.scene.leave()
  }
)

const bannerWizard = new Scenes.WizardScene(
  'add-banner-scene',
  async (ctx: any) => {
    ctx.scene.state = {} as any
    await ctx.reply('🖼 <b>Крок 1/2.</b> Введи ЗАГОЛОВОК банера (на будь-якій мові):', { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('❌ Скасувати', 'admin_home')]]) })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (ctx.callbackQuery) { await ctx.answerCbQuery().catch(() => {}); return ctx.scene.leave() }
    if (!ctx.message?.text) return
    
    await ctx.reply('⏳ Перекладаю назву...');
    ctx.scene.state.title = await translateToAll(ctx.message.text);
    
    await ctx.reply('🖼 <b>Крок 2/2.</b> Надішли ФОТОГРАФІЮ:', { parse_mode: 'HTML' })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (!ctx.message?.photo) return ctx.reply('❌ Це не фото.')
    ctx.scene.state.image = ctx.message.photo.pop().file_id
    const { title, image } = ctx.scene.state
    db.run(`INSERT INTO banners (title, image) VALUES (?, ?)`, [title, image], async (err) => {
      if (err) await ctx.reply('❌ Помилка збереження.')
      else await ctx.replyWithPhoto(image, {
        caption: `✅ <b>БАНЕР ДОДАНО!</b>\n\n📌 <b>${getUaName(title)}</b>`, parse_mode: 'HTML',
        ...Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]])
      })
    })
    return ctx.scene.leave()
  }
)

const bot = new Telegraf<any>(BOT_TOKEN)
const stage = new Scenes.Stage([categoryWizard, productWizard, addonWizard, bannerWizard])
bot.use(session())
bot.use(stage.middleware())

const sendAdminMenu = async (ctx: any) => {
  if (ctx.session) ctx.session.editState = null
  const { isOpen, closedMessage } = await getShopSettings()
  
  const statusBadge = isOpen ? '🟢 <b>ВІДКРИТО</b> (приймає замовлення)' : '🔴 <b>НА ПАУЗІ</b> (показується заглушка)'
  const toggleBtnText = isOpen ? '🔴 Поставити на паузу' : '🟢 Відкрити магазин'

  const text = `👑 <b>ПАНЕЛЬ УПРАВЛІННЯ</b>\n\nСтатус сайту: ${statusBadge}\nТекст заглушки: <i>«${getUaName(closedMessage)}»</i>\n\nОберіть дію:`
  
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback(toggleBtnText, 'toggle_shop_status'), Markup.button.callback('✏️ Текст паузи', 'edit_closed_msg')],
    [Markup.button.callback('🧾 Перевірити фактуру', 'check_invoice_prompt')],
    [Markup.button.callback('➕ Категорію', 'add_cat_prompt'), Markup.button.callback('➕ Товар', 'menu_add_product')],
    [Markup.button.callback('➕ Додаток', 'menu_add_addon'), Markup.button.callback('➕ Банер', 'menu_add_banner')],
    [Markup.button.callback('📁 Категорії', 'menu_cats_manage'), Markup.button.callback('📦 Товари', 'menu_cats_list')],
    [Markup.button.callback('🎀 Додатки', 'menu_addons_list'), Markup.button.callback('🎞 Банери', 'menu_banners_list')]
  ])
  try {
    if (ctx.callbackQuery) { await ctx.deleteMessage().catch(() => {}); await ctx.reply(text, { parse_mode: 'HTML', ...keyboard }) } 
    else await ctx.reply(text, { parse_mode: 'HTML', ...keyboard })
  } catch (e) {}
}

bot.command('admin', sendAdminMenu)
bot.command('start', (ctx) => ctx.reply('Напиши /admin'))

bot.action('admin_home', async (ctx: any) => { await ctx.answerCbQuery().catch(() => {}); await sendAdminMenu(ctx) })

bot.action('toggle_shop_status', async (ctx: any) => {
  const { isOpen } = await getShopSettings()
  await setSetting('is_shop_open', (!isOpen).toString())
  await ctx.answerCbQuery(!isOpen ? '🟢 Магазин відкрито!' : '🔴 Магазин поставлено на паузу!').catch(() => {})
  await sendAdminMenu(ctx)
})

bot.action('edit_closed_msg', async (ctx: any) => {
  await ctx.answerCbQuery().catch(() => {})
  ctx.session ??= {}
  ctx.session.editState = { type: 'settings', id: 0, field: 'closed_message' }
  await ctx.reply('✍️ Введи новий текст повідомлення для клієнтів, коли сайт на паузі (на будь-якій мові, я перекладу на всі 4):', {
    ...Markup.inlineKeyboard([[Markup.button.callback('❌ Скасувати', 'admin_home')]])
  })
})

bot.action('check_invoice_prompt', async (ctx: any) => {
  await ctx.answerCbQuery().catch(() => {})
  ctx.session ??= {}
  ctx.session.editState = { type: 'invoice_check', id: 0, field: 'search' }
  await ctx.reply(
    '🔍 Введи <b>номер фактури</b> (наприклад, <code>ASF-2026-12345</code>) або <b>код перевірки</b> (наприклад, <code>A1B2C3D4E5F6</code>):',
    {
      parse_mode: 'HTML',
      ...Markup.inlineKeyboard([[Markup.button.callback('❌ Скасувати', 'admin_home')]]),
    }
  )
})

bot.action('add_cat_prompt', async (ctx: any) => { await ctx.answerCbQuery().catch(() => {}); return ctx.scene.enter('add-category-scene') })
bot.action('menu_add_product', async (ctx: any) => { await ctx.answerCbQuery().catch(() => {}); return ctx.scene.enter('add-product-scene') })
bot.action('menu_add_addon', async (ctx: any) => { await ctx.answerCbQuery().catch(() => {}); return ctx.scene.enter('add-addon-scene') })
bot.action('menu_add_banner', async (ctx: any) => { await ctx.answerCbQuery().catch(() => {}); return ctx.scene.enter('add-banner-scene') })

bot.action('menu_cats_manage', async (ctx: any) => {
  await ctx.answerCbQuery().catch(() => {})
  const categories = await getCategories()
  if (categories.length === 0) return ctx.editMessageText('Поки немає категорій.', Markup.inlineKeyboard([[Markup.button.callback('🔙 Назад', 'admin_home')]]))
  await ctx.deleteMessage().catch(() => {})
  for (const c of categories) {
    await ctx.replyWithPhoto(c.image, { caption: `📁 <b>${getUaName(c.name)}</b>`, parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback(`❌ Видалити`, `delcat_${c.id}`)]]) })
  }
  await ctx.reply('👆 Усі категорії.', Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]]))
})

bot.action(/^delcat_(\d+)$/, async (ctx: any) => {
  const catId = ctx.match[1];

  db.get('SELECT name FROM categories WHERE id = ?', [catId], (err: any, row: any) => {
    if (err || !row) return ctx.answerCbQuery('❌ Помилка: категорію не знайдено').catch(() => {});
    
    const catName = row.name;

    db.run('DELETE FROM products WHERE category = ?', [catName], (err: any) => {
      if (err) console.error('Помилка видалення товарів:', err);
      
      db.run('DELETE FROM categories WHERE id = ?', [catId], async (err: any) => {
        if (!err) { 
          await ctx.answerCbQuery('✅ Категорію та її товари видалено!').catch(() => {}); 
          await ctx.editMessageCaption(`❌ <i>Категорію та всі її товари видалено.</i>`, { parse_mode: 'HTML' }).catch(() => {}) 
        }
      });
    });
  });
})

bot.action('menu_cats_list', async (ctx: any) => {
  await ctx.answerCbQuery().catch(() => {})
  const categories = await getCategories()
  if (categories.length === 0) return ctx.editMessageText('Категорій немає.', Markup.inlineKeyboard([[Markup.button.callback('🔙 Назад', 'admin_home')]]))
  const buttons = categories.map(c => [Markup.button.callback(`📁 ${getUaName(c.name)}`, `view_cat_${c.id}`)])
  buttons.push([Markup.button.callback('🔙 Головне меню', 'admin_home')])
  await ctx.editMessageText('📂 <b>Обери категорію:</b>', { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) })
})

bot.action(/^view_cat_(\d+)$/, async (ctx: any) => {
  await ctx.answerCbQuery().catch(() => {})
  const cats = await getCategories()
  const selected = cats.find(c => c.id === Number(ctx.match[1]))
  if (!selected) return
  const products = await getProductsByCategory(selected.name)
  if (products.length === 0) return ctx.reply(`📦 Порожньо.`, { ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Назад', 'menu_cats_list')]]) })
  
  await ctx.reply(`📦 Завантажую товари з <b>${getUaName(selected.name)}</b>...`, { parse_mode: 'HTML' })
  for (const p of products) {
    const isAvail = p.is_available !== 0
    const statusText = isAvail ? '🟢 В наявності' : '🔴 Немає в наявності'
    const toggleBtnText = isAvail ? '🚫 Позначити: Немає' : '✅ Позначити: В наявності'

    await ctx.replyWithPhoto(p.image, {
      caption: `🌸 <b>${getUaName(p.name)}</b>\n💵 Ціна: ${p.price} Kč\n📦 Статус: <b>${statusText}</b>`, parse_mode: 'HTML',
      ...Markup.inlineKeyboard([
        [Markup.button.callback(toggleBtnText, `toggle_avail_${p.id}`)],
        [Markup.button.callback('✏️ Редагувати', `edit_product_${p.id}`), Markup.button.callback('❌ Видалити', `delete_product_${p.id}`)]
      ])
    })
  }
  await ctx.reply('👆 Усі товари категорії.', Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]]))
})

bot.action('menu_addons_list', async (ctx: any) => {
  await ctx.answerCbQuery().catch(() => {})
  const addons = await getAddons()
  if (addons.length === 0) return ctx.editMessageText('🎁 Додатків немає.', Markup.inlineKeyboard([[Markup.button.callback('🔙 Назад', 'admin_home')]]))
  await ctx.deleteMessage().catch(() => {})
  for (const a of addons) {
    await ctx.replyWithPhoto(a.image, {
      caption: `🎁 <b>${getUaName(a.name)}</b>\n💵 Ціна: ${a.price} Kč`, parse_mode: 'HTML',
      ...Markup.inlineKeyboard([[Markup.button.callback('✏️ Редагувати', `edit_addon_${a.id}`), Markup.button.callback('❌ Видалити', `delete_addon_${a.id}`)]])
    })
  }
  await ctx.reply('👆 Усі додатки.', Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]]))
})

bot.action('menu_banners_list', async (ctx: any) => {
  await ctx.answerCbQuery().catch(() => {})
  const banners = await getBanners()
  if (banners.length === 0) return ctx.editMessageText('🖼 Банерів немає.', Markup.inlineKeyboard([[Markup.button.callback('🔙 Назад', 'admin_home')]]))
  await ctx.deleteMessage().catch(() => {})
  for (const b of banners) {
    await ctx.replyWithPhoto(b.image, {
      caption: `📌 <b>${getUaName(b.title)}</b>`, parse_mode: 'HTML',
      ...Markup.inlineKeyboard([[Markup.button.callback('✏️ Редагувати', `edit_banner_${b.id}`), Markup.button.callback('❌ Видалити', `delete_banner_${b.id}`)]])
    })
  }
  await ctx.reply('👆 Усі банери.', Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]]))
})

bot.action(/^edit_(product|addon|banner)_(\d+)$/, async (ctx: any) => {
  const type = ctx.match[1], id = ctx.match[2]
  await ctx.answerCbQuery().catch(() => {})
  const buttons = type === 'banner' ? [[Markup.button.callback('Заголовок', `set_edit_${type}_${id}_title`)]] : [[Markup.button.callback('Назву', `set_edit_${type}_${id}_name`), Markup.button.callback('Ціну', `set_edit_${type}_${id}_price`)]]
  if (type === 'product') buttons.push([Markup.button.callback('Категорію', `set_edit_${type}_${id}_category`)])
  buttons.push([Markup.button.callback('Фотографію', `set_edit_${type}_${id}_image`)], [Markup.button.callback('🔙 Скасувати', 'admin_home')])
  await ctx.reply(`Що змінюємо?`, Markup.inlineKeyboard(buttons))
})

bot.action(/^set_edit_(product|addon|banner)_(\d+)_(.+)$/, async (ctx: any) => {
  const type = ctx.match[1], id = Number(ctx.match[2]), field = ctx.match[3]
  await ctx.answerCbQuery().catch(() => {})
  ctx.session ??= {}; ctx.session.editState = { type, id, field }
  if (field === 'name' || field === 'title') await ctx.reply('✍️ Введи новий текст (на будь-якій мові):')
  if (field === 'price') await ctx.reply('💵 Введи нову ЦІНУ (цифри):')
  if (field === 'image') await ctx.reply('🖼 Надішли нову ФОТОГРАФІЮ:')
  if (field === 'category' && type === 'product') {
    const cats = await getCategories()
    const buttons = cats.map(c => [Markup.button.callback(`📁 ${getUaName(c.name)}`, `save_edit_cat_${id}_${c.id}`)])
    await ctx.reply('📂 Вибери нову КАТЕГОРІЮ:', Markup.inlineKeyboard(buttons))
  }
})

bot.action(/^save_edit_cat_(\d+)_(.+)$/, async (ctx: any) => {
  const id = Number(ctx.match[1]), catId = Number(ctx.match[2])
  const cats = await getCategories(); const selected = cats.find(c => c.id === catId);
  if (selected) {
    await updateItemField('products', id, 'category', selected.name)
    await ctx.answerCbQuery('Оновлено!').catch(() => {}); await ctx.editMessageText(`✅ Категорію змінено на <b>${getUaName(selected.name)}</b>.`, { parse_mode: 'HTML' })
  }
  ctx.session.editState = null
})

bot.action(/^delete_(product|addon|banner)_(\d+)$/, async (ctx: any) => {
  const table = ctx.match[1] === 'product' ? 'products' : ctx.match[1] === 'addon' ? 'addons' : 'banners'
  db.run(`DELETE FROM ${table} WHERE id = ?`, [ctx.match[2]], async (err) => {
    if (!err) { await ctx.answerCbQuery('✅ Видалено!').catch(() => {}); await ctx.editMessageCaption(`❌ <i>Видалено.</i>`, { parse_mode: 'HTML' }).catch(() => {}) }
  })
})

bot.action(/^toggle_avail_(\d+)$/, async (ctx: any) => {
  const prodId = Number(ctx.match[1])
  db.get('SELECT * FROM products WHERE id = ?', [prodId], async (err: any, p: any) => {
    if (err || !p) return ctx.answerCbQuery('❌ Товар не знайдено').catch(() => {})
    
    const currentAvail = p.is_available !== 0
    const newAvail = currentAvail ? 0 : 1

    await updateItemField('products', prodId, 'is_available', newAvail)
    await ctx.answerCbQuery(newAvail ? '✅ Товар знову в наявності!' : '🚫 Позначено як «Немає в наявності»').catch(() => {})

    const statusText = newAvail ? '🟢 В наявності' : '🔴 Немає в наявності'
    const toggleBtnText = newAvail ? '🚫 Позначити: Немає' : '✅ Позначити: В наявності'

    await ctx.editMessageCaption(
      `🌸 <b>${getUaName(p.name)}</b>\n💵 Ціна: ${p.price} Kč\n📦 Статус: <b>${statusText}</b>`,
      {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.callback(toggleBtnText, `toggle_avail_${p.id}`)],
          [Markup.button.callback('✏️ Редагувати', `edit_product_${p.id}`), Markup.button.callback('❌ Видалити', `delete_product_${p.id}`)]
        ])
      }
    ).catch(() => {})
  })
})

bot.on('text', async (ctx: any) => {
  if (ctx.message.text.trim().startsWith('/')) return
  if (ctx.session?.editState) {
    const { type, id, field } = ctx.session.editState

    if (type === 'invoice_check') {
      const queryText = ctx.message.text.trim().toUpperCase()
      db.get(
        'SELECT * FROM invoices WHERE invoice_number = ? OR verification_hash = ?',
        [queryText, queryText],
        async (err: any, inv: any) => {
          ctx.session.editState = null
          if (err || !inv) {
            return ctx.reply(
              '🚨 <b>УВАГА! Фактуру не знайдено в базі даних!</b>\nМожливо, це підробка або помилка в номері.',
              { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]]) }
            )
          }

          const items = JSON.parse(inv.items_json || '[]')
          const itemsStr = items.map((i: any) => `• ${i.name} (${i.quantity} шт. — ${i.price * i.quantity} Kč)`).join('\n')
          const statusBadge =
            inv.payment_status === 'paid'
              ? '🟢 <b>ОПЛАЧЕНО (Stripe)</b>'
              : inv.payment_status === 'pending_cash'
              ? '🟡 <b>Оплата готівкою при отриманні</b>'
              : '🔴 <b>НЕ ОПЛАЧЕНО (замовлення створено, але платіж не завершено)</b>'

          const replyText =
            `✅ <b>ОРИГІНАЛЬНА ФАКТУРА ПІДТВЕРДЖЕНА</b>\n\n` +
            `🧾 Номер: <code>${inv.invoice_number}</code>\n` +
            `🔐 Код: <code>${inv.verification_hash}</code>\n` +
            `💳 Статус: ${statusBadge}\n` +
            `💰 Сума: <b>${inv.total_price} Kč</b> (доставка: ${inv.delivery_cost} Kč)\n\n` +
            `👤 Клієнт: ${inv.client_name}\n` +
            `📞 Телефон: ${inv.client_phone}\n` +
            `📧 Email: ${inv.client_email || '—'}\n` +
            `📅 Дата: ${inv.created_at}\n\n` +
            `🛍 <b>Склад замовлення:</b>\n${itemsStr}`

          return ctx.reply(replyText, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]]),
          })
        }
      )
      return
    }

    if (type === 'settings' && field === 'closed_message') {
      await ctx.reply('⏳ Перекладаю текст заглушки на 4 мови...')
      const translated = await translateToAll(ctx.message.text.trim())
      await setSetting('closed_message', translated)
      ctx.session.editState = null
      return ctx.reply('✅ Текст заглушки оновлено!', Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]]))
    }

    const table = type === 'product' ? 'products' : type === 'addon' ? 'addons' : 'banners'
    if (field === 'price' && isNaN(Number(ctx.message.text))) return ctx.reply('❌ Ціна має бути числом.')
    
    let value = ctx.message.text.trim();
    if (field === 'price') {
      value = Number(value);
    } else if (field === 'name' || field === 'title') {
      await ctx.reply('⏳ Перекладаю назву...');
      value = await translateToAll(value);
    }
    
    await updateItemField(table, id, field, value)
    ctx.session.editState = null
    await ctx.reply(`✅ Успішно оновлено!`, Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]]))
  }
})

bot.on('photo', async (ctx: any) => {
  if (ctx.session?.editState && ctx.session.editState.field === 'image') {
    const { type, id } = ctx.session.editState
    const table = type === 'product' ? 'products' : type === 'addon' ? 'addons' : 'banners'
    await updateItemField(table, id, 'image', ctx.message.photo.pop().file_id)
    ctx.session.editState = null
    await ctx.reply('✅ Фотографію оновлено!', Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]]))
  }
})

db.run("DELETE FROM products WHERE category NOT IN (SELECT name FROM categories)", (err) => {
  if (!err) console.log("🧹 Старі квіти без категорій успішно видалено!");
});

bot.catch((err: any, ctx: any) => {
  console.error(`⚠️ Помилка Telegraf для ${ctx.updateType}:`, err.message || err);
});

export const launchBot = () => { bot.launch(); console.log('👑 Адмін-панель (Автопереклад) запущена!') }
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))