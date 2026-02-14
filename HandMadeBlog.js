// reading
let allData = [];
let baseData = [];
let renderIndex = 0;
let currentCategory = "All";
let filteredData = [];

// Функция для перемешивания массива в случайный порядок (Fisher-Yates shuffle)
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

async function initializeApp() {
    // Ждем загрузки переводов и данных
    await translator.waitForTranslations();

    // Загружаем базовые данные для ID и изображений
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            baseData = data;
            updateProductData();
            renderBatch(6);
            modalLouded()
        })
        .catch(console.error);
}

function updateProductData() {
    // Объединяем базовые данные с переведенными
    const translatedData = translator.getProductData();
    allData = baseData.map(item => {
        const translated = translatedData.find(t => t.id === item.id) || {};
        return {
            ...item,
            title: translated.title || item.title,
            description: translated.description || item.description,
            category: translated.category || item.category,
            originalCategory: item.category  // Сохраняем оригинальную категорию
        };
    });
    // Перемешиваем данные в случайный порядок
    allData = shuffleArray(allData);
}

// Инициализация приложения
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function createCard(item) {

    let tpl = document.getElementById("cardTemplate").content.cloneNode(true);

    // Unique swiper id
    let swiperId = "swp-" + Math.random().toString(36).slice(2);
    let swiper = tpl.querySelector(".swiper");
    swiper.classList.add(swiperId);

    // Add slides
    let wrapper = tpl.querySelector(".swiper-wrapper");
    item.imgs.forEach(src => {
        wrapper.insertAdjacentHTML("beforeend",
            `<img class="swiper-slide photo" src="${src}">`
        );
    });

    tpl.querySelector("h2").textContent = item.title;
    tpl.querySelector("p").textContent = item.description;
    tpl.querySelector(".price").textContent = item.price;
    tpl.querySelector(".vinted").textContent = item.vinted;
    tpl.querySelector(".wallapop").textContent = item.wallapop;
    tpl.querySelector(".status").textContent = item.available;

    // Materials icons
    const menu = tpl.querySelector(".cardMenu");
    item.materials.forEach(src =>
        menu.insertAdjacentHTML("afterbegin",
            `<img class="icon" src="${src}">`
        )
    );
    const btn = tpl.querySelector("button");
    if (!item.available) {
        btn.textContent = translator.get("card.notAvailable");
        btn.setAttribute("data-unavailable", "true");
    } else {
        btn.textContent = translator.get("card.available");
        btn.removeAttribute("data-unavailable");
    }
    // Сохраняем фото в атрибут кнопки
    btn.setAttribute("data-imgs", JSON.stringify(item.imgs));
    return { el: tpl, id: swiperId };
}

function initSwiper(id) {
    new Swiper("." + id, {
        loop: true,
        pagination: {
            el: "." + id + " .swiper-pagination",
            clickable: true
        },
        navigation: {
            nextEl: "." + id + " .swiper-button-next",
            prevEl: "." + id + " .swiper-button-prev"
        },
    });
}

function filterByCategory(category) {
    renderIndex = 0;
    let cards = document.getElementById("cards");
    cards.innerHTML = "";

    if (category === "All") {
        filteredData = [];
    } else {
        // Используем оригинальную категорию для фильтрации и перемешиваем результаты
        const filtered = allData.filter(item => item.originalCategory === category);
        filteredData = shuffleArray(filtered);
    }
    renderBatch(6);
    modalLouded();
}
function renderBatch(count) {
    let cards = document.getElementById("cards");
    let source = filteredData.length ? filteredData : allData;
    let slice = source.slice(renderIndex, renderIndex + count);

    slice.forEach(item => {
        let card = createCard(item);
        cards.appendChild(card.el);
        initSwiper(card.id);
    });

    renderIndex += slice.length;

    // hide if no more
    if (renderIndex >= source.length) {
        document.getElementById("loadMore").style.display = "none";
    } else {
        document.getElementById("loadMore").style.display = "block";
    }
}

// Load more button
document.getElementById("loadMore").addEventListener("click", () => {
    renderBatch(3);
    modalLouded()
});

// modal
let modal = document.getElementById('modal');
let closeBtn = document.getElementById('closeModal');
let modalSwiperInstance = null;

