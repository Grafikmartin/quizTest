const themaInput = document.getElementById("themaInput");
const levelSelect = document.getElementById("levelSelect");
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
  const level = levelSelect.value;

  if (!thema) return;

  startBtn.textContent = "⏳ Fragen werden geladen...";
  startBtn.disabled = true;

  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thema, level })
    });

    const data = await res.json();

    if (data.quizText) {
      const fragen = parseQuizText(data.quizText);
      zeigeFrage(fragen, 0, 0);
    } else {
      alert("GPT konnte keine Fragen generieren. Bitte versuche es erneut.");
      console.error("Antwort vom Server:", data);
    }

    startBtn.textContent = "🚀 Quiz starten";
  } catch (err) {
    console.error("Fehler beim Laden der Fragen:", err);
    startBtn.textContent = "🚀 Quiz starten";
  }

  startBtn.disabled = false;
});

// GPT-Antwort in Fragen-Array umwandeln
function parseQuizText(text) {
  const fragen = [];
  const blocks = text.split(/Frage\s\d+:/g).slice(1);

  blocks.forEach(block => {
    const lines = block.trim().split('\n');
    const frage = lines[0];
    const antworten = {
      A: lines[1]?.replace(/^A:\s*/, '').trim(),
      B: lines[2]?.replace(/^B:\s*/, '').trim(),
      C: lines[3]?.replace(/^C:\s*/, '').trim(),
      D: lines[4]?.replace(/^D:\s*/, '').trim()
    };
    const richtigLine = lines.find(line => line.startsWith('Richtige Antwort'));
    const richtig = richtigLine ? richtigLine.split(':')[1].trim().toUpperCase() : null;

    fragen.push({ frage, antworten, richtig });
  });

  return fragen;
}

// Frage anzeigen + Interaktion
function zeigeFrage(quiz, index, score) {
  const aktuelle = quiz[index];

  document.querySelector(".container").innerHTML = `
    <h2>Frage ${index + 1} von ${quiz.length}</h2>
    <p>${aktuelle.frage}</p>
    <div class="antworten">
      ${Object.entries(aktuelle.antworten).map(([key, value]) => `
        <button class="antwort-btn" data-key="${key}">${key}: ${value}</button>
      `).join("")}
    </div>
    <p id="feedback"></p>
  `;

  document.querySelectorAll(".antwort-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const auswahl = btn.dataset.key;
      const korrekt = aktuelle.richtig;

      const feedback = document.getElementById("feedback");
      let neuerScore = score;

      if (auswahl === korrekt) {
        feedback.textContent = "✅ Richtig!";
        feedback.style.color = "lightgreen";
        neuerScore++;
      } else {
        feedback.textContent = `❌ Falsch. Richtig war: ${korrekt}`;
        feedback.style.color = "salmon";
      }

      setTimeout(() => {
        if (index + 1 < quiz.length) {
          zeigeFrage(quiz, index + 1, neuerScore);
        } else {
          zeigeErgebnis(quiz.length, neuerScore);
        }
      }, 2000);
    });
  });
}

// Ergebnis anzeigen
function zeigeErgebnis(gesamt, richtig) {
  document.querySelector(".container").innerHTML = `
    <h2>🎉 Quiz beendet!</h2>
    <p>Du hast ${richtig} von ${gesamt} Fragen richtig beantwortet.</p>
    <button onclick="location.reload()">🔁 Nochmal spielen</button>
  `;
}
