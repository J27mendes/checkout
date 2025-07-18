document.addEventListener("DOMContentLoaded", () => {
  const appBaseUrl = window.ENV.APP_URL;
  const sizes = document.querySelectorAll(".options--sizes__numbers .size");
  const mainButton = document.getElementById("main-button");
  const deskButton = document.getElementById("desk-button");
  const mobileButton = document.getElementById("mobile-button");

  let sizeSelected = "M";
  let selectedQuantity = 1;
  let selectedPrice = 99.9;
  let selectedDescription = "Kit 2 Camisas Urban Flex Jeans";

  // Seleção de tamanho
  sizes.forEach((size) => {
    size.addEventListener("click", (e) => {
      sizes.forEach((otherSizes) => {
        otherSizes.classList.remove("selected");
      });
      e.target.classList.add("selected");
      sizeSelected = e.target.textContent.trim();
    });
  });

  // Botões de compra
  [mainButton, deskButton].forEach((buttonTarget) => {
    if (buttonTarget) {
      buttonTarget.addEventListener("click", (e) => {
        e.preventDefault();
        const checkoutId = getOrCreateCheckoutId();
        goToCheckout(checkoutId);
      });
    }
  });

  // Scroll suave para mobile
  mobileButton?.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementsByTagName("body")[0].scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });

  // Função para redirecionar com validação
  function goToCheckout(checkoutId) {
    const product = {
      code: checkoutId,
      size: sizeSelected,
      quantity: selectedQuantity || "",
      price: selectedPrice.toFixed(2),
      description: selectedDescription,
    };

    if (!product.size) {
      showToastMessage("Selecione o Tamanho!");
      return;
    }

    localStorage.setItem("checkoutProduct", JSON.stringify(product));
    window.location.href = `${appBaseUrl}/checkout.html`;
  }
});
