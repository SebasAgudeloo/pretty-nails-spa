// Dark Mode
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function toggleDarkMode(enable) {
    if (enable) {
        body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        body.classList.remove('dark-mode');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
        localStorage.setItem('darkMode', 'disabled');
    }
}

function checkDarkModePreference() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled' || (savedMode === null && prefersDarkScheme.matches)) {
        toggleDarkMode(true);
    }
}

prefersDarkScheme.addListener((e) => {
    if (localStorage.getItem('darkMode') === null) {
        toggleDarkMode(e.matches);
    }
});

darkModeToggle.addEventListener('click', () => {
    toggleDarkMode(!body.classList.contains('dark-mode'));
});

// Before & After Slider
function initBeforeAfterSliders() {
    const containers = document.querySelectorAll('.before-after-container');
    
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
            if (!isDragging) return;
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            if (clientX) updateSliderPosition(clientX);
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
            updateSliderPosition(e.clientX);
        });
    });
}

// Formatting Functions
function formatHoraAMPM(hora24) {
    if (!hora24) return '';
    const [horas, minutos] = hora24.split(':');
    let hora = parseInt(horas, 10);
    const sufijo = hora >= 12 ? 'PM' : 'AM';
    hora = hora % 12 || 12;
    return `${hora}:${minutos} ${sufijo}`;
}

function formatFechaBonita(fechaStr) {
    if (!fechaStr) return '';
    const [año, mes, dia] = fechaStr.split('-').map(Number);
    const fecha = new Date(año, mes - 1, dia);
    return fecha.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    }).replace(/,/g, '').replace(/^(\w)/, match => match.toLowerCase());
}

