let hsvColor = { "h": 0, "s": 1, "v": 1}


document.addEventListener("DOMContentLoaded", function() {
	const colorWheel = document.querySelector(".color-wheel")
	const innerWheel = document.querySelector(".inner-wheel")
	const svgWheel = document.querySelector(".svg-bolt")
	const cursor = document.querySelector(".color-cursor")
	const triangleCursor = document.querySelector(".triangle-color-cursor")
	let isDragging = false

	// Обработчики событий для мыши
	colorWheel.addEventListener("mousedown", startDrag)
	document.addEventListener("mousemove", drag)
	document.addEventListener("mouseup", endDrag)

	// Обработчики событий для сенсорных устройств
	colorWheel.addEventListener('touchstart', startDrag, { passive: false })
    document.addEventListener('touchmove', drag, { passive: false })
    document.addEventListener('touchend', endDrag)

	function startDrag(e) {
        e.preventDefault()
        isDragging = true
        updateCursorPosition(e)
    }

	function drag(e) {
        if (!isDragging) return
        e.preventDefault()
        updateCursorPosition(e)
    }

	function endDrag() {
        isDragging = false
    }

	function updateCursorPosition(e) {
        // Получаем координаты касания/клика
        const clientX = e.clientX ?? e.touches[0].clientX
        const clientY = e.clientY ?? e.touches[0].clientY
		
        // Рассчитываем центр color-wheel
        const rect = colorWheel.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
		
        // Вектор от центра до курсора
        const dx = clientX - centerX
        const dy = clientY - centerY
        const angle = Math.atan2(dy, dx)
		
		let angleDegrees = angle * (180 / Math.PI) + 90
		angleDegrees = (angleDegrees + 360) % 360
		
        // Радиус движения курсора
		const rectInnerWheel = innerWheel.getBoundingClientRect()
		const innerWheelRadius = rectInnerWheel.width / 2
		const colorWheelRadius = rect.width / 2
		const centerDonut = (colorWheelRadius - innerWheelRadius) / 2
        const radius = colorWheelRadius - centerDonut

        // Позиционируем курсор
        const x = centerX + radius * Math.cos(angle) - rect.left - cursor.offsetWidth / 2
        const y = centerY + radius * Math.sin(angle) - rect.top - cursor.offsetHeight / 2


		// Позиционируем курсор
        const tx = centerX + innerWheelRadius * Math.cos(angle) - rect.left - triangleCursor.offsetWidth / 2
        const ty = centerY + innerWheelRadius * Math.sin(angle) - rect.top - triangleCursor.offsetHeight / 2
		
		triangleCursor.style.transform = `translate(${tx}px, ${ty}px) rotate(${angleDegrees}deg)`

		cursor.style.transform = `translate(${x}px, ${y}px)`

		hueColor(angle)
	}

	// Инициализация слайдеров
    const sliders = document.querySelectorAll('.slider-container > div[class$="-slider"]');
    
    sliders.forEach(slider => {
        const cursor = slider.querySelector('.color-cursor');
        const valueSpan = slider.parentElement.querySelector('span');
        let isDragging = false;

        // Обработчики событий
        slider.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);

        slider.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', endDrag);

        function startDrag(e) {
            e.preventDefault();
            isDragging = true;
            updateCursorPosition(e);
        }

        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            updateCursorPosition(e);
        }

        function endDrag() {
            isDragging = false;
        }

        function updateCursorPosition(e) {
            // Получаем координаты
            const clientX = e.clientX ?? e.touches[0].clientX;
            const sliderRect = slider.getBoundingClientRect();
			
			// Рассчитываем границы движения
			const padding = (slider.offsetHeight - cursor.offsetHeight) / 2;
			const maxX = sliderRect.width - cursor.offsetWidth - padding;
			const minX = padding;

            // Рассчитываем позицию
            let x = clientX - sliderRect.left - cursor.offsetWidth/2;
			
            x = Math.max(minX, Math.min(x, maxX));
            
            // Обновляем позицию
            cursor.style.transform = `translateX(${x}px) translateY(${padding}px)`;

            // Обновляем значение
			const rowPercent = (x - minX) / (maxX - minX);
            const percent = (rowPercent * 100).toFixed(0);
			
            valueSpan.textContent = `${percent}%`;

			if (slider.classList == "saturation-slider") saturationColor(rowPercent);
			if (slider.classList == "brightness-slider") brightnessColor(rowPercent);
			
        }
    });

	function hueColor(angle) {
		let degrees = -(angle * (180 / Math.PI) + 90) / 360;
		if (degrees < 0) degrees += 1;
		
		hsvColor.h = degrees;
		updateColor();
	}

	function saturationColor(percent) {
		hsvColor.s = percent;
		updateColor();
	}

	function brightnessColor(percent) {
		hsvColor.v = percent;
		updateColor();
	}

	function updateColor() {
		let hsvColor_rgb = HSVtoRGB(hsvColor)
		let hsvColorStr_rgb = RAW_RGBtoRGB(hsvColor_rgb)
		
		let hsColor_rgb = HSVtoRGB(hsvColor.h, hsvColor.s, 1)
		let hsColorStr_rgb = RAW_RGBtoRGB(hsColor_rgb)

		let hColor_rgb = HSVtoRGB(hsvColor.h, 1, 1)
		let hColorStr_rgb = RAW_RGBtoRGB(hColor_rgb)
		
		svgWheel.style.fill = hsvColorStr_rgb;		
		
		sliders.forEach(slider => {
			if (slider.classList == "brightness-slider")
				slider.style.background = `linear-gradient(to right, #000, ${hsColorStr_rgb})`
			if (slider.classList == "saturation-slider") {
				slider.style.background = `linear-gradient(rgba(0, 0, 0, ${-hsvColor.v + 1}), rgba(0, 0, 0, ${-hsvColor.v + 1})), linear-gradient(to right, #fff, ${hColorStr_rgb})`
			}
			
		})
	}
})

function RAW_RGBtoRGB(r, g, b) {
	if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
	return `rgb(${r}, ${g}, ${b})`
}

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}


function RGBtoHSV(r, g, b) {
    if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: h,
        s: s,
        v: v
    };
}

function createDotsElements() {
	const innerWheel = document.querySelector(".inner-wheel")
	const docFrag = document.createDocumentFragment()
	
	for (let i = 1; i <= 32; i += 1) {
		let div = document.createElement("div")
		div.className = "dots"
		div.style.cssText = `--i: ${i}`
		
		docFrag.appendChild(div)
	}
	innerWheel.appendChild(docFrag)
}

function device() {
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		document.querySelector("header").remove()
	}
}

device()
createDotsElements()