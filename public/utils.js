// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getOrCreateCheckoutId() {
  let id = localStorage.getItem("checkoutId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("checkoutId", id);
  }
  return id;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function showToast(message, duration = 5000) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, duration);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function showToastMessage(message, duration = 5000) {
  const toast = document.getElementById("toast-message");
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, duration);
}
