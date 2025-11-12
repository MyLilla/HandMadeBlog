// menu btns
let buttons = document.querySelectorAll(".ringBtn");
buttons.forEach(btn => {
    btn.onclick = function (e) {
        if (!e.target.classList.contains("active")) {
            btn.classList.add("active");

        } else {
            btn.classList.remove("active");
        }
    }
});

// modal
let modal = document.getElementById('modal');
let closeBtn = document.getElementById('closeModal');

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.openModal').forEach(button => {
        button.addEventListener('click', function (e) {


            let card = e.target.closest('.cardMenu');
            console.log(card)

            let price = card.querySelector('.price').textContent.trim();
            document.querySelector('.sellerPrice')
                .textContent = price + " €";

            document.querySelector('.sliderPrice')
                .textContent = price + " €";
            modal.classList.add('show');

        });
    });
});

// close modal
closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
});
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// open more
let geleries = document.querySelectorAll(".gelery")
document.querySelector(".more button").addEventListener("click", function (e) {
    for (let gelery of geleries) {
        if (!gelery.classList.contains("show")) {
            gelery.classList.add("show")
            return
        }
    }
})

// not active

let logInBtn = document.querySelector(".login").addEventListener("click",
    function () {
        alert("this function in in process...")
    }
)
