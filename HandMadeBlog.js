// reading
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        for (item of data) {
            document.getElementById("cards")
                .append(createCard(item));
        }
        modalLouded()
    })
    .catch(err => console.error(err));

function createCard(item) {

    const tpl = document.getElementById("cardTemplate")
        .content.cloneNode(true);

    tpl.querySelector(".photo").src = item.imgPreview;
    tpl.querySelector("h2").textContent = item.title;
    tpl.querySelector("p").textContent = item.description;

    for (let i = 0; i < item.materials.length; i++) {

        let icon = document.createElement("img");
        icon.className = "icon"
        tpl.querySelector(".cardMenu").prepend(icon)
        tpl.querySelector(".icon").src = item.materials[i]
    }
    if (!item.available) tpl.querySelector("button").innerHTML = "not available"

    tpl.querySelector(".price").textContent = item.price

    return tpl;
}

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

// in process
let logInBtn = document.querySelector(".login").addEventListener("click",
    function () {
        alert("this function in in process...")
    }
)

document.querySelector(".more button").addEventListener("click", function (e) {
    alert("this function in in process...")
})

// menu btns
let buttons = document.querySelectorAll(".ringBtn");
buttons.forEach(btn => {
    btn.onclick = function (e) {
        if (!e.target.classList.contains("active")) {
            btn.classList.add("active");
            alert("this function in in process...")
        } else {
            btn.classList.remove("active");
        }
    }
})