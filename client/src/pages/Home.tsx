import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  ArrowUpLeft,
  Bell,
  BookOpen,
  Bookmark,
  BrainCircuit,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Headphones,
  Heart,
  Home as HomeIcon,
  Library,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Tag,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";

// ─────────────────────────────────────────────────────────────────────────────
// Demo catalog — intentionally local so the prototype feels complete immediately
// ─────────────────────────────────────────────────────────────────────────────
type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  cover: string;
  coverStyle: string;
  badge?: string;
  format: string;
  description: string;
};

export const books: Book[] = [
  {
    id: "leadership",
    title: "القيادة الهادئة",
    author: "سارة المنيف",
    category: "تطوير الذات",
    price: 39,
    oldPrice: 59,
    rating: 4.8,
    reviews: 248,
    cover: "/manus-storage/cover-mockup_f846599f.jpg",
    coverStyle: "cover-coral",
    badge: "الأكثر مبيعًا",
    format: "إلكتروني + ورقي",
    description: "خريطة عملية لبناء تأثير حقيقي وقيادة الفرق بهدوء، وضوح، وثقة لا تحتاج إلى ضجيج.",
  },
  {
    id: "focus",
    title: "فن التركيز العميق",
    author: "ياسر العتيبي",
    category: "إنتاجية",
    price: 29,
    oldPrice: 42,
    rating: 4.7,
    reviews: 191,
    cover: "",
    coverStyle: "cover-navy",
    badge: "اختيار المحررين",
    format: "إلكتروني",
    description: "دليل بسيط وعميق لاستعادة انتباهك في عالم يتنافس كل يوم على وقتك.",
  },
  {
    id: "ai",
    title: "ما بعد الذكاء الاصطناعي",
    author: "لينا الخطيب",
    category: "تقنية",
    price: 44,
    oldPrice: 64,
    rating: 4.9,
    reviews: 312,
    cover: "",
    coverStyle: "cover-violet",
    badge: "جديد",
    format: "إلكتروني + ورقي",
    description: "قراءة إنسانية لما يتغير حولنا، وكيف نصمم مستقبلاً أذكى وأكثر عدلاً.",
  },
  {
    id: "room",
    title: "غرفة تطل على العالم",
    author: "نوف العبدالله",
    category: "روايات",
    price: 32,
    oldPrice: 45,
    rating: 4.6,
    reviews: 167,
    cover: "",
    coverStyle: "cover-teal",
    badge: "قريبًا",
    format: "ورقي",
    description: "رواية عن المدن التي نسكنها، والنسخ الصغيرة منّا التي نتركها خلفنا.",
  },
  {
    id: "economy",
    title: "اقتصاد الفكرة",
    author: "عمر الزهراني",
    category: "أعمال",
    price: 36,
    oldPrice: 50,
    rating: 4.5,
    reviews: 88,
    cover: "",
    coverStyle: "cover-gold",
    badge: "متوفر الآن",
    format: "إلكتروني + ورقي",
    description: "من شرارة صغيرة إلى مشروع واضح: كيف تختبر فكرتك وتبني لها سوقًا.",
  },
  {
    id: "mornings",
    title: "ملاحظات الصباح",
    author: "ريم حجازي",
    category: "حياة",
    price: 27,
    oldPrice: 34,
    rating: 4.8,
    reviews: 114,
    cover: "",
    coverStyle: "cover-pink",
    badge: "وصل حديثًا",
    format: "إلكتروني",
    description: "تأملات قصيرة للعيش ببطء، والنظر إلى الأشياء العادية بعين جديدة.",
  },
];

const categories = [
  { label: "الروايات", count: "1,240 كتاب", icon: BookOpen, color: "bg-coral-soft text-coral" },
  { label: "تطوير الذات", count: "842 كتاب", icon: Sparkles, color: "bg-violet-soft text-violet" },
  { label: "الأعمال", count: "679 كتاب", icon: BriefcaseBusiness, color: "bg-gold-soft text-gold" },
  { label: "التقنية والذكاء", count: "512 كتاب", icon: BrainCircuit, color: "bg-teal-soft text-teal" },
  { label: "التاريخ", count: "398 كتاب", icon: Clock3, color: "bg-navy-soft text-navy" },
  { label: "الأطفال", count: "276 كتاب", icon: Users, color: "bg-pink-soft text-pink" },
];

export const formatPrice = (price: number) => `${price.toLocaleString("ar-SA")} ر.س`;

