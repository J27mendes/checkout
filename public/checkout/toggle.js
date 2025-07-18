const arrowToggle = document.querySelector('.icon-accordion')
const listOrder = document.querySelector('.list-order')
listOrder.classList.toggle("hide")

arrowToggle.addEventListener('click', () => {
    toggleModeThanks()
})

function toggleModeThanks() {
    listOrder.classList.toggle("hide")
    //const cardResume = document.querySelector("#resume-toggle")
    
    if (listOrder.classList.contains("hide")) {
        arrowToggle.classList.add('closed')
        listOrder.classList.add("hide")
    } else {
        listOrder.classList.remove("hide")
        arrowToggle.classList.remove('closed')
        listOrder.classList.remove("hide")
    }
  }