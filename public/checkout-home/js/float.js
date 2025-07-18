const elementoAlvo = document.querySelector('.float-desk');
const floatBtn = document.querySelector('.float-button');
const referenceElement = document.getElementById('main-button');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // Quando o marcador começa a sair da viewport pelo topo (rolagem para baixo)
    if (entry.boundingClientRect.top < 0) {
      floatBtn.classList.add('show')
      elementoAlvo.classList.add('show')
    } 
    // Quando o marcador está totalmente visível novamente (rolagem para cima)
    else if (entry.isIntersecting && entry.boundingClientRect.top >= 0) {
      floatBtn.classList.remove('show')
      elementoAlvo.classList.remove('show')
    }
  });
}, {
  root: null,
  rootMargin: '0px',
  threshold: [0, 1] // Observa quando entra/sai completamente
});

observer.observe(referenceElement);