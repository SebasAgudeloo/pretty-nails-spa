// Dark Mode
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Función para aplicar/remover dark mode
function toggleDarkMode(enable) {
    if(enable) {
        body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        body.classList.remove('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
        localStorage.setItem('darkMode', 'disabled');
    }
}

// Verificar preferencias al cargar
function checkDarkModePreference() {
    const savedMode = localStorage.getItem('darkMode');
    
    if(savedMode === 'enabled' || (savedMode === null && prefersDarkScheme.matches)) {
        toggleDarkMode(true);
    }
}

// Escuchar cambios en las preferencias del sistema
prefersDarkScheme.addListener((e) => {
    if(localStorage.getItem('darkMode') === null) {
        toggleDarkMode(e.matches);
    }
});

// Evento del botón
darkModeToggle.addEventListener('click', () => {
    toggleDarkMode(!body.classList.contains('dark-mode'));
});

// Before & After Slider
function initBeforeAfterSliders() {
    const containers = document.querySelectorAll('.before-after-container');
    
    if(!containers.length) return;
    
    containers.forEach(container => {
        const slider = container.querySelector('.before-after-slider');
        const handle = container.querySelector('.before-after-handle');
        let isDragging = false;
        
        const updateSliderPosition = (x) => {
            const containerRect = container.getBoundingClientRect();
            let xPos = x - containerRect.left;
            xPos = Math.max(0, Math.min(xPos, containerRect.width));
            const percent = (xPos / containerRect.width) * 100;
            
            slider.style.width = `${percent}%`;
            handle.style.left = `${percent}%`;
        };
        
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;
            container.classList.add('dragging');
        });
        
        handle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDragging = true;
            container.classList.add('dragging');
        });
        
        const moveHandler = (e) => {
            if(!isDragging) return;
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            if(clientX) updateSliderPosition(clientX);
        };
        
        const endHandler = () => {
            isDragging = false;
            container.classList.remove('dragging');
        };
        
        const containerRect = container.getBoundingClientRect();
        updateSliderPosition(containerRect.left + (containerRect.width / 2));
        
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('touchmove', moveHandler, { passive: false });
        document.addEventListener('mouseup', endHandler);
        document.addEventListener('touchend', endHandler);
        
        container.addEventListener('click', (e) => {
            const clientX = e.clientX;
            updateSliderPosition(clientX);
        });
    });
}

// Funciones de formato
function formatHoraAMPM(hora24) {
    if (!hora24) return '';
    const [horas, minutos] = hora24.split(':');
    let hora = parseInt(horas, 10);
    const sufijo = hora >= 12 ? 'PM' : 'AM';
    hora = hora % 12;
    hora = hora ? hora : 12;
    return `${hora}:${minutos} ${sufijo}`;
}

// Función para formatear fecha corregida (sin problemas de zona horaria)
function formatFechaBonita(fechaStr) {
    if (!fechaStr) return '';
    const [año, mes, dia] = fechaStr.split('-').map(Number);
    const fecha = new Date(año, mes - 1, dia);
    const opciones = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones)
               .replace(/,/g, '')
               .replace(/^(\w)/, match => match.toLowerCase());
}


