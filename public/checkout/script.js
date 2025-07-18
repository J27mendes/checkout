window.addEventListener("DOMContentLoaded", () => {
  const apiBaseUrl = window.ENV.API_URL;
  const appBaseUrl = window.ENV.APP_URL;
  const formIdentify = document.getElementById("formIdentify");
  const formName = document.getElementById("nameInput");
  const formEmail = document.getElementById("email");
  const formCPF = document.getElementById("cpf");
  const formTEL = document.getElementById("tel");
  const formCEP = document.getElementById("cep");
  const formAddress = document.getElementById("address");
  const formEntrega = document.getElementById("formAddress");
  const formNumber = document.getElementById("number");
  const formDistrict = document.getElementById("district");
  const formComplement = document.getElementById("complement");
  const formNameSaved = document.getElementById("name-saved");
  const formCardNumber = document.getElementById("card-number");
  const formCardValid = document.getElementById("card-valid");
  const formCardCode = document.getElementById("card-code");
  const formCardOwner = document.getElementById("card-owner");
  const formCardCPF = document.getElementById("card-cpf");
  const formCardInstallments = document.getElementById("installments");
  const formPayment = document.getElementById("formPayment");
  const paymentResult = document.getElementById("paymentResult");
  const descDefault = document.querySelector("#paymentStep .desc:not(.hide)");
  const descResumo = document.querySelector("#paymentStep .desc.hide");
  let valorEntrega = 0;

  const resume = localStorage.getItem("checkoutProduct");

  if (!resume) {
    console.log("Nenhum item encontrado no localStorage.");
    return;
  }
  try {
    const item = JSON.parse(resume);

    const resumeItem = Array.isArray(item) ? item[0] : item;

    document.getElementById("detail-total").value = resumeItem.total ?? "";
    document.getElementById("item-variation-size").textContent = `Tamanho: ${
      resumeItem.size ?? ""
    }`;
    document.getElementById("item-variation-description").textContent =
      resumeItem.description ?? "";
    document.getElementById("item-price-sale-unit").value =
      resumeItem.price ?? "";
    document.getElementById("quantity-sale").value = resumeItem.quantity ?? "";
  } catch (e) {
    console.error("Erro ao processar dados do localStorage:", e);
  }

  const inputQuantidade = document.getElementById("quantity-sale");
  const precoUnitarioEl = document.getElementById("item-price-sale-unit");
  const totalEl = document.getElementById("detail-total");

  const botaoMenos = document.querySelector(".switch-control.less");
  const botaoMais = document.querySelector(".switch-control.more");

  function formatarParaReal(valor) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  botaoMais.addEventListener("click", () => {
    let valorAtual = parseInt(inputQuantidade.value) || 0;
    inputQuantidade.value = valorAtual + 1;
    atualizarTotal();
  });

  botaoMenos.addEventListener("click", () => {
    let valorAtual = parseInt(inputQuantidade.value) || 0;
    if (valorAtual > 1) {
      inputQuantidade.value = valorAtual - 1;
      atualizarTotal();
    }
  });

  inputQuantidade.addEventListener("input", atualizarTotal);

  atualizarTotal();

  formName.addEventListener(
    "focusout",
    () => {
      checkName();
    },
    true
  );
  formEmail.addEventListener(
    "focusout",
    () => {
      checkEmail();
    },
    true
  );
  formCPF.addEventListener(
    "focusout",
    () => {
      checkCPF();
    },
    true
  );
  formTEL.addEventListener(
    "focusout",
    () => {
      checkTEL();
    },
    true
  );
  formCEP.addEventListener(
    "focusout",
    () => {
      checkCEP();
    },
    true
  );
  formAddress.addEventListener(
    "focusout",
    () => {
      checkAddress();
    },
    true
  );
  formNumber.addEventListener(
    "focusout",
    () => {
      checkNumber();
    },
    true
  );
  formDistrict.addEventListener(
    "focusout",
    () => {
      checkDistrict();
    },
    true
  );
  formNameSaved.addEventListener(
    "focusout",
    () => {
      checkNameSaved();
    },
    true
  );
  formCardNumber.addEventListener(
    "focusout",
    () => {
      checkCardNumber();
    },
    true
  );
  formCardValid.addEventListener(
    "focusout",
    () => {
      checkCardValid();
    },
    true
  );
  formCardCode.addEventListener(
    "focusout",
    () => {
      checkCardCode();
    },
    true
  );
  formCardOwner.addEventListener(
    "focusout",
    () => {
      checkCardOwner();
    },
    true
  );
  formCardCPF.addEventListener(
    "focusout",
    () => {
      checkCardCPF();
    },
    true
  );
  formCardInstallments.addEventListener(
    "click",
    () => {
      checkInstallments();
    },
    true
  );

  formEntrega.style.display = "none";
  formPayment.style.display = "none";

  formCardCode.addEventListener("focusout", () => {
    const cvv = formCardCode.value.trim();
    const brand = detectCardBrand(formCardNumber.value);

    if (!validarCVV(cvv, brand)) {
      errorCardCode(formCardCode, "Código de segurança inválido.");
    } else {
      sucessCardCode(formCardCode);
    }
  });

  function checkFormaEntrega() {
    const selected = document.querySelector('input[name="transport"]:checked');
    if (!selected) {
      showToast("Selecione uma forma de entrega.");
      return false;
    }
    return true;
  }

  const checkoutId = getOrCreateCheckoutId();

  if (!localStorage.getItem("formThanks")) {
    localStorage.setItem("formThanks", JSON.stringify({}));
  }

  let identifySuccess = false;

  formIdentify.addEventListener("submit", async (e) => {
    e.preventDefault();

    const button = formIdentify.querySelector("button");
    setButtonLoading(button, true);

    const formData = {
      nomeCompleto: formName.value,
      email: formEmail.value,
      cpf: formCPF.value,
      celular: formTEL.value,
      checkoutId,
    };

    try {
      const res = await fetch(`${apiBaseUrl}/identify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        const dados = result.data;

        identifySuccess = true;

        showToast("Dados enviados com sucesso!");

        document.getElementById("userName").textContent = dados.nomeCompleto;
        document.getElementById("userEmail").textContent = dados.email;
        document.getElementById("userCPF").textContent = `CPF ${dados.cpf}`;
        formEntrega.style.display = "block";

        const boxConfirm = document.getElementById("boxIdentifyConfirm");
        if (boxConfirm) boxConfirm.classList.remove("hide");

        document.getElementById("step-entrega").classList.remove("disabled");

        document.getElementById("formIdentify").style.display = "none";
        let formThanks = JSON.parse(localStorage.getItem("formThanks")) || {};
        formThanks.nomeCompleto = formData.nomeCompleto;
        formThanks.email = formData.email;
        formThanks.celular = formData.celular;
        localStorage.setItem("formThanks", JSON.stringify(formThanks));

        const editBtn = document.getElementById("editIdentifyBtn");
        if (editBtn) {
          editBtn.addEventListener("click", () => {
            boxConfirm.classList.add("hide");
            document.getElementById("formIdentify").style.display = "block";
            document.getElementById("step-entrega").classList.add("disabled");
            identifySuccess = false;
          });
        }
      } else {
        showToastMessage("Erro ao enviar: " + result.message);
        console.error(result);
      }
    } catch (err) {
      showToast("Erro ao conectar com o servidor.");
      console.error(err);
    }
  });

  let addressSuccess = false;

  formEntrega.addEventListener("submit", async (e) => {
    e.preventDefault();

    const button = formEntrega.querySelector('button[type="submit"]');
    setButtonLoading(button, true);

    if (!identifySuccess) {
      showToastMessage(
        "Por favor, preencha primeiro os dados de identificação."
      );
      return;
    }

    if (!checkFormaEntrega()) return;

    const formData = {
      checkoutId,
      cep: formCEP.value,
      endereco: formAddress.value,
      numero: formNumber.value,
      bairro: formDistrict.value,
      complemento: formComplement.value,
      destinatario: formNameSaved.value,
      formaEntrega: document.querySelector('input[name="transport"]:checked')
        ?.value,
    };

    try {
      const res = await fetch(`${apiBaseUrl}/address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        const dados = result.data;

        addressSuccess = true;

        showToast("Endereço salvo com sucesso!");

        const enderecoText = `${dados.endereco}, ${dados.numero} - ${dados.bairro} <br /> CEP ${dados.cep}`;
        document.getElementById("resumo-endereco").innerHTML = enderecoText;

        document.getElementById(
          "resumo-destinatario"
        ).innerText = `Destinatário: ${dados.destinatario}`;
        let formaEntregaTexto = "";
        switch (dados.formaEntrega) {
          case "GRATUITO":
            formaEntregaTexto = "Correios - de 8 a 17 dias úteis (Grátis)";
            break;
          case "EXPRESSO_SEGURO":
            formaEntregaTexto = "Correios - de 7 a 12 dias úteis (R$ 14,90)";
            valorEntrega = 1490;
            break;
          default:
            formaEntregaTexto = "Forma de entrega não identificada";
        }

        document.getElementById("resumo-forma-entrega").innerText =
          formaEntregaTexto;

        document.querySelector(".box-card.hide")?.classList.remove("hide");

        document.getElementById("step-pagamento").classList.remove("disabled");

        document.getElementById("formAddress").style.display = "none";

        const editAddressBtn = document.getElementById("editAddressBtn");
        formPayment.style.display = "block";

        let formThanks = JSON.parse(localStorage.getItem("formThanks")) || {};

        formThanks.cep = formData.cep;
        formThanks.bairro = formData.bairro;
        formThanks.destinatario = formData.destinatario;
        formThanks.numero = formData.numero;
        formThanks.endereco = formData.endereco;
        formThanks.formaEntrega = formaEntregaTexto;

        localStorage.setItem("formThanks", JSON.stringify(formThanks));

        if (editAddressBtn) {
          editAddressBtn.addEventListener("click", () => {
            const boxResumoEntrega = editAddressBtn.closest(".box-card");
            if (boxResumoEntrega) {
              boxResumoEntrega.classList.add("hide");
            }

            const formAddress = document.getElementById("formAddress");
            if (formAddress) {
              formAddress.style.display = "block";
            }

            document.getElementById("step-pagamento").classList.add("disabled");
            document
              .getElementById("named-save-button")
              .classList.remove("disabled");
            addressSuccess = false;
          });
        }
      } else {
        showToastMessage("Erro ao salvar: " + result.message);
      }
    } catch (err) {
      showToastMessage("Erro ao conectar com o servidor.");
      console.error(err);
    }
  });

  formPayment.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!identifySuccess) {
      showToastMessage("❌ Preencha primeiro os dados de identificação.");
      return;
    }

    if (!addressSuccess) {
      showToastMessage("❌ Preencha primeiro os dados de entrega.");
      return;
    }

    const metodoSelecionado = document.querySelector(
      'input[name="option"]:checked'
    );

    if (!metodoSelecionado) {
      showToastMessage("Selecione um método de pagamento.");
      return;
    }

    const clickedButton = e.submitter;

    if (!clickedButton || !clickedButton.id) {
      showToastMessage("❌ Botão de envio não identificado.");
      return;
    }

    const buttonId = clickedButton.id;

    switch (buttonId) {
      case "submit-payment-credit-card":
        await processarPagamentoCartao();
        break;
      case "submit-payment-pix":
        await processarPagamentoPix();
        break;
      default:
        console.warn("❓ Botão não reconhecido:", buttonId);
        showToastMessage("Erro ao identificar o tipo de pagamento.");
    }
  });

  async function processarPagamentoCartao() {
    const inputQuantidade = document.getElementById("quantity-sale");
    const precoUnitarioEl = document.getElementById("item-price-sale-unit");

    const quantidade = parseInt(inputQuantidade.value) || 0;
    const precoLimpo = precoUnitarioEl.value
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(",", ".");
    const precoUnitario = parseFloat(precoLimpo) || 0;
    let amountInCents = Math.round(quantidade * precoUnitario * 100);
    const brand = detectCardBrand(formCardNumber.value);
    const seguro = false;

    if (valorEntrega > 0) {
      amountInCents += valorEntrega;
    }

    // Validação básica
    if (
      !checkoutId ||
      !formCardNumber ||
      !formCardValid ||
      !formCardCode ||
      !formCardOwner ||
      !formCardCPF ||
      !formCardInstallments
    ) {
      showToastMessage("Preencha todos os campos corretamente!");
      return;
    }

    const formData = {
      checkoutId,
      cardNumber: formCardNumber.value.replace(/\s/g, ""),
      expirationDate: formatExpirationDate(formCardValid.value),
      cvv: formCardCode.value,
      nomeNoCartao: formCardOwner.value,
      cpfTitular: formCardCPF.value.replace(/\D/g, ""),
      parcelas: parseInt(formCardInstallments.value),
      seguro,
      amountInCents,
      brand,
    };

    try {
      const response = await fetch(`${apiBaseUrl}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Pagamento autorizado com sucesso!");
        localStorage.removeItem("checkoutId");
        const pay = data.payment;
        const brasp = data.braspagResponse;
        const cpfFormatado = formatCPF(pay.cpfTitular);
        formPayment.hidden = true;
        descDefault.classList.add("hide");
        descResumo.classList.remove("hide");
        formPayment.style.display = "none";

        paymentResult.innerHTML = `
        <p class="red-paragraph">
          ${data.message}
        </p>
        <p><strong>Nome:</strong> ${pay.nomeNoCartao}</p>
        <p><strong>CPF:</strong> ${cpfFormatado}</p>        
        <p><strong>Número do Cartão:************</strong> ${pay.last4Digits}</p>
        <p><strong>Bandeira:</strong> ${brasp.Payment.CreditCard.Brand}</p>
        <p><strong>Valor:</strong> R$ ${(brasp.Payment.Amount / 100).toFixed(
          2
        )}</p>
        <p><strong>Parcelas:</strong> ${pay.parcelas}</p>`;
        paymentResult.hidden = false;
        let formThanks = JSON.parse(localStorage.getItem("formThanks")) || {};
        formThanks.cardNumber = pay.last4Digits;
        formThanks.parcelas = formData.parcelas;
        formThanks.Bandeira = brasp.Payment.CreditCard.Brand;
        formThanks.valor = (brasp.Payment.Amount / 100).toFixed(2);
        formThanks.location = "";
        formThanks.checkoutId = formData.checkoutId;
        localStorage.setItem("formThanks", JSON.stringify(formThanks));
        setTimeout(() => {
          paymentResult.hidden = true;
          window.location.href = `${appBaseUrl}/thanks.html`;
        }, 7500);
      } else {
        showToastMessage("Erro ao processar pagamento: " + data.message);
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      showToastMessage("Erro inesperado no envio do pagamento.");
    }
  }

  async function processarPagamentoPix() {
    try {
      const inputQuantidade = document.getElementById("quantity-sale");
      const precoUnitarioEl = document.getElementById("item-price-sale-unit");

      const quantidade = parseInt(inputQuantidade.value) || 0;
      const precoLimpo = precoUnitarioEl.value
        .replace("R$", "")
        .replace(/\s/g, "")
        .replace(",", ".");

      const precoUnitario = parseFloat(precoLimpo) || 0;
      let total = quantidade * precoUnitario;

      const desconto = total * 0.05;
      const totalDesconto = total - desconto;

      const response = await fetch(`${apiBaseUrl}/pix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao: "Pagamento com Pix",
          valor: totalDesconto.toFixed(2),
        }),
      });

      const data = await response.json();
      console.log(data, "aqui data");

      if (response.ok) {
        showToast("Siga as instruções para fazer o pagamento!");
        localStorage.setItem("pixData", JSON.stringify(data));
        setTimeout(() => {
          paymentResult.hidden = true;
          window.location.href = `${appBaseUrl}/pix.html`;
        }, 5000);
      } else {
        throw new Error(data?.message || "Erro ao gerar PIX");
      }
    } catch (error) {
      console.error("❌ Erro no pagamento com PIX:", error);
      showToastMessage("Erro ao processar pagamento com PIX.");
    }
  }
  function atualizarTotal() {
    const quantidade = parseInt(inputQuantidade.value) || 0;

    const precoLimpo = precoUnitarioEl.value
      .replace("R$", "")
      .replace(/\s/g, "")
      .replace(",", ".");

    const precoUnitario = parseFloat(precoLimpo) || 0;

    const total = quantidade * precoUnitario;

    totalEl.value = total.toFixed(2).replace(".", ",");

    if (totalEl) {
      totalEl.textContent = formatarParaReal(total + valorEntrega);
    }
  }

  function checkName() {
    const name = formName.value.trim();
    if (name === "") {
      errorName(formName, "Preencha esse campo");
    } else {
      sucessName(formName);
    }
  }

  function checkEmail() {
    const email = formEmail.value.trim();
    if (email === "") {
      errorEmail(formEmail, "Preencha esse campo");
    } else {
      sucessEmail(formEmail);
    }
  }

  function checkCPF() {
    const cpf = formCPF.value.trim();
    if (cpf === "") {
      errorCPF(formCPF, "Preencha esse campo");
    } else {
      sucessCPF(formCPF);
    }
  }

  function checkTEL() {
    const tel = formTEL.value.trim();
    if (tel === "") {
      errorTEL(formTEL, "Preencha esse campo");
    } else {
      sucessTEL(formTEL);
    }
  }

  function checkCEP() {
    const cep = formCEP.value.trim();
    if (cep === "") {
      errorCEP(formCEP, "Preencha esse campo");
    } else {
      sucessCEP(formCEP);
    }
  }

  function checkAddress() {
    const address = formAddress.value.trim();
    if (address === "") {
      errorAddress(formAddress, "Preencha esse campo");
    } else {
      sucessAddress(formAddress);
    }
  }

  function checkNumber() {
    const number = formNumber.value.trim();
    if (number === "") {
      errorNumber(formNumber, "Preencha esse campo");
    } else {
      sucessNumber(formNumber);
    }
  }

  function checkDistrict() {
    const district = formDistrict.value.trim();
    if (district === "") {
      errorDistrict(formDistrict, "Preencha esse campo");
    } else {
      sucessDistrict(formDistrict);
    }
  }

  function checkNameSaved() {
    const nameSaved = formNameSaved.value.trim();
    if (nameSaved === "") {
      errorNameSaved(formNameSaved, "Preencha esse campo");
    } else {
      sucessNameSaved(formNameSaved);
      const button = formEntrega.querySelector("button");
      setButtonLoading(button, true);
      document.getElementById("named-save-button").classList.add("disabled");
    }
  }

  function checkCardNumber() {
    const cardNumber = formCardNumber.value.trim();
    if (cardNumber === "") {
      errorCardNumber(formCardNumber, "Preencha esse campo");
    } else {
      sucessCardNumber(formCardNumber);
    }
  }

  function checkCardValid() {
    const cardValid = formCardValid.value.trim();
    if (cardValid === "") {
      errorCardValid(formCardValid, "Preencha esse campo");
    } else {
      sucessCardValid(formCardValid);
    }
  }

  function checkCardCode() {
    const cardCode = formCardCode.value.trim();
    if (cardCode === "") {
      errorCardCode(formCardCode, "Preencha esse campo");
    } else {
      sucessCardCode(formCardCode);
    }
  }

  function checkCardOwner() {
    const cardOwner = formCardOwner.value.trim();
    if (cardOwner === "") {
      errorCardOwner(formCardOwner, "Preencha esse campo");
    } else {
      sucessCardOwner(formCardOwner);
    }
  }

  function checkCardCPF() {
    const cardCPF = formCardCPF.value.trim();
    if (cardCPF === "") {
      errorCardCPF(formCardCPF, "Preencha esse campo");
    } else {
      sucessCardCPF(formCardCPF);
    }
  }

  function checkInstallments() {
    const cardInstallments = formCardInstallments.value.trim();
    if (cardInstallments === "") {
      errorCardInstallments(formCardInstallments, "Preencha esse campo");
    } else {
      sucessCardInstallments(formCardInstallments);
    }
  }

  function errorName(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formName.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessName(input) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formName.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function errorEmail(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formEmail.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessEmail(input) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formEmail.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function errorCPF(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formCPF.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessCPF(input) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formCPF.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function errorTEL(input, message) {
    const formControl = input.parentElement.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formTEL.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessTEL(input) {
    const formControl = input.parentElement.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formTEL.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function errorCEP(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formCEP.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessCEP(input) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formCEP.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function errorAddress(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formAddress.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessAddress(input) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formAddress.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function errorNumber(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formNumber.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessNumber(input) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formNumber.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function errorDistrict(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formDistrict.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessDistrict(input) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formDistrict.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function errorNameSaved(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formNameSaved.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessNameSaved(input) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formNameSaved.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function errorCardNumber(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formCardNumber.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessCardNumber(input) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formCardNumber.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function errorCardValid(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formCardValid.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessCardValid(input) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formCardValid.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function errorCardCode(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formCardCode.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessCardCode(input) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formCardCode.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function errorCardOwner(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formCardOwner.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessCardOwner(input) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formCardOwner.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function errorCardCPF(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formCardCPF.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessCardCPF(input) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formCardCPF.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function errorCardInstallments(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = message;
    formCardInstallments.className = "input_error";
    icon_error.style.visibility = "visible";
  }

  function sucessCardInstallments(input) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    const icon_sucess = formControl.querySelector(".img-sucess");
    const icon_error = formControl.querySelector(".img-error");
    small.innerText = "";
    formCardInstallments.className = "input_sucess";
    icon_error.style.visibility = "hidden";
    icon_sucess.style.visibility = "visible";
  }

  function setButtonLoading(button, isLoading = true, duration = 750) {
    if (!button) return;

    const img = button.querySelector("img");
    const svg = button.querySelector("svg");

    if (isLoading) {
      button.classList.add("loading");
      if (img) img.style.display = "none";
      if (svg) svg.style.display = "none";

      // se quiser tirar depois de alguns segundos
      if (duration) {
        setTimeout(() => {
          setButtonLoading(button, false);
        }, duration);
      }
    } else {
      button.classList.remove("loading");
      if (img) img.style.display = "inline-flex";
      if (svg) svg.style.display = "inline-flex";
    }
  }

  const arrowToggle = document.querySelector(".icon-accordion");

  arrowToggle.addEventListener("click", () => {
    toggleMode();
  });

  function toggleMode() {
    const boxCardResume = document.querySelector(".box-card-resume");
    boxCardResume.classList.toggle("closed");
    const cardResume = document.querySelector("#resume-toggle");

    if (boxCardResume.classList.contains("closed")) {
      arrowToggle.classList.add("closed");
      cardResume.classList.add("col-mobile-hide");
    } else {
      boxCardResume.classList.remove("closed");
      arrowToggle.classList.remove("closed");
      cardResume.classList.remove("col-mobile-hide");
    }
  }

  // FORMATACAO INPUTS

  const cpf = document.querySelectorAll("#cpf");
  const tel = document.querySelector("#tel");

  cpf.forEach((e) => {
    e.addEventListener("keypress", () => {
      const cpfLength = e.value.length;

      if (cpfLength === 3 || cpfLength === 7) {
        e.value += ".";
        console.log(e.value);
      } else if (cpfLength === 11) {
        e.value += "-";
        console.log(e.value);
      }
      if (cpfLength === 14) {
        tel.focus();
        console.log(e.value);
      }
    });
  });

  tel.addEventListener("keypress", () => {
    const telLength = tel.value.length;

    if (telLength === 0) {
      tel.value += "(";
    }
    if (telLength === 3) {
      tel.value += ")";
      tel.value += " ";
    }
    if (telLength === 10) {
      tel.value += "-";
    }
  });

  const cep = document.querySelector("#cep");

  cep.addEventListener("keypress", () => {
    const cepLength = cep.value.length;

    if (cepLength === 2) {
      cep.value += ".";
    }
    if (cepLength === 6) {
      cep.value += "-";
    }
  });

  const cardNumber = document.querySelector("#card-number");

  cardNumber.addEventListener("keypress", () => {
    const cardNumberLength = cardNumber.value.length;

    if (
      cardNumberLength === 4 ||
      cardNumberLength === 9 ||
      cardNumberLength === 14
    ) {
      cardNumber.value += " ";
    }
  });

  const cardValid = document.querySelector("#card-valid");

  cardValid.addEventListener("keypress", () => {
    const cardValidLength = cardValid.value.length;

    if (cardValidLength === 2) {
      cardValid.value += "/";
    }
  });
});

function formatExpirationDate(date) {
  const [month, year] = date.split("/");
  const formattedYear = year.length === 2 ? `20${year}` : year;
  return `${month}/${formattedYear}`;
}

function validarCVV(cvv, brand) {
  if (!cvv) return false;

  const isAmex = brand === "American Express" || brand === "Amex";
  const regex = isAmex ? /^\d{4}$/ : /^\d{3}$/;

  return regex.test(cvv);
}

function detectCardBrand(number) {
  number = number.replace(/\D/g, "");

  if (/^4\d{12}(\d{3})?$/.test(number)) return "Visa";

  if (
    /^(5[1-5]\d{14}|2(2[2-9]\d{12}|[3-6]\d{13}|7[01]\d{12}|720\d{12}))$/.test(
      number
    )
  )
    return "Master";

  if (/^3[47]\d{13}$/.test(number)) return "Amex";

  if (/^35(2[89]|[3-8][0-9])\d{12}$/.test(number)) return "JCB";

  if (/^3(0[0-5]|[68])\d{11}$/.test(number)) return "Diners";

  if (
    /^(4011|431274|438935|451416|457393|457631|504175|506699|506770|509|627780|636297|636368|6500|651652|6550)/.test(
      number
    )
  ) {
    return "Elo";
  }

  if (
    /^(6011\d{12}|622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9([01]\d|2[0-5]))\d{10}|64[4-9]\d{13}|65(?!0[3-9]|1[0-9]|5[0-1]|0[0-2]|4[0-9])\d{14})$/.test(
      number
    )
  )
    return "Discover";

  if (/^(606282|3841)\d{7,12}$/.test(number)) return "Hipercard";

  return "Desconhecida";
}

function formatCPF(cpf) {
  const digits = cpf.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
