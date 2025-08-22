// ===== FUNCIONES DE HORARIOS =====

// Generar horarios disponibles según el día seleccionado
function generarHorariosDisponibles(fecha) {
    const diaSemana = fecha.getDay(); // 0: Domingo, 1: Lunes, ..., 6: Sábado
    const horarios = [];
    
    // Martes cerrado
    if (diaSemana === 2) return horarios;
    
    // Domingo: 8:00 AM - 12:00 PM
    if (diaSemana === 0) {
        for (let hora = 8; hora < 12; hora++) {
            horarios.push(`${hora.toString().padStart(2, '0')}:00`);
            horarios.push(`${hora.toString().padStart(2, '0')}:30`);
        }
    }
    // Sábado: 8:00 AM - 12:00 PM y 1:00 PM - 6:00 PM
    else if (diaSemana === 6) {
        // Mañana: 8:00 AM - 12:00 PM
        for (let hora = 8; hora < 12; hora++) {
            horarios.push(`${hora.toString().padStart(2, '0')}:00`);
            horarios.push(`${hora.toString().padStart(2, '0')}:30`);
        }
        
        // Tarde: 1:00 PM - 6:00 PM
        for (let hora = 13; hora < 18; hora++) {
            horarios.push(`${hora.toString().padStart(2, '0')}:00`);
            horarios.push(`${hora.toString().padStart(2, '0')}:30`);
        }
    }
    // Lunes a Viernes (excepto martes): 2:00 PM - 6:00 PM
    else {
        for (let hora = 14; hora < 18; hora++) {
            horarios.push(`${hora.toString().padStart(2, '0')}:00`);
            horarios.push(`${hora.toString().padStart(2, '0')}:30`);
        }
    }
    
    return horarios;
}

