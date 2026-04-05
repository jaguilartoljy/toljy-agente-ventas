import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Eres TOLY, el agente de ventas virtual de Toljy, una fábrica mexicana de equipos de iluminación profesional. Tu rol es atender clientes, responder dudas, calificar prospectos y apoyar al equipo de ventas.

SOBRE TOLJY:
- Fabricante mexicano de equipos de iluminación profesional
- Productos: luminarias industriales, comerciales, LED, alumbrado público, iluminación arquitectónica, proyectores, paneles LED, reflectores
- Ofrecemos soluciones para industria, comercio, gobierno y proyectos especiales
- Garantía de fábrica, soporte técnico, instalación y proyectos llave en mano
- Presencia nacional en México

TU PERSONALIDAD:
- Eres amable, profesional y conocedor
- Hablas en español mexicano natural, no robótico
- Eres proactivo: siempre buscas entender la necesidad del cliente
- Cuando el cliente tiene una necesidad concreta, intentas calificarla
- Si no tienes información exacta, dices que lo verificas con el equipo técnico
- Al final de conversaciones con prospectos serios, intentas obtener: nombre, teléfono, correo y proyecto`;

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: "rgba(255,180,0,0.08)", borderRadius: 16, borderBottomLeftRadius: 4, width: "fit-content" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#FFB400",
          animation: "bounce 1.2s infinite",
          animationDelay: `${i * 0.2}s`
        }} />
      ))}
    </div>
  );
}

function Message({ msg }) {
  const isBot = msg.role === "assistant";
  return (
    <div style={{
      display: "flex", flexDirection: isBot ? "row" : "row-reverse",
      alignItems: "flex-end", gap: 8, marginBottom: 12,
      animation: "fadeSlide 0.3s ease"
    }}>
      {isBot && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, #FFB400, #FF6B00)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, color: "#000", flexShrink: 0,
          boxShadow: "0 2px 8px rgba(255,180,0,0.4)"
        }}>T</div>
      )}
      <div style={{
        maxWidth: "78%", padding: "10px 14px",
        borderRadius: isBot ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
        background: isBot ? "rgba(255,180,0,0.08)" : "linear-gradient(135deg, #FFB400, #FF8C00)",
        color: isBot ? "#F0F0F0" : "#000",
        fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-wrap"
      }}>
        {msg.content}
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "¡Hola! Soy TOLY, tu asesor virtual de Toljy 💡\n\n¿En qué te puedo ayudar hoy? Ya sea que necesites iluminación para un proyecto industrial, comercial o arquitectónico, estoy aquí para orientarte." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": API_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Lo siento, hubo un error.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error de conexión. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  const quickReplies = ["Ver productos", "Solicitar cotización", "Proyecto industrial", "Hablar con vendedor"];

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0A; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Segoe UI', sans-serif; }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,180,0,0.4)} 50%{box-shadow:0 0 0 8px rgba(255,180,0,0)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,180,0,0.2); border-radius: 4px; }
        textarea { resize: none; font-family: inherit; }
      `}</style>
      <div style={{
        width: "100%", maxWidth: 420, height: "100vh", maxHeight: 720,
        display: "flex", flexDirection: "column", background: "#111111",
        borderRadius: 24, overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,180,0,0.12)"
      }}>
        {/* Header */}
        <div style={{ padding: "18px 20px", background: "linear-gradient(135deg, #1A1400, #1C1200)", borderBottom: "1px solid rgba(255,180,0,0.15)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #FFB400, #FF6B00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#000", animation: "pulse 2s infinite" }}>T</div>
            <div style={{ position: "absolute", bottom: 2, right: 2, width: 10, height: 10, borderRadius: "50%", background: "#22C55E", border: "2px solid #111" }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#FFB400", letterSpacing: 1 }}>TOLY</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Asesor virtual · Toljy Iluminación</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
            <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>En línea</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column" }}>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #FFB400, #FF6B00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#000" }}>T</div>
              <TypingIndicator />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {messages.length <= 2 && (
          <div style={{ padding: "0 16px 10px", display: "flex", flexWrap: "wrap", gap: 6 }}>
            {quickReplies.map(q => (
              <button key={q} onClick={() => { setInput(q); }}
                style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid rgba(255,180,0,0.3)", background: "rgba(255,180,0,0.06)", color: "#FFB400", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "10px 14px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "#0E0E0E", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Escribe tu mensaje..." rows={1}
            style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 14px", color: "#F0F0F0", fontSize: 13.5, outline: "none", lineHeight: 1.5 }}
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            style={{ width: 42, height: 42, borderRadius: "50%", border: "none", background: input.trim() ? "linear-gradient(135deg, #FFB400, #FF8C00)" : "rgba(255,255,255,0.08)", color: input.trim() ? "#000" : "rgba(255,255,255,0.3)", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>

        <div style={{ textAlign: "center", padding: "6px 0 10px", fontSize: 10.5, color: "rgba(255,255,255,0.2)" }}>
          Powered by IA · Toljy Iluminación 💡
        </div>
      </div>
    </>
  );
}
