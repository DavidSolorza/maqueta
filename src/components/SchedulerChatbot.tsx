import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, Bot, User, X, Minimize2, Maximize2, CheckCircle } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface Course {
  id: string;
  name: string;
  credits: number;
  schedule: string[];
}

// *** Simulación de utilidad de copia (mantener fuera del componente) ***
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
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null); // Estado para la alerta
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Ocultar la alerta de copiado después de un tiempo
  useEffect(() => {
    if (copiedMessage) {
      const timer = setTimeout(() => {
        setCopiedMessage(null);
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [copiedMessage]);


  // OCR + AI parsing with Gemini Vision API
  const processScheduleImage = async (file: File): Promise<string> => {
    if (!GEMINI_API_KEY) {
      throw new Error('Error de Configuración: La clave API de Gemini no está cargada (VITE_GEMINI_API_KEY). Verifica tu archivo .env y reinicia el servidor.');
    }
    
    const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
    
    if (file.size > MAX_FILE_SIZE) {
      return 'Imagen muy grande (máx 4MB). Reduce el tamaño.';
    }

    try {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); 
        };
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
- Horas en formato 24h (08:00, 14:00)
- Días: Lunes, Martes, Miércoles, Jueves, Viernes
- Si no hay créditos visibles, usa 3
- NO agregues comentarios ni explicaciones
- SOLO devuelve las líneas con datos`;

      // *** Using 'gemini-flash-latest' as identified ***
      const response = await fetch(
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
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 2048
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini Vision API Error:', errorData);
        // Si el error es 400 (Bad Request), probablemente sea la clave no válida.
        throw new Error(`Error ${response.status}: ${errorData?.error?.message || 'Fallo al conectar con la API (revisa la clave API)'}`);
      }

      const data = await response.json();
      const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!extractedText.trim()) {
        return 'No pude extraer información. Asegúrate de que la imagen muestre un horario claro.';
      }

      return await parseScheduleWithAI(extractedText);
      
    } catch (error: any) {
      console.error('Gemini Error:', error);
      throw new Error(`Error al procesar la imagen: ${error.message}. Usa "Escribir por texto" como alternativa.`);
    }
  };

  // Parse schedule using intelligent pattern matching (adapted for Gemini's structured output)
  const parseScheduleWithAI = async (ocrText: string): Promise<string> => {
    const lines = ocrText.split('\n').filter(line => line.trim());
    const courses: Course[] = [];
    
    const geminiLinePattern = /([A-Z0-9]+)\s*\|\s*([^|]+)\s*\|\s*(\d+)\s*\|\s*(.*)/i;
    const schedulePattern = /(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado)\s*(\d{1,2}:\d{2})-(\d{1,2}:\d{2})/gi;
    
    lines.forEach(line => {
      const lineMatch = geminiLinePattern.exec(line);
      if (lineMatch) {
        const [, id, name, creditsStr, schedulePart] = lineMatch;
        const schedules: string[] = [];
        let scheduleMatch;
        
        while ((scheduleMatch = schedulePattern.exec(schedulePart)) !== null) {
          schedules.push(`${scheduleMatch[1]} ${scheduleMatch[2]}-${scheduleMatch[3]}`);
        }
        
        courses.push({
          id: id.trim(),
          name: name.trim(),
          credits: parseInt(creditsStr.trim(), 10),
          schedule: schedules.length > 0 ? schedules : ['Horario no detectado']
        });
      }
    });
    
    if (courses.length === 0) {
      return `He detectado el siguiente texto:\n\n${ocrText.substring(0, 500)}...\n\nNo pude identificar materias con el formato esperado (ID | Nombre | Créditos | Horario). ¿Podrías subir una imagen más clara o describir el formato del horario?`;
    }
    
    const formattedCourses = courses.map(course => 
      `${course.id} | ${course.name} | ${course.credits} | ${course.schedule.join(' | ')}`
    ).join('\n');
    
    return `He procesado tu horario y detecté ${courses.length} materia(s) con el formato solicitado:\n\n${formattedCourses}\n\n¿Quieres que genere combinaciones de horarios o exportar estos datos?`;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const userMessage = { id: Date.now(), type: 'user' as const, content: `📸 He subido una imagen: ${file.name}` };
    setMessages(prev => [...prev, userMessage]);

    try {
      const result = await processScheduleImage(file);
      const botMessage = { id: Date.now() + 1, type: 'bot' as const, content: result };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      // Se usa el error capturado de processScheduleImage para mostrarlo al usuario
      const errorMessage = { id: Date.now() + 1, type: 'bot' as const, content: error instanceof Error ? error.message : 'Error desconocido al procesar la imagen' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      // @ts-ignore
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // AI-powered response with Gemini API
  const getAIResponse = async (question: string, context: typeof messages): Promise<string> => {
    if (!GEMINI_API_KEY) {
      throw new Error('Error de Configuración: La clave API de Gemini no está cargada para el chat. Verifica tu archivo .env y reinicia el servidor.');
    }
    
    try {
      const conversationHistory = context.slice(-6).map(m => 
        `${m.type === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`
      ).join('\n');

      const systemPrompt = `Eres SchedulerBot, un asistente amigable para organizar horarios de universidad.
Habla de forma casual y ve al grano, como un compañero de clase.

FUNCIONES DE LA APP:
- Cargar materias: Manual, por texto, o subiendo un JSON.
- OCR de imágenes: Sube una foto de tu horario y la digitalizo.
- Generador: Crea combinaciones de horarios sin choques.
- Exportar: Saca tu horario o el chat como PNG o JSON.
- Detección de conflictos: Te avisa si hay choques.
- Filtros: Optimiza por huecos, créditos, o días.

HISTORIAL RECIENTE:
${conversationHistory}

PREGUNTA: ${question}

REGLAS IMPORTANTES:
1.  **Tono:** Sé amable, conciso y directo. Usa un lenguaje humano y casual.
2.  **FORMATO:** ¡NO USES MARKDOWN! Escribe solo texto plano. (No uses **negritas**, *cursivas*, - listas, etc.). Las negritas y otros formatos se ven mal en el chat.`;

      // *** Using 'gemini-flash-latest' as identified ***
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini Chat API Error:', errorData);
        throw new Error(`Error ${response.status}: ${errorData?.error?.message || 'Fallo al conectar con la API (revisa la clave API)'}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 
        'No pude generar respuesta. Reformula tu pregunta.';
      
    } catch (error: any) {
      console.error('Gemini error:', error);
      throw new Error(`Error temporal al procesar la pregunta: ${error.message}. Intenta de nuevo.`);
    }
  };
  // === FIN REFECTORIZACIÓN CHAT ===

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now(), type: 'user' as const, content: inputText };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages); 
    const question = inputText;
    setInputText('');

    setIsProcessing(true);

    try {
      const aiResponse = await getAIResponse(question, currentMessages);
      const botMessage = { 
        id: Date.now() + 1, 
        type: 'bot' as const, 
        content: aiResponse 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { 
        id: Date.now() + 1, 
        type: 'bot' as const, 
        content: error instanceof Error ? error.message : 'Lo siento, hubo un error desconocido al procesar tu pregunta.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * REFACTORIZACIÓN: La función ahora detecta el formato de materia en la última
   * respuesta del bot, copia esas líneas al portapapeles y notifica al usuario.
   * Si no encuentra el formato, intenta la exportación a PNG como fallback.
   */
  const handleExportChat = async () => {
    const lastBotMessage = messages.slice().reverse().find(m => m.type === 'bot');

    // Patrón para una línea de materia: ID | Nombre | Créditos | Horario
    // Ajustado para el nuevo formato (sin "créditos")
    const courseLinePattern = /^[A-Z0-9]+\s*\|\s*[^|]+\s*\|\s*\d+\s*\|\s*.*$/gim;
    
    if (lastBotMessage) {
      const botContent = lastBotMessage.content;
      // Encuentra todas las líneas que coincidan con el formato
      const matches = botContent.match(courseLinePattern);

      if (matches && matches.length > 0) {
        const textToCopy = matches.join('\n');
        try {
          await copyToClipboard(textToCopy);
          setCopiedMessage('¡Formato de materias copiado! Puedes usar "Escribir por Texto" en la página principal.');
          return;
        } catch (error) {
          console.error("Error al copiar al portapapeles:", error);
          setCopiedMessage('Error al copiar el texto. Intenta hacerlo manualmente.');
          return;
        }
      }
    }

    // Fallback: Si no hay mensaje de bot o no hay formato de materia, exporta como PNG
    try {
      const chatContainer = document.getElementById('chat-container');
      if (!chatContainer) {
        throw new Error("No se encontró el contenedor del chat.");
      }
      
      const dataUrl = await htmlToImage.toPng(chatContainer, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = 'chat-scheduler.png';
      link.href = dataUrl;
      link.click();
      setCopiedMessage('Chat exportado como imagen (PNG).');
    } catch (error) {
      console.error("Error al exportar chat:", error);
      setCopiedMessage('Error al exportar el chat. Por favor, inténtalo de nuevo.');
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
                      className={`max-w-xs p-3 rounded-lg ${
                        message.type === 'user'
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