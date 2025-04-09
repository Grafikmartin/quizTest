export default async function handler(req, res) {
    const { thema } = req.body;
  
    const prompt = `Erstelle 10 Quizfragen zum Thema "${thema}". Jede Frage hat 4 Antwortmöglichkeiten (A bis D), nur eine ist richtig. Formatiere sie so:
  
  Frage 1: [Text]
  A: ...
  B: ...
  C: ...
  D: ...
  Richtige Antwort: [A/B/C/D]
  
  Wiederhole das für alle 10 Fragen.`;
  
    try {
      const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
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
  
      const json = await gptRes.json();
      const content = json.choices[0].message.content;
  
      res.status(200).json({ quizText: content });
    } catch (err) {
      console.error("GPT API Fehler:", err);
      res.status(500).json({ error: "Fehler beim Laden des Quiz" });
    }
  }
  