// Actualizar las opciones de hora según la fecha seleccionada
function actualizarOpcionesHora() {
    const fechaInput = document.getElementById('fecha');
    const horaInput = document.getElementById('hora');
    const timeOptionsContainer = document.getElementById('time-options');
    
    if (!fechaInput.value) {
        timeOptionsContainer.style.display = 'none';
        horaInput.value = '';
        return;
    }
    
    // Validar formato de fecha primero
    const fechaParts = fechaInput.value.split('-');
    if (fechaParts.length !== 3) {
        timeOptionsContainer.innerHTML = '<div class="text-center text-muted p-2">Formato de fecha inválido</div>';
        timeOptionsContainer.style.display = 'block';
        horaInput.value = '';
        return;
    }
    
    const [año, mes, dia] = fechaParts.map(Number);
    const fechaSeleccionada = new Date(año, mes - 1, dia);
    
    // Validar si la fecha es válida
    if (isNaN(fechaSeleccionada.getTime())) {
        timeOptionsContainer.innerHTML = '<div class="text-center text-muted p-2">Fecha inválida</div>';
        timeOptionsContainer.style.display = 'block';
        horaInput.value = '';
        return;
    }
    
    const horariosDisponibles = generarHorariosDisponibles(fechaSeleccionada);
    
    // Limpiar opciones anteriores
    timeOptionsContainer.innerHTML = '';
    
    if (horariosDisponibles.length === 0) {
        timeOptionsContainer.innerHTML = '<div class="text-center text-muted p-2">No hay horarios disponibles para este día</div>';
        timeOptionsContainer.style.display = 'block';
        horaInput.value = '';
        return;
    }
    
    // Crear opciones de horarios
    horariosDisponibles.forEach(horario => {
        const opcion = document.createElement('div');
        opcion.className = 'time-option';
        opcion.textContent = formatHoraAMPM(horario);
        opcion.dataset.value = horario;
        
        opcion.addEventListener('click', function() {
            horaInput.value = this.dataset.value;
            document.querySelectorAll('.time-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            timeOptionsContainer.style.display = 'none';
        });
        
        timeOptionsContainer.appendChild(opcion);
    });
    
    timeOptionsContainer.style.display = 'block';
}

// Validar que la hora seleccionada tenga minutos en 00 o 30
function validarHoraSeleccionada() {
    const horaInput = document.getElementById('hora');
    if (!horaInput.value) return;
    
    const [horas, minutos] = horaInput.value.split(':').map(Number);
    
    // Si los minutos no son 00 o 30, ajustar al intervalo más cercano
    if (minutos !== 0 && minutos !== 30) {
        const minutosAjustados = minutos < 30 ? '00' : '30';
        horaInput.value = `${horas.toString().padStart(2, '0')}:${minutosAjustados}`;
    }
}

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
            handle.setAttribute('aria-valuenow', Math.round(percent));
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
    const ahorroPromocion = document.getElementById('ahorroPromocion');
    const fechaInput = document.getElementById('fecha');

    // Event listener para fecha
    fechaInput.addEventListener('change', actualizarOpcionesHora);
    
    // Event listener para hora
    document.getElementById('hora').addEventListener('change', function() {
        validarHoraSeleccionada();
        document.getElementById('time-options').style.display = 'none';
    });

    // Función para parsear precios de forma segura
    const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        const price = parseInt(priceStr.replace(/\D/g, ''), 10);
        return isNaN(price) ? 0 : price;
    };

    // Función para actualizar las opciones del segundo select
    function updateServicio2Options() {
        const selectedService1 = servicio1.value;
        const servicio2Select = document.getElementById('servicio2');
        const servicio2Label = servicio2Select.closest('.form-floating').querySelector('label');

        // Si no existe el elemento, salir
        if (!servicio2Select) return;

        // Resetear estado del segundo select
        servicio2Select.disabled = false;
        servicio2Select.closest('.form-floating').style.opacity = '1';
        servicio2Label.innerHTML = '<i class="fas fa-spa me-2"></i>Servicio 2 (Opcional)';

        // Si no hay selección en servicio1, salir
        if (!selectedService1) return;

        // Verificar si es una promoción (tiene 3 partes: nombre|precioOriginal|precioPromo)
        const esPromocion = selectedService1.split('|').length === 3;

        if (esPromocion) {
            // Bloquear completamente el segundo servicio para promociones
            servicio2Select.disabled = true;
            servicio2Select.value = "";
            servicio2Select.closest('.form-floating').style.opacity = '0.6';
            servicio2Label.innerHTML = '<i class="fas fa-spa me-2"></i>Servicio 2 (No disponible con promoción)';
        } else {
            // No es promoción, manejar como antes
            const service1Name = selectedService1.split('|')[0];

            // Habilitar todas las opciones primero
            servicio2Select.querySelectorAll('option').forEach(option => {
                if (option.value !== "") {
                    option.disabled = false;
                    option.style.display = '';
                }
            });

            // Deshabilitar la opción que coincide con el servicio1 seleccionado
            servicio2Select.querySelectorAll('option').forEach(option => {
                if (option.value !== "" && option.value.split('|')[0] === service1Name) {
                    option.disabled = true;
                    option.style.display = 'none';
                }
            });

            // Si el servicio2 actualmente seleccionado es el mismo que servicio1, resetearlo
            if (servicio2Select.value && servicio2Select.value.split('|')[0] === service1Name) {
                servicio2Select.value = "";
            }
        }
    }

    // Función para inicializar las opciones del segundo select
    function initializeServicio2Options() {
        const servicio2Select = document.getElementById('servicio2');
        
        // Si no existe el elemento, salir
        if (!servicio2Select) return;

        // Guardar la opción por defecto
        const defaultOption = servicio2Select.querySelector('option[value=""]');

        // Limpiar todas las opciones excepto la por defecto
        servicio2Select.innerHTML = '';
        servicio2Select.appendChild(defaultOption);

        // Clonar los optgroups y opciones del primer select (excepto promociones)
        const optgroups = document.getElementById('servicio1').querySelectorAll('optgroup:not([label="PROMOCIONES"])');

        optgroups.forEach(optgroup => {
            const newOptgroup = document.createElement('optgroup');
            newOptgroup.label = optgroup.label;

            optgroup.querySelectorAll('option:not(.promo-option)').forEach(option => {
                const newOption = option.cloneNode(true);
                newOptgroup.appendChild(newOption);
            });

            servicio2Select.appendChild(newOptgroup);
        });
    }

    function calculateTotal() {
        const totalElement = document.getElementById('totalServicios');
        const totalContainer = document.querySelector('.total-container');
        
        // Si no existen los elementos, salir
        if (!totalElement || !totalContainer) return;

        let total = 0;
        let precioOriginal = 0;
        let esPromocion = false;

        // Verificar si el servicio1 es una promoción
        if (servicio1.value && servicio1.value.split('|').length === 3) {
            const [nombre, precioOriginalStr, precioPromoStr] = servicio1.value.split('|');
            total = parsePrice(precioPromoStr);
            precioOriginal = parsePrice(precioOriginalStr);
            esPromocion = true;
        } else if (servicio1.value) {
            total += parsePrice(servicio1.value.split('|')[1]);
        }

        // Solo sumar servicio2 si no es una promoción y está habilitado
        if (servicio2.value && !servicio2.disabled && servicio2.value.split('|').length > 1) {
            total += parsePrice(servicio2.value.split('|')[1]);
        }

        // Mostrar u ocultar el ahorro de promoción
        if (esPromocion && ahorroPromocion) {
            const ahorro = precioOriginal - total;
            ahorroPromocion.style.display = 'block';
            ahorroPromocion.textContent = `Ahorras ${formatCurrency(ahorro)}`;
        } else if (ahorroPromocion) {
            ahorroPromocion.style.display = 'none';
        }

        totalElement.textContent = formatCurrency(total);
        totalContainer.classList.add('changed');
        setTimeout(() => totalContainer.classList.remove('changed'), 500);
    }

    function showError(button, message) {
        if (!button) return;
        
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

        // Validar que no sean el mismo servicio (solo si no es promoción y servicio2 está habilitado)
        if (!servicio2.disabled && servicio1Val && servicio2.value &&
            servicio1Val.split('|')[0] === servicio2.value.split('|')[0]) {
            showError(enviarBtn, 'No puedes seleccionar el mismo servicio dos veces');
            return false;
        }

        if (!nombre || !servicio1Val || !fechaInput || !hora) {
            showError(enviarBtn, 'Completa todos los campos obligatorios');
            return false;
        }

        // Sanitizar nombre para prevenir XSS básico
        const sanitizedNombre = nombre.replace(/[<>]/g, '');
        if (sanitizedNombre !== nombre) {
            showError(enviarBtn, 'El nombre contiene caracteres no permitidos');
            return false;
        }

        if (nombre.length < 3) {
            showError(enviarBtn, 'Nombre muy corto (mín. 3 caracteres)');
            return false;
        }

        if (nombre.length > 100) {
            showError(enviarBtn, 'Nombre muy largo (máx. 100 caracteres)');
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
        const fecha = document.getElementById('fecha').value;
        const hora = document.getElementById('hora').value;

        // Sanitizar nombre
        const sanitizedNombre = nombre.replace(/[<>]/g, '');

        // Verificar si es una promoción (tiene 3 partes: nombre|precioOriginal|precioPromo)
        const esPromocion = servicio1Data.length === 3;
        const total = esPromocion ? parsePrice(servicio1Data[2]) : parsePrice(servicio1Data[1]) + parsePrice(servicio2Data[1]);

        let serviciosMsg = esPromocion ?
            `*Promoción:* ${servicio1Data[0]}` :
            `*Servicio 1:* ${servicio1Data[0]}`;

        if (servicio2.value && !servicio2.disabled && !esPromocion) {
            serviciosMsg += `\n*Servicio 2:* ${servicio2Data[0]}`;
        }

        serviciosMsg += `\n*Total:* ${formatCurrency(total)}`;

        if (esPromocion) {
            const precioOriginal = parsePrice(servicio1Data[1]);
            const ahorro = precioOriginal - total;
            serviciosMsg += `\n*Precio original:* ${formatCurrency(precioOriginal)}`;
            serviciosMsg += `\n*Ahorras:* ${formatCurrency(ahorro)}`;
        }

        const mensaje = `Hola Karen! Espero te encuentres muy bien, mi nombre es *${sanitizedNombre}* y quiero reservar una cita contigo para:\n\n` +
            `${serviciosMsg}\n` +
            `*Fecha:* ${formatFechaBonita(fecha)}\n` +
            `*Hora:* ${formatHoraAMPM(hora)}\n\n` +
            `Por favor confírmame disponibilidad. ¡Gracias!`;

        window.open(`https://wa.me/573163572744?text=${encodeURIComponent(mensaje)
            .replace(/'/g, "%27")
            .replace(/\(/g, "%28")
            .replace(/\)/g, "%29")
            .replace(/\*/g, "%2A")}`, '_blank');
    }

    // Inicializar las opciones del segundo select
    initializeServicio2Options();

    // Configurar event listeners
    servicio1.addEventListener('change', function () {
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
                entry.target.classList.add('animate__animated');
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

    const carousel = new bootstrap.Carousel(carouselEl, {
        interval: 5000,
        wrap: true,
        pause: 'hover',
        keyboard: false
    });

    carouselEl.addEventListener('slid.bs.carousel', function (event) {
        const indicators = document.querySelectorAll('#testimoniosCarousel .carousel-indicators button');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === event.to);
        });
    });
}

