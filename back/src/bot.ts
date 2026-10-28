import { Telegraf, Scenes, session, Markup } from 'telegraf'
import dotenv from 'dotenv'
import db from './db.js'

dotenv.config()

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
if (!BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN не задано в .env')

// ==========================================
// МАГІЯ: АВТОМАТИЧНИЙ ПЕРЕКЛАДАЧ
// ==========================================
const translateText = async (text: string, targetLang: string) => {
  try {
    // Використовуємо відкритий безкоштовний ендпоінт Google Translate
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    // Google повертає масив, де перший елемент — це шматки перекладу
    return data[0].map((item: any) => item[0]).join('');
  } catch (error) {
    console.error('Помилка перекладу:', error);
    return text; // Якщо щось пішло не так, залишаємо оригінальний текст
  }
};

const translateToAll = async (text: string) => {
  // Код чеської в Google це 'cs', але для фронтенду ми зберігаємо як 'cz'
  const uk = await translateText(text, 'uk');
  const cz = await translateText(text, 'cs'); 
  const en = await translateText(text, 'en');
  return JSON.stringify({ uk, cz, en });
};

const getUaName = (str: string) => {
  try { return JSON.parse(str).uk; } catch { return str; }
}

// ==========================================
// 1. РОБОТА З БАЗОЮ ДАНИХ
// ==========================================
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
    ctx.scene.state = {}
    await ctx.reply('📁 <b>Крок 1/2.</b> Введи НАЗВУ категорії (на будь-якій мові, я сам перекладу):', { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('❌ Скасувати', 'admin_home')]]) })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (ctx.callbackQuery) { await ctx.answerCbQuery(); return ctx.scene.leave() }
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
    ctx.scene.state = {}
    await ctx.reply('🌸 <b>Крок 1/4.</b> Введи НАЗВУ товару (на будь-якій мові):', { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('❌ Скасувати', 'admin_home')]]) })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (ctx.callbackQuery) { await ctx.answerCbQuery(); return ctx.scene.leave() }
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
      await ctx.answerCbQuery()
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
    ctx.scene.state = {}
    await ctx.reply('🎁 <b>Крок 1/3.</b> Введи НАЗВУ додатку (на будь-якій мові):', { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('❌ Скасувати', 'admin_home')]]) })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (ctx.callbackQuery) { await ctx.answerCbQuery(); return ctx.scene.leave() }
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
    ctx.scene.state = {}
    await ctx.reply('🖼 <b>Крок 1/2.</b> Введи ЗАГОЛОВОК банера (на будь-якій мові):', { parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback('❌ Скасувати', 'admin_home')]]) })
    return ctx.wizard.next()
  },
  async (ctx: any) => {
    if (ctx.callbackQuery) { await ctx.answerCbQuery(); return ctx.scene.leave() }
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
  const text = '👑 <b>ПАНЕЛЬ УПРАВЛІННЯ</b>\n\nОберіть дію:'
  const keyboard = Markup.inlineKeyboard([
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

bot.action('admin_home', async (ctx: any) => { await ctx.answerCbQuery(); await sendAdminMenu(ctx) })
bot.action('add_cat_prompt', async (ctx: any) => { await ctx.answerCbQuery(); return ctx.scene.enter('add-category-scene') })
bot.action('menu_add_product', async (ctx: any) => { await ctx.answerCbQuery(); return ctx.scene.enter('add-product-scene') })
bot.action('menu_add_addon', async (ctx: any) => { await ctx.answerCbQuery(); return ctx.scene.enter('add-addon-scene') })
bot.action('menu_add_banner', async (ctx: any) => { await ctx.answerCbQuery(); return ctx.scene.enter('add-banner-scene') })

bot.action('menu_cats_manage', async (ctx: any) => {
  await ctx.answerCbQuery()
  const categories = await getCategories()
  if (categories.length === 0) return ctx.editMessageText('Поки немає категорій.', Markup.inlineKeyboard([[Markup.button.callback('🔙 Назад', 'admin_home')]]))
  await ctx.deleteMessage().catch(() => {})
  for (const c of categories) {
    await ctx.replyWithPhoto(c.image, { caption: `📁 <b>${getUaName(c.name)}</b>`, parse_mode: 'HTML', ...Markup.inlineKeyboard([[Markup.button.callback(`❌ Видалити`, `delcat_${c.id}`)]]) })
  }
  await ctx.reply('👆 Усі категорії.', Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]]))
})