// ─────────────────────────────────────────────────────────────────────────────
// Cart context and shared storefront shell
// ─────────────────────────────────────────────────────────────────────────────
type CartItem = Book & { quantity: number };
const CartProviderContext = createContext<{ cart: CartItem[]; add: (book: Book) => void; remove: (id: string) => void; clear: () => void } | null>(null);
let cartState: CartItem[] = [
  { ...books[1], quantity: 1 },
  { ...books[5], quantity: 1 },
];
const cartListeners = new Set<() => void>();
const cartApi = {
  get: () => cartState,
  add: (book: Book) => {
    const existing = cartState.find((item) => item.id === book.id);
    cartState = existing
      ? cartState.map((item) => (item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item))
      : [...cartState, { ...book, quantity: 1 }];
    cartListeners.forEach((listener) => listener());
  },
  remove: (id: string) => {
    cartState = cartState.filter((item) => item.id !== id);
    cartListeners.forEach((listener) => listener());
  },
  clear: () => {
    cartState = [];
    cartListeners.forEach((listener) => listener());
  },
};
function useCart() {
  const context = useContext(CartProviderContext);
  const [, render] = useState(0);
  useEffect(() => {
    const listener = () => render((value) => value + 1);
    cartListeners.add(listener);
    return () => { cartListeners.delete(listener); };
  }, []);
  return context || { cart: cartApi.get(), add: cartApi.add, remove: cartApi.remove, clear: cartApi.clear };
}

export function StorefrontShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const navItems = [
    ["الرئيسية", "/"], ["الكتب", "/books"], ["التصنيفات", "/books"], ["الأكثر مبيعًا", "/books?sort=bestsellers"],
    ["العروض", "/books?promo=true"], ["المؤلفون", "/authors"], ["المجلة", "/journal"],
  ];
  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (!search.trim()) return toast.info("اكتب عنوانًا أو مؤلفًا أو موضوعًا للبحث");
    window.location.href = `/books?search=${encodeURIComponent(search.trim())}`;
  };
  return (
    <CartProviderContext.Provider value={{ cart, add: cartApi.add, remove: cartApi.remove, clear: cartApi.clear }}>
      <div dir="rtl" className="min-h-screen bg-cream text-ink">
        <div className="announce-bar"><span className="announce-dot" /> شحن مجاني للطلبات فوق ١٥٠ ر.س <span className="announce-separator">·</span> خصم ١٥٪ على أول طلب <button onClick={() => toast.success("تم نسخ كود الخصم: READ15")}>استخدم READ15</button></div>
        <header className="site-header">
          <div className="container header-inner">
            <button className="mobile-menu" aria-label="فتح القائمة" onClick={() => setMobileOpen(!mobileOpen)}><Menu size={21} /></button>
            <Link href="/" className="brand" aria-label="كتابنا - الرئيسية"><span className="brand-mark"><BookOpen size={18} strokeWidth={2.5} /></span><span><strong>كتابنا</strong><small>رفّك القادم</small></span></Link>
            <nav className={`main-nav ${mobileOpen ? "is-open" : ""}`}>
              {navItems.map(([label, href]) => <Link key={label} href={href} onClick={() => setMobileOpen(false)} className={location === href ? "active" : ""}>{label}</Link>)}
            </nav>
            <form className="header-search" onSubmit={submitSearch}><Search size={17} /><Input aria-label="ابحث في كتابنا" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن كتاب، مؤلف، أو موضوع" /><kbd>⌘ K</kbd></form>
            <div className="header-actions">
              <button className="icon-button" aria-label="المفضلة" onClick={() => toast.info("سجّل دخولك لحفظ الكتب المفضلة")}><Heart size={19} /></button>
              <Link className="icon-button cart-icon" href="/cart" aria-label="سلة التسوق"><ShoppingBag size={19} /><span>{cartCount}</span></Link>
              <Link href="/account" className="account-link"><UserRound size={18} /><span>حسابي</span></Link>
              <button className="lang-button" onClick={() => toast.success("الواجهة العربية هي اللغة الحالية")}>EN</button>
            </div>
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="container footer-top">
            <div className="footer-brand"><Link href="/" className="brand"><span className="brand-mark"><BookOpen size={18} /></span><span><strong>كتابنا</strong><small>رفّك القادم</small></span></Link><p>نختار لك الكتب التي تستحق وقتك، وتصل إلى بابك أو شاشتك بكل حب.</p><div className="socials"><button onClick={() => toast.info("سنكون معك قريبًا على إنستغرام")} aria-label="Instagram">ig</button><button onClick={() => toast.info("سنكون معك قريبًا على X")} aria-label="X">𝕏</button><button onClick={() => toast.info("سنكون معك قريبًا على YouTube")} aria-label="YouTube">▶</button></div></div>
            <div><h4>اكتشف</h4><Link href="/books">كل الكتب</Link><Link href="/books?sort=bestsellers">الأكثر مبيعًا</Link><Link href="/authors">المؤلفون</Link><Link href="/journal">مجلة كتابنا</Link></div>
            <div><h4>المساعدة</h4><button onClick={() => toast.info("مركز المساعدة قيد الإعداد")}>الأسئلة الشائعة</button><button onClick={() => toast.info("تواصل معنا على hello@kitabna.sa")}>تواصل معنا</button><button onClick={() => toast.info("سياسة الاسترجاع متاحة عند الإطلاق")}>سياسة الاسترجاع</button><button onClick={() => toast.info("نحمي بياناتك دائمًا")}>الخصوصية</button></div>
            <div className="newsletter"><h4>رسائل تستحق القراءة</h4><p>ترشيحات أسبوعية، وإصدارات جديدة، وخصومات لا تفوتها.</p><form onSubmit={(e) => { e.preventDefault(); toast.success("تم اشتراكك في نشرة كتابنا"); }}><Input type="email" required placeholder="بريدك الإلكتروني" /><Button type="submit">اشترك</Button></form><small>بالاشتراك، أنت توافق على سياسة الخصوصية.</small></div>
          </div>
          <div className="container footer-bottom"><span>© ٢٠٢٦ كتابنا. صُنع لمن يحب القراءة.</span><span>دفع آمن · شحن موثوق · دعم إنساني</span></div>
        </footer>
      </div>
    </CartProviderContext.Provider>
  );
}

