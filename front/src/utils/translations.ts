export type Language = 'ua' | 'cz' | 'en' | 'ru'

export const translations = {
  ua: {
    // Header & Navigation
    cart: 'Кошик',
    categories: 'Категорії',
    catalog: 'Каталог',
    about: 'Про нас',
    faq: 'Часті запитання (FAQ)',
    contacts: 'Контакти',

    // Hero Promo Banner
    heroTitle: 'Французькі троянди бокс',
    heroSub: 'Можлива анонімна доставка. Надсилаємо фото готового букета перед відправкою.',
    heroBtn: 'Перейти до каталогу',

    // Delivery Notice Banner
    deliveryBannerTitle1: 'ДОСТАВКА КВІТІВ У',
    deliveryBannerTitle2: ' ПРАЗІ ТА ЧЕХІЇ',
    deliveryBannerText: 'Доставка по Празі вираховується по кілометражу:',
    deliveryTier1: '1-2 км - 100 крон',
    deliveryTier2: '2-6 км - 200 крон',
    deliveryTier3: '6-9 км - 300 крон',
    deliveryTier4: '10-16 км - 400 крон',
    deliverySchedule: 'Графік доставки 10:30 - 20:00',

    // Categories Section
    catWedding: 'ВЕСІЛЬНІ БУКЕТИ',
    catRoses: 'ТРОЯНДИ',
    catBoxes: 'БОКСИ',
    catHydrangeas: 'ГОРТЕНЗІЇ',
    prepayNotice: 'Бокси, корзини та французькі троянди лише по предоплаті',

    // Catalog & Filters
    catalogSubtitle: 'Колекції, створені вражати',
    catalogDesc: 'Від ніжних авторських композицій до унікальних боксів. Обирайте настрій для вашої особливої події.',
    from: 'Від',
    to: 'До',
    buy: 'Придбати',
    categoryLabel: 'Категорія',
    reset: 'Скинути',
    notFound: 'Товарів за вказаними критеріями не знайдено.',

    // Why Art Studio Section
    whyTitle: 'ЧОМУ ART STUDIO',
    whyHeartTitle: 'В самому серці Праги',
    whyHeartDesc: 'Ми створюємо букети та квіткові композиції для особливих моментів і просто для гарного настрою',
    whyFreshTitle: 'Завжди свіжі букети',
    whyFreshDesc:
      'Ми щодня працюємо зі свіжими квітами, ретельно обираючи їх за якістю, свіжістю та зовнішнім виглядом',
    whyVarietyTitle: 'Різноманітність',
    whyVarietyDesc:
      'У нашій студії ви знайдете букети, авторські композиції, квіткові коробки та кошики, весільні букети, гелієві кульки, плюшевих ведмедиків та подарунки.',
    whyEmotionsTitle: 'Акцент на емоціях',
    whyEmotionsDesc:
      'Для нас важливо, щоб кожен букет був не просто красивим, а передавав емоцію та увагу, яку ви хочете подарувати близькій людині.',

    // FAQ Section
    faqTitle: 'ЧАСТІ ЗАПИТАННЯ',
    faqQ1: 'У яких випадках букет може бути замінений?',
    faqA1: 'Якщо деяких квітів немає в наявності, ми узгоджуємо рівноцінну заміну з вами перед збіркою.',
    faqQ2: 'Чи обов’язково робити передоплату?',
    faqA2: 'Так, бокси, корзини та французькі троянди збираються виключно по передоплаті.',
    faqQ3: 'Який графік роботи вашої студії?',
    faqA3: 'Графік доставки та прийому замовлень: щодня з 10:30 до 20:00.',
    faqQ4: 'Скільки коштує доставка і що впливає на вартість?',
    faqA4: 'Вартість доставки по Празі розраховується за кілометражем (від 100 до 400 крон).',

    // Cart Page
    cartTitle: 'КОШИК',
    breadcrumbCart: 'Головна → Кошик',
    emptyCart: 'Ваш кошик порожній 🌸',
    subtotal: 'Сума',
    total: 'Разом',
    deliveryNotice: 'Вартість доставки залежить від адреси та способу отримання й уточнюється під час оформлення.',
    itemsCount: 'Товарів',
    totalSum: 'Сума',
    checkoutBtn: 'ОФОРМИТИ ЗАМОВЛЕННЯ',
    continueShopping: 'Продовжити покупки',
    popularAddons: 'ПОПУЛЯРНІ ДОДАТКИ',

    // Checkout Page
    checkoutTitle: 'ОФОРМЛЕННЯ ЗАМОВЛЕННЯ',
    breadcrumbCheckout: 'Головна → Кошик → Оформлення замовлення',
    step1: 'ДАНІ ЗАМОВЛЕННЯ',
    step2: 'ДОСТАВКА',
    step3: 'ОПЛАТА',
    namePlaceholder: "Ім'я",
    pickup: 'Самовивіз',
    deliveryPrague: 'Доставка по Празі',
    street: 'Вулиця',
    house: 'Будинок',
    entrance: "Під'їзд",
    deliveryTimeLabel: 'Час отримання:',
    recipientSelf: 'Я отримувач',
    recipientGift: 'В подарунок',
    payCard: 'Оплата картою',
    payCrypto: 'Оплата криптовалютою',
    payCash: 'Оплата при отриманні',
    orderComment: 'Коментар до замовлення',
    commentPlaceholder: 'Вкажіть побажання до замовлення...',
    submitOrder: 'Оформити замовлення',
    submitSuccess : "Замовлення успішно оформлено! Менеджер зв'яжеться з вами.",
    submitFault : "Сталася помилка при оформленні. Спробуйте пізніше.",

    // Footer
    footerDelivery: 'Доставка квітів',
  },
  cz: {
    // Header & Navigation
    cart: 'Košík',
    categories: 'Kategorie',
    catalog: 'Katalog',
    about: 'O nás',
    faq: 'Časté dotazy (FAQ)',
    contacts: 'Kontakty',

    // Hero Promo Banner
    heroTitle: 'Francouzské růže v boxu',
    heroSub: 'Možnost anonymního doručení. Před odesláním zasíláme foto hotové kytice.',
    heroBtn: 'Přejít do katalogu',

    // Delivery Notice Banner
    deliveryBannerTitle1: 'DORUČENÍ KVĚTIN V',
    deliveryBannerTitle2: 'PRAZE A ČESKU',
    deliveryBannerText: 'Doručení po Praze se počítá podle počtu kilometrů:',
    deliveryTier1: '1-2 km - 100 Kč',
    deliveryTier2: '2-6 km - 200 Kč',
    deliveryTier3: '6-9 km - 300 Kč',
    deliveryTier4: '10-16 km - 400 Kč',
    deliverySchedule: 'Doručovací doba 10:30 - 20:00',

    // Categories Section
    catWedding: 'SVATEBNÍ KYTICE',
    catRoses: 'RŮŽE',
    catBoxes: 'BOXY',
    catHydrangeas: 'HORZENZIE',
    prepayNotice: 'Boxy, koše a francouzské růže pouze na zálohu',

    // Catalog & Filters
    catalogSubtitle: 'Kolekce vytvořené tak, aby zaujaly',
    catalogDesc: 'Od jemných autorských kompozic až po unikátní boxy. Vyberte si náladu pro vaši zvláštní příležitost.',
    from: 'Od',
    to: 'Do',
    buy: 'Koupit',
    categoryLabel: 'Kategorie',
    reset: 'Obnovit',
    notFound: 'Nebyly nalezeny žádné produkty podle zadaných kritérií.',

    // Why Art Studio Section
    whyTitle: 'PROČ ART STUDIO',
    whyHeartTitle: 'V samém srdci Prahy',
    whyHeartDesc: 'Vytváříme kytice a květinová aranžmá pro zvláštní okamžiky i jen tak pro radost',
    whyFreshTitle: 'Vždy čerstvé kytice',
    whyFreshDesc: 'Denně pracujeme s čerstvými květinami a pečlivě je vybíráme podle kvality, čerstvosti a vzhledu',
    whyVarietyTitle: 'Různorodost',
    whyVarietyDesc:
      'V našem studiu najdete kytice, autorské kompozice, květinové boxy a koše, svatební kytice, héliové balónky, plyšové medvídky a dárky.',
    whyEmotionsTitle: 'Důraz na emoce',
    whyEmotionsDesc:
      'Je pro nás důležité, aby každá kytice byla nejen krásná, ale také předávala emoce a péči, kterou chcete darovat blízké osobě.',

    // FAQ Section
    faqTitle: 'ČASTÉ DOTAZY',
    faqQ1: 'V jakých případech může být kytice nahrazena?',
    faqA1: 'Pokud některé květiny nejsou skladem, před sestavením s vámi dohodneme rovnocennou náhradu.',
    faqQ2: 'Je nutné provést platbu předem?',
    faqA2: 'Ano, boxy, koše a francouzské růže se sestavují výhradně po zaplacení zálohy.',
    faqQ3: 'Jaká je otevírací doba vašeho studia?',
    faqA3: 'Doručování a příjem objednávek: denně od 10:30 do 20:00.',
    faqQ4: 'Kolik stojí doručení a co ovlivňuje cenu?',
    faqA4: 'Cena doručení po Praze se počítá podle kilometrů (od 100 do 400 Kč).',

    // Cart Page
    cartTitle: 'KOŠÍK',
    breadcrumbCart: 'Hlavní → Košík',
    emptyCart: 'Váš košík je prázdný 🌸',
    subtotal: 'Suma',
    total: 'Celkem',
    deliveryNotice: 'Cena doručení závisí na adrese a způsobu převzetí a bude upřesněna při objednávce.',
    itemsCount: 'Položek',
    totalSum: 'Suma',
    checkoutBtn: 'DOKONČIT OBJEDNÁVKU',
    continueShopping: 'Pokračovat v nákupu',
    popularAddons: 'OBLÍBENÉ DOPLŇKY',

    // Checkout Page
    checkoutTitle: 'DOKONČENÍ OBJEDNÁVKY',
    breadcrumbCheckout: 'Hlavní → Košík → Dokončení objednávky',
    step1: 'ÚDAJE OBJEDNÁVKY',
    step2: 'DORUČENÍ',
    step3: 'PLATBA',
    namePlaceholder: 'Jméno',
    pickup: 'Osobní odběr',
    deliveryPrague: 'Doručení po Praze',
    street: 'Ulice',
    house: 'Číslo popisné',
    entrance: 'Vchod',
    deliveryTimeLabel: 'Čas doručení:',
    recipientSelf: 'Jsem příjemce',
    recipientGift: 'Jako dárek',
    payCard: 'Platba kartou',
    payCrypto: 'Platba kryptoměnou',
    payCash: 'Platba při převzetí',
    orderComment: 'Poznámka k objednávce',
    commentPlaceholder: 'Uveďte přání k objednávce...',
    submitOrder: 'Odeslat objednávku',
    submitSuccess : "Objednávka byla úspěšně odeslána! Náš manažer vás bude kontaktovat.",
    submitFault : "Při odesílání objednávky došlo k chybě. Zkuste to prosím později.",
    // Footer
    footerDelivery: 'Rozvoz květin',
  },
  en: {
    // Header & Navigation
    cart: 'Cart',
    categories: 'Categories',
    catalog: 'Catalog',
    about: 'About Us',
    faq: 'FAQ',
    contacts: 'Contacts',

    // Hero Promo Banner
    heroTitle: 'French Roses Box',
    heroSub: 'Anonymous delivery available. We send a photo of the ready bouquet before shipping.',
    heroBtn: 'Go to catalog',

    deliveryBannerTitle1: 'FLOWER DELIVERY IN',
    deliveryBannerTitle2: 'PRAGUE AND CZECHIA',

    deliveryBannerText: 'Delivery in Prague is calculated by distance:',
    deliveryTier1: '1-2 km - 100 CZK',
    deliveryTier2: '2-6 km - 200 CZK',
    deliveryTier3: '6-9 km - 300 CZK',
    deliveryTier4: '10-16 km - 400 CZK',
    deliverySchedule: 'Delivery hours 10:30 - 20:00',

    // Categories Section
    catWedding: 'WEDDING BOUQUETS',
    catRoses: 'ROSES',
    catBoxes: 'BOXES',
    catHydrangeas: 'HYDRANGEAS',
    prepayNotice: 'Boxes, baskets and French roses require prepayment only',

    // Catalog & Filters
    catalogSubtitle: 'Collections created to impress',
    catalogDesc: 'From delicate author compositions to unique boxes. Choose the mood for your special occasion.',
    from: 'From',
    to: 'To',
    buy: 'Buy now',
    categoryLabel: 'Category',
    reset: 'Reset',
    notFound: 'No products found matching the criteria.',

    // Why Art Studio Section
    whyTitle: 'WHY ART STUDIO',
    whyHeartTitle: 'In the heart of Prague',
    whyHeartDesc: 'We create bouquets and floral arrangements for special moments and everyday joy',
    whyFreshTitle: 'Always fresh flowers',
    whyFreshDesc: 'We work daily with fresh flowers, carefully selecting them for quality, freshness, and appearance',
    whyVarietyTitle: 'Variety',
    whyVarietyDesc:
      'In our studio you will find bouquets, custom arrangements, flower boxes & baskets, wedding flowers, helium balloons, teddy bears, and gifts.',
    whyEmotionsTitle: 'Focus on emotions',
    whyEmotionsDesc:
      'It is important to us that every bouquet is not just beautiful, but conveys the emotion and care you wish to give your loved one.',

    // FAQ Section
    faqTitle: 'FREQUENTLY ASKED QUESTIONS',
    faqQ1: 'In what cases can a bouquet be substituted?',
    faqA1: 'If some flowers are out of stock, we agree on an equivalent replacement with you before assembly.',
    faqQ2: 'Is prepayment required?',
    faqA2: 'Yes, boxes, baskets and French roses are assembled exclusively upon prepayment.',
    faqQ3: 'What are your working hours?',
    faqA3: 'Delivery and order processing: daily from 10:30 to 20:00.',
    faqQ4: 'How much does delivery cost and what affects the price?',
    faqA4: 'Delivery cost in Prague is calculated by distance (from 100 to 400 CZK).',

    // Cart Page
    cartTitle: 'CART',
    breadcrumbCart: 'Home → Cart',
    emptyCart: 'Your cart is empty 🌸',
    subtotal: 'Subtotal',
    total: 'Total',
    deliveryNotice: 'Delivery cost depends on the address and method and will be specified during checkout.',
    itemsCount: 'Items',
    totalSum: 'Total',
    checkoutBtn: 'CHECKOUT',
    continueShopping: 'Continue shopping',
    popularAddons: 'POPULAR ADD-ONS',

    // Checkout Page
    checkoutTitle: 'CHECKOUT',
    breadcrumbCheckout: 'Home → Cart → Checkout',
    step1: 'ORDER DETAILS',
    step2: 'DELIVERY',
    step3: 'PAYMENT',
    namePlaceholder: 'Name',
    pickup: 'Pickup',
    deliveryPrague: 'Delivery in Prague',
    street: 'Street',
    house: 'Building',
    entrance: 'Entrance',
    deliveryTimeLabel: 'Delivery time:',
    recipientSelf: "I'm the recipient",
    recipientGift: 'As a gift',
    payCard: 'Card payment',
    payCrypto: 'Crypto payment',
    payCash: 'Cash on delivery',
    orderComment: 'Order comment',
    commentPlaceholder: 'Enter any special wishes...',
    submitOrder: 'Place Order',
    submitSuccess : "Your order has been placed successfully! Our manager will contact you.",
    submitFault : "An error occurred while placing your order. Please try again later.",
    // Footer
    footerDelivery: 'Flower Delivery',
  },
  ru: {
    // Header & Navigation
    cart: 'Корзина',
    categories: 'Категории',
    catalog: 'Каталог',
    about: 'О нас',
    faq: 'Частые вопросы (FAQ)',
    contacts: 'Контакты',

    // Hero Promo Banner
    heroTitle: 'Французские розы бокс',
    heroSub: 'Возможна анонимная доставка. Отправляй фото готового букета перед отправкой.',
    heroBtn: 'Перейти в каталог',

    // Delivery Notice Banner
    deliveryBannerTitle1: 'ДОСТАВКА ЦВЕТОВ В',
    deliveryBannerTitle2: 'ПРАГЕ И ЧЕХИИ',
    deliveryBannerText: 'Доставка по Праге рассчитывается по километражу:',
    deliveryTier1: '1-2 км - 100 крон',
    deliveryTier2: '2-6 км - 200 крон',
    deliveryTier3: '6-9 км - 300 крон',
    deliveryTier4: '10-16 км - 400 крон',
    deliverySchedule: 'График доставки 10:30 - 20:00',

    // Categories Section
    catWedding: 'СВАДЕБНЫЕ БУКЕТЫ',
    catRoses: 'РОЗЫ',
    catBoxes: 'БОКСЫ',
    catHydrangeas: 'ГОРТЕНЗИИ',
    prepayNotice: 'Боксы, корзины и французские розы только по предоплате',

    // Catalog & Filters
    catalogSubtitle: 'Коллекции, созданные впечатлять',
    catalogDesc:
      'От нежных авторских композиций до уникальных боксов. Выбирайте настроение для вашего особого события.',
    from: 'От',
    to: 'До',
    buy: 'Купить',
    categoryLabel: 'Категория',
    reset: 'Сбросить',
    notFound: 'Товаров по указанным критериям не найдено.',

    // Why Art Studio Section
    whyTitle: 'ПОЧЕМУ ART STUDIO',
    whyHeartTitle: 'В самом сердце Праги',
    whyHeartDesc: 'Мы создаем букеты и цветочные композиции для особых моментов и просто для хорошего настроения',
    whyFreshTitle: 'Всегда свежие букеты',
    whyFreshDesc:
      'Мы каждый день работаем со свежими цветами, тщательно выбирая их по качеству, свежести и внешнему виду',
    whyVarietyTitle: 'Разнообразие',
    whyVarietyDesc:
      'В нашей студии вы найдете букеты, авторские композиции, цветочные коробки и корзины, свадебные букеты, гелиевые шары, плюшевых мишек и подарки.',
    whyEmotionsTitle: 'Акцент на эмоциях',
    whyEmotionsDesc:
      'Для нас важно, чтобы каждый букет был не просто красивым, а передавал эмоцию и внимание, которое вы хотите подарить близкому человеку.',

    // FAQ Section
    faqTitle: 'ЧАСТЫЕ ВОПРОСЫ',
    faqQ1: 'В каких случаях букет может быть заменен?',
    faqA1: 'Если некоторых цветов нет в наличии, мы согласовываем равноценную замену с вами перед сборкой.',
    faqQ2: 'Обязательно ли делать предоплату?',
    faqA2: 'Да, боксы, корзины и французские розы собираются исключительно по предоплате.',
    faqQ3: 'Какой график работы вашей студии?',
    faqA3: 'График доставки и приема заказов: ежедневно с 10:30 до 20:00.',
    faqQ4: 'Сколько стоит доставка и что влияет на стоимость?',
    faqA4: 'Стоимость доставки по Праге рассчитывается по километражу (от 100 до 400 крон).',

    // Cart Page
    cartTitle: 'КОРЗИНА',
    breadcrumbCart: 'Главная → Корзина',
    emptyCart: 'Ваша корзина пуста 🌸',
    subtotal: 'Сумма',
    total: 'Итого',
    deliveryNotice: 'Стоимость доставки зависит от адреса и способа получения и уточняется при оформлении.',
    itemsCount: 'Товаров',
    totalSum: 'Сумма',
    checkoutBtn: 'ОФОРМИТЬ ЗАКАЗ',
    continueShopping: 'Продолжить покупки',
    popularAddons: 'ПОПУЛЯРНЫЕ ДОПОЛНЕНИЯ',

    // Checkout Page
    checkoutTitle: 'ОФОРМЛЕНИЕ ЗАКАЗА',
    breadcrumbCheckout: 'Главная → Корзина → Оформление заказа',
    step1: 'ДАННЫЕ ЗАКАЗА',
    step2: 'ДОСТАВКА',
    step3: 'ОПЛАТА',
    namePlaceholder: 'Имя',
    pickup: 'Самовывоз',
    deliveryPrague: 'Доставка по Праге',
    street: 'Улица',
    house: 'Дом',
    entrance: 'Подъезд',
    deliveryTimeLabel: 'Время получения:',
    recipientSelf: 'Я получатель',
    recipientGift: 'В подарок',
    payCard: 'Оплата картой',
    payCrypto: 'Оплата криптовалютой',
    payCash: 'Оплата при получении',
    orderComment: 'Комментарий к заказу',
    commentPlaceholder: 'Укажите пожелания к заказу...',
    submitOrder: 'Оформить заказ',
    submitSuccess : "Заказ успешно оформлен! Менеджер свяжется с вами.",
    submitFault : "Произошла ошибка при оформлении заказа. Попробуйте позже.",

    // Footer
    footerDelivery: 'Доставка цветов',
  },
}