bot.action(/^delcat_(\d+)$/, async (ctx: any) => {
  db.run('DELETE FROM categories WHERE id = ?', [ctx.match[1]], async (err) => {
    if (!err) { await ctx.answerCbQuery('✅ Видалено!'); await ctx.editMessageCaption(`❌ <i>Видалено.</i>`, { parse_mode: 'HTML' }).catch(() => {}) }
  })
})

bot.action('menu_cats_list', async (ctx: any) => {
  await ctx.answerCbQuery()
  const categories = await getCategories()
  if (categories.length === 0) return ctx.editMessageText('Категорій немає.', Markup.inlineKeyboard([[Markup.button.callback('🔙 Назад', 'admin_home')]]))
  const buttons = categories.map(c => [Markup.button.callback(`📁 ${getUaName(c.name)}`, `view_cat_${c.id}`)])
  buttons.push([Markup.button.callback('🔙 Головне меню', 'admin_home')])
  await ctx.editMessageText('📂 <b>Обери категорію:</b>', { parse_mode: 'HTML', ...Markup.inlineKeyboard(buttons) })
})

bot.action(/^view_cat_(\d+)$/, async (ctx: any) => {
  await ctx.answerCbQuery()
  const cats = await getCategories()
  const selected = cats.find(c => c.id === Number(ctx.match[1]))
  if (!selected) return
  const products = await getProductsByCategory(selected.name)
  if (products.length === 0) return ctx.reply(`📦 Порожньо.`, { ...Markup.inlineKeyboard([[Markup.button.callback('🔙 Назад', 'menu_cats_list')]]) })
  
  await ctx.reply(`📦 Завантажую товари з <b>${getUaName(selected.name)}</b>...`, { parse_mode: 'HTML' })
  for (const p of products) {
    await ctx.replyWithPhoto(p.image, {
      caption: `🌸 <b>${getUaName(p.name)}</b>\n💵 Ціна: ${p.price} Kč`, parse_mode: 'HTML',
      ...Markup.inlineKeyboard([[Markup.button.callback('✏️ Редагувати', `edit_product_${p.id}`), Markup.button.callback('❌ Видалити', `delete_product_${p.id}`)]])
    })
  }
  await ctx.reply('👆 Усі товари категорії.', Markup.inlineKeyboard([[Markup.button.callback('🔙 В меню', 'admin_home')]]))
})

bot.action('menu_addons_list', async (ctx: any) => {
  await ctx.answerCbQuery()
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
  await ctx.answerCbQuery()
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
  await ctx.answerCbQuery()
  const buttons = type === 'banner' ? [[Markup.button.callback('Заголовок', `set_edit_${type}_${id}_title`)]] : [[Markup.button.callback('Назву', `set_edit_${type}_${id}_name`), Markup.button.callback('Ціну', `set_edit_${type}_${id}_price`)]]
  if (type === 'product') buttons.push([Markup.button.callback('Категорію', `set_edit_${type}_${id}_category`)])
  buttons.push([Markup.button.callback('Фотографію', `set_edit_${type}_${id}_image`)], [Markup.button.callback('🔙 Скасувати', 'admin_home')])
  await ctx.reply(`Що змінюємо?`, Markup.inlineKeyboard(buttons))
})

bot.action(/^set_edit_(product|addon|banner)_(\d+)_(.+)$/, async (ctx: any) => {
  const type = ctx.match[1], id = Number(ctx.match[2]), field = ctx.match[3]
  await ctx.answerCbQuery()
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
    await ctx.answerCbQuery('Оновлено!'); await ctx.editMessageText(`✅ Категорію змінено на <b>${getUaName(selected.name)}</b>.`, { parse_mode: 'HTML' })
  }
  ctx.session.editState = null
})

bot.action(/^delete_(product|addon|banner)_(\d+)$/, async (ctx: any) => {
  const table = ctx.match[1] === 'product' ? 'products' : ctx.match[1] === 'addon' ? 'addons' : 'banners'
  db.run(`DELETE FROM ${table} WHERE id = ?`, [ctx.match[2]], async (err) => {
    if (!err) { await ctx.answerCbQuery('✅ Видалено!'); await ctx.editMessageCaption(`❌ <i>Видалено.</i>`, { parse_mode: 'HTML' }).catch(() => {}) }
  })
})

bot.on('text', async (ctx: any) => {
  if (ctx.message.text.trim().startsWith('/')) return
  if (ctx.session?.editState) {
    const { type, id, field } = ctx.session.editState
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

export const launchBot = () => { bot.launch(); console.log('👑 Адмін-панель (Автопереклад) запущена!') }
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))