function SectionHeading({ eyebrow, title, action = "عرض الكل", href = "/books" }: { eyebrow?: string; title: string; action?: string; href?: string }) {
  return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div><Link href={href} className="text-link">{action}<ArrowLeft size={15} /></Link></div>;
}

function BookCover({ book, large = false }: { book: Book; large?: boolean }) {
  return <div className={`book-cover ${book.coverStyle} ${large ? "book-cover-large" : ""}`}>
    {book.cover && <img src={book.cover} alt="" className="cover-reference" />}
    <div className="cover-glow" /><div className="cover-copy"><span>{book.category}</span><strong>{book.title}</strong><small>{book.author}</small></div><span className="cover-spine" />
  </div>;
}

function Stars({ rating }: { rating: number }) { return <span className="stars" aria-label={`تقييم ${rating} من 5`}><Star size={13} fill="currentColor" /> <b>{rating}</b></span>; }

function BookCard({ book, ranking }: { book: Book; ranking?: number }) {
  const { add } = useCart();
  const [liked, setLiked] = useState(false);
  return <article className="book-card">
    {ranking && <span className="ranking">#{ranking}</span>}
    <div className="book-card-cover"><Link href={`/books/${book.id}`}><BookCover book={book} /></Link><span className="book-badge">{book.badge}</span><button className={`heart-float ${liked ? "liked" : ""}`} onClick={() => { setLiked(!liked); toast.success(liked ? "أزيل من المفضلة" : "أضيف إلى المفضلة"); }} aria-label="إضافة للمفضلة"><Heart size={16} fill={liked ? "currentColor" : "none"} /></button><div className="quick-actions"><button onClick={() => toast.info("المعاينة ستفتح في النسخة الكاملة")}>معاينة</button><button onClick={() => { add(book); toast.success("أضيف الكتاب إلى السلة"); }}>أضف للسلة</button></div></div>
    <div className="book-meta"><span className="book-category">{book.category}</span><Link href={`/books/${book.id}`}><h3>{book.title}</h3></Link><p>{book.author}</p><div className="book-rating"><Stars rating={book.rating} /><span>({book.reviews})</span></div><div className="price-row"><strong>{formatPrice(book.price)}</strong>{book.oldPrice && <del>{formatPrice(book.oldPrice)}</del>}<button className="add-mini" onClick={() => { add(book); toast.success("أضيف الكتاب إلى السلة"); }} aria-label="أضف للسلة"><Plus size={16} /></button></div></div>
  </article>;
}

export function Home() {
  const { add } = useCart();
  const [email, setEmail] = useState("");
  return <main>
    <section className="hero-section">
      <div className="hero-noise" /><div className="container hero-grid">
        <div className="hero-copy"><div className="hero-kicker"><span><Sparkles size={14} /> ترشيحات تشبهك</span><span className="kicker-line" /> <span className="kicker-muted">موسم القراءة ٢٠٢٦</span></div><h1>كتابك القادم<br /><em>ينتظرك هنا.</em></h1><p>في كتابنا، لا نبيع الكتب فقط. نساعدك أن تجد الفكرة التي تغيّر يومك، أو الحكاية التي تبقى معك طويلًا.</p><div className="hero-actions"><Link href="/books" className="primary-cta">تصفح الكتب <ArrowLeft size={18} /></Link><Link href="/books?sort=bestsellers" className="secondary-cta">اكتشف الأكثر مبيعًا <ChevronLeft size={17} /></Link></div><div className="hero-proof"><div className="avatar-stack"><span>ن</span><span>س</span><span>م</span><span>+</span></div><div><strong>+٢٥ ألف قارئ</strong><small>يعودون إلى كتابنا كل شهر</small></div></div></div>
        <div className="hero-art"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-note note-top"><Bookmark size={15} fill="currentColor" /> خذ وقتك</div><div className="hero-note note-bottom"><Star size={15} fill="currentColor" /> ٤.٩ / ٥ تقييم القراء</div><div className="floating-book book-back"><BookCover book={books[2]} /></div><div className="floating-book book-main"><BookCover book={books[0]} large /></div><div className="floating-book book-front"><BookCover book={books[5]} /></div><div className="hero-sticker"><span>اقرأ</span><strong>بهدوء</strong><ArrowUpLeft size={16} /></div></div>
      </div>
      <div className="hero-stats container"><div><strong>+١٢,٠٠٠</strong><span>عنوان مختار</span></div><div><strong>+٨٠٠</strong><span>مؤلف عربي</span></div><div><strong>٤٨ ساعة</strong><span>توصيل سريع</span></div><div><strong>رقمي وورقي</strong><span>بالطريقة التي تحب</span></div></div>
    </section>

    <section className="category-section container"><SectionHeading eyebrow="استكشف حسب مزاجك" title="ماذا تقرأ اليوم؟" action="كل التصنيفات" /><div className="category-grid">{categories.map(({ label, count, icon: Icon, color }) => <Link href={`/books?category=${encodeURIComponent(label)}`} className="category-card" key={label}><span className={`category-icon ${color}`}><Icon size={21} /></span><span><strong>{label}</strong><small>{count}</small></span><ArrowLeft size={16} /></Link>)}</div></section>

    <section className="featured-section container"><SectionHeading eyebrow="مختارات فريق كتابنا" title="كتب مختارة لك" /><div className="featured-layout"><div className="featured-pick"><div className="pick-top"><span className="pick-label">اختيار هذا الأسبوع</span><span>01 / 04</span></div><div className="pick-content"><BookCover book={books[0]} large /><div><span className="eyebrow">تطوير الذات · قيادة</span><h3>“القيادة ليست أن تكون الأعلى صوتًا، بل أن تجعل الآخرين يرون صوتهم.”</h3><p>قراءة هادئة وعملية لكل من يريد أن يقود دون أن يفقد إنسانيته.</p><Link href="/books/leadership" className="text-link">اقرأ عن الكتاب <ArrowLeft size={15} /></Link></div></div></div><div className="featured-list">{books.slice(1, 4).map((book) => <BookCard book={book} key={book.id} />)}</div></div></section>

    <section className="bestseller-section"><div className="container"><SectionHeading eyebrow="ما يقرأه الجميع الآن" title="الأكثر مبيعًا" action="ترتيب الكتب" /><div className="bestseller-grid">{books.slice(0, 3).map((book, index) => <BookCard key={book.id} book={book} ranking={index + 1} />)}</div></div></section>

    <section className="promo-section container"><div className="promo-card"><div className="promo-content"><span className="eyebrow">لفترة محدودة</span><h2>مساحتك الجديدة<br /><em>للقراءة تبدأ الآن.</em></h2><p>خصومات تصل إلى ٥٠٪ على عناوين مختارة، لأن الكتاب الجيد يستحق فرصة ثانية.</p><div className="countdown"><div><strong>٠٣</strong><span>يوم</span></div><i>:</i><div><strong>١٢</strong><span>ساعة</span></div><i>:</i><div><strong>٤٨</strong><span>دقيقة</span></div></div><Link href="/books?promo=true" className="light-cta">اكتشف العروض <ArrowLeft size={17} /></Link></div><div className="promo-art"><div className="promo-sun" /><BookCover book={books[3]} /><BookCover book={books[4]} /><BookCover book={books[5]} /></div><span className="promo-corner">خصم<br /><strong>٥٠٪</strong></span></div></section>

    <section className="new-section container"><SectionHeading eyebrow="وصل حديثًا إلى الرف" title="كتب جديدة، أفكار جديدة" action="كل الإصدارات" /><div className="new-grid">{books.slice(3).map((book) => <BookCard book={book} key={book.id} />)}</div></section>

    <section className="assistant-banner container"><div className="assistant-icon"><BrainCircuit size={30} /></div><div><span className="eyebrow">لا تعرف من أين تبدأ؟</span><h2>دع كتابنا يقرأ ذوقك.</h2><p>مساعدنا الذكي يقترح لك كتابًا يشبه فضولك، لا مجرد الأكثر مبيعًا.</p></div><Link href="/assistant" className="assistant-cta">جرّب مساعد الكتب <ArrowLeft size={17} /></Link><div className="assistant-decoration">Aa</div></section>

    <section className="journal-section container"><SectionHeading eyebrow="من مجلة كتابنا" title="أفكار خارج الصفحات" action="اقرأ المجلة" href="/journal" /><div className="journal-grid"><Link href="/journal" className="journal-feature"><div className="journal-image image-bookshelf"><img src="/manus-storage/book-studio_58dcdd9d.png" alt="كتب ملوّنة على طاولة" /></div><div><span className="eyebrow">دليل القراءة</span><h3>كيف تبني عادة قراءة لا تحتاج إلى قوة إرادة؟</h3><p>ثلاثة مفاتيح صغيرة تجعل القراءة جزءًا طبيعيًا من يومك.</p><small>منذ ٦ دقائق · بقلم فريق كتابنا</small></div></Link><div className="journal-side"><Link href="/journal"><span>مراجعة كتاب</span><h3>“ما بعد الذكاء الاصطناعي”؛ كتاب يطرح الأسئلة الصحيحة</h3><small>منذ ١٢ دقيقة</small></Link><Link href="/journal"><span>ترشيحات</span><h3>٥ كتب تأخذها معك في إجازة قصيرة</h3><small>منذ يومين</small></Link></div></div></section>

    <section className="newsletter-section"><div className="container newsletter-inner"><div><span className="eyebrow">صندوق الوارد، ولكن أجمل</span><h2>رسالة واحدة كل أسبوع.<br /><em>تستحق أن تُفتح.</em></h2></div><form onSubmit={(e) => { e.preventDefault(); if (email) toast.success("تم اشتراكك — سنرسل لك أول ترشيح قريبًا"); }}><p>ترشيحات كتب، قصص مؤلفين، وأفكار صغيرة للحياة الكبيرة.</p><div><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="اكتب بريدك الإلكتروني" /><Button type="submit">اشترك الآن</Button></div><small>لا رسائل مزعجة. يمكنك إلغاء الاشتراك متى شئت.</small></form></div></section>
  </main>;
}

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <section className="page-intro"><div className="container"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div></section>; }

