// Directorio de emergencias ampliado para mayor alcance del ecosistema
const emergencyDirectory = {
    "CL": { country: "Chile", number: "131", service: "SAMU Salud Mental" },
    "MX": { country: "México", number: "800 911 2000", service: "Línea de la Vida" },
    "ES": { country: "España", number: "024", service: "Prevención Suicidio" },
    "AR": { country: "Argentina", number: "0800 999 0091", service: "Asistencia Salud Mental" },
    "CO": { country: "Colombia", number: "106", service: "Línea de Ayuda" },
    "PE": { country: "Perú", number: "113", service: "Infostalin (Opción 5)" },
    "EC": { country: "Ecuador", number: "171", service: "Asesoría Psicológica" },
    "UY": { country: "Uruguay", number: "0800 0767", service: "Prevención Suicidio" },
    "default": { country: "Internacional", number: "911", service: "Emergencias" }
};

// Palabras clave para la IA de triaje local
const alertKeywords = ["suicidio", "morir", "matarme", "daño", "desesperado", "crisis", "terminar con todo", "pastillas", "ahorcar"];

document.getElementById('btn-analyze').addEventListener('click', async () => {
    const input = document.getElementById('mood-input');
    const btn = document.getElementById('btn-analyze');
    
    if(input.value.trim().length < 10) return alert("Por favor, cuéntanos un poco más para poder ayudarte mejor.");

    // Estado de carga
    btn.innerHTML = '<span class="loader"></span> Analizando privadamente...';
    btn.disabled = true;

    // Lógica de detección de urgencia
    const text = input.value.toLowerCase();
    const isUrgent = alertKeywords.some(word => text.includes(word));

    // Intentar geolocalización para precisión local
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                const data = await res.json();
                const countryCode = data.address.country_code ? data.address.country_code.toUpperCase() : "default";
                showResults(countryCode, isUrgent, pos.coords.latitude, pos.coords.longitude);
            } catch (error) {
                showResults("default", isUrgent);
            }
        }, () => {
            // Si el usuario rechaza el GPS, mostramos resultados por defecto
            showResults("default", isUrgent);
        });
    } else {
        showResults("default", isUrgent);
    }
});

function showResults(code, urgent, lat, lon) {
    const info = emergencyDirectory[code] || emergencyDirectory["default"];
    const results = document.getElementById('results-section');
    const btn = document.getElementById('btn-analyze');
    
    btn.innerHTML = "Analizar y Buscar Ayuda";
    btn.disabled = false;
    results.classList.remove('hidden');

    // Feedback de la IA Local
    document.getElementById('ai-feedback').innerHTML = `
        <div class="card" style="border-left: 5px solid ${urgent ? '#e11d48' : '#10b981'}">
            <strong style="color: ${urgent ? '#e11d48' : '#1e293b'}">${urgent ? '🚨 Detección de Urgencia:' : 'Análisis Completado:'}</strong>
            <p>${urgent ? 'Detectamos señales de crisis. Por favor, contacta con profesionales de inmediato.' : 'Gracias por expresarte. Hemos preparado recursos locales que pueden ayudarte.'}</p>
        </div>`;

    // Generar bloque de emergencias
    let emergencyHTML = `
        <div class="card emergency-card">
            <small style="color: #64748b">Recurso disponible en ${info.country}</small>
            <h4>${info.service}</h4>
            <a href="tel:${info.number}" class="phone-number">${info.number}</a>
            <p style="font-size: 0.85rem; color: #64748b">Llamada gratuita y confidencial.</p>
        </div>`;

    // Si hay GPS, añadir mapa de centros cercanos
    if (lat && lon) {
        emergencyHTML += `
            <div class="card">
                <p><strong>Centros de ayuda cercanos:</strong></p>
                <p style="font-size: 0.85rem; margin-bottom: 15px;">Localiza hospitales o centros de salud mental en tu zona.</p>
                <a href="https://www.google.com/maps/search/hospital+salud+mental/@${lat},${lon},13z" target="_blank" class="btn-primary" style="display:block; text-align:center; text-decoration:none; background:#64748b; font-size: 0.9rem;">Ver mapa de ayuda</a>
            </div>`;
    }

    document.getElementById('emergency-numbers').innerHTML = emergencyHTML;
    
    // Scroll suave hacia los resultados
    setTimeout(() => {
        results.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// Lógica de Borrado Seguro
document.getElementById('btn-purge').addEventListener('click', () => {
    if(confirm("¿Estás seguro? Se borrará todo el texto y el historial de esta sesión de forma permanente.")) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    }
});
