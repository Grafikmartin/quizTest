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
  
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
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
  