import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, Bot, User, X, Minimize2, Maximize2, CheckCircle } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { geminiRequest } from '../utils/geminiRequest';

interface Course {
  id: string;
  name: string;
  credits: number;
  schedule: string[];
}

// Utilidad de copia
const copyToClipboard = (text: string) => {
  return new Promise<void>((resolve, reject) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(resolve, reject);
      } else {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = text;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
        resolve();
      }
    } catch (err) {
      reject(err);
    }
  });
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const SchedulerChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id: number; type: 'user' | 'bot'; content: string }[]>([
    { id: 1, type: 'bot', content: '¡Hola! Soy SchedulerBot. Puedes subir imágenes de horarios o preguntarme sobre la plataforma.' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (copiedMessage) {
      const timer = setTimeout(() => setCopiedMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [copiedMessage]);

  // 🧠 Imagen -> texto -> análisis
  const processScheduleImage = async (file: File): Promise<string> => {
    if (!GEMINI_API_KEY) {
      throw new Error('Error de Configuración: falta la clave API (VITE_GEMINI_API_KEY).');
    }

    const MAX_FILE_SIZE = 4 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) return 'Imagen muy grande (máx 4MB). Reduce el tamaño.';

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const prompt = `Analiza esta imagen de un horario universitario y extrae SOLO las materias en este formato EXACTO:

CODIGO | NOMBRE | CREDITOS | DIA HORA_INICIO-HORA_FIN, DIA HORA_INICIO-HORA_FIN

Ejemplo:
MAT101 | Cálculo Diferencial | 4 | Lunes 08:00-10:00, Miércoles 08:00-10:00
CS101 | Programación I | 3 | Martes 10:00-12:00, Jueves 10:00-12:00

Reglas estrictas:
- Un formato por línea
- Horas 24h (08:00, 14:00)
- Días: Lunes-Viernes
- Si no hay créditos visibles, usa 3
- NO explicaciones, solo datos`;

    try {
      const data = await geminiRequest(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: file.type,
                    data: base64
                  }
                }
              ]
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
          })
        }
      );

      const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!extractedText.trim()) {
        return 'No pude extraer información. Asegúrate de que la imagen muestre un horario claro.';
      }

      return await parseScheduleWithAI(extractedText);
    } catch (error: any) {
      throw new Error(error.message || 'Ocurrió un error al procesar la imagen.');
    }
  };

  const parseScheduleWithAI = async (ocrText: string): Promise<string> => {
    const lines = ocrText.split('\n').filter(line => line.trim());
    const courses: Course[] = [];

    const geminiLinePattern = /([A-Z0-9]+)\s*\|\s*([^|]+)\s*\|\s*(\d+)\s*\|\s*(.*)/i;
    const schedulePattern = /(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado)\s*(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/gi;

    for (const line of lines) {
      const match = geminiLinePattern.exec(line);
      if (match) {
        const [, id, name, creditsStr, schedulePart] = match;
        const schedules: string[] = [];
        let scheduleMatch;
        while ((scheduleMatch = schedulePattern.exec(schedulePart)) !== null) {
          schedules.push(`${scheduleMatch[1]} ${scheduleMatch[2]}-${scheduleMatch[3]}`);
        }
        courses.push({
          id: id.trim(),
          name: name.trim(),
          credits: parseInt(creditsStr, 10),
          schedule: schedules.length ? schedules : ['Horario no detectado']
        });
      }
    }

    if (!courses.length) {
      return `He detectado el siguiente texto:\n\n${ocrText.substring(0, 500)}...\n\nNo pude identificar materias con el formato esperado.`;
    }

    const formatted = courses
      .map(c => `${c.id} | ${c.name} | ${c.credits} | ${c.schedule.join(' | ')}`)
      .join('\n');

    return `He procesado tu horario y detecté ${courses.length} materia(s):\n\n${formatted}\n\n¿Deseas generar combinaciones o exportar los datos?`;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', content: `📸 He subido una imagen: ${file.name}` }]);

    try {
      const result = await processScheduleImage(file);
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: result }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: error.message }]);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 🗣️ Chat general
  const getAIResponse = async (question: string, context: typeof messages): Promise<string> => {
    if (!GEMINI_API_KEY) throw new Error('Error: Falta la clave API de Gemini.');

    const conversation = context.slice(-6).map(m => `${m.type === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`).join('\n');

    const systemPrompt = `Eres SchedulerBot, un asistente amigable para organizar horarios universitarios.
Habla casual, directo, sin formato Markdown.
Funciones: OCR, combinaciones, exportar, detectar choques, etc.

HISTORIAL:
${conversation}

PREGUNTA: ${question}`;

    try {
      const data = await geminiRequest(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
          })
        }
      );

      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta.';
    } catch (error: any) {
      throw new Error(error.message || 'Ocurrió un error al generar la respuesta.');
    }
  };

  // 📨 Enviar mensaje
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg = { id: Date.now(), type: 'user' as const, content: inputText };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInputText('');
    setIsProcessing(true);

    try {
      const aiResponse = await getAIResponse(inputText, currentMessages);
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: aiResponse }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', content: error.message }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // (Exportar chat se mantiene igual)
  const handleExportChat = async () => {
    const lastBotMessage = messages.slice().reverse().find(m => m.type === 'bot');
    const pattern = /^[A-Z0-9]+\s*\|\s*[^|]+\s*\|\s*\d+\s*\|\s*.*$/gim;
    if (lastBotMessage) {
      const matches = lastBotMessage.content.match(pattern);
      if (matches?.length) {
        await copyToClipboard(matches.join('\n'));
        setCopiedMessage('¡Materias copiadas al portapapeles!');
        return;
      }
    }

    try {
      const chatContainer = document.getElementById('chat-container');
      if (!chatContainer) throw new Error('No se encontró el contenedor.');
      const dataUrl = await htmlToImage.toPng(chatContainer, { backgroundColor: '#ffffff', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'chat-scheduler.png';
      link.href = dataUrl;
      link.click();
      setCopiedMessage('Chat exportado como imagen.');
    } catch {
      setCopiedMessage('Error al exportar el chat.');
    }
  };

  const toggleMinimize = () => setIsMinimized(!isMinimized);

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 p-4 bg-brand-blue-900 dark:bg-brand-blue-800 text-white rounded-full shadow-lg hover:bg-brand-blue-800 dark:hover:bg-brand-blue-700 transition-all duration-300 hover:scale-110"
          aria-label="Abrir chat de Scheduler"
        >
          <Bot className="w-6 h-6" />
        </button>
      )}

      {/* Alerta de Copiado (estilo decente) */}
      {copiedMessage && (
        <div className="fixed top-4 right-4 z-[60] flex items-center p-4 mb-4 text-sm text-green-800 border border-green-300 rounded-lg bg-green-50 shadow-md transition-opacity duration-300 ease-in-out" role="alert">
          <CheckCircle className="w-5 h-5 mr-3" />
          <span className="font-medium">{copiedMessage}</span>
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8"
            onClick={() => setCopiedMessage(null)}
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}


      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <h2 className="font-bold">SchedulerBot</h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={toggleMinimize}
                className="p-1 rounded-full hover:bg-blue-500 transition-colors"
                aria-label={isMinimized ? "Maximizar" : "Minimizar"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-blue-500 transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat content */}
          {!isMinimized && (
            <>
              <div id="chat-container" className="h-80 overflow-y-auto p-4 bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs p-3 rounded-lg ${message.type === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                        }`}
                    >
                      <div className="flex items-center mb-1">
                        {message.type === 'user' ? (
                          <User className="w-4 h-4 mr-2" />
                        ) : (
                          <Bot className="w-4 h-4 mr-2 text-blue-500" />
                        )}
                        <span className="text-xs font-semibold">
                          {message.type === 'user' ? 'Tú' : 'SchedulerBot'}
                        </span>
                      </div>
                      {/* Esta clase 'whitespace-pre-wrap' es importante, 
                        conserva los saltos de línea que envía el bot.
                      */}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 text-gray-800 p-3 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-gray-500 rounded-full mr-2 animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full mr-2 animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                      </div>
                      <p className="text-sm mt-2">Procesando...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    <span className="text-sm">Subir</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Pregunta sobre horarios o la plataforma..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isProcessing}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim() || isProcessing}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-blue-500 disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={handleExportChat}
                    className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Copiar materias del bot o Exportar chat como imagen"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="text-sm">Copiar/Exportar</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default SchedulerChatbot;