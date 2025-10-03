document.addEventListener('DOMContentLoaded', () => {

    // Helper para animar texto letra por letra (char-split) o línea por línea (line-split)
    const splitText = (selector, type = 'char') => {
        document.querySelectorAll(selector).forEach(element => {
            if (type === 'char') {
                const text = element.textContent;
                element.innerHTML = text.split('').map(char => `<span>${char === ' ' ? '&nbsp;' : char}</span>`).join('');
            } else if (type === 'line') {
                const text = element.textContent;
                const words = text.split(' ');
                let lines = [];
                let currentLine = '';

                words.forEach(word => {
                    if (currentLine.length + word.length + 1 > 40 && currentLine !== '') {
                        lines.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = currentLine === '' ? word : currentLine + ' ' + word;
                    }
                });
                if (currentLine !== '') {
                    lines.push(currentLine);
                }

                element.innerHTML = lines.map(line => `<span>${line}</span>`).join('');
            }
        });
    };

    // Aplicar splitText
    splitText('.char-split', 'char');
    splitText('.line-split', 'line');

    // 1. Lógica del Seguidor de Cursor (Circle Follower)
    const body = document.body;
    if (body) {
        body.insertAdjacentHTML('beforeend', '<div class="cursor-follower"></div>');
    }
    const cursorFollower = document.querySelector('.cursor-follower');
    const heroLetters = document.querySelectorAll('.hero-title-line-1 span, .hero-title-line-2 span');
    
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Mueve el cursor seguidor
        if (cursorFollower) {
            cursorFollower.style.left = `${mouseX}px`;
            cursorFollower.style.top = `${mouseY}px`;
        }
    });

    // ⚡ Efecto Hover en el Título Principal
    if (heroLetters && heroLetters.length > 0 && cursorFollower) {
        heroLetters.forEach(letter => {
            letter.addEventListener('mouseenter', () => {
                cursorFollower.style.width = '80px';
                cursorFollower.style.height = '80px';
                cursorFollower.style.backgroundColor = 'rgba(172, 74, 29, 0.4)'; 
                letter.style.color = 'var(--color-primary)'; 
            });

            letter.addEventListener('mouseleave', () => {
                cursorFollower.style.width = 'var(--cursor-size)';
                cursorFollower.style.height = 'var(--cursor-size)';
                cursorFollower.style.backgroundColor = 'var(--cursor-color)'; 
                letter.style.color = ''; // Quitar estilo inline para que CSS tome el control
            });
        });
    }

    // 2. Lógica de Animación de Lluvia de Bolitas Mejorada con Interacción
    const particleContainer = document.getElementById('particle-container');
    if (particleContainer) {
        const colors = [
            'rgba(255, 255, 255, 0.8)', 
            'rgba(71, 193, 220, 0.7)',  
            'rgba(26, 115, 232, 0.7)', 
            'rgba(249, 249, 249, 0.7)' 
        ];
        const particles = []; 
        const particleCount = 15;

        class Particle {
            constructor(id) {
                this.id = id;
                this.element = document.createElement('div');
                this.element.classList.add('particle');
                this.x = Math.random() * window.innerWidth;
                this.y = Math.random() * window.innerHeight;
                this.size = 8 + Math.random() * 10;
                this.speedY = 90 + Math.random();
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.element.style.backgroundColor = this.color;
                this.element.style.width = `${this.size}px`;
                this.element.style.height = `${this.size}px`;
                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;
                this.element.style.opacity = Math.random() * 0.4 + 0.3;

                particleContainer.appendChild(this.element);
            }

            update() {
                this.y += this.speedY;
                this.x += this.speedX;

                // Interacción con el cursor: "Empuje"
                const dx = this.x - mouseX;
                const dy = this.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = 100; 

                if (distance < minDistance) {
                    const force = (minDistance - distance) / minDistance;
                    this.x += dx / distance * force * 2; 
                    this.y += dy / distance * force * 2;
                    this.element.style.transform = `scale(1.2)`;
                } else {
                    this.element.style.transform = `scale(1)`;
                }

                // Reiniciar partícula si sale de la pantalla
                if (this.y > window.innerHeight + this.size || this.x < -this.size || this.x > window.innerWidth + this.size) {
                    this.y = -this.size; // Vuelve arriba
                    this.x = Math.random() * window.innerWidth;
                    this.speedY = 1 + Math.random();
                    this.speedX = (Math.random() - 0.5) * 0.5;
                }

                this.element.style.left = `${this.x}px`;
                this.element.style.top = `${this.y}px`;
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(i));
        }

        const animateParticles = () => {
            particles.forEach(p => p.update());
            requestAnimationFrame(animateParticles);
        };

        animateParticles(); 
    }

    // 3. Lógica de Persistencia de Animación (Scroll Reveal)
    const scrollRevealElements = document.querySelectorAll('.scroll-reveal');
    
    const animateSplitText = (el) => {
        el.querySelectorAll('.char-split span').forEach((span, index) => {
            span.style.transitionDelay = `${index * 0.03}s`;
            span.style.opacity = 1;
            span.style.transform = 'translateY(0)';
        });
        el.querySelectorAll('.line-split span').forEach((span, index) => {
            span.style.transitionDelay = `${index * 0.15}s`;
            span.style.opacity = 1;
            span.style.transform = 'translateY(0)';
        });
        el.querySelectorAll('.recommendation-list li.fade-in-item').forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.1}s`; 
            item.style.opacity = 1;
            item.style.transform = 'translateX(0)';
        });
    }

    const animateOnScroll = () => {
        scrollRevealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const threshold = 0.2; 
            
            if (rect.top <= (window.innerHeight || document.documentElement.clientHeight) * (1 - threshold) &&
                rect.bottom >= (window.innerHeight || document.documentElement.clientHeight) * threshold) {
                
                if (!el.classList.contains('visible')) {
                    el.classList.add('visible');
                    animateSplitText(el);
                }

            } else {
                // Reiniciar animación cuando el elemento sale de la vista si queremos el efecto continuo
                if (el.classList.contains('visible')) {
                    el.classList.remove('visible');
                    
                    el.querySelectorAll('.char-split span, .line-split span').forEach(span => { 
                        span.style.opacity = 0; 
                        span.style.transform = 'translateY(20px)'; 
                        span.style.transitionDelay = '0s'; 
                    });
                    el.querySelectorAll('.recommendation-list li.fade-in-item').forEach(item => { 
                        item.style.opacity = 0; 
                        item.style.transform = 'translateX(-20px)';
                        item.style.transitionDelay = '0s';
                    });
                }
            }
        });
    };

    // Inicializar y agregar listener de scroll
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);

    // 4. Efecto de Menú Fijo (Sticky Navbar)
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('sticky');
            } else {
                navbar.classList.remove('sticky');
            }
        });
    }

    // 5. Lógica del Velocímetro AQI Mejorado
    const aqiGauge = document.getElementById('aqi-gauge');
    const gaugeNeedle = document.getElementById('gauge-needle');
    const gaugeArcFill = document.getElementById('gauge-arc-fill');
    const currentAqiValue = document.getElementById('current-aqi-value');
    const aqiStatusText = document.getElementById('aqi-status-text');
    const gaugeCenter = document.querySelector('.gauge-center');

    if (aqiGauge && gaugeNeedle && gaugeArcFill && currentAqiValue && aqiStatusText && gaugeCenter) {
        const updateAqiGauge = (aqi) => {
            const angle = (aqi / 500) * 260; 
            gaugeNeedle.style.transform = `translateX(-50%) rotate(${angle - 90}deg)`;
            gaugeArcFill.style.transform = `rotate(${angle}deg)`;
            currentAqiValue.textContent = aqi;

            let status = '';
            let statusColor = '';

            if (aqi <= 50) {
                status = 'Buena';
                statusColor = 'var(--aqi-good)';
            } else if (aqi <= 100) {
                status = 'Moderada';
                statusColor = 'var(--aqi-moderate)';
            } else if (aqi <= 150) {
                status = 'Mala para Grupos Sensibles';
                statusColor = 'var(--aqi-unhealthy-sensitive)';
            } else if (aqi <= 200) {
                status = 'Mala';
                statusColor = 'var(--aqi-unhealthy)';
            } else if (aqi <= 300) {
                status = 'Muy Mala';
                statusColor = 'var(--aqi-very-unhealthy)';
            } else {
                status = 'Peligrosa';
                statusColor = 'var(--aqi-hazardous)';
            }
            aqiStatusText.innerHTML = `Calidad **${status}**`;
            aqiStatusText.style.color = statusColor;
            currentAqiValue.style.color = statusColor;
            gaugeCenter.style.borderColor = statusColor;
        };

        updateAqiGauge(55);
    }

    // 6. Lógica de Predicciones Semanales 
    const dayCards = document.querySelectorAll('.day-card-interactive');
    const predictionTitle = document.getElementById('prediction-day-title');
    const predictionDesc = document.getElementById('prediction-base-desc');

    if (dayCards.length > 0 && predictionTitle && predictionDesc) {
        const predictionData = {
            lunes: {
                title: "Lunes: Aire Moderado",
                baseDesc: "Se pronostican niveles de AQI Moderados (68). Se recomienda limitar la actividad intensa al aire libre para niños y personas con enfermedades respiratorias. Considere usar mascarilla.",
                modalFace: "😊",
                modalDesc: "AQI: 68 (Moderada)<br>Concentraciones de partículas finas (PM2.5) levemente elevadas. Se aconseja usar purificador de aire en casa y optar por paseos cortos. **Grupos Sensibles:** Reduzca el esfuerzo prolongado o intenso al aire libre."
            },
            martes: {
                title: "Martes: Aire Bueno",
                baseDesc: "¡Día Excelente! Se espera que la calidad del aire se mantenga en niveles **Buenos (45)**. La dispersión de contaminantes es óptima gracias a vientos ligeros. Las condiciones son ideales para actividades al aire libre sin restricciones.",
                modalFace: "😃",
                modalDesc: "AQI: 45 (Buena)<br>La calidad del aire es satisfactoria y representa poco o ningún riesgo. Disfruta del día al aire libre. La visibilidad será alta y la sensación de aire limpio óptima."
            },
            miercoles: {
                title: "Miércoles: Aire Malo",
                baseDesc: "Alerta: Se anticipa un deterioro significativo con AQI Malo (112). Evite salir si no es estrictamente necesario, especialmente por la mañana. Grupos sensibles deben permanecer en interiores.",
                modalFace: "🙁",
                modalDesc: "AQI: 112 (Mala)<br>Riesgo para la población general. Se recomienda usar mascarilla KN95 al salir y evitar el ejercicio extenuante. Cierre todas las entradas de aire y use purificador si es posible."
            },
            jueves: {
                title: "Jueves: Aire Moderado",
                baseDesc: "El aire mejora pero se mantiene Moderado (80). Grupos sensibles deben seguir precauciones. El resto de la población puede realizar actividades moderadas al aire libre.",
                modalFace: "😐",
                modalDesc: "AQI: 80 (Moderada)<br>Las concentraciones de Ozono (O3) podrían aumentar durante la tarde. Limite la actividad física a las horas de menor tráfico vehicular y en zonas menos contaminadas."
            },
            viernes: {
                title: "Viernes: Aire Excelente",
                baseDesc: "La mejor calidad de la semana, AQI Excelente (30). Disfruta de la calidad del aire para terminar la semana con actividades al aire libre sin preocupaciones.",
                modalFace: "🤩",
                modalDesc: "AQI: 30 (Excelente)<br>Calidad del aire muy satisfactoria. Ideal para correr, andar en bicicleta o pasar tiempo en parques. ¡Aprovecha el aire puro!"
            },
            sabado: {
                title: "Sábado: Aire Bueno",
                baseDesc: "Un buen inicio de fin de semana con AQI Bueno (52). Ideal para disfrutar de actividades familiares al aire libre y excursiones cortas.",
                modalFace: "😊",
                modalDesc: "AQI: 52 (Bueno)<br>Condiciones favorables para todas las actividades al aire libre. La calidad del aire es aceptable para la mayoría de las personas."
            },
            domingo: {
                title: "Domingo: Aire Moderado",
                baseDesc: "AQI Moderado (75). Se recomienda a los grupos sensibles tomar precauciones, aunque la población general puede disfrutar del día.",
                modalFace: "😐",
                modalDesc: "AQI: 75 (Moderada)<br>Las personas inusualmente sensibles pueden experimentar síntomas respiratorios. Se aconseja estar atento a las actualizaciones de AQI si planea actividades prolongadas."
            }
        };

        dayCards.forEach(card => {
            card.addEventListener('click', () => {
                dayCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                const dayKey = card.dataset.day;
                const data = predictionData[dayKey];
                predictionTitle.textContent = data.title;
                predictionDesc.innerHTML = data.baseDesc;

                updateModalData(data.title, data.modalFace, data.modalDesc);
            });
        });

        // 7. Lógica del Modal (Ventana Emergente) 
        const modal = document.getElementById('prediction-modal');
        const openBtn = document.getElementById('open-modal');
        const closeBtn = document.querySelector('.modal .close-button');

        function updateModalData(dayTitle, face, description) {
            document.getElementById('modal-day-title').textContent = dayTitle;
            document.getElementById('modal-face').textContent = face;
            document.getElementById('modal-description').innerHTML = description;
        }

        if (openBtn && modal) {
            openBtn.onclick = function() {
                modal.style.display = "flex"; 
                document.body.style.overflow = 'hidden'; 
            }
        }
        if (closeBtn && modal) {
            closeBtn.onclick = function() {
                modal.style.display = "none";
                document.body.style.overflow = ''; 
            }
        }
        window.onclick = function(event) {
            if (modal && event.target == modal) {
                modal.style.display = "none";
                document.body.style.overflow = '';
            }
        }

        // Seleccionar el Martes al inicio
        const martesCard = document.querySelector('.day-card-interactive[data-day="martes"]');
        if (martesCard) {
            martesCard.click();
        }
    }

    // 8. Efecto Parallax en la Sección del Mapa 
    const mapPlaceholder = document.querySelector('.map-placeholder');
    if (mapPlaceholder) {
        mapPlaceholder.addEventListener('mousemove', (e) => {
            const speed = 0.03; 
            const x = (window.innerWidth / 2 - e.clientX) * speed;
            const y = (window.innerHeight / 2 - e.clientY) * speed;
            mapPlaceholder.style.backgroundPosition = `${50 + x}px ${50 + y}px`;
        });
    }

});

// =========================================================================
// LÓGICA ESPECÍFICA DE LA PÁGINA DE PERFIL Y CHATBOT
// (Se añade al final del script.js principal)
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------
    // LÓGICA DE EDICIÓN DE PERFIL
    // ------------------------------------
    const editIcons = document.querySelectorAll('.edit-icon');
    const saveButton = document.querySelector('.save-button');
    let editing = false;

    const toggleEdit = (input, isEditing) => {
        input.readOnly = !isEditing;
        if (isEditing) {
            input.focus();
            input.select();
            input.style.borderBottom = '1px solid var(--color-primary)';
            input.parentElement.querySelector('.edit-icon').classList.remove('fa-pen');
            input.parentElement.querySelector('.edit-icon').classList.add('fa-check');
        } else {
            input.style.borderBottom = '1px solid var(--color-border-light)';
            input.parentElement.querySelector('.edit-icon').classList.remove('fa-check');
            input.parentElement.querySelector('.edit-icon').classList.add('fa-pen');
        }
    };

    editIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const fieldId = icon.dataset.field;
            const input = document.getElementById(fieldId);

            const currentlyEditing = !input.readOnly;
            
            // Si hacemos click en 'Editar'
            if (!currentlyEditing) {
                toggleEdit(input, true);
                saveButton.classList.remove('hidden');
            } else { // Si hacemos click en 'Guardar' (el checkmark)
                toggleEdit(input, false);
                
                // Ocultar el botón si no queda nada más que editar
                let anyFieldStillEditing = false;
                document.querySelectorAll('.profile-form input[readonly=false]').forEach(i => {
                    if (i.id !== fieldId) {
                        anyFieldStillEditing = true;
                    }
                });
                if (!anyFieldStillEditing) {
                    saveButton.classList.add('hidden');
                }
                
                // Aquí va la lógica real de guardar en el servidor (simulado)
                console.log(`Guardando cambio para ${fieldId}: ${input.value}`);
            }
        });
    });

    // Lógica para el botón 'Guardar Cambios' global
    if (saveButton) {
        saveButton.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.profile-form input[readonly=false]').forEach(input => {
                // Forzar el guardado de todos los campos abiertos
                toggleEdit(input, false);
                console.log(`Guardado masivo para ${input.id}: ${input.value}`);
            });
            saveButton.classList.add('hidden');
        });
    }


    // Inicializar mapa automáticamente si existe el div #map
    const mapDiv = document.getElementById("map");
    if (mapDiv && typeof L !== 'undefined') {
        var map = L.map('map').setView([19.4326, -99.1332], 6);
        L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=y6eMi6szg7ZddVJclXiY', {
            attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
        }).addTo(map);

        // Marcador de ejemplo para Ozono
        const ozonoData = {
            nombre: "Ozono (O₃)",
            cantidad: 120, // ppb
            coords: [34.0522, -118.2437] // Los Angeles
        };
        const ozonoMarker = L.circleMarker(ozonoData.coords, {
            radius: 10,
            color: "#1a73e8",
            fillColor: "#1a73e8",
            fillOpacity: 0.7
        }).addTo(map);
            ozonoMarker.on('click', function() {
                map.flyTo(ozonoData.coords, 10, {
                    animate: true,
                    duration: 2.2, // segundos, más lento
                    easeLinearity: 0.15 // más smooth
                });
                // Actualizar panel de información
                const infoPanel = document.getElementById('info-detalles');
                if (infoPanel) {
                    infoPanel.innerHTML = `
                        <h4 style=\"margin-bottom:8px;\">${ozonoData.nombre}</h4>
                        <p><b>Cantidad:</b> ${ozonoData.cantidad} ppb</p>
                        <div id=\"ozono-grafica\" style=\"height:180px; margin-top:12px; background:#f5f5f5; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#888;\">[Aquí irá la gráfica]</div>
                    `;
                }
            });

        // Detectar ubicación del usuario (opcional)
        map.locate({ setView: true, maxZoom: 12 });
        map.on('locationfound', function(e) {
            L.marker(e.latlng).addTo(map)
                .bindPopup("Estás aquí 📍")
                .openPopup();
        });
    }

    
    // NOTA: La lógica de partículas, scroll reveal, AQI, etc. de la página principal
    // sigue funcionando aquí, gracias a la reutilización del script.
});
