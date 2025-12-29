/* =========================
   FORMS HANDLING (DEMO)
========================= */

document.addEventListener("DOMContentLoaded", () => {
  // Handle forms with data-form attribute OR forms in contact page
  const forms = document.querySelectorAll("form[data-form], .form-panel form, .contact-forms form");

  forms.forEach((form) => {
    // Skip if it's the custom tour form (handled by modal)
    if (form.closest("[data-panel='custom']")) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSubmit(form);
    });
  });

  function handleSubmit(form) {
    const formType = form.dataset.form || form.closest(".form-panel")?.dataset.panel || "inquiry";
    const fields = form.querySelectorAll("input, select, textarea");
    let valid = true;
    let summary = "";

    fields.forEach((field) => {
      // Skip buttons
      if (field.type === "submit" || field.type === "button") return;

      if (field.hasAttribute("required") && !field.value.trim()) {
        field.classList.add("error");
        valid = false;
      } else {
        field.classList.remove("error");
      }

      if (field.value && field.value.trim()) {
        const label = field.placeholder || field.name || formatLabel(field.name || "Field");
        summary += `<li><strong>${label}:</strong> ${field.value}</li>`;
      }
    });

    if (!valid) {
      showMessage(form, "Please fill in all required fields.", "error");
      return;
    }

    // Simulated submit success
    showPreview(form, formType, summary);
  }

  /* -------------------------
     UI HELPERS
  ------------------------- */
  function showPreview(form, type, summary) {
    const preview = document.createElement("div");
    preview.className = "form-preview";

    preview.innerHTML = `
      <h4>Submission Preview</h4>
      <ul>${summary}</ul>
      <p class="micro muted">
        This is a demo preview. In a live site, this would be sent to the company.
      </p>
      <button type="button" class="btn ghost small" data-reset>Submit Another</button>
    `;

    form.style.display = "none";
    form.parentElement.appendChild(preview);

    preview.querySelector("[data-reset]").addEventListener("click", () => {
      preview.remove();
      form.reset();
      form.style.display = "";
    });
  }

  function showMessage(form, message, type) {
    let msg = form.querySelector(".form-message");

    if (!msg) {
      msg = document.createElement("div");
      msg.className = "form-message";
      form.prepend(msg);
    }

    msg.textContent = message;
    msg.classList.remove("error", "success");
    msg.classList.add(type);
  }

  function formatLabel(name) {
    return name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  }
});