function modalLouded() {
    document.querySelectorAll('.openModal').forEach(button => {

        button.addEventListener('click', function (e) {
            let card = e.target.closest('.cardMenu');

            let price = card.querySelector('.price').textContent.trim();
            document.querySelector('.sellerPrice')
                .textContent = price + " €";
            modal.classList.add('show');

            let vinted = card.querySelector('.vinted').textContent.trim();
            document.querySelector('.vintedLink').setAttribute("href", vinted);

            let wallapop = card.querySelector('.wallapop').textContent.trim();
            document.querySelector('.wallapopLink').setAttribute("href", wallapop);

            let status = card.querySelector('.status').textContent.trim();
            if (status === "true") {
                document.querySelector('.vintedLink').style.display = "block";
                document.querySelector('.wallapopLink').style.display = "block";
                document.querySelector('.order p').textContent = translator.get("modal.available");
            } else {
                document.querySelector('.vintedLink').style.display = "none";
                document.querySelector('.wallapopLink').style.display = "none";
                document.querySelector('.order p').textContent = translator.get("modal.notAvailableOrder")
            }
            document.querySelector('.vintedLink').setAttribute("href", vinted);
            document.querySelector('.wallapopLink').setAttribute("href", wallapop);

            // Обновляем фото в слайдере модального окна
            const imgsData = e.target.getAttribute('data-imgs');
            if (imgsData) {
                const imgs = JSON.parse(imgsData);
                const wrapper = document.getElementById('modalSwiperWrapper');
                wrapper.innerHTML = '';
                imgs.forEach(src => {
                    wrapper.insertAdjacentHTML('beforeend',
                        `<img class="swiper-slide photo" src="${src}">`
                    );
                });

                // Уничтожим старый свайпер и создадим новый
                if (modalSwiperInstance) {
                    modalSwiperInstance.destroy();
                }
                modalSwiperInstance = new Swiper('.modal-swiper', {
                    loop: true,
                    pagination: {
                        el: '.modal-swiper .swiper-pagination',
                        clickable: true
                    },
                    navigation: {
                        nextEl: '.modal-swiper .swiper-button-next',
                        prevEl: '.modal-swiper .swiper-button-prev'
                    },
                });
            }

        })
    })
}

// close modal
closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
});
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
})

// Маппинг переведенных названий в оригинальные
const categoryMap = {
    'All': 'All',
    'Home': 'Home',
    'Jewelry': 'Jewelry',
    'Souvenirs': 'Souvenirs',
    'Все': 'All',
    'Дом': 'Home',
    'Украшения': 'Jewelry',
    'Сувениры': 'Souvenirs'
};

// Обновление текста при смене языка
window.addEventListener('languageChanged', () => {
    // Обновить данные товаров
    updateProductData();

    // Перерендерить карточки
    renderIndex = 0;
    document.getElementById("cards").innerHTML = "";
    filterByCategory("All");

    // Обновить текст на карточках
    document.querySelectorAll('.openModal').forEach(btn => {
        const unavailable = btn.getAttribute('data-unavailable');
        if (unavailable === 'true') {
            btn.textContent = translator.get("card.notAvailable");
        } else {
            btn.textContent = translator.get("card.available");
        }
    });

    // Обновить текст модального окна
    const orderParagraph = document.querySelector('.order p');
    if (orderParagraph) {
        // Проверить, содержит ли текст "available" или "notAvailable"
        const currentText = orderParagraph.textContent;
        if (currentText.includes("purchase the product") || currentText.includes("приобрести продукт")) {
            orderParagraph.textContent = translator.get("modal.available");
        } else if (currentText.includes("not available") || currentText.includes("недоступен")) {
            orderParagraph.textContent = translator.get("modal.notAvailableOrder");
        } else {
            orderParagraph.textContent = translator.get("modal.recommendations");
        }
    }
});

// menu btns - обработчик на основе переведенного текста
function attachMenuHandlers() {
    document.querySelectorAll(".menu .ringBtn").forEach(btn => {
        btn.removeEventListener("click", handleMenuClick); // Удалить старые слушатели
        btn.addEventListener("click", handleMenuClick);
    });
}

function handleMenuClick(e) {
    const category = this.textContent.trim();
    const originalCategory = categoryMap[category] || category;
    filterByCategory(originalCategory);
}

// Первоначальное добавление обработчиков
attachMenuHandlers();

// Переприсоединить обработчики при смене языка
window.addEventListener('languageChanged', () => {
    attachMenuHandlers();
});

// Scroll to Top Button functionality
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
});

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

gsap.from("#bannerText", {
    x: -400,
    duration: 2
});

gsap.from(".logo ", {
    duration: 2,
    x: 200,
    rotation: 360,
});

gsap.from(".insta, .vinted, .lang-icon ", {
    duration: 2,
    x: -200,
    rotation: 360,
});

let buttons = document.querySelectorAll(".ringBtn");

for (let i = 0; i < buttons.length; i++) {
    gsap.from(buttons[i], {
        y: 250,
        duration: (i + 1) / 2,
    })
}

// Disable text selection (except form controls) and prevent dragging images
document.addEventListener('selectstart', function (e) {
    const tag = e.target.tagName;
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT' && tag !== 'BUTTON') {
        e.preventDefault();
    }
});

// Ensure images are not draggable
document.querySelectorAll('img').forEach(img => {
    img.setAttribute('draggable', 'false');
});