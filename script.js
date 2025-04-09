const themaInput = document.getElementById("themaInput");
const themaCards = document.querySelectorAll(".thema-card");
const startBtn = document.getElementById("startBtn");

// Themenkarten klicken → ins Input-Feld schreiben
themaCards.forEach(card => {
  card.addEventListener("click", () => {
    themaInput.value = card.textContent;
    startBtn.disabled = false;
    markiereAktiveKarte(card);
  });
});

// Eingabefeld manuell
themaInput.addEventListener("input", () => {
  startBtn.disabled = themaInput.value.trim() === "";
  entferneKartenMarkierung();
});

// Karten visuell markieren
function markiereAktiveKarte(aktive) {
  themaCards.forEach(card => card.classList.remove("active"));
  aktive.classList.add("active");
}

function entferneKartenMarkierung() {
  themaCards.forEach(card => card.classList.remove("active"));
}

// Quiz starten
startBtn.addEventListener("click", async () => {
  const thema = themaInput.value.trim();
  if (!thema) return;

  startBtn.textContent = "⏳ Fragen werden geladen...";
  startBtn.disabled = true;

  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thema })
    });

    const data = await res.json();

    // Nur für Testzwecke: zeige GPT-Antwort in der Konsole
    console.log("Antwort von GPT:", data.quizText);

    // Später: hier parsen und Quiz anzeigen
    startBtn.textContent = "🚀 Quiz starten";
  } catch (err) {
    console.error("Fehler beim Laden der Fragen:", err);
    startBtn.textContent = "🚀 Quiz starten";
  }

  startBtn.disabled = false;
});
