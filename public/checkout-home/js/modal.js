document.addEventListener("DOMContentLoaded", () => {
  const modal = document.querySelector(".modal");
  const details = document.querySelectorAll(".main-info__details");
  const modalTitle = document.querySelector(".modal__title h1");
  const modalContent = document.querySelector(".modal__text");
  const mainButton = document.getElementById("main-button");
  const deskButton = document.getElementById("desk-button");

  const content = {
    details: ` <div class='modal__text--title'>
              detalhes
            </div>
            <ul>
              <li>Gênero: Masculino.</li>
              <li>Cor: Azul Claro e Azul Escuro.</li>
              <li>Material: Mistura de Algodão e Jeans.</li>
              <li>Modelagem: Slim Fit.</li>
              <li>Estação: Versátil.</li>
              <li>Colarinho: Clássico.</li>
              <li>Manga: Longa.</li>
              <li>Padrão: Jeans.</li>
              <li>Ocasião: Versátil.</li>
            </ul>`,
    measure: `<div class="modal__text--title">
                    tabela
                </div>
                <table>
                    <tbody>
                        <tr>
                            <th>Tamanho</th>
                            <th>Peito</th>
                            <th>Ombro</th>
                            <th>Comprimento</th>
                            <th>Manga</th>
                        </tr>
                        <tr>
                            <th>PP</th>
                            <td>96 cm </td>
                            <td>42 cm </td>
                            <td>69 cm </td>
                            <td>63 cm</td>
                        </tr>
                        <tr>
                            <th>P</th>
                            <td>100 cm </td>
                            <td>44 cm </td>
                            <td>70 cm </td>
                            <td>64 cm </td>
                        </tr>
                        <tr>
                            <th>M</th>
                            <td>104 cm </td>
                            <td>46 cm </td>
                            <td>71 cm </td>
                            <td>65 cm</td>
                        </tr>
                        <tr>
                            <th>G</th>
                            <td>108 cm </td>
                            <td>48 cm </td>
                            <td>72 cm </td>
                            <td>66 cm</td>
                        </tr>
                        <tr>
                            <th>XG</th>
                            <td>112 cm</td>
                            <td>50 cm</td>
                            <td>73 cm</td>
                            <td>67 cm</td>
                        </tr>
                        <tr>
                            <th>XGG</th>
                            <td>116 cm</td>
                            <td>52 cm</td>
                            <td>74 cm</td>
                            <td>68 cm</td>
                        </tr>
                    </tbody>
                </table>`,
    payment: `<div class="modal__payments">
              <div class='modal__text--title'>
                cartões de crédito
              </div>
              <ul>
                <li> <img src="./assets/visa_modal.png"> Visa </li>
                <li> <img src="./assets/master_modal.png"> Master Card </li>
                <li> <img src="./assets/elo_modal.png"> Elo </li>
                <li> <img src="./assets/amex_modal.png"> American Express </li>
              </ul>
              <div class="modal__text--title">
                Outras opções de pagamentos
              </div>
              <ul>
                <li> <img src="./assets/pix_modal.png"> Pix </li>
              </ul>
              <p>
                Tenha em atenção que termos e condições de terceiros podem aplicar-se no caso de Formas de pagamento adicionais.
                Certifique-se de que lê estes termos cuidadosamente na finalização da compra antes de utilizar Formas de pagamentos adicionais.
              </p>
            </div>
  `,
  };

  document.body.classList.remove("modal__open");
  modal.classList.remove("modal");
  modal.classList.add("hide");

  let scrollPosition = 0;
  details.forEach((detail, index) => {
    detail.addEventListener("click", (e) => {
      e.preventDefault();
      scrollPosition = window.pageYOffset;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollPosition}px`;
      window.scrollTo(0, scrollPosition);
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      modal.classList.remove("hide");
      modal.classList.add("modal");
      if (index === 0) {
        modalTitle.innerText = "Detalhes do Produto";
        modalContent.innerHTML = content.details;
      }
      if (index === 1) {
        modalTitle.innerText = "Medidas";
        modalContent.innerHTML = content.measure;
      }
      if (index === 2) {
        modalTitle.innerText = "Opções de Pagamento";
        modalContent.innerHTML = content.payment;
      }
      desabilitarBotoes();
    });
  });

  modal.addEventListener("click", (e) => {
    if (e.target || e.target.id === "close_modal") {
      fecharModal();
      habilitarBotoes();
    }
  });

  function fecharModal() {
    console.log("Executando fecharModal");
    modal.classList.remove("modal");
    modal.classList.add("hide");
    document.body.classList.remove("modal__open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.overflow = "visible";
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPosition);
    });
  }
  function desabilitarBotoes() {
    if (mainButton) mainButton.disabled = true;
    if (deskButton) deskButton.disabled = true;
  }

  function habilitarBotoes() {
    if (mainButton) mainButton.disabled = false;
    if (deskButton) deskButton.disabled = false;
  }
});
