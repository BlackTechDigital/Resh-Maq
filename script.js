"use strict";

/*
 * CONFIGURAÇÃO
 *
 * Deixe vazio enquanto não houver um WhatsApp oficial confirmado.
 * Quando confirmado, informe apenas dígitos:
 * código do país 55 + DDD + telefone.
 *
 * O formulário permanece demonstrativo, mesmo com WhatsApp configurado.
 * Os botões gerais de orçamento passam a abrir a conversa no WhatsApp.
 */
const CONFIG = {
  whatsapp: "",
  message:
    "Olá! Conheci a RESHMAQ pelo site e gostaria de solicitar informações sobre produtos ou serviços."
};

const photo = (id, width = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

/*
 * As fotografias são referências ilustrativas externas.
 * Para usar imagens próprias, substitua cada image por:
 * "assets/nome-da-imagem.webp"
 */
const PRODUCTS = [
  {
    id: "furadeira",
    name: "Furadeira de impacto",
    category: "Ferramentas elétricas",
    description: "Exemplo de ferramenta para apresentar opções de perfuração.",
    details:
      "Modelo ilustrativo para organizar a consulta de ferramentas de perfuração. Potência, aplicações, acessórios, marca e modelo precisam ser confirmados antes de qualquer orçamento.",
    image: photo("photo-1504148455328-c376907d081c"),
    alt: "Referência fotográfica ilustrativa de ferramentas para trabalho"
  },
  {
    id: "chaves",
    name: "Jogo de chaves",
    category: "Ferramentas manuais",
    description: "Uma possibilidade de apresentação para ferramentas de uso manual.",
    details:
      "Exemplo de conjunto de ferramentas manuais. Quantidade de peças, medidas, materiais e aplicações são informações a preencher com dados oficiais da empresa.",
    image: photo("photo-1586864387967-d02ef85d93e8"),
    alt: "Ferramentas manuais em fotografia ilustrativa"
  },
  {
    id: "maquina",
    name: "Equipamento de bancada",
    category: "Máquinas e equipamentos",
    description: "Referência de categoria para equipamentos de apoio ao trabalho.",
    details:
      "Item demonstrativo de máquinas e equipamentos. A imagem é uma referência de contexto técnico. Tipo de máquina, dimensões, alimentação e disponibilidade devem ser confirmados.",
    image: photo("photo-1581092160562-40aa08e78837"),
    alt: "Ambiente técnico ilustrativo para a categoria de máquinas"
  },
  {
    id: "acessorios",
    name: "Acessórios para ferramentas",
    category: "Acessórios e componentes",
    description: "Organização de componentes e acessórios em um só lugar.",
    details:
      "Exemplo de apresentação de acessórios. Compatibilidade, tamanhos, composição e modelos disponíveis não estão definidos nesta demonstração.",
    image: photo("photo-1530124566582-a618bc2615dc"),
    alt: "Composição ilustrativa de ferramentas e acessórios"
  },
  {
    id: "manutencao",
    name: "Soluções para manutenção",
    category: "Equipamentos para manutenção",
    description: "Categoria demonstrativa para necessidades de manutenção.",
    details:
      "Referência de organização comercial para equipamentos de manutenção. A escolha de produtos e suas aplicações depende das especialidades efetivamente confirmadas pela RESHMAQ.",
    image: photo("photo-1581092921461-eab62e97a780"),
    alt: "Atividade técnica ilustrativa associada à manutenção"
  },
  {
    id: "outros",
    name: "Soluções sob consulta",
    category: "Outros produtos",
    description: "Espaço para consultar outras possibilidades de produtos.",
    details:
      "Categoria aberta para futuras inclusões no catálogo. Não representa promessa de fornecimento. A empresa deverá confirmar quais itens podem ser comercializados.",
    image: photo("photo-1504917595217-d4dc5ebe6122"),
    alt: "Cena industrial ilustrativa para outras soluções"
  }
];

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

const normalize = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const header = $("#header");
const nav = $("#navigation");
const menuToggle = $("#menu-toggle");
const backTop = $("#back-top");
const productGrid = $("#product-grid");
const productSearch = $("#product-search");
const emptyState = $("#empty-state");
const productCount = $("#product-count");
const dialog = $("#product-dialog");
const form = $("#contact-form");
const phone = $("#phone");

let selectedCategory = "Todos";
let currentProduct = null;
let lastProductTrigger = null;

/* MENU MOBILE */

document.documentElement.classList.add("js-menu");
menuToggle.hidden = false;

function setMenu(open) {
  nav.classList.toggle("open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute(
    "aria-label",
    open ? "Fechar menu" : "Abrir menu"
  );
}

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

$$("a", nav).forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("open")) {
    setMenu(false);
    menuToggle.focus();
  }
});

