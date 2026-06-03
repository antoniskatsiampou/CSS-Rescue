/* ============================================================
   CSS RESCUE — Level Definitions (v2.1)
   - readonlyHint: σχόλια πάνω από τον editor (μη-επεξεργάσιμα)
   - starterCSS: μόνο ο σκελετός (αυτό που γράφει ο χρήστης)
   ============================================================ */

const parseRGB = (v) => {
  const m = v && v.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return m ? { r: +m[1], g: +m[2], b: +m[3] } : null;
};
const isBlueish = (v) => { const c = parseRGB(v); return !!c && c.b > 120 && c.b > c.r && c.b >= c.g - 30; };
const isGreenish = (v) => { const c = parseRGB(v); return !!c && c.g > 110 && c.g > c.r && c.g > c.b - 30; };
const isLightText = (v) => { const c = parseRGB(v); return !!c && c.r + c.g + c.b > 600; };
const px = (v) => parseFloat(v) || 0;
const atLeast = (n) => (v) => px(v) >= n;

const LEVELS = [

  /* -------- LEVEL 1 — TUTORIAL -------- */
  {
    id: 1,
    title: "Επίπεδο 1: Welcome Banner",
    subtitle: "Tutorial — Χρώματα & Padding",
    penalty: 6,
    story: "Πρώτη μέρα στη δουλειά και ο Hacker χτύπησε! Το welcome banner της PixelMart εμφανίζεται γυμνό, χωρίς καθόλου styling. Δώσε του ζωή πριν φτάσει ο πρώτος πελάτης.",
    targetHTML: `
      <div class="banner">
        <h1>Καλώς ήρθες στην PixelMart!</h1>
        <p>Η μεγαλύτερη αγορά τεχνολογίας στην Ελλάδα</p>
      </div>`,
    baseStyles: `
      body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #f3f4f6; }
      .banner h1 { margin: 0 0 8px 0; }
      .banner p  { margin: 0; }`,
    readonlyHint: `/* Δώσε ζωή στο banner!
   - Μπλε χρώμα φόντου
   - Λευκό κείμενο
   - Κεντραρισμένο κείμενο
   - Padding 30px */`,
    starterCSS: `.banner {
  
}`,
    instructions: [
      "Δώσε στο <code>.banner</code> <b>μπλε</b> background-color",
      "Κάνε το <b>χρώμα του κειμένου λευκό</b>",
      "<b>Κεντράρισε</b> το κείμενο",
      "Πρόσθεσε <b>padding τουλάχιστον 20px</b>",
    ],
    hints: [
      "💡 <code>background-color</code> αλλάζει το χρώμα φόντου. Π.χ. <code>background-color: #2563eb;</code>",
      "💡 <code>color</code> αλλάζει χρώμα κειμένου. Δοκίμασε <code>color: white;</code>",
      "💡 <code>text-align: center;</code> κεντράρει κείμενο",
      "💡 <code>padding: 30px;</code> εσωτερικό κενό σε όλες τις πλευρές",
    ],
    checks: [
      { selector: ".banner", property: "background-color", test: isBlueish, msg: "Το <code>.banner</code> δεν έχει μπλε φόντο" },
      { selector: ".banner", property: "color", test: isLightText, msg: "Κείμενο → λευκό/ανοιχτόχρωμο" },
      { selector: ".banner", property: "text-align", test: (v) => v === "center", msg: "Κεντράρισε (<code>text-align: center</code>)" },
      { selector: ".banner", property: "padding-top", test: atLeast(20), msg: "Padding ≥ 20px" },
    ],
    solution: `.banner {
  background-color: #2563eb;
  color: white;
  text-align: center;
  padding: 30px;
}`,
    reward: { hint: 1 },
  },

  /* -------- LEVEL 2 — BUTTONS -------- */
  {
    id: 2,
    title: "Επίπεδο 2: Τα Κουμπιά της Συμφοράς",
    subtitle: "Backgrounds, Borders & Border-radius",
    penalty: 7,
    story: "Όλα τα κουμπιά «Αγορά» μοιάζουν με κουμπιά του 1995. Ο Hacker χτύπησε ξανά! Κάνε τα ελκυστικά.",
    targetHTML: `
      <div style="display:flex; gap:12px; flex-wrap:wrap;">
        <button class="btn">Αγορά Τώρα</button>
        <button class="btn">Προσθήκη στο Καλάθι</button>
        <button class="btn">Δες Λεπτομέρειες</button>
      </div>`,
    baseStyles: `body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #f3f4f6; }`,
    readonlyHint: `/* Φτιάξε όμορφο κουμπί!
   - Πράσινο φόντο
   - Λευκό κείμενο
   - Χωρίς border
   - Στρογγυλεμένες γωνίες
   - Άνετο padding
   - Δείκτης «χεράκι» στο hover */`,
    starterCSS: `.btn {

}`,
    instructions: [
      "Δώσε στο <code>.btn</code> <b>πράσινο</b> φόντο",
      "Κάνε το <b>κείμενο λευκό</b>",
      "<b>Αφαίρεσε</b> το border του κουμπιού",
      "Κάνε τις <b>γωνίες στρογγυλεμένες</b>",
      "Πρόσθεσε <b>padding</b> για να αναπνέει το κείμενο",
      "Κάνε τον <b>δείκτη να γίνεται χεράκι</b> όταν περνάς πάνω από το κουμπί",
    ],
    hints: [
      "💡 <code>border: none;</code> αφαιρεί border",
      "💡 <code>border-radius: 8px;</code> στρογγυλεμένες γωνίες",
      "💡 <code>padding: 12px 24px;</code>",
      "💡 <code>cursor: pointer;</code>",
    ],
    checks: [
      { selector: ".btn", property: "background-color", test: isGreenish, msg: "Πράσινο φόντο" },
      { selector: ".btn", property: "color", test: isLightText, msg: "Λευκό κείμενο" },
      { selector: ".btn", property: "border-top-width", test: (v) => px(v) === 0, msg: "<code>border: none</code>" },
      { selector: ".btn", property: "border-top-left-radius", test: atLeast(6), msg: "<code>border-radius</code> ≥ 6px" },
      { selector: ".btn", property: "padding-left", test: atLeast(15), msg: "Padding αριστερά-δεξιά" },
      { selector: ".btn", property: "cursor", test: (v) => v === "pointer", msg: "<code>cursor: pointer</code>" },
    ],
    solution: `.btn {
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
}`,
    reward: {},
  },

  /* -------- LEVEL 3 — FLEXBOX -------- */
  {
    id: 3,
    title: "Επίπεδο 3: Η Μάχη του Flexbox",
    subtitle: "Display: flex & gap",
    penalty: 8,
    story: "Τα προϊόντα εμφανίζονται το ένα κάτω από το άλλο! Πρέπει να μπουν δίπλα-δίπλα. Χρόνος για Flexbox!",
    targetHTML: `
      <div class="products">
        <div class="card">📱<br/>Smartphone<br/><b>299€</b></div>
        <div class="card">💻<br/>Laptop<br/><b>899€</b></div>
        <div class="card">🎧<br/>Headphones<br/><b>79€</b></div>
      </div>`,
    baseStyles: `
      body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #f3f4f6; }
      .card { background: white; padding: 16px; border-radius: 8px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,.08); font-size: 28px; flex: 1; }
      .card b { font-size: 16px; color: #2563eb; }`,
    readonlyHint: `/* Βάλε τις κάρτες σε μία γραμμή!
   - Όλες δίπλα-δίπλα (flexbox)
   - Με κενό ανάμεσά τους */`,
    starterCSS: `.products {

}`,
    instructions: [
      "Βάλε τις κάρτες <b>δίπλα-δίπλα σε μία γραμμή</b> (flexbox)",
      "Άφησε <b>κενό ανάμεσα στις κάρτες</b>",
    ],
    hints: [
      "💡 <code>display: flex;</code> τοποθετεί τα παιδιά σε γραμμή",
      "💡 <code>gap: 16px;</code> απόσταση μεταξύ flex items",
    ],
    checks: [
      { selector: ".products", property: "display", test: (v) => v === "flex" || v === "inline-flex", msg: "<code>display: flex</code>" },
      { selector: ".products", property: "gap", test: atLeast(12), msg: "<code>gap</code> ≥ 12px" },
    ],
    solution: `.products {
  display: flex;
  gap: 16px;
}`,
    reward: { antivirus: 1 },
  },

  /* -------- LEVEL 4 — NAVIGATION -------- */
  {
    id: 4,
    title: "Επίπεδο 4: Navigation Madness",
    subtitle: "Flex + list-style + text-decoration",
    penalty: 9,
    story: "Το menu πλοήγησης εμφανίζεται κάθετα, με κουκκίδες και υπογραμμίσεις. Κάν' το οριζόντιο!",
    targetHTML: `
      <nav class="nav">
        <ul class="nav-list">
          <li><a href="#" class="nav-link">Αρχική</a></li>
          <li><a href="#" class="nav-link">Προϊόντα</a></li>
          <li><a href="#" class="nav-link">Καλάθι</a></li>
          <li><a href="#" class="nav-link">Επικοινωνία</a></li>
        </ul>
      </nav>`,
    baseStyles: `
      body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: #1e293b; }
      .nav { background: #0f172a; padding: 16px 24px; }`,
    readonlyHint: `/* Φτιάξε οριζόντιο menu!
   .nav-list → οριζόντιο, χωρίς κουκκίδες, χωρίς περιθώρια, με κενό
   .nav-link → λευκά links, χωρίς υπογράμμιση */`,
    starterCSS: `.nav-list {

}

.nav-link {

}`,
    instructions: [
      "<code>.nav-list</code>: βάλε τα στοιχεία σε <b>οριζόντια σειρά</b>, με <b>κενό</b> ανάμεσα",
      "Αφαίρεσε τις <b>κουκκίδες</b> και τα προεπιλεγμένα <b>περιθώρια</b> της λίστας",
      "<code>.nav-link</code>: κάνε τα links <b>λευκά</b>, <b>χωρίς υπογράμμιση</b>",
    ],
    hints: [
      "💡 <code>list-style: none;</code> αφαιρεί κουκκίδες",
      "💡 <code>padding: 0; margin: 0;</code> καθαρίζει defaults",
      "💡 <code>text-decoration: none;</code> αφαιρεί υπογράμμιση",
      "💡 <code>display: flex; gap: 24px;</code>",
    ],
    checks: [
      { selector: ".nav-list", property: "display", test: (v) => v === "flex" || v === "inline-flex", msg: "flex" },
      { selector: ".nav-list", property: "list-style-type", test: (v) => v === "none", msg: "<code>list-style: none</code>" },
      { selector: ".nav-list", property: "padding-left", test: (v) => px(v) < 5, msg: "<code>padding: 0</code>" },
      { selector: ".nav-list", property: "gap", test: atLeast(16), msg: "gap ≥ 16px" },
      { selector: ".nav-link", property: "color", test: isLightText, msg: "Λευκά links" },
      { selector: ".nav-link", property: "text-decoration-line", test: (v) => v === "none" || !v, msg: "<code>text-decoration: none</code>" },
    ],
    solution: `.nav-list {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
  gap: 24px;
}

.nav-link {
  color: white;
  text-decoration: none;
}`,
    reward: { hint: 1 },
  },

  /* -------- LEVEL 5 — GRID -------- */
  {
    id: 5,
    title: "Επίπεδο 5: Grid Wars",
    subtitle: "CSS Grid Layout",
    penalty: 10,
    story: "6 προϊόντα πρέπει να εμφανίζονται σε πλέγμα 3 στηλών. Καιρός για CSS Grid!",
    targetHTML: `
      <div class="grid">
        <div class="product">📱<br/>299€</div>
        <div class="product">💻<br/>899€</div>
        <div class="product">🎧<br/>79€</div>
        <div class="product">⌚<br/>199€</div>
        <div class="product">📷<br/>549€</div>
        <div class="product">🖱️<br/>29€</div>
      </div>`,
    baseStyles: `
      body { font-family: system-ui, sans-serif; margin: 0; padding: 16px; background: #f3f4f6; }
      .product { background: white; padding: 24px; border-radius: 12px; text-align: center; font-size: 32px; box-shadow: 0 4px 10px rgba(0,0,0,.08); }`,
    readonlyHint: `/* Grid με 3 ίσες στήλες!
   - Πλέγμα (grid)
   - 3 ίσες στήλες
   - Με κενό ανάμεσα */`,
    starterCSS: `.grid {

}`,
    instructions: [
      "Εμφάνισε τα προϊόντα σε <b>πλέγμα (grid)</b>",
      "Όρισε <b>3 ίσες στήλες</b>",
      "Άφησε <b>κενό ανάμεσα στα προϊόντα</b>",
    ],
    hints: [
      "💡 <code>display: grid;</code>",
      "💡 <code>grid-template-columns: 1fr 1fr 1fr;</code>",
      "💡 Ή πιο σύντομα: <code>repeat(3, 1fr)</code>",
    ],
    checks: [
      { selector: ".grid", property: "display", test: (v) => v === "grid" || v === "inline-grid", msg: "<code>display: grid</code>" },
      { selector: ".grid", property: "grid-template-columns", test: (v) => v && v.split(" ").length === 3, msg: "Ακριβώς 3 στήλες" },
      { selector: ".grid", property: "gap", test: atLeast(16), msg: "gap ≥ 16px" },
    ],
    solution: `.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}`,
    reward: { antivirus: 1 },
  },

  /* -------- LEVEL 6 — POSITION -------- */
  {
    id: 6,
    title: "Επίπεδο 6: Το Sale Badge",
    subtitle: "Position: relative & absolute",
    penalty: 11,
    story: "Χρειαζόμαστε κόκκινο badge «-50%» πάνω-δεξιά στην κάρτα. Ο Hacker το άφησε να επιπλέει τυχαία…",
    targetHTML: `
      <div class="product-card">
        <div class="badge">-50%</div>
        <div class="image">📷</div>
        <div class="title">DSLR Camera</div>
        <div class="price">549€</div>
      </div>`,
    baseStyles: `
      body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #f3f4f6; }
      .product-card { background: white; padding: 24px; border-radius: 12px; text-align: center; width: 220px; box-shadow: 0 4px 10px rgba(0,0,0,.1); }
      .image { font-size: 72px; }
      .title { font-weight: 600; margin-top: 8px; }
      .price { color: #2563eb; font-weight: 700; font-size: 20px; }
      .badge { background: #ef4444; color: white; padding: 4px 10px; border-radius: 999px; font-weight: bold; font-size: 14px; display: inline-block; }`,
    readonlyHint: `/* Τοποθέτησε το badge πάνω-δεξιά!
   .product-card → το badge θα τοποθετείται μέσα σ' αυτήν
   .badge → στην πάνω-δεξιά γωνία της κάρτας */`,
    starterCSS: `.product-card {

}

.badge {

}`,
    instructions: [
      "<code>.product-card</code>: κάν' την ώστε το badge να <b>τοποθετείται μέσα της</b> (όχι σε σχέση με όλη τη σελίδα)",
      "<code>.badge</code>: <b>κόλλησέ το στην πάνω-δεξιά γωνία</b> της κάρτας",
    ],
    hints: [
      "💡 <code>position: absolute</code> τοποθετείται σε σχέση με τον πιο κοντινό γονιό που ΔΕΝ είναι <code>static</code>",
      "💡 Γι' αυτό: <code>position: relative</code> στο <code>.product-card</code>",
      "💡 Μετά: <code>top: 10px; right: 10px;</code>",
    ],
    checks: [
      { selector: ".product-card", property: "position", test: (v) => v === "relative" || v === "absolute" || v === "fixed", msg: "<code>position: relative</code>" },
      { selector: ".badge", property: "position", test: (v) => v === "absolute", msg: "<code>position: absolute</code>" },
      { selector: ".badge", property: "top", test: (v) => v !== "auto" && px(v) >= 0 && px(v) <= 40, msg: "Όρισε <code>top</code>" },
      { selector: ".badge", property: "right", test: (v) => v !== "auto" && px(v) >= 0 && px(v) <= 40, msg: "Όρισε <code>right</code>" },
    ],
    solution: `.product-card {
  position: relative;
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
}`,
    reward: { hint: 1 },
  },

  /* -------- LEVEL 7 — BOSS -------- */
  {
    id: 7,
    title: "Επίπεδο 7: Η Τελική Μάχη — Checkout Page",
    subtitle: "BOSS BATTLE — Όλα μαζί!",
    penalty: 14,
    story: "Τελευταία μάχη. Ο Bug κατέστρεψε τη σελίδα ολοκλήρωσης παραγγελίας. Αν την επαναφέρεις, σώζεις την PixelMart!",
    targetHTML: `
      <div class="checkout">
        <h2 class="title">Ολοκλήρωση Παραγγελίας</h2>
        <div class="row">
          <div class="item">📱 Smartphone <span>299€</span></div>
          <div class="item">🎧 Headphones <span>79€</span></div>
          <div class="item">⌚ Smartwatch <span>199€</span></div>
        </div>
        <div class="total">Σύνολο: <b>577€</b></div>
        <button class="pay-btn">Πληρωμή</button>
      </div>`,
    baseStyles: `body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; background: #0f172a; min-height: 100vh; }`,
    readonlyHint: `/* Boss Battle — Χρησιμοποίησε τα πάντα!
   .checkout → λευκή κάρτα, padding, στρογγυλεμένες γωνίες, περιορισμένο πλάτος, κεντραρισμένη
   .title → κεντραρισμένο, σκούρο μπλε
   .row → κάθετη στοίβα με κενό
   .item → όνομα & τιμή στις άκρες, γκρι φόντο
   .total → κεντραρισμένο, μεγαλύτερο κείμενο
   .pay-btn → πλήρες πλάτος, πράσινο, λευκό, χωρίς border, στρογγυλεμένο, bold */`,
    starterCSS: `.checkout {
  
}

.title {
  
}

.row {
  
}

.item {
  
}

.total {
  
}

.pay-btn {
  
}`,
    instructions: [
      "<code>.checkout</code>: κάν' το <b>λευκή κάρτα</b> — με padding, στρογγυλεμένες γωνίες, <b>όχι πολύ φαρδιά</b> και <b>κεντραρισμένη</b> στη σελίδα",
      "<code>.title</code>: <b>κεντραρισμένος</b> τίτλος σε <b>σκούρο μπλε</b>",
      "<code>.row</code>: βάλε τα προϊόντα σε <b>κάθετη στήλη</b>, με κενό",
      "<code>.item</code>: <b>όνομα αριστερά, τιμή δεξιά</b>, με γκρι φόντο",
      "<code>.total</code>: <b>κεντραρισμένο</b>, με <b>μεγαλύτερα γράμματα</b>",
      "<code>.pay-btn</code>: κουμπί που <b>πιάνει όλο το πλάτος</b>, πράσινο, χωρίς border",
    ],
    hints: [
      "💡 <code>margin: 0 auto;</code> κεντράρει block element",
      "💡 <code>flex-direction: column;</code> = κάθετα",
      "💡 <code>justify-content: space-between;</code> = στις άκρες",
      "💡 <code>width: 100%;</code> = πλήρες πλάτος",
    ],
    checks: [
      { selector: ".checkout", property: "background-color", test: isLightText, msg: "Λευκό φόντο" },
      { selector: ".checkout", property: "border-top-left-radius", test: atLeast(8), msg: "border-radius" },
      { selector: ".checkout", property: "padding-top", test: atLeast(16), msg: "Padding" },
      { selector: ".checkout", property: "max-width", test: (v) => px(v) > 0 && px(v) <= 700, msg: "max-width ~500px" },
      { selector: ".title", property: "text-align", test: (v) => v === "center", msg: "title κεντραρισμένο" },
      { selector: ".row", property: "display", test: (v) => v === "flex" || v === "inline-flex", msg: "row → flex" },
      { selector: ".row", property: "flex-direction", test: (v) => v === "column", msg: "row → column" },
      { selector: ".item", property: "display", test: (v) => v === "flex" || v === "inline-flex", msg: "item → flex" },
      { selector: ".item", property: "justify-content", test: (v) => v === "space-between", msg: "item → space-between" },
      { selector: ".pay-btn", property: "background-color", test: isGreenish, msg: "Πράσινο κουμπί" },
      { selector: ".pay-btn", property: "color", test: isLightText, msg: "Λευκό κείμενο" },
      { selector: ".pay-btn", property: "width", test: (v) => px(v) > 300, msg: "width: 100%" },
    ],
    solution: `.checkout {
  background: white;
  padding: 24px;
  border-radius: 12px;
  max-width: 500px;
  margin: 0 auto;
}

.title {
  text-align: center;
  color: #1e3a8a;
}

.row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f3f4f6;
  border-radius: 8px;
}

.total {
  text-align: center;
  font-size: 20px;
  margin-bottom: 16px;
}

.pay-btn {
  width: 100%;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px;
  cursor: pointer;
  font-weight: bold;
}`,
    reward: {},
  },
];

window.LEVELS = LEVELS;
