export async function geminiRequest(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }

      console.error('Gemini API Error:', errorData);

      // 🎯 Manejo unificado de errores comunes
      switch (response.status) {
        case 400:
          throw new Error('Solicitud inválida. Verifica tu formato o tu clave API.');
        case 401:
          throw new Error('No autorizado. La clave API puede ser incorrecta o estar caducada.');
        case 403:
          throw new Error('Upsi 😅, algo salió mal con el servidor. Inténtalo más tarde.');
        case 429:
          throw new Error('Demasiadas solicitudes. Espera unos segundos e inténtalo de nuevo.');
        case 500:
        case 503:
          throw new Error('El servicio de Gemini tuvo un problema interno. Vuelve a intentarlo.');
        default:
          throw new Error('Upsi 😅, algo salió mal. Inténtelo más tarde.');
      }
    }

    return await response.json();
  } catch (error: any) {
    console.error('Gemini Request Error:', error);
    if (error instanceof Error) throw error;
    throw new Error('Error desconocido al comunicarse con Gemini.');
  }
}