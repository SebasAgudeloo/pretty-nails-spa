// Dark Mode Toggle
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

// Verificar preferencia al cargar
if(localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
}

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    if(body.classList.contains('dark-mode')) {
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
        localStorage.setItem('darkMode', 'disabled');
    }
});



// Before & After Slider
function initBeforeAfterSliders() {
    document.querySelectorAll('.before-after-container').forEach(container => {
        const slider = container.querySelector('.before-after-slider');
        const handle = container.querySelector('.before-after-handle');
        let isDragging = false;
        
        function moveSlider(e) {
            if(!isDragging) return;
            
            const containerRect = container.getBoundingClientRect();
            let x = e.clientX - containerRect.left;
            
            // Limitar el movimiento dentro del contenedor
            x = Math.max(0, Math.min(x, containerRect.width));
            
            const percent = (x / containerRect.width) * 100;
            slider.style.width = `${percent}%`;
            handle.style.left = `${percent}%`;
        }
        
        handle.addEventListener('mousedown', () => {
            isDragging = true;
            handle.style.transition = 'none';
            slider.style.transition = 'none';
        });
        
        window.addEventListener('mouseup', () => {
            isDragging = false;
            handle.style.transition = 'left 0.3s ease';
            slider.style.transition = 'width 0.3s ease';
        });
        
        window.addEventListener('mousemove', moveSlider);
        
        // Soporte para touch
        handle.addEventListener('touchstart', () => {
            isDragging = true;
            handle.style.transition = 'none';
            slider.style.transition = 'none';
        });
        
        window.addEventListener('touchend', () => {
            isDragging = false;
            handle.style.transition = 'left 0.3s ease';
            slider.style.transition = 'width 0.3s ease';
        });
        
        window.addEventListener('touchmove', (e) => {
            if(!isDragging) return;
            moveSlider(e.touches[0]);
        });
    });
}

// Función para convertir formato 24h a 12h AM/PM
function formatHoraAMPM(hora24) {
    if (!hora24) return '';
    
    // Dividir la hora y los minutos
    const [horas, minutos] = hora24.split(':');
    let hora = parseInt(horas, 10);
    const sufijo = hora >= 12 ? 'PM' : 'AM';
    
    // Convertir a formato 12h
    hora = hora % 12;
    hora = hora ? hora : 12; // La hora 0 se convierte en 12
    
    return `${hora}:${minutos} ${sufijo}`;
}

function formatFechaBonita(fechaISO) {
    if (!fechaISO) return '';
    
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fecha = new Date(fechaISO);
    // Ajustar por el huso horario
    fecha.setDate(fecha.getDate() + 1);
    
    return fecha.toLocaleDateString('es-ES', opciones);
}

// Formulario de reserva
function setupReservationForm() {
    document.getElementById('enviarReserva').addEventListener('click', function() {
        const nombre = document.getElementById('nombre').value; // ← leer nombre
        const servicio = document.getElementById('servicio').value;
        const fecha = document.getElementById('fecha').value;
        const hora24 = document.getElementById('hora').value;
        
        const hora12 = formatHoraAMPM(hora24);
        
        if (nombre && servicio && fecha && hora24) {
            const mensaje = `¡Hola Karen! Espero te encuentres muy bien, mi nombre es *${nombre}* y quiero reservar una cita contigo para:\n\n` +
                            `*Servicio:* ${servicio}\n` +
                            `*Fecha:* ${formatFechaBonita(fecha)}\n` +
                            `*Hora:* ${hora12}\n\n` +
                            `Por favor confírmenme disponibilidad. ¡Gracias!`;
            
            const url = `https://wa.me/573163572744?text=${encodeURIComponent(mensaje)}`;
            window.open(url, '_blank');
        } else {
            alert('Por favor completa todos los campos del formulario.');
        }
    });
}


// Animación al hacer scroll
function setupScrollAnimations() {
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.service-card, .promo-card, .testimonial-card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if(elementPosition < screenPosition) {
                element.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    window.addEventListener('load', animateOnScroll);
}



// Inicializar todas las funciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initBeforeAfterSliders();
    setupReservationForm();
    setupScrollAnimations();
});