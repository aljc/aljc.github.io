// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Accordion functionality
let acc = document.getElementsByClassName("accordion-button");
let i;

for (i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        let panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
            panel.style.maxHeight = null;
            this.textContent = 'Earlier work [+]';
        } else {
            panel.style.maxHeight = panel.scrollHeight + "px";
            this.textContent = 'Earlier work [-]';
        } 
    });
}

window.onscroll = function() {
    scrollFunction();
};

function scrollFunction() {
    if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
        btn.style.display = "block";
    } else {
        btn.style.display = "none";
    }
}

btn.onclick = function() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

// Typewriter effect for the main title
const textElement = document.querySelector("main header h1");
const fullText = textElement.textContent;
const stopText = "Hi, I'm Alice.";
textElement.textContent = '';

let index = 0;

function typeText() {
    if (textElement.textContent !== stopText) {
        textElement.textContent += fullText[index];
        index++;
        setTimeout(typeText, 100); // Speed of typing
    }
}

// Initiate the typing effect after a delay
setTimeout(typeText, 1000);

// Adjust scroll position for sticky header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        let target = document.querySelector(this.getAttribute('href'));
        let headerHeight = document.getElementById('sticky-navbar').offsetHeight;

        window.scrollTo({
            top: target.offsetTop - headerHeight,
            behavior: 'smooth'
        });
    });
});