export function BooksPage() {
  const [search] = useState(() => new URLSearchParams(window.location.search).get("search") || "");
  const [category, setCategory] = useState("الكل");
  const [view, setView] = useState<"grid" | "list">("grid");
  const filtered = useMemo(() => books.filter((book) => (category === "الكل" || book.category.includes(category)) && (!search || `${book.title} ${book.author} ${book.category}`.includes(search))), [category, search]);
  return <main><PageIntro eyebrow="المكتبة المفتوحة" title="كل الكتب التي تستحق وقتك" description="رفوف مرتبة بعناية، من الرواية التي تسهر معها إلى الفكرة التي تغيّر طريقة عملك." /><section className="container shop-section"><div className="shop-toolbar"><div className="shop-search"><Search size={17} /><Input defaultValue={search} placeholder="ابحث في العناوين والمؤلفين..." onKeyDown={(e) => { if (e.key === "Enter") window.location.href = `/books?search=${encodeURIComponent(e.currentTarget.value)}`; }} /></div><div className="toolbar-actions"><button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} aria-label="عرض شبكي">▦</button><button className={view === "list" ? "active" : ""} onClick={() => setView("list")} aria-label="عرض قائمة">☷</button><select aria-label="ترتيب"><option>الأكثر مبيعًا</option><option>الأحدث</option><option>السعر من الأقل</option><option>الأعلى تقييمًا</option></select></div></div><div className="shop-body"><aside className="filter-panel"><div className="filter-title"><strong>تصفية النتائج</strong><button onClick={() => setCategory("الكل")}>مسح الكل</button></div><div className="filter-group"><span>التصنيف</span>{["الكل", "تطوير الذات", "روايات", "تقنية", "أعمال", "حياة"].map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}><span className="check-dot">{category === item && <Check size={11} />}</span>{item}<small>{item === "الكل" ? "٢,٤٨٠" : "٣٤٢"}</small></button>)}</div><div className="filter-group"><span>نوع الكتاب</span><button><span className="check-box" />كتاب إلكتروني<small>١,٨٩٠</small></button><button><span className="check-box" />نسخة ورقية<small>١,١٢٠</small></button></div><div className="filter-group"><span>السعر</span><div className="range-line"><span /><span /></div><div className="range-values"><small>٠ ر.س</small><small>١٥٠ ر.س</small></div></div><div className="filter-note"><Tag size={16} /><span>استخدم كود <strong>READ15</strong> عند الدفع للحصول على خصم ١٥٪</span></div></aside><div className={`books-results ${view === "list" ? "list-view" : ""}`}><div className="results-head"><span>عرض {filtered.length * 56} من ٢,٤٨٠ كتاب</span><span className="results-note"><Check size={14} /> شحن مجاني فوق ١٥٠ ر.س</span></div><div className="book-results-grid">{filtered.length ? filtered.map((book) => <BookCard key={book.id} book={book} />) : <div className="empty-state"><Search size={30} /><h3>لم نجد هذا الكتاب بعد</h3><p>جرّب كلمة أخرى أو تصفح كل رفوفنا.</p><Link href="/books">عرض كل الكتب</Link></div>}</div></div></div></section></main>;
}