// Formulario de reserva
    function setupReservationForm() {
        const form = document.getElementById('reservaForm');
        const enviarBtn = document.getElementById('enviarReserva');
        
        if(!form || !enviarBtn) return;

        function validateForm() {
        const form = document.getElementById('reservaForm');
        const nombre = form.elements['nombre'].value.trim();
        const servicio = form.elements['servicio'].value;
        const fechaInput = form.elements['fecha'].value;
        const hora = form.elements['hora'].value;
        const enviarBtn = document.getElementById('enviarReserva');
        
        // Validar campos vacíos
        if(!nombre || !servicio || servicio === "Selecciona un servicio..." || !fechaInput || !hora) {
            showError(enviarBtn, 'Completa todos los campos');
            return false;
        }
        
        // Validar formato del nombre
        if(nombre.length < 3) {
            showError(enviarBtn, 'Nombre muy corto (mín. 3 caracteres)');
            return false;
        }
        
        // Crear fecha sin problemas de zona horaria
        const [año, mes, dia] = fechaInput.split('-').map(Number);
        const fechaSeleccionada = new Date(año, mes - 1, dia);
        const diaSemana = fechaSeleccionada.getDay(); // 0=domingo, 1=lunes,...,6=sábado
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        // Validar fecha no sea pasada
        if(fechaSeleccionada < hoy) {
            showError(enviarBtn, 'No puedes seleccionar fechas pasadas');
            return false;
        }
        
        // Validar que no sea martes
        if(diaSemana === 2) {
            showError(enviarBtn, 'Los martes estamos cerrados');
            return false;
        }
        
        // Validar hora según día
        const [horas, minutos] = hora.split(':').map(Number);
        const minutosTotales = horas * 60 + minutos;
        let horarioValido = false;
        let mensajeHorario = '';
        
        if(diaSemana === 0) { // Domingo
            // Horario: 8:00 AM - 12:00 PM
            const inicio = 8 * 60;
            const fin = 12 * 60;
            
            if(minutosTotales >= inicio && minutosTotales <= fin) {
                horarioValido = true;
            }
            mensajeHorario = 'Horario: 8:00 AM - 12:00 PM';
        } 
        else if(diaSemana === 6) { // Sábado
            // Mañana: 8:00 AM - 12:00 PM
            // Tarde: 1:00 PM - 6:00 PM
            const mananaInicio = 8 * 60;
            const mananaFin = 12 * 60;
            const tardeInicio = 13 * 60;
            const tardeFin = 18 * 60;
            
            if((minutosTotales >= mananaInicio && minutosTotales <= mananaFin) || 
            (minutosTotales >= tardeInicio && minutosTotales <= tardeFin)) {
                horarioValido = true;
            }
            mensajeHorario = 'Horarios: 8:00 AM - 12:00 PM y 1:00 PM - 6:00 PM';
        } 
        else { // Lunes (1), Miércoles (3), Jueves (4), Viernes (5)
            // Horario: 2:00 PM - 6:00 PM
            const inicio = 14 * 60;
            const fin = 18 * 60;
            
            if(minutosTotales >= inicio && minutosTotales <= fin) {
                horarioValido = true;
            }
            mensajeHorario = 'Horario: 2:00 PM - 6:00 PM';
        }
        
        if(!horarioValido) {
            showError(enviarBtn, `Horario no disponible. ${mensajeHorario}`);
            return false;
        }
        
        return true;
    }

    function showError(button, message) {
        if (!button.dataset.originalContent) {
            button.dataset.originalContent = button.innerHTML;
        }
        
        // Aplicar estado de error
        button.classList.add('btn-error');
        button.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i> ${message}`;
        
        // Restaurar después de 1.5 segundos
        setTimeout(() => {
            button.classList.remove('btn-error');
            button.innerHTML = button.dataset.originalContent;
        }, 3000);
    }
    
    function submitForm() {
        if(!validateForm()) return;
        
        const {nombre, servicio, fecha, hora} = form.elements;
        const hora12 = formatHoraAMPM(hora.value);
        
        const mensaje = `Hola Karen! Espero te encuentres muy bien, mi nombre es *${nombre.value.trim()}* y quiero reservar una cita contigo para:\n\n` +
                       `*Servicio:* ${servicio.value}\n` +
                       `*Fecha:* ${formatFechaBonita(fecha.value)}\n` +
                       `*Hora:* ${hora12}\n\n` +
                       `Por favor confírmame disponibilidad. ¡Gracias!`;
        
        window.open(`https://wa.me/573163572744?text=${encodeURIComponent(mensaje)
            .replace(/'/g,"%27")
            .replace(/\(/g,"%28")
            .replace(/\)/g,"%29")
            .replace(/\*/g,"%2A")}`, '_blank');
    }
    
    enviarBtn.addEventListener('click', submitForm);
    
    form.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            e.preventDefault();
            submitForm();
        }
    });
}

// Animaciones al hacer scroll
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.service-card, .promo-card, .testimonial-card').forEach(card => {
        observer.observe(card);
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    checkDarkModePreference();
    initBeforeAfterSliders();
    setupReservationForm();
    setupScrollAnimations();
    
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

window.addEventListener('error', function(e) {
    console.error('Error:', e.message, 'en', e.filename, 'línea:', e.lineno);
});