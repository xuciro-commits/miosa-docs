/* Homepage behaviour: about 3 KB. Everything here must work without it, so the
 * page is usable before this file runs: the copy button falls back to showing
 * the command, and the status pill already says it is checking. */
(function () {
	/** @type {HTMLElement | null} */
	var installEl = document.querySelector('.install');
	if (installEl) {
		var command = installEl;
		/** @type {HTMLElement | null} */
		var label = command.querySelector('[data-label]');
		/** @type {HTMLElement | null} */
		var fallback = document.querySelector('.install-fallback');
		/** @param {string} text */
		var reset = function (text) {
			command.dataset.state = 'idle';
			if (label) label.textContent = text;
		};
		command.addEventListener('click', function () {
			var value = command.dataset.command || '';
			var done = command.dataset.done || 'Copied';
			var manual = command.dataset.manual || 'Select to copy';
			if (navigator.clipboard && navigator.clipboard.writeText) {
				navigator.clipboard.writeText(value).then(
					function () {
						command.dataset.state = 'done';
						if (label) label.textContent = done;
						setTimeout(function () {
							reset(command.dataset.idle || 'Copy');
						}, 1800);
					},
					function () {
						if (label) label.textContent = manual;
						if (fallback) fallback.hidden = false;
					}
				);
			} else {
				if (label) label.textContent = manual;
				if (fallback) fallback.hidden = false;
			}
		});
	}

	/** @type {HTMLElement | null} */
	var statusEl = document.querySelector('.status');
	if (statusEl) {
		var status = statusEl;
		/** @type {HTMLElement | null} */
		var text = status.querySelector('[data-status]');
		/** @param {string} state @param {string} message */
		var set = function (state, message) {
			status.dataset.state = state;
			if (text) text.textContent = message;
		};
		var check = function () {
			set('checking', status.dataset.checking || 'Checking');
			fetch('/api/status', { cache: 'no-store' })
				.then(function (response) {
					return response.json().then(function (body) {
						var ok = response.ok && body && body.status === 'operational';
						set('ready', ok ? status.dataset.ready || '' : status.dataset.error || '');
					});
				})
				.catch(function () {
					set('error', status.dataset.error || '');
				});
		};
		status.addEventListener('click', check);
		// The static build has no API, so a failed check is shown as-is rather
		// than retried in a loop.
		setTimeout(check, 600);
	}

	// Keep the theme in step when the reader changes it elsewhere and comes back.
	window.addEventListener('storage', function (event) {
		if (event.key !== 'miosa-theme') return;
		var dark =
			event.newValue === 'dark' ||
			(event.newValue === 'system' &&
				window.matchMedia('(prefers-color-scheme: dark)').matches);
		document.documentElement.dataset.theme = dark ? 'dark' : 'light';
	});
})();