export function BookPage() {
  const [, params] = useRoute("/books/:id");
  const book = books.find((item) => item.id === params?.id) || books[0];
  const { add } = useCart();
  const [format, setFormat] = useState("إلكتروني");
  const [quantity, setQuantity] = useState(1);
  const [sampleOpen, setSampleOpen] = useState(false);
  const buy = () => { for (let i = 0; i < quantity; i++) add(book); toast.success("تمت إضافة الكتاب إلى السلة"); };
  return <main><div className="container breadcrumbs"><Link href="/">الرئيسية</Link><ChevronLeft size={14} /><Link href="/books">الكتب</Link><ChevronLeft size={14} /><span>{book.title}</span></div><section className="container product-detail"><div className="product-cover-stage"><span className="product-save">{book.badge}</span><BookCover book={book} large /><div className="cover-thumbs"><button className="selected"><BookCover book={book} /></button><button onClick={() => toast.info("المعرض الكامل متاح في النسخة النهائية")}><div className="thumb-placeholder"><BookOpen size={19} /></div></button><button onClick={() => toast.info("المعرض الكامل متاح في النسخة النهائية")}><div className="thumb-placeholder"><Sparkles size={19} /></div></button></div></div><div className="product-copy"><span className="eyebrow">{book.category} · كتاب موصى به</span><h1>{book.title}</h1><p className="product-author">بقلم <a href="#author">{book.author}</a></p><div className="product-rating"><Stars rating={book.rating} /><span>{book.reviews} مراجعة من القراء</span></div><div className="product-description"><p>{book.description} هذا الكتاب يفتح لك مساحة عملية للتجربة، ويتركك مع أسئلة أفضل مما بدأت.</p></div><div className="format-picker"><span>اختر نسختك</span><div><button className={format === "إلكتروني" ? "selected" : ""} onClick={() => setFormat("إلكتروني")}><span>إلكتروني</span><small>يصل فورًا · PDF + EPUB</small><b>{formatPrice(book.price)}</b></button><button className={format === "ورقي" ? "selected" : ""} onClick={() => setFormat("ورقي")}><span>ورقي</span><small>شحن خلال ٢–٤ أيام</small><b>{formatPrice(book.price + 12)}</b></button></div></div><div className="purchase-row"><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={15} /></button><strong>{quantity}</strong><button onClick={() => setQuantity(quantity + 1)}><Plus size={15} /></button></div><Button className="add-to-cart" onClick={buy}>أضف إلى السلة <ShoppingBag size={17} /></Button><button className="save-product" onClick={() => toast.success("أضيف إلى قائمة الأمنيات")}><Heart size={19} /></button></div><button className="sample-button" onClick={() => setSampleOpen(true)}><BookOpen size={17} /> اقرأ عينة مجانية <ArrowLeft size={15} /></button><div className="product-facts"><span><Library size={17} /><small>الصفحات<strong>٢٢٤ صفحة</strong></small></span><span><Headphones size={17} /><small>اللغة<strong>العربية</strong></small></span><span><Tag size={17} /><small>ISBN<strong>978-603-000</strong></small></span></div></div></section><section className="container review-section"><SectionHeading eyebrow="ماذا قال القراء" title="تقييمات تضيء الطريق" action="كل التقييمات" /><div className="review-summary"><div className="big-rating"><strong>٤.٨</strong><Stars rating={4.8} /><span>من ٢٤٨ تقييم</span></div><div className="rating-bars">{[[5, 86], [4, 10], [3, 3], [2, 1], [1, 0]].map(([num, width]) => <div key={num}><span>{num}</span><div><i style={{ width: `${width}%` }} /></div><small>{width}%</small></div>)}</div><div className="review-quote"><MessageCircle size={20} /><p>“كتاب عملي دون أن يكون جافًا، إنساني دون أن يفقد وضوحه. عدت إليه أكثر من مرة.”</p><small>— هناء م. · قارئة موثقة</small></div></div></section><section className="container related-section"><SectionHeading eyebrow="قد يعجبك أيضًا" title="رفّ مشابه لذوقك" /><div className="new-grid">{books.slice(2, 6).map((item) => <BookCard book={item} key={item.id} />)}</div></section>{sampleOpen && <div className="modal-backdrop" onClick={() => setSampleOpen(false)}><div className="sample-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSampleOpen(false)}><X size={18} /></button><span className="eyebrow">عينة مجانية · الفصل الأول</span><h2>{book.title}</h2><p>“في كل مرة نحاول فيها أن نثبت أننا نعرف الطريق، ننسى أن أفضل القادة هم الذين يتركون مساحة كافية للطريق كي يفاجئهم.”</p><p>هذه العينة جزء صغير من الكتاب. اشترِ نسختك لتكمل القراءة، وتحصل على أدوات عملية يمكنك استخدامها من اليوم.</p><Button onClick={() => { setSampleOpen(false); buy(); }}>أكمل القراءة بالشراء <ArrowLeft size={16} /></Button></div></div>}</main>;
}

export function CartPage() {
  const { cart, remove, clear } = useCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <main><PageIntro eyebrow="خطوتك التالية" title="سلة القراءة" description="كتبك المختارة، جاهزة لتصل إليك." /><section className="container cart-section">{cart.length ? <><div className="cart-list">{cart.map((item) => <div className="cart-row" key={item.id}><BookCover book={item} /><div className="cart-row-copy"><span className="book-category">{item.category}</span><h3>{item.title}</h3><p>{item.author} · نسخة إلكترونية</p><button onClick={() => remove(item.id)}>إزالة من السلة</button></div><div className="cart-quantity"><button><Minus size={14} /></button><span>{item.quantity}</span><button><Plus size={14} /></button></div><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}<button className="clear-cart" onClick={clear}>إفراغ السلة</button></div><aside className="order-summary"><span className="eyebrow">ملخص الطلب</span><h2>جاهز للقراءة؟</h2><div><span>المجموع الفرعي</span><strong>{formatPrice(subtotal)}</strong></div><div><span>الخصم <small>READ15</small></span><strong className="discount">− {formatPrice(Math.round(subtotal * .15))}</strong></div><div className="summary-total"><span>الإجمالي</span><strong>{formatPrice(Math.round(subtotal * .85))}</strong></div><Button onClick={() => toast.success("الخطوة التالية: بيانات الشحن والدفع")}>إتمام الشراء <ArrowLeft size={16} /></Button><small className="secure-note"><Check size={13} /> دفع آمن · يمكنك القراءة فور إتمام الطلب</small></aside></> : <div className="empty-cart"><ShoppingBag size={34} /><h2>سلتك تنتظر كتابًا جميلًا</h2><p>أضف أول كتاب يعجبك، وسنحتفظ به هنا.</p><Link href="/books" className="primary-cta">تصفح الكتب <ArrowLeft size={16} /></Link></div>}</section></main>;
}

export function AssistantPage() {
  const [messages, setMessages] = useState([{ from: "bot", text: "أهلًا، أنا مساعد كتابنا. قل لي ما الذي يشغل فضولك اليوم؟" }]);
  const [input, setInput] = useState("");
  const suggestions = ["كتاب عن القيادة الهادئة", "أريد رواية قصيرة", "شيء يساعدني على التركيز"];
  const send = (text = input) => { if (!text.trim()) return; setMessages((items) => [...items, { from: "user", text }, { from: "bot", text: "فهمت عليك. بناءً على ذوقك، أرشح لك “القيادة الهادئة” و“فن التركيز العميق”. هل تفضّل قراءة عملية أم حكاية ملهمة؟" }]); setInput(""); };
  return <main><PageIntro eyebrow="رفيقك في الاختيار" title="مساعد الكتب الذكي" description="لا تحتاج أن تعرف اسم الكتاب. أخبرنا بما تريد أن تشعر أو تتعلم، وسنبدأ من هناك." /><section className="container assistant-page"><div className="assistant-chat"><div className="chat-head"><span className="assistant-icon"><BrainCircuit size={20} /></span><div><strong>مساعد كتابنا</strong><small><i /> متصل الآن</small></div><button onClick={() => setMessages([])} aria-label="مسح المحادثة"><X size={17} /></button></div><div className="chat-messages">{messages.map((message, index) => <div className={`message ${message.from}`} key={`${message.text}-${index}`}>{message.text}</div>)}</div><div className="quick-prompts">{suggestions.map((item) => <button key={item} onClick={() => send(item)}>{item}</button>)}</div><form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(); }}><Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="مثال: أريد كتابًا يطور مهارات القيادة" /><Button type="submit"><ArrowLeft size={17} /></Button></form></div><div className="assistant-aside"><span className="eyebrow">كيف يعمل؟</span><h2>اقتراحات تعرفك أكثر.</h2><div><span>١</span><p><strong>احكِ لنا</strong><small>عن فضولك، مستواك، ووقتك.</small></p></div><div><span>٢</span><p><strong>نضيّق الدائرة</strong><small>نمزج بين ذوقك ومراجعات القراء.</small></p></div><div><span>٣</span><p><strong>نقترح بصدق</strong><small>ثلاثة كتب فقط. لأن الاختيار الزائد مُتعب.</small></p></div></div></section></main>;
}

