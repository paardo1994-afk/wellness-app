const emergencyDirectory = {
    "CL": { country: "Chile", number: "131", service: "SAMU Salud Mental" },
    "MX": { country: "México", number: "800 911 2000", service: "Línea de la Vida" },
    "ES": { country: "España", number: "024", service: "Prevención Suicidio" },
    "AR": { country: "Argentina", number: "0800 999 0091", service: "Asistencia Salud Mental" },
    "CO": { country: "Colombia", number: "106", service: "Línea de Ayuda" },
    "PE": { country: "Perú", number: "113", service: "Infosalud (Opción 5)" },
    "default": { country: "Internacional", number: "911", service: "Emergencias" }
};

const alertKeywords = ["suicidio", "morir", "matarme", "daño", "desesperado", "crisis", "ayuda", "triste", "solo", "sola", "mal"];

document.getElementById('btn-analyze').addEventListener('click', async () => {
    const input = document.getElementById('mood-input');
    const btn = document.getElementById('btn-analyze');
    
    if(input.value.trim().length < 5) return alert("Por favor, escribe un poco más sobre cómo te sientes.");

    btn.innerHTML = '<span class="loader"></span> Analizando...';
    btn.disabled = true;

    const text = input.value.toLowerCase();
    const isUrgent = alertKeywords.some(word => text.includes(word));

    // Intentar obtener ubicación
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                const data = await res.json();
                const countryCode = data.address.country_code ? data.address.country_code.toUpperCase() : "default";
                showResults(countryCode, isUrgent, pos.coords.latitude, pos.coords.longitude);
            } catch (e) {
                showResults("default", isUrgent);
            }
        }, () => {
            showResults("default", isUrgent);
        }, { timeout: 5000 });
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

    // 1. Feedback de Análisis (LA IA LOCAL)
    let feedbackText = urgent 
        ? "Nuestro análisis detecta que estás pasando por un momento crítico. Tu bienestar es prioridad." 
        : "Gracias por compartir lo que sientes. Hablar de ello es el primer paso para sentirse mejor.";

    document.getElementById('ai-feedback').innerHTML = `
        <div class="card" style="border-left: 5px solid ${urgent ? '#e11d48' : '#10b981'}">
            <h3 style="color: ${urgent ? '#e11d48' : '#1e293b'}">${urgent ? '🚨 Atención Prioritaria' : '✅ Análisis Finalizado'}</h3>
            <p style="margin-top:10px; color:#1e293b;">${feedbackText}</p>
        </div>`;

    // 2. Recursos de Emergencia
    let htmlContent = `
        <div class="card emergency-card">
            <small>Recurso para ${info.country}</small>
            <h4>${info.service}</h4>
            <a href="tel:${info.number}" class="phone-number">${info.number}</a>
        </div>`;

    // 3. Recomendación de Lugares Cercanos (MAPA CORREGIDO)
    if (lat && lon) {
        // Creamos un link de búsqueda específica en Google Maps
        const mapUrl = `https://www.google.com/maps/search/hospital+psiquiatrico+o+centro+salud+mental/@${lat},${lon},14z`;
        
        htmlContent += `
            <div class="card">
                <h4>📍 Lugares de ayuda cercanos</h4>
                <p>Hemos localizado centros de atención en tu zona para apoyo presencial.</p>
                <a href="${mapUrl}" target="_blank" class="btn-primary" style="display:block; text-align:center; text-decoration:none; margin-top:15px; background:#64748b;">
                    Ver centros en el Mapa
                </a>
            </div>`;
    } else {
        htmlContent += `
            <div class="card">
                <p>⚠️ No pudimos acceder a tu ubicación precisa, pero te recomendamos acudir al centro de salud más cercano.</p>
            </div>`;
    }

    document.getElementById('emergency-numbers').innerHTML = htmlContent;
    results.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('btn-purge').addEventListener('click', () => {
    if(confirm("¿Borrar permanentemente esta sesión?")) window.location.reload();
});
