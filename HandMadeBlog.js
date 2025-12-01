// reading

let allData = [];
let renderIndex = 0;

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        allData = data

        renderBatch(6);
        modalLouded()
    })
    .catch(console.error);

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

    // Materials icons
    const menu = tpl.querySelector(".cardMenu");
    item.materials.forEach(src =>
        menu.insertAdjacentHTML("afterbegin",
            `<img class="icon" src="${src}">`
        )
    );
    if (!item.available) tpl.querySelector("button").textContent = "not available"
    return { el: tpl, id: swiperId };
}

function initSwiper(id) {
    new Swiper("." + id, {
        pagination: {
            el: "." + id + " .swiper-pagination",
            clickable: true
        },
        navigation: {
            nextEl: "." + id + " .swiper-button-next",
            prevEl: "." + id + " .swiper-button-prev"
        },
        // autoplay: {
        //     delay: 5000,
        //     disableOnInteraction: false,
        // },
    });
}

function renderBatch(count) {
    let cards = document.getElementById("cards");

    let slice = allData.slice(renderIndex, renderIndex + count);

    slice.forEach(item => {
        let card = createCard(item);
        cards.appendChild(card.el);
        initSwiper(card.id);
    });

    renderIndex += slice.length;

    // hide if no more
    if (renderIndex >= allData.length) {
        document.getElementById("loadMore").style.display = "none";
    }
}

// Load more button
document.getElementById("loadMore").addEventListener("click", () => {
    renderBatch(3);    // дальше по 3
    modalLouded()
});

// modal
let modal = document.getElementById('modal');
let closeBtn = document.getElementById('closeModal');
function modalLouded() {
    document.querySelectorAll('.openModal').forEach(button => {

        button.addEventListener('click', function (e) {
            let card = e.target.closest('.cardMenu');

            let price = card.querySelector('.price').textContent.trim();
            document.querySelector('.sellerPrice')
                .textContent = price + " €";

            document.querySelector('.sliderPrice')
                .textContent = price + " €";
            modal.classList.add('show');

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

// menu btns
let buttons = document.querySelectorAll(".ringBtn");
buttons.forEach(btn => {
    btn.onclick = function (e) {
        console.log(e.target.textContent)
        let category = e.target.textContent
        categoryFiltr(category)
    }
})

// // in process
// let logInBtn = document.querySelector(".login").addEventListener("click",
//     function () {
//         alert("this function in in process...")
//     }
// )