export function AuthorsPage() { return <main><PageIntro eyebrow="أصوات خلف الكتب" title="مؤلفون نعود إليهم" description="أشخاص يكتبون من قلب التجربة، ويتركون لنا نافذة أوسع على العالم." /><section className="container authors-grid">{["سارة المنيف", "ياسر العتيبي", "لينا الخطيب", "نوف العبدالله", "عمر الزهراني", "ريم حجازي"].map((name, index) => <article className="author-card" key={name}><div className={`author-avatar avatar-${index + 1}`}>{name.slice(0, 1)}</div><span className="eyebrow">كاتب {index % 2 ? "ومستشار" : "ومفكر"}</span><h3>{name}</h3><p>{index % 2 ? "يكتب عن العمل والحياة بإيقاع عملي وإنساني." : "تبحث في التفاصيل الصغيرة التي تصنع فرقًا كبيرًا."}</p><Link href={`/books?author=${encodeURIComponent(name)}`} className="text-link">تصفح كتبه <ArrowLeft size={15} /></Link></article>)}</section></main>; }

export function JournalPage() { return <main><PageIntro eyebrow="مجلة كتابنا" title="أفكار خارج الصفحات" description="مراجعات صادقة، ترشيحات موسمية، وحكايات من خلف الغلاف." /><section className="container journal-page-grid"><article className="journal-story-main"><div className="story-art"><BookOpen size={44} /></div><span className="eyebrow">دليل القراءة · ٦ دقائق</span><h2>كيف تبني عادة قراءة لا تحتاج إلى قوة إرادة؟</h2><p>السر ليس في قراءة المزيد، بل في جعل الكتاب أقرب إلى يدك من أي مشتت آخر.</p><button className="text-link" onClick={() => toast.success("المقال مفتوح للقراءة")}>اقرأ المقال <ArrowLeft size={15} /></button></article><div className="journal-story-list">{["“ما بعد الذكاء الاصطناعي”؛ كتاب يطرح الأسئلة الصحيحة", "٥ كتب تأخذها معك في إجازة قصيرة", "لماذا نحب إعادة قراءة الكتب القديمة؟", "دليل كتابنا لرفّ هادئ قبل النوم"].map((title, i) => <Link href="/journal" key={title}><span>0{i + 1}</span><div><small>{i % 2 ? "ترشيحات" : "مراجعة كتاب"} · منذ {i + 2} أيام</small><h3>{title}</h3></div><ArrowLeft size={16} /></Link>)}</div></section></main>; }

export function AboutPage() { return <main><PageIntro eyebrow="نحن كتابنا" title="نؤمن أن الكتاب الجيد يصل في وقته تمامًا" description="بدأنا من سؤال بسيط: كيف نجعل العثور على الكتاب المناسب أسهل، وأجمل، وأكثر إنسانية؟" /><section className="container about-page"><div className="about-big-quote">“نحن لا نرتب الكتب على الرفوف فقط، بل نرتب لك احتمالاتك القادمة.”</div><div className="about-columns"><div><span className="eyebrow">ما يهمنا</span><h2>الاختيار قبل الكثرة.</h2></div><div><p>كتابنا متجر كتب عربي مستقل، يجمع بين دقة الاختيار ومتعة الاكتشاف. نعمل مع ناشرين ومؤلفين محليين لنقدم كتبًا رقمية وورقية تستحق وقتك ومساحتك.</p><p>كل رف هنا له سبب. وكل ترشيح نضعه أمامك يمر على عين قارئ، لا على خوارزمية وحيدة.</p></div></div><div className="about-values"><div><Sparkles size={20} /><strong>اختيارات ذات معنى</strong><span>نختار أقل، ونختار أفضل.</span></div><div><Heart size={20} /><strong>تجربة إنسانية</strong><span>دعم حقيقي من قارئ إلى قارئ.</span></div><div><BookOpen size={20} /><strong>قراءة بلا حدود</strong><span>ورقي، رقمي، وبالطريقة التي تحب.</span></div></div></section></main>; }

export function AccountPage() { const { user } = useAuth(); return <main><PageIntro eyebrow="مساحتك الخاصة" title="أهلًا بك في رفّك" description="تابع قراءاتك، واحفظ ما تريد، واجعل كتابنا يعرفك أكثر." /><section className="container account-page"><aside className="account-nav"><div className="profile-mini"><div>{user?.name?.slice(0, 1) || "ق"}</div><span><strong>{user?.name || "قارئ كتابنا"}</strong><small>{user?.email || "أكمل ملفك الشخصي"}</small></span></div>{["نظرة عامة", "طلباتي", "مكتبتي الرقمية", "المفضلة", "العناوين المحفوظة", "الإعدادات"].map((item, i) => <button className={i === 0 ? "active" : ""} key={item}>{item}{i === 2 && <span>٢</span>}</button>)}</aside><div className="account-content"><div className="account-welcome"><div><span className="eyebrow">الأربعاء، ١٦ سبتمبر</span><h2>مساء القراءة، يا قارئ.</h2></div><Button variant="outline" onClick={() => toast.info("لا توجد إشعارات جديدة")}><Bell size={16} /> الإشعارات</Button></div><div className="account-stats"><div><Library size={19} /><strong>٢</strong><span>في مكتبتك الرقمية</span></div><div><Heart size={19} /><strong>٨</strong><span>في قائمة الأمنيات</span></div><div><Clock3 size={19} /><strong>٣</strong><span>قراءات قادمة</span></div></div><div className="account-reading"><div className="reading-head"><span className="eyebrow">أكمل من حيث توقفت</span><Link href="/books/focus" className="text-link">مكتبتي الرقمية <ArrowLeft size={15} /></Link></div><div className="reading-book"><BookCover book={books[1]} /><div><h3>{books[1].title}</h3><p>{books[1].author}</p><div className="progress-label"><span>الفصل الثالث من ١٠</span><strong>٣٢٪</strong></div><div className="progress-track"><i /></div><Link href="/books/focus" className="primary-cta">تابع القراءة <ArrowLeft size={15} /></Link></div></div></div></div></section></main>; }
