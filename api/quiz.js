export default async function handler(req, res) {
  try {
    const { thema, level } = req.body;

    if (!thema || !level) {
      return res.status(400).json({ error: "Thema oder Level fehlt" });
    }

    // Detaillierte Beschreibung der Schwierigkeitsstufen
    const levelBeschreibungen = {
      "Anfänger": "sehr einfache Fragen, die jeder beantworten kann, auch ohne Vorwissen",
      "Kandidat": "einfache Fragen mit grundlegendem Allgemeinwissen",
      "Halbfinale": "mittelschwere Fragen, die etwas tieferes Wissen erfordern",
      "Finale": "schwierige Fragen, die detailliertes Wissen erfordern",
      "Quizchampion": "sehr anspruchsvolle Fragen mit Expertenwissen und kniffligen Details"
    };

    const levelBeschreibung = levelBeschreibungen[level] || "mittelschwere Fragen";

    const prompt = `Erstelle 10 Quizfragen zum Thema "${thema}" mit folgendem Schwierigkeitsgrad:
    
Aktuell gewählter Schwierigkeitsgrad: "${level}" (${levelBeschreibung})

Beachte dabei die Abstufung der Schwierigkeitsgrade:
- Anfänger (Hohlbirne): Sehr einfache, grundlegende Fragen die jeder beantworten kann
- Kandidat (Alltagsdenker): Einfache Fragen mit Basis-Allgemeinwissen
- Halbfinale (Klugscheißer): Mittelschwere Fragen mit spezifischerem Wissen
- Finale (Besserwisser-Genie): Schwierige Fragen die detailliertes Fachwissen erfordern
- Quizchampion (Superhirn mit Dachschaden): Extrem schwierige Expertenfragen mit Details und Feinheiten

Formatiere die Fragen wie folgt:

Frage 1: [Text]
A: ...
B: ...
C: ...
D: ...
Richtige Antwort: [A/B/C/D]

Wichtig: 
- Stelle sicher, dass die Fragen EXAKT dem gewählten Schwierigkeitsgrad "${level}" entsprechen
- Die Antwortmöglichkeiten sollten plausibel sein
- Bei höheren Schwierigkeitsgraden auch Fangfragen und Details einbauen
- Bei niedrigeren Schwierigkeitsgraden die Fragen einfach und klar formulieren

Erstelle nun 10 Fragen in diesem Format.`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ 
          role: "system", 
          content: "Du bist ein erfahrener Quizmaster, der Fragen exakt nach Schwierigkeitsgrad erstellt."
        },
        { 
          role: "user", 
          content: prompt 
        }],
        temperature: 0.7,
      }),
    });

    const raw = await openaiRes.text();
    console.log("❗️RAW GPT:", raw);

    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("❌ GPT-Antwort konnte nicht geparst werden:", e.message);
      return res.status(500).json({ error: "GPT-Antwort ungültig (kein JSON)" });
    }

    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error("❌ GPT-Antwort hat keine Frage:", data);
      return res.status(500).json({ error: "GPT-Antwort leer oder fehlerhaft" });
    }

    const quizText = data.choices[0].message.content;
    res.status(200).json({ quizText });
  } catch (err) {
    console.error("❌ Fehler im Handler:", err);
    res.status(500).json({ error: "Fehler beim Generieren des Quiz" });
  }
}
