export default async function handler(req, res) {
    try {
      const { thema } = req.body;
  
      if (!thema) {
        return res.status(400).json({ error: "Kein Thema angegeben" });
      }
  
      const prompt = `Erstelle 10 Quizfragen zum Thema "${thema}". Jede Frage hat 4 Antwortmöglichkeiten (A bis D), nur eine ist richtig. Formatiere sie so:
  
  Frage 1: [Text]
  A: ...
  B: ...
  C: ...
  D: ...
  Richtige Antwort: [A/B/C/D]
  
  Wiederhole das für alle 10 Fragen.`;
  
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });
  
      // Debug-Ausgabe: zeigt, was GPT wirklich antwortet
      const raw = await response.text();
      console.log("Antwort von OpenAI:", raw);
  
      // Versuche das Ergebnis zu parsen (falls gültig)
      const data = JSON.parse(raw);
  
      if (!data.choices || !data.choices[0]?.message?.content) {
        console.error("GPT-Antwort ungültig:", data);
        return res.status(500).json({ error: "GPT-Antwort ungültig" });
      }
  
      const quizText = data.choices[0].message.content;
      res.status(200).json({ quizText });
    } catch (err) {
      console.error("Fehler in /api/quiz:", err);
      res.status(500).json({ error: "Fehler beim Generieren des Quiz" });
    }
  }
  