// ===== PROMOCIONES COUNTDOWN =====
function setupPromotionsCountdown() {
    const endDate = new Date('2025-08-28T23:59:59');

    const countdownElements = document.querySelectorAll('.countdown');
    const promoButtons = document.querySelectorAll('.btn-promo');
    const promoCards = document.querySelectorAll('.promo-card:not(:last-child)');
    const badges = document.querySelectorAll('.promo-card:not(:last-child) .badge');
    const promoOptions = document.querySelectorAll('.promo-option');
    const promocionesOptgroup = document.querySelector('#servicio1 optgroup[label="PROMOCIONES"]');
    const servicio1 = document.getElementById('servicio1');

    // Si no existe el grupo de promociones, salir
    if (!promocionesOptgroup) return;

    // Eliminar cualquier mensaje existente de "terminadas" para evitar duplicados
    const existingTerminatedMsg = promocionesOptgroup.querySelector('option[value="terminada"]');
    if (existingTerminatedMsg) {
        promocionesOptgroup.removeChild(existingTerminatedMsg);
    }

    // Función para verificar si es móvil
    function checkIfMobile() {
        return window.innerWidth <= 768; // Ajusta este valor según tus breakpoints
    }

    function updatePromotionsAvailability(available) {
        const isMobile = checkIfMobile();

        // Comportamiento diferente para móviles
        if (isMobile) {
            if (!available) {
                // En móviles cuando no hay promociones: ocultar todo el grupo
                promocionesOptgroup.style.display = 'none';
            } else {
                // En móviles cuando hay promociones: mostrar normalmente
                promocionesOptgroup.style.display = '';
                promoOptions.forEach(option => {
                    option.disabled = false;
                    option.style.display = '';
                });
            }
        }
        // Comportamiento para desktop
        else {
            promocionesOptgroup.style.display = ''; // Asegurar que el grupo es visible

            if (available) {
                promoOptions.forEach(option => {
                    option.disabled = false;
                    option.style.display = '';
                });
            } else {
                promoOptions.forEach(option => {
                    option.disabled = true;
                    option.style.display = 'none';
                });

                // Crear mensaje de terminadas solo para desktop
                const terminadaOption = document.createElement('option');
                terminadaOption.value = "terminada";
                terminadaOption.textContent = "Las promociones ya han terminado";
                terminadaOption.disabled = true;
                promocionesOptgroup.appendChild(terminadaOption);

                // Resetear selección si estaba en una promoción
                if (servicio1 && servicio1.value && servicio1.options[servicio1.selectedIndex].parentElement.label === "PROMOCIONES") {
                    servicio1.value = "";
                }
            }
        }
    }

    function updateCountdown() {
        const now = new Date();
        const distance = endDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownElements.forEach(el => {
            if (el) {
                el.innerHTML = distance >= 0
                    ? `⏳ Termina en: <strong>${days}d ${hours}h ${minutes}m ${seconds}s</strong>`
                    : '⌛ ¡OFERTA TERMINADA!';
                if (distance < 0) el.classList.add('ended');
            }
        });

        if (distance < 0) {
            clearInterval(countdownInterval);
            promoButtons.forEach(btn => {
                if (btn) btn.classList.add('disabled');
            });

            promoCards.forEach(card => {
                if (card) {
                    card.style.filter = 'grayscale(80%)';
                    card.style.opacity = '0.8';
                    const priceElement = card.querySelector('.promo-price');
                    const savingsElement = card.querySelector('.savings');
                    if (priceElement) priceElement.style.color = '#888';
                    if (savingsElement) {
                        savingsElement.style.color = '#888';
                        savingsElement.style.background = 'rgba(136,136,136,0.1)';
                    }
                    card.innerHTML = `
                        <span class="badge bg-secondary position-absolute top-0 end-0 m-3">OFERTA TERMINADA</span>
                        <div class="service-icon"><i class="fas fa-star"></i></div>
                        <h4>Próximamente!!</h4>
                    `;
                }
            });

            badges.forEach(badge => {
                if (badge) {
                    badge.classList.remove('bg-success');
                    badge.classList.add('bg-secondary');
                    badge.textContent = 'OFERTA TERMINADA';
                    badge.style.animation = 'none';
                }
            });
        }

        updatePromotionsAvailability(distance >= 0);
    }

    // Debounce function para optimizar rendimiento
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Manejar cambios de tamaño de pantalla
    window.addEventListener('resize', debounce(() => {
        updatePromotionsAvailability(endDate - new Date() >= 0);
    }, 250));

    // Iniciar
    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
}

