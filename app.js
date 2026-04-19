const emergencyDirectory = {
    "CL": { country: "Chile", number: "131", service: "SAMU Salud Mental" },
    "MX": { country: "México", number: "800 911 2000", service: "Línea de la Vida" },
    "ES": { country: "España", number: "024", service: "Prevención Suicidio" },
    "AR": { country: "Argentina", number: "0800 999 0091", service: "Asistencia Salud Mental" },
    "CO": { country: "Colombia", number: "106", service: "Línea de Ayuda" },
    "default": { country: "Internacional", number: "911", service: "Emergencias" }
};

const alertKeywords = ["suicidio", "morir", "matarme", "daño", "desesperado", "crisis"];

document.getElementById('btn-analyze').addEventListener('click', async () => {
    const input = document.getElementById('mood-input');
    const btn = document.getElementById('btn-analyze');
    
    if(input.value.length < 10) return alert("Por favor, cuéntanos un poco más.");

    btn.innerHTML = '<span class="loader"></span> Analizando privadamente...';
    btn.disabled = true;

    const isUrgent = alertKeywords.some(word => input.value.toLowerCase().includes(word));

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
                const data = await res.json();
                showResults(data.address.country_code.toUpperCase(), isUrgent, pos.coords.latitude, pos.coords.longitude);
            } catch { showResults("default", isUrgent); }
        }, () => showResults("default", isUrgent));
    } else { showResults("default", isUrgent); }
});

function showResults(code, urgent, lat, lon) {
    const info = emergencyDirectory[code] || emergencyDirectory["default"];
    const results = document.getElementById('results-section');
    const btn = document.getElementById('btn-analyze');
    
    btn.innerHTML = "Analizar y Buscar Ayuda";
    btn.disabled = false;
    results.classList.remove('hidden');

    document.getElementById('ai-feedback').innerHTML = `
        <div class="card">
            <strong>${urgent ? '🚨 Detección de Urgencia:' : 'Análisis Completado:'}</strong>
            <p>${urgent ? 'Hemos detectado señales de crisis. Por favor, usa los recursos de abajo.' : 'Gracias por compartir. Te sugerimos los siguientes recursos locales.'}</p>
        </div>`;

    document.getElementById('emergency-numbers').innerHTML = `
        <div class="card emergency-card">
            <h4>${info.service} (${info.country})</h4>
            <a href="tel:${info.number}" class="phone-number">${info.number}</a>
        </div>
        ${lat ? `<div class="card"><p>Centros de ayuda cercanos:</p><a href="https://www.google.com/maps/search/salud+mental/@${lat},${lon},13z" target="_blank" class="btn-primary" style="display:block; text-align:center; text-decoration:none; background:#64748b">Abrir Mapa</a></div>` : ''}
    `;
    results.scrollIntoView({ behavior: 'smooth' });
}

document.getElementById('btn-purge').addEventListener('click', () => {
    if(confirm("¿Borrar permanentemente los datos de esta sesión?")) window.location.reload();
});