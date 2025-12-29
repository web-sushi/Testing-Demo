/* =========================
   CUSTOM TOUR MODAL SCRIPT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("customTourModal");
  const openBtns = document.querySelectorAll("[data-open-custom-tour]");
  const closeBtns = modal?.querySelectorAll("[data-close]");
  const steps = modal?.querySelectorAll(".tour-step");
  const nextBtns = modal?.querySelectorAll("[data-next]");
  const backBtns = modal?.querySelectorAll("[data-back]");

  if (!modal) return;

  let currentStep = 0;

  /* -------------------------
     OPEN / CLOSE
  ------------------------- */
  openBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
      goToStep(0);
    });
  });

  closeBtns.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  function closeModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  /* -------------------------
     STEP NAVIGATION
  ------------------------- */
  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        goToStep(currentStep);
      }
    });
  });

  backBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep > 0) {
        currentStep--;
        goToStep(currentStep);
      }
    });
  });

  function goToStep(index) {
    steps.forEach((step, i) => {
      step.classList.toggle("is-active", i === index);
    });
  }

  /* -------------------------
     TOUR ESTIMATION LOGIC
  ------------------------- */
  const durationSelect = modal.querySelector("#tourDuration");
  const vehicleSelect = modal.querySelector("#transportMode");
  const estimateBox = modal.querySelector("#tourEstimate");

  function calculateEstimate() {
    const duration = durationSelect.value;
    const vehicle = vehicleSelect.value;

    let basePrice = 0;

    // Duration base (JPY)
    switch (duration) {
      case "4h":
        basePrice = 20000;
        break;
      case "day":
        basePrice = 35000;
        break;
      case "3days":
        basePrice = 95000;
        break;
      case "7days":
        basePrice = 220000;
        break;
      default:
        basePrice = 0;
    }

    // Vehicle multiplier
    let multiplier = 1;
    switch (vehicle) {
      case "walk":
        multiplier = 0.8;
        break;
      case "bike":
        multiplier = 0.9;
        break;
      case "car":
        multiplier = 1.2;
        break;
      case "van":
        multiplier = 1.5;
        break;
      case "bus":
        multiplier = 2;
        break;
    }

    const finalJPY = Math.round(basePrice * multiplier);
    const finalUSD = Math.round(finalJPY / 150);

    estimateBox.innerHTML = `
      <strong>Estimated Tour Cost</strong>
      <p>¥${finalJPY.toLocaleString()} / $${finalUSD}</p>
      <small>* Final price may vary depending on itinerary & availability</small>
    `;
  }

  durationSelect?.addEventListener("change", calculateEstimate);
  vehicleSelect?.addEventListener("change", calculateEstimate);
});