// Lazy loading para imágenes
function setupLazyLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback para navegadores que no soportan IntersectionObserver
        lazyImages.forEach(img => {
            img.classList.add('loaded');
        });
    }
}

// Smooth scrolling para navegación
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Preload de imágenes críticas
function preloadCriticalImages() {
    const criticalImages = [
        'IMAGES/Logo.png',
        'IMAGES/Karen.JPEG',
        'IMAGES/Galeria 1.jpg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    // Ocultar pantalla de carga
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 1000);

    initBeforeAfterSliders();
    setupReservationForm();
    setupScrollAnimations();
    setupTestimonialsCarousel();
    setupPromotionsCountdown();
    setupLazyLoading();
    setupSmoothScrolling();
    preloadCriticalImages();

    // Inicializar opciones de hora si ya hay una fecha seleccionada
    const fechaInput = document.getElementById('fecha');
    if (fechaInput && fechaInput.value) {
        actualizarOpcionesHora();
    }

    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

window.addEventListener('error', function (e) {
    console.error('Error:', e.message, 'en', e.filename, 'línea:', e.lineno);
});

// Mostrar/ocultar opciones de hora al hacer clic en el input
document.getElementById('hora').addEventListener('focus', function() {
    const timeOptions = document.getElementById('time-options');
    if (timeOptions) timeOptions.style.display = 'block';
});

// Ocultar opciones al hacer clic fuera
document.addEventListener('click', function(e) {
    const horaInput = document.getElementById('hora');
    const timeOptions = document.getElementById('time-options');
    
    if (e.target !== horaInput && timeOptions && !timeOptions.contains(e.target)) {
        timeOptions.style.display = 'none';
    }
});