document.addEventListener("click", (event) => {
  if (
    nav.classList.contains("open") &&
    !header.contains(event.target)
  ) {
    setMenu(false);
  }
});

window.matchMedia("(min-width: 801px)").addEventListener(
  "change",
  () => setMenu(false)
);

/* HEADER E VOLTAR AO TOPO */

function updateScrollUI() {
  header.classList.toggle("scrolled", window.scrollY > 25);
  backTop.hidden = window.scrollY < 650;
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();

backTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: reducedMotion.matches ? "auto" : "smooth"
  });
  const brand = $(".brand", header);
  brand.focus({ preventScroll: true });
});

/* FALLBACK DE IMAGENS
 * Evita ícones de imagem quebrada se a fonte externa falhar.
 */

function attachImageFallback(image) {
  function fallback() {
    if (image.dataset.fallback === "true") return;

    image.dataset.fallback = "true";
    image.classList.add("image-unavailable");
    image.alt = "Fotografia ilustrativa indisponível no momento";

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="650">
        <defs>
          <linearGradient id="bg" x2="1" y2="1">
            <stop stop-color="#102440"/>
            <stop offset="1" stop-color="#080b10"/>
          </linearGradient>
        </defs>
        <rect width="900" height="650" fill="url(#bg)"/>
        <path d="M0 500H900M150 0V650M750 0V650"
          stroke="#29415c" fill="none"/>
        <rect x="375" y="220" width="150" height="120"
          fill="none" stroke="#6aaaff" stroke-width="2"/>
        <path d="M390 320l40-40 30 25 30-45 25 60"
          fill="none" stroke="#6aaaff" stroke-width="2"/>
        <text x="450" y="390" text-anchor="middle"
          fill="#d3e1f3" font-family="Arial" font-size="22">
          RESHMAQ
        </text>
        <text x="450" y="425" text-anchor="middle"
          fill="#a5b0be" font-family="Arial" font-size="15">
          Fotografia ilustrativa indisponível
        </text>
      </svg>
    `;

    image.src =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  image.addEventListener("error", fallback);

  if (
    image.getAttribute("src") &&
    image.complete &&
    image.naturalWidth === 0
  ) {
    fallback();
  }
}

$$("img").forEach(attachImageFallback);

/* CATÁLOGO */

function createProductCard(product) {
  const article = document.createElement("article");
  article.className = "product-card";

  const imageButton = document.createElement("button");
  imageButton.type = "button";
  imageButton.className = "product-image-button";
  imageButton.setAttribute(
    "aria-label",
    `Ver detalhes de ${product.name}`
  );

  const image = document.createElement("img");
  image.src = product.image;
  image.alt = product.alt;
  image.loading = "lazy";
  image.width = 900;
  image.height = 650;
  attachImageFallback(image);

  const tag = document.createElement("span");
  tag.className = "product-tag";
  tag.textContent = "EXEMPLO ILUSTRATIVO";

  const openSymbol = document.createElement("span");
  openSymbol.className = "product-open";
  openSymbol.textContent = "+";
  openSymbol.setAttribute("aria-hidden", "true");

  imageButton.append(image, tag, openSymbol);

  const body = document.createElement("div");
  body.className = "product-body";

  const category = document.createElement("p");
  category.className = "product-category";
  category.textContent = product.category;

  const title = document.createElement("h3");
  title.textContent = product.name;

  const description = document.createElement("p");
  description.textContent = product.description;

  const action = document.createElement("button");
  action.type = "button";
  action.className = "product-action";
  action.append(document.createTextNode("Consultar disponibilidade "));

  const arrow = document.createElement("span");
  arrow.textContent = "↗";
  arrow.setAttribute("aria-hidden", "true");
  action.append(arrow);

  imageButton.addEventListener("click", () =>
    openProduct(product, imageButton)
  );

  action.addEventListener("click", () =>
    requestProduct(product.name)
  );

  body.append(category, title, description, action);
  article.append(imageButton, body);

  return article;
}

function renderProducts() {
  const query = normalize(productSearch.value);

  const filtered = PRODUCTS.filter((product) => {
    const matchesCategory =
      selectedCategory === "Todos" ||
      product.category === selectedCategory;

    const matchesQuery = normalize(
      `${product.name} ${product.category} ${product.description}`
    ).includes(query);

    return matchesCategory && matchesQuery;
  });

  productGrid.replaceChildren(...filtered.map(createProductCard));
  emptyState.hidden = filtered.length > 0;

  productCount.textContent =
    filtered.length === 1
      ? "1 exemplo encontrado"
      : `${filtered.length} exemplos encontrados`;
}

productSearch.addEventListener("input", renderProducts);

$$("[data-category]").forEach((button) => {
  button.addEventListener("click", () => {
    selectedCategory = button.dataset.category;

    $$("[data-category]").forEach((item) => {
      item.setAttribute(
        "aria-pressed",
        String(item === button)
      );
    });

    renderProducts();
  });
});

$("#reset-search").addEventListener("click", () => {
  productSearch.value = "";
  selectedCategory = "Todos";

  $$("[data-category]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.category === "Todos")
    );
  });

  renderProducts();
  productSearch.focus();
});

/* MODAL DE PRODUTOS */

function openProduct(product, trigger) {
  currentProduct = product;
  lastProductTrigger = trigger;

  const image = $("#dialog-image");
  delete image.dataset.fallback;
  image.classList.remove("image-unavailable");
  image.alt = product.alt;
  image.src = product.image;

  $("#dialog-title").textContent = product.name;
  $("#dialog-category").textContent = product.category;
  $("#dialog-description").textContent = product.details;

  dialog.showModal();
  document.body.classList.add("modal-open");
  $("#dialog-close").focus();
}

$("#dialog-close").addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target !== dialog) return;

  const rect = dialog.getBoundingClientRect();
  const outside =
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;

  if (outside) dialog.close();
});

dialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");

  if (lastProductTrigger?.isConnected) {
    lastProductTrigger.focus({ preventScroll: true });
  }
});

$("#dialog-quote").addEventListener("click", () => {
  if (!currentProduct) return;

  const name = currentProduct.name;
  dialog.close();
  requestProduct(name);
});

/* ORÇAMENTOS E WHATSAPP */

const whatsappDigits = CONFIG.whatsapp.replace(/\D/g, "");

const whatsappConfigured =
  /^55[1-9]\d\d{8,9}$/.test(whatsappDigits);

function whatsappURL(message) {
  return `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(message)}`;
}

function focusContact(interest = "") {
  if (interest) $("#interest").value = interest;

  $("#form-result").textContent = "";
  setMenu(false);

  const field = interest ? $("#name") : $("#interest");

  field.focus({ preventScroll: true });
  $("#contato").scrollIntoView({
    behavior: reducedMotion.matches ? "auto" : "smooth",
    block: "start"
  });
}

function requestProduct(name) {
  if (whatsappConfigured) {
    const message =
      `Olá! Conheci a RESHMAQ pelo site e gostaria de consultar ` +
      `informações sobre ${name}. Vi o item no catálogo demonstrativo ` +
      `e gostaria de confirmar se vocês trabalham com essa solução.`;

    window.location.assign(whatsappURL(message));
  } else {
    focusContact(name);
  }
}

$$("[data-interest]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    requestProduct(link.dataset.interest);
  });
});

if (whatsappConfigured) {
  const url = whatsappURL(CONFIG.message);

  $$("[data-quote]").forEach((link) => {
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });

  const floating = $("#floating-contact");
  floating.href = url;
  floating.target = "_blank";
  floating.rel = "noopener noreferrer";
  floating.classList.add("whatsapp");
  floating.setAttribute("aria-label", "Conversar pelo WhatsApp oficial");
  $("span", floating).textContent = "WhatsApp";

  $("#official-phone").textContent = `+${whatsappDigits}`;
} else {
  $$("[data-quote], #floating-contact").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      focusContact();
    });
  });
}

/* FORMULÁRIO DEMONSTRATIVO */

function phoneIsValid(value) {
  const digits = value.replace(/\D/g, "");

  const national =
    digits.startsWith("55") &&
    (digits.length === 12 || digits.length === 13)
      ? digits.slice(2)
      : digits;

  return /^[1-9]\d\d{8,9}$/.test(national);
}

phone.addEventListener("input", () => {
  phone.setCustomValidity("");
});

form.addEventListener("input", () => {
  $("#form-result").textContent = "";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  phone.setCustomValidity(
    phoneIsValid(phone.value)
      ? ""
      : "Informe um telefone com DDD, com 10 ou 11 dígitos."
  );

  if (!form.reportValidity()) return;

  const name = $("#name").value.trim();
  const interest = $("#interest").value.trim();
  const message = $("#message").value.trim();

  if (
    name.length < 2 ||
    interest.length < 3 ||
    message.length < 10
  ) {
    $("#form-result").textContent =
      "Preencha nome, interesse e mensagem com informações válidas, " +
      "sem usar apenas espaços.";
    return;
  }

  $("#form-result").textContent =
    "Campos validados. Esta é uma demonstração: sua solicitação NÃO " +
    "foi enviada e os dados não foram armazenados pelo formulário. " +
    "O recebimento de mensagens depende da configuração de um canal oficial.";
});

/* REVELAÇÃO SUAVE */

if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -20px 0px"
    }
  );

  document.documentElement.classList.add("js-reveal");
  $$(".reveal").forEach((element) => observer.observe(element));
}

renderProducts();
