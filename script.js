// Configuração — preencher antes de publicar
const WHATSAPP_NUMBER = "5531986481032"; // DDI + DDD + número, só dígitos
const LEAD_WEBHOOK_URL = ""; // ex.: webhook do n8n; vazio = não envia o lead

const dialog = document.getElementById("lead-dialog");
const form = document.getElementById("lead-form");
const phone = form.elements.telefone;

document.querySelectorAll("[data-whatsapp]").forEach((btn) =>
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    dialog.dataset.servico = btn.dataset.whatsapp || "documentacao";
    dialog.showModal();
  })
);

dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
// fecha ao clicar fora da caixa
dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });

// máscara (31) 99999-9999
phone.addEventListener("input", () => {
  const d = phone.value.replace(/\D/g, "").slice(0, 11);
  phone.value = d.length > 10 ? d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
    : d.length > 6 ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
    : d.length > 2 ? d.replace(/(\d{2})(\d{0,5})/, "($1) $2")
    : d;
  phone.setCustomValidity(d.length === 10 || d.length === 11 ? "" : "Informe DDD + número.");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = form.elements.nome.value.trim();
  const servico = dialog.dataset.servico;
  const telefone = phone.value.replace(/\D/g, "");

  // sendBeacon: o navegador entrega o POST mesmo com a troca para o app do WhatsApp,
  // sem atrasar o redirecionamento (atrasar faz o iOS abrir a página web em vez do app).
  // urlencoded = sem preflight CORS. Sem confirmação do servidor: verificar os leads no destino.
  if (LEAD_WEBHOOK_URL) {
    const body = new URLSearchParams({ nome, telefone, servico, origem: "viagem-internacional", pagina: location.href });
    const queued = navigator.sendBeacon?.(LEAD_WEBHOOK_URL, body);
    if (!queued) fetch(LEAD_WEBHOOK_URL, { method: "POST", body, keepalive: true }).catch(() => {});
  }

  const msg = servico === "translado"
    ? `Olá! Sou ${nome} e gostaria de informações sobre o translado internacional do meu cão.`
    : `Olá! Sou ${nome} e gostaria de informações sobre viagem internacional com meu pet.`;
  window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
});
