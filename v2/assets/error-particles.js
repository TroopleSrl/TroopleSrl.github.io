(async () => {
	await document.fonts.ready;
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

	for (const visual of document.querySelectorAll(".error-visual")) {
		const artwork = visual.querySelector(".error-artwork");
		const { width, height } = artwork.viewBox.baseVal;
		const mask = document.createElement("canvas");
		mask.width = width;
		mask.height = height;
		const sample = mask.getContext("2d", { willReadFrequently: true });
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		if (!sample || !context) continue;

		sample.fillStyle = "white";
		sample.strokeStyle = "white";
		for (const text of artwork.querySelectorAll("text")) {
			const style = getComputedStyle(text);
			sample.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
			sample.textAlign = style.textAnchor === "middle" ? "center" : "left";
			let position = Number(text.getAttribute("x"));
			const baseline = Number(text.getAttribute("y"));
			const spacing = parseFloat(style.letterSpacing) || 0;
			for (const character of text.textContent) {
				sample.fillText(character, position, baseline);
				position += sample.measureText(character).width + spacing;
			}
		}
		for (const ring of artwork.querySelectorAll(".error-icon-ring")) {
			sample.beginPath();
			sample.lineWidth = 5;
			sample.arc(Number(ring.getAttribute("cx")), Number(ring.getAttribute("cy")), Number(ring.getAttribute("r")), 0, Math.PI * 2);
			sample.stroke();
		}
		for (const rectangle of artwork.querySelectorAll("rect")) {
			sample.fillRect(...["x", "y", "width", "height"].map(attribute => Number(rectangle.getAttribute(attribute))));
		}

		const pixels = sample.getImageData(0, 0, width, height).data;
		const particles = [];
		for (let vertical = 2; vertical < height; vertical += 5) {
			for (let horizontal = 2; horizontal < width; horizontal += 5) {
				if (pixels[(vertical * width + horizontal) * 4 + 3] < 128) continue;
				particles.push({
					x: horizontal + (Math.random() - .5),
					y: vertical + (Math.random() - .5),
					startX: (Math.random() - .15) * width * 1.3,
					startY: (Math.random() - .5) * height * 2,
					delay: Math.random() * .7,
					phase: Math.random() * Math.PI * 2,
					radius: 1.2 + Math.random() * 1.1
				});
			}
		}
		if (!particles.length) continue;

		canvas.className = "error-particles";
		visual.appendChild(canvas);
		const color = getComputedStyle(visual).getPropertyValue("--bs-accent").trim();
		const started = performance.now() - 1500;
		let frame = 0;
		let visible = true;
		let scale = 1;
		let offsetX = 0;
		let offsetY = 0;

		function render(timestamp) {
			context.setTransform(1, 0, 0, 1, 0, 0);
			context.clearRect(0, 0, canvas.width, canvas.height);
			context.setTransform(scale, 0, 0, scale, offsetX, offsetY);
			context.fillStyle = color;
			const elapsed = (timestamp - started) / 1000;
			for (const particle of particles) {
				const progress = reducedMotion.matches ? 1 : Math.max(0, Math.min(1, (elapsed - particle.delay) / 2.8));
				const gathered = 1 - (1 - progress) ** 3;
				const drift = reducedMotion.matches ? 0 : Math.sin(elapsed * .8 + particle.phase) * (1.2 + (1 - gathered) * 5);
				const horizontal = particle.startX + (particle.x - particle.startX) * gathered + drift;
				const vertical = particle.startY + (particle.y - particle.startY) * gathered + drift * .6;
				context.globalAlpha = .25 + gathered * .7;
				context.beginPath();
				context.arc(horizontal, vertical, .8 + (particle.radius - .8) * gathered, 0, Math.PI * 2);
				context.fill();
			}
			if (!reducedMotion.matches && !document.hidden && visible) frame = requestAnimationFrame(render);
		}

		function refresh() {
			cancelAnimationFrame(frame);
			render(performance.now());
		}

		function resize() {
			const bounds = visual.getBoundingClientRect();
			const ratio = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.round(bounds.width * ratio);
			canvas.height = Math.round(bounds.height * ratio);
			scale = Math.min(canvas.width / width, canvas.height / height);
			offsetX = (canvas.width - width * scale) / 2;
			offsetY = (canvas.height - height * scale) / 2;
			refresh();
		}

		resize();
		artwork.classList.add("error-artwork-source");
		new ResizeObserver(resize).observe(visual);
		new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			refresh();
		}).observe(visual);
		reducedMotion.addEventListener("change", refresh);
		document.addEventListener("visibilitychange", refresh);
	}
})();
