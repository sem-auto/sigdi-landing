// SIDGI — script.js
// Navegación, año de pie de página y demostraciones ficticias (sin backend, sin persistencia).

document.addEventListener('DOMContentLoaded', function () {
  /* ---------- Año en el pie de página ---------- */
  document.querySelectorAll('#year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Header con sombra al hacer scroll ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Animación de aparición al hacer scroll ---------- */
  var revealTargets = document.querySelectorAll(
    '.card, .step, .case-card, .price-card, .company-card, .demo-shell, .cta-band, .section-head, .problem-list li'
  );
  if ('IntersectionObserver' in window && revealTargets.length) {
    revealTargets.forEach(function (el) { el.classList.add('reveal'); });
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('reveal-visible'); });
  }

  /* ---------- Menú móvil ---------- */
  var menuToggle = document.getElementById('menu-toggle');
  var mainNav = document.getElementById('main-nav');
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* ---------- Desplegable "Soluciones" (touch/click) ---------- */
  document.querySelectorAll('.nav-dropdown-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dropdown = btn.closest('.nav-dropdown');
      var isOpen = dropdown.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.nav-dropdown.open').forEach(function (dropdown) {
      if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
    });
  });

  /* =========================================================
     DEMO 1 — Control horario (datos ficticios, no se guardan)
     ========================================================= */
  var clockDemo = document.getElementById('demo-fichajes');
  if (clockDemo) {
    var initialWorkerStates = {
      marta: { nombre: 'Marta G.', iniciales: 'MG', estado: 'fuera' },
      javier: { nombre: 'Javier R.', iniciales: 'JR', estado: 'trabajando' },
      ana: { nombre: 'Ana P.', iniciales: 'AP', estado: 'pausa' }
    };
    var workers = JSON.parse(JSON.stringify(initialWorkerStates));
    var selectedWorkerId = '';
    var pinValue = '';
    var records = [];

    var workerButtons = clockDemo.querySelectorAll('[data-worker]');
    var demoSteps = clockDemo.querySelectorAll('[data-demo-step]');
    var progressBars = clockDemo.querySelectorAll('.demo-progress span');
    var msg = clockDemo.querySelector('.demo-message');
    var tableBody = clockDemo.querySelector('tbody');
    var selectedAvatar = clockDemo.querySelector('.demo-selected-worker .demo-avatar');
    var selectedName = clockDemo.querySelector('.demo-selected-worker strong');
    var pinDots = clockDemo.querySelectorAll('.demo-pin-dots span');
    var pinError = clockDemo.querySelector('.demo-pin-error');
    var confirmPinButton = clockDemo.querySelector('[data-pin-confirm]');
    var greeting = clockDemo.querySelector('[data-demo-greeting]');
    var stateText = clockDemo.querySelector('[data-demo-state]');
    var actionContainer = clockDemo.querySelector('[data-demo-actions]');

    var statusLabels = { fuera: 'Fuera', trabajando: 'Trabajando', pausa: 'En pausa' };
    var stepIndexes = { workers: 0, pin: 1, actions: 2 };

    function setStep(stepName) {
      demoSteps.forEach(function (step) {
        step.hidden = step.getAttribute('data-demo-step') !== stepName;
      });
      var activeIndex = stepIndexes[stepName];
      progressBars.forEach(function (bar, index) {
        bar.classList.toggle('active', index <= activeIndex);
      });
    }

    function renderWorkers() {
      Object.keys(workers).forEach(function (id) {
        var status = clockDemo.querySelector('[data-status-for="' + id + '"]');
        status.textContent = statusLabels[workers[id].estado];
        status.className = 'demo-status status-' + workers[id].estado;
      });
    }

    function updatePin() {
      pinDots.forEach(function (dot, index) {
        dot.classList.toggle('filled', index < pinValue.length);
      });
      confirmPinButton.disabled = pinValue.length !== 4;
    }

    workerButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectedWorkerId = btn.getAttribute('data-worker');
        var worker = workers[selectedWorkerId];
        selectedAvatar.textContent = worker.iniciales;
        selectedName.textContent = worker.nombre;
        pinValue = '';
        pinError.textContent = '';
        msg.textContent = '';
        updatePin();
        setStep('pin');
      });
    });

    clockDemo.querySelectorAll('[data-demo-back]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        selectedWorkerId = '';
        pinValue = '';
        pinError.textContent = '';
        msg.textContent = '';
        updatePin();
        setStep('workers');
      });
    });

    clockDemo.querySelectorAll('[data-pin-key]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (pinValue.length < 4) pinValue += btn.getAttribute('data-pin-key');
        pinError.textContent = '';
        updatePin();
      });
    });

    clockDemo.querySelector('[data-pin-delete]').addEventListener('click', function () {
      pinValue = pinValue.slice(0, -1);
      pinError.textContent = '';
      updatePin();
    });

    confirmPinButton.addEventListener('click', function () {
      if (pinValue !== '1234') {
        pinError.textContent = 'PIN incorrecto. Para esta demostración utiliza 1234.';
        pinValue = '';
        updatePin();
        return;
      }
      pinError.textContent = '';
      renderActions();
      setStep('actions');
    });

    function nowLabel() {
      var d = new Date();
      return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0') + ':' + d.getSeconds().toString().padStart(2, '0');
    }

    function renderActions() {
      var worker = workers[selectedWorkerId];
      greeting.textContent = 'Hola, ' + worker.nombre.split(' ')[0];
      actionContainer.innerHTML = '';

      var actions = [];
      if (worker.estado === 'fuera') {
        stateText.textContent = 'Puedes registrar tu entrada.';
        actions = [{ evento: 'entrada', titulo: 'Fichar entrada', ayuda: 'Empiezo a trabajar', clase: 'action-entry' }];
      } else if (worker.estado === 'trabajando') {
        stateText.textContent = 'Estás trabajando. ¿Qué quieres fichar?';
        actions = [
          { evento: 'pausa', titulo: 'Pausar', ayuda: 'Empiezo el descanso', clase: 'action-pause' },
          { evento: 'salida', titulo: 'Fichar salida', ayuda: 'Termino de trabajar', clase: 'action-exit' }
        ];
      } else {
        stateText.textContent = 'Estás en pausa.';
        actions = [
          { evento: 'reanudar', titulo: 'Terminar pausa', ayuda: 'Vuelvo del descanso', clase: 'action-resume' },
          { evento: 'salida', titulo: 'Fichar salida', ayuda: 'Termino de trabajar', clase: 'action-exit' }
        ];
      }

      actions.forEach(function (action) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'demo-action-card ' + action.clase;
        button.setAttribute('data-demo-event', action.evento);
        var title = document.createElement('strong');
        title.textContent = action.titulo;
        var help = document.createElement('span');
        help.textContent = action.ayuda;
        button.appendChild(title);
        button.appendChild(help);
        actionContainer.appendChild(button);
      });
    }

    function addRecord(evento) {
      var worker = workers[selectedWorkerId];
      var eventLabels = { entrada: 'Entrada', pausa: 'Pausa iniciada', reanudar: 'Pausa terminada', salida: 'Salida' };
      var nextStates = { entrada: 'trabajando', pausa: 'pausa', reanudar: 'trabajando', salida: 'fuera' };
      var time = nowLabel();
      worker.estado = nextStates[evento];
      records.unshift({ trabajador: worker.nombre, tipo: eventLabels[evento], hora: time });
      renderTable();
      renderWorkers();
      msg.textContent = worker.nombre + ': ' + eventLabels[evento] + ' guardada a las ' + time + '.';
      selectedWorkerId = '';
      pinValue = '';
      updatePin();
      setStep('workers');
    }

    function renderTable() {
      tableBody.innerHTML = '';
      if (!records.length) {
        var emptyRow = document.createElement('tr');
        emptyRow.className = 'demo-empty';
        var emptyCell = document.createElement('td');
        emptyCell.colSpan = 3;
        emptyCell.textContent = 'Todavía no has realizado ningún fichaje.';
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
        return;
      }
      records.slice(0, 6).forEach(function (r) {
        var tr = document.createElement('tr');
        [r.trabajador, r.tipo, r.hora].forEach(function (value) {
          var td = document.createElement('td');
          td.textContent = value;
          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      });
    }

    actionContainer.addEventListener('click', function (event) {
      var button = event.target.closest('[data-demo-event]');
      if (button) addRecord(button.getAttribute('data-demo-event'));
    });

    clockDemo.querySelector('[data-demo-reset]').addEventListener('click', function () {
      workers = JSON.parse(JSON.stringify(initialWorkerStates));
      selectedWorkerId = '';
      pinValue = '';
      records = [];
      msg.textContent = '';
      pinError.textContent = '';
      renderWorkers();
      renderTable();
      updatePin();
      setStep('workers');
    });

    renderWorkers();
    renderTable();
    updatePin();
    setStep('workers');
  }

  /* =========================================================
     DEMO 2 — Bonos y clientes (datos ficticios, no se guardan)
     ========================================================= */
  var bonoDemo = document.getElementById('demo-bonos');
  if (bonoDemo) {
    var clients = [
      { nombre: 'Laura Martínez', bono: '5 consultas', importe: '150 €', usadas: 2, total: 5, estado: 'Activo' },
      { nombre: 'Pedro Sánchez', bono: '10 sesiones', importe: '220 €', usadas: 7, total: 10, estado: 'Activo' },
      { nombre: 'Marina Ruiz', bono: '3 sesiones', importe: '90 €', usadas: 3, total: 3, estado: 'Finalizado' }
    ];

    var searchInput = bonoDemo.querySelector('.demo-client-search input');
    var listEl = bonoDemo.querySelector('.demo-client-list');
    var cardEl = bonoDemo.querySelector('.demo-client-card');
    var confirmEl = bonoDemo.querySelector('.demo-message');
    var activeIndex = 0;

    function renderList(filter) {
      listEl.innerHTML = '';
      clients
        .map(function (c, i) { return { c: c, i: i }; })
        .filter(function (item) { return !filter || item.c.nombre.toLowerCase().indexOf(filter.toLowerCase()) !== -1; })
        .forEach(function (item) {
          var div = document.createElement('div');
          div.className = 'demo-client-item';
          div.innerHTML = '<span>' + item.c.nombre + '</span><span class="pill' + (item.c.estado === 'Activo' ? '' : ' pill-neutral') + '">' + item.c.estado + '</span>';
          div.addEventListener('click', function () {
            activeIndex = item.i;
            renderCard();
            confirmEl.textContent = '';
          });
          listEl.appendChild(div);
        });
    }

    function renderCard() {
      var c = clients[activeIndex];
      var restantes = c.total - c.usadas;
      var pct = Math.round((c.usadas / c.total) * 100);
      cardEl.innerHTML =
        '<div class="row"><span>Cliente</span><span><strong>' + c.nombre + '</strong></span></div>' +
        '<div class="row"><span>Bono</span><span>' + c.bono + '</span></div>' +
        '<div class="row"><span>Importe</span><span>' + c.importe + '</span></div>' +
        '<div class="row"><span>Sesiones usadas</span><span>' + c.usadas + ' de ' + c.total + '</span></div>' +
        '<div class="demo-sessions-bar"><div class="demo-sessions-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="row"><span>Sesiones restantes</span><span><strong>' + restantes + '</strong></span></div>' +
        '<div class="row"><span>Estado</span><span class="pill' + (c.estado === 'Activo' ? '' : ' pill-neutral') + '">' + c.estado + '</span></div>' +
        '<button type="button" class="btn btn-primary btn-block" data-action="registrar" ' + (restantes <= 0 ? 'disabled' : '') + '>Registrar sesión</button>';

      var registerBtn = cardEl.querySelector('[data-action="registrar"]');
      registerBtn.addEventListener('click', function () {
        if (c.usadas < c.total) {
          c.usadas += 1;
          renderCard();
          confirmEl.textContent = 'Sesión registrada para ' + c.nombre + '. Quedan ' + (c.total - c.usadas) + '.';
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        renderList(searchInput.value);
      });
    }

    renderList('');
    renderCard();
  }

  /* =========================================================
     Formulario de contacto — WhatsApp o correo, sin backend
     ========================================================= */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    var setError = function (id, message) {
      var el = document.getElementById('err-' + id);
      var field = document.getElementById(id);
      if (!el) return;
      if (message) {
        el.textContent = message;
        el.hidden = false;
        el.setAttribute('role', 'alert');
        if (field) field.setAttribute('aria-invalid', 'true');
      } else {
        el.textContent = '';
        el.hidden = true;
        el.removeAttribute('role');
        if (field) field.removeAttribute('aria-invalid');
      }
    };

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(contactForm);
      var nombre = (data.get('nombre') || '').toString().trim();
      var empresa = (data.get('empresa') || '').toString().trim();
      var telefono = (data.get('telefono') || '').toString().trim();
      var correo = (data.get('correo') || '').toString().trim();
      var solucion = (data.get('solucion') || '').toString();
      var mensaje = (data.get('mensaje') || '').toString().trim();
      var canal = (data.get('canal') || 'whatsapp').toString();
      var privacidad = contactForm.querySelector('#privacidad').checked;

      var valid = true;
      var firstInvalid = null;
      var mark = function (id, message) {
        setError(id, message);
        if (message) {
          valid = false;
          if (!firstInvalid) firstInvalid = document.getElementById(id);
        }
      };

      mark('nombre', nombre ? '' : 'Escribe tu nombre.');
      mark('mensaje', mensaje ? '' : 'Cuéntanos brevemente qué necesitas.');
      mark('telefono', canal === 'whatsapp' && !telefono ? 'Para responderte por WhatsApp necesitamos tu teléfono.' : '');
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
      if (canal === 'correo' && !correo) {
        mark('correo', 'Para responderte por correo necesitamos tu dirección.');
      } else if (correo && !emailOk) {
        mark('correo', 'Revisa el formato del correo.');
      } else {
        mark('correo', '');
      }
      mark('privacidad', privacidad ? '' : 'Debes aceptar el aviso de privacidad.');

      if (!valid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var body = 'Nombre: ' + nombre + '\n' +
        (empresa ? 'Empresa: ' + empresa + '\n' : '') +
        (telefono ? 'Teléfono: ' + telefono + '\n' : '') +
        (correo ? 'Correo: ' + correo + '\n' : '') +
        'Solución de interés: ' + solucion + '\n\n' +
        'Mensaje:\n' + mensaje;

      if (canal === 'whatsapp') {
        var texto = 'Hola, he visto la web de SIDGI y me gustaría recibir información.\n\n' + body;
        window.open('https://wa.me/34623627923?text=' + encodeURIComponent(texto), '_blank', 'noopener');
      } else {
        var subject = 'Solicitud de información — ' + (empresa || nombre);
        window.location.href = 'mailto:sidgifichajes@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      }
    });
  }
});