function formatCurrency(amount) {
    return '$' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function setupReservationForm() {
    // Obtener referencias a los selects
    const servicio1 = document.getElementById('servicio1');
    const servicio2 = document.getElementById('servicio2');
    
    // Función para actualizar las opciones del segundo select
    function updateServicio2Options() {
        const selectedService1 = servicio1.value;
        const servicio2Options = servicio2.querySelectorAll('option');
        
        // Primero, habilitar todas las opciones
        servicio2Options.forEach(option => {
            if (option.value !== "") {
                option.disabled = false;
                option.style.display = '';
            }
        });
        
        // Si hay un servicio1 seleccionado, deshabilitar esa opción en servicio2
        if (selectedService1) {
            const service1Name = selectedService1.split('|')[0];
            servicio2Options.forEach(option => {
                if (option.value !== "" && option.value.split('|')[0] === service1Name) {
                    option.disabled = true;
                    option.style.display = 'none';
                }
            });
            
            // Si el servicio2 actualmente seleccionado es el mismo que servicio1, resetearlo
            if (servicio2.value && servicio2.value.split('|')[0] === service1Name) {
                servicio2.value = "";
                calculateTotal();
            }
        }
    }
    
    // Función para inicializar las opciones del segundo select
    function initializeServicio2Options() {
        // Guardar la opción por defecto
        const defaultOption = servicio2.querySelector('option[value=""]');
        
        // Limpiar todas las opciones excepto la por defecto
        servicio2.innerHTML = '';
        servicio2.appendChild(defaultOption);
        
        // Clonar las opciones del primer select (excepto la opción por defecto)
        const servicio1Options = servicio1.querySelectorAll('option:not([value=""])');
        servicio1Options.forEach(option => {
            const newOption = option.cloneNode(true);
            servicio2.appendChild(newOption);
        });
        
        // Actualizar las opciones basado en la selección actual
        updateServicio2Options();
    }

    function calculateTotal() {
        const totalElement = document.getElementById('totalServicios');
        const totalContainer = document.querySelector('.total-container');
        
        let total = 0;
        
        if (servicio1.value) {
            total += parseInt(servicio1.value.split('|')[1]);
        }
        
        if (servicio2.value) {
            total += parseInt(servicio2.value.split('|')[1]);
        }
        
        totalElement.textContent = formatCurrency(total);
        totalContainer.classList.add('changed');
        setTimeout(() => totalContainer.classList.remove('changed'), 500);
    }

    function showError(button, message) {
        if (!button.dataset.originalContent) {
            button.dataset.originalContent = button.innerHTML;
        }
        
        button.classList.add('btn-error');
        button.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${message}`;
        
        setTimeout(() => {
            button.classList.remove('btn-error');
            button.innerHTML = button.dataset.originalContent;
        }, 3000);
    }

    function validateForm() {
        const nombre = document.getElementById('nombre').value.trim();
        const servicio1Val = servicio1.value;
        const fechaInput = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;
        const enviarBtn = document.getElementById('enviarReserva');
        
        // Validar que no sean el mismo servicio
        if (servicio1Val && servicio2.value && 
            servicio1Val.split('|')[0] === servicio2.value.split('|')[0]) {
            showError(enviarBtn, 'No puedes seleccionar el mismo servicio dos veces');
            return false;
        }
        
        if (!nombre || !servicio1Val || !fechaInput || !hora) {
            showError(enviarBtn, 'Completa todos los campos obligatorios');
            return false;
        }
        
        if (nombre.length < 3) {
            showError(enviarBtn, 'Nombre muy corto (mín. 3 caracteres)');
            return false;
        }
        
        const [año, mes, dia] = fechaInput.split('-').map(Number);
        const fechaSeleccionada = new Date(año, mes - 1, dia);
        const diaSemana = fechaSeleccionada.getDay();
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaSeleccionada < hoy) {
            showError(enviarBtn, 'No puedes seleccionar fechas pasadas');
            return false;
        }
        
        if (diaSemana === 2) {
            showError(enviarBtn, 'Los martes estamos cerrados');
            return false;
        }
        
        const [horas, minutos] = hora.split(':').map(Number);
        const minutosTotales = horas * 60 + minutos;
        let horarioValido = false;
        let mensajeHorario = '';
        
        if (diaSemana === 0) { // Domingo
            horarioValido = minutosTotales >= 480 && minutosTotales <= 720;
            mensajeHorario = 'Horario: 8:00 AM - 12:00 PM';
        } else if (diaSemana === 6) { // Sábado
            horarioValido = (minutosTotales >= 480 && minutosTotales <= 720) || 
                           (minutosTotales >= 780 && minutosTotales <= 1080);
            mensajeHorario = 'Horarios: 8:00 AM - 12:00 PM y 1:00 PM - 6:00 PM';
        } else { // Lunes a Viernes (excepto martes)
            horarioValido = minutosTotales >= 840 && minutosTotales <= 1080;
            mensajeHorario = 'Horario: 2:00 PM - 6:00 PM';
        }
        
        if (!horarioValido) {
            showError(enviarBtn, `Horario no disponible. ${mensajeHorario}`);
            return false;
        }
        
        return true;
    }

    function submitForm() {
        if (!validateForm()) return;
        
        const nombre = document.getElementById('nombre').value.trim();
        const servicio1Data = servicio1.value.split('|');
        const servicio2Data = servicio2.value ? servicio2.value.split('|') : ['', '0'];
        const fecha = document.getElementById('fecha');
        const hora = document.getElementById('hora');
        const total = parseInt(servicio1Data[1]) + parseInt(servicio2Data[1]);
        
        let serviciosMsg = `*Servicio 1:* ${servicio1Data[0]}`;
        if (servicio2.value) serviciosMsg += `\n*Servicio 2:* ${servicio2Data[0]}`;
        
        serviciosMsg += `\n*Total:* ${formatCurrency(total)}`;
        
        const mensaje = `Hola Karen! Espero te encuentres muy bien, mi nombre es *${nombre}* y quiero reservar una cita contigo para:\n\n` +
                       `${serviciosMsg}\n` +
                       `*Fecha:* ${formatFechaBonita(fecha.value)}\n` +
                       `*Hora:* ${formatHoraAMPM(hora.value)}\n\n` +
                       `Por favor confírmame disponibilidad. ¡Gracias!`;
        
        window.open(`https://wa.me/573163572744?text=${encodeURIComponent(mensaje)
            .replace(/'/g,"%27")
            .replace(/\(/g,"%28")
            .replace(/\)/g,"%29")
            .replace(/\*/g,"%2A")}`, '_blank');
    }

    // Inicializar las opciones del segundo select
    initializeServicio2Options();
    
    // Configurar event listeners
    servicio1.addEventListener('change', function() {
        updateServicio2Options();
        calculateTotal();
    });
    
    servicio2.addEventListener('change', calculateTotal);
    
    document.getElementById('enviarReserva').addEventListener('click', submitForm);
    
    document.getElementById('reservaForm').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            submitForm();
        }
    });
}

// Animaciones Al Posicionar El Mouse
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated'); // Opcional: quita esta línea también si no quieres ninguna animación
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    document.querySelectorAll('.service-card, .promo-card, .testimonial-card').forEach(card => {
        observer.observe(card);
    });
}

// Carrusel de Testimonios
function setupTestimonialsCarousel() {
    const carouselEl = document.getElementById('testimoniosCarousel');
    if (!carouselEl) return;

    // Inicialización automática (usando data-bs-ride del HTML)
    const carousel = new bootstrap.Carousel(carouselEl, {
        interval: 5000,  // Cambia de slide cada 5 segundos
        wrap: true,      // Vuelve al inicio después del último slide
        pause: 'hover',  // Pausa al poner el mouse encima
        keyboard: false  // Desactiva navegación con teclado (opcional)
    });

    // Actualiza indicadores al cambiar de slide (opcional)
    carouselEl.addEventListener('slid.bs.carousel', function(event) {
        const indicators = document.querySelectorAll('#testimoniosCarousel .carousel-indicators button');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === event.to);
        });
    });
}

// Eliminar animaciones no deseadas
function removeUnwantedAnimations() {
    document.querySelectorAll('#testimonios .animate__animated').forEach(element => {
        element.classList.remove('animate__animated', 'animate__fadeInUp');
    });
    
    document.querySelectorAll('#testimonios [style*="animation"]').forEach(element => {
        element.style.animation = 'none';
        element.style.opacity = '1';
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    checkDarkModePreference();
    initBeforeAfterSliders();
    setupReservationForm();
    setupScrollAnimations();
    setupTestimonialsCarousel();
    
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

window.addEventListener('load', removeUnwantedAnimations);

darkModeToggle.addEventListener('click', function() {
    setTimeout(removeUnwantedAnimations, 300);
});

window.addEventListener('error', function(e) {
    console.error('Error:', e.message, 'en', e.filename, 'línea:', e.lineno);
});