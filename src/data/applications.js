// Postulaciones (página postulaciones.html y sección "Postulaciones" de la portada). Editar aquí.
//
// Cada convocatoria tiene:
//  id          se usa en la URL (postulaciones.html#bandas); no cambiarlo sin actualizar enlaces externos.
//  deadline    fecha y hora límite con zona horaria de Chile (-03:00 en primavera). Pasada la fecha,
//              el formulario se cierra solo.
//  subject     asunto del correo; {campo} se reemplaza por la respuesta de ese campo.
//  facts       "lo esencial": tarjetas cortas con icono (lo primero que se lee).
//  rules       bases desplegables: cada bloque con título y viñetas.
//  sections    campos del formulario, agrupados. Tipos: text, email, tel, url, number, textarea,
//              select (options), radio (options), members (filas con columnas).
//  attachments lo que se adjunta a mano al correo (el formulario no puede adjuntar archivos).
//  commitments compromisos que se aceptan con una sola casilla.
//
// Todos los textos son bilingües: L('español', 'english').

const L = (es, en) => ({ es, en })

// Compromisos comunes a bandas y DJs
const ARTIST_COMMITMENTS = [
  L('Entregar a tiempo toda la información solicitada.', 'Submit all the requested information on time.'),
  L('Aceptar que la selección final la decide la comisión organizadora.', 'Accept that the organizing committee makes the final selection.'),
  L('Mantener una conducta profesional y seguir las indicaciones de la organización.', 'Behave professionally and follow the organizers’ instructions.'),
  L('Autorizar fotos y video de la presentación, solo para promoción y registro del festival.', 'Allow photos and video of the performance, only for the festival’s promotion and records.'),
  L('Entender que la participación es voluntaria y no remunerada: LOOK AT FLOWERS es autogestionado, sin cobro de entradas ni fines de lucro.', 'Understand that taking part is voluntary and unpaid: LOOK AT FLOWERS is self-managed, with free entry and no profit.'),
]

const ARTIST_BENEFITS = L(
  'A cambio te ofrecemos visibilidad en el circuito universitario y local, registro audiovisual profesional y catering durante la jornada.',
  'In return we offer visibility in the university and local scene, professional audiovisual coverage and catering during the day.',
)

export const applications = [
  {
    id: 'bandas',
    label: L('Bandas', 'Bands'),
    stage: 'Flowers Stage',
    deadline: '2026-10-29T23:59:59-03:00',
    subject: 'Postulación BANDA {bandName}',
    intro: L(
      '¿Tienen canciones propias y ganas de tocarlas en vivo? Queremos escucharlas en el Flowers Stage. 🌸',
      'Got your own songs and want to play them live? We want to hear them on the Flowers Stage. 🌸',
    ),
    time: L('unos 15 minutos', 'about 15 minutes'),
    facts: [
      { icon: '⏱️', title: L('Show', 'Set'), text: L('Hasta 40 minutos efectivos', 'Up to 40 minutes of playing time') },
      { icon: '🎸', title: L('Repertorio', 'Setlist'), text: L('Composiciones originales (máx. 2 no originales)', 'Original songs (max. 2 covers)') },
      { icon: '🎓', title: L('Prioridad', 'Priority'), text: L('Bandas con integrantes UACh — no excluyente', 'Bands with UACh members — not required') },
      { icon: '🎛️', title: L('Ficha técnica', 'Tech rider'), text: L('Se revisa la semana del 26 de octubre', 'Reviewed the week of October 26') },
    ],
    rules: [
      {
        title: L('Repertorio', 'Setlist'),
        items: [
          L('**Obligatorio:** composiciones originales.', '**Required:** original songs.'),
          L('Pueden incluir **hasta 2 canciones no originales**.', 'You may include **up to 2 covers**.'),
          L('**No se acepta instrumental pregrabado.** Si su caso es especial, cuéntenlo en el formulario y el comité lo evaluará.', '**No pre-recorded backing tracks.** If yours is a special case, explain it in the form and the committee will review it.'),
        ],
      },
      {
        title: L('¿Quiénes pueden postular?', 'Who can apply?'),
        items: [
          L('Priorizamos bandas con **al menos un integrante de la UACh** (estudiante, funcionario/a o docente).', 'We prioritize bands with **at least one UACh member** (student, staff or faculty).'),
          L('**No es excluyente:** si no tienen vínculo con la universidad, ¡postulen igual! 🌸', '**It’s not a requirement:** if you have no link to the university, apply anyway! 🌸'),
        ],
      },
      {
        title: L('Ficha técnica', 'Tech rider'),
        items: [
          L('Backline disponible: **2 amplificadores de guitarra, 1 de bajo y una batería**.', 'Available backline: **2 guitar amps, 1 bass amp and a drum kit**.'),
          L('Revisamos las fichas la **semana del 26 de octubre** y los contactamos para coordinar.', 'We review riders the **week of October 26** and will contact you to coordinate.'),
          L('Los requerimientos complejos se conversan por nuestro **Instagram oficial**.', 'Complex requirements are discussed through our **official Instagram**.'),
          L('La factibilidad depende de los recursos técnicos disponibles.', 'Feasibility depends on the technical resources available.'),
        ],
      },
      {
        title: L('Lo que ofrecemos', 'What we offer'),
        items: [
          ARTIST_BENEFITS,
          L('Traslado, equipos y backline propio corren por cuenta de la banda (evaluamos apoyo logístico según disponibilidad).', 'Transport, gear and your own backline are covered by the band (we’ll consider logistic support where possible).'),
        ],
      },
    ],
    sections: [
      {
        title: L('La banda', 'The band'),
        fields: [
          { id: 'bandName', type: 'text', required: true, label: L('Nombre de la banda', 'Band name') },
          { id: 'genre', type: 'text', required: true, label: L('Género musical principal', 'Main genre'), placeholder: L('Ej.: indie rock, cumbia, post-punk', 'E.g. indie rock, cumbia, post-punk') },
          { id: 'bio', type: 'textarea', required: true, maxLength: 900, label: L('Reseña de la banda', 'Band bio'), hint: L('3 a 5 líneas. Podremos usarla para presentarlos en el festival.', '3 to 5 lines. We may use it to introduce you at the festival.') },
          { id: 'instagram', type: 'url', label: L('Instagram u otra red de la banda', 'Band Instagram or other social link'), placeholder: L('instagram.com/tubanda', 'instagram.com/yourband') },
        ],
      },
      {
        title: L('Representante', 'Contact person'),
        hint: L('Una persona del grupo a cargo de la coordinación con nosotros.', 'One band member who coordinates with us.'),
        fields: [
          { id: 'repName', type: 'text', required: true, label: L('Nombre completo', 'Full name'), autoComplete: 'name' },
          { id: 'repRut', type: 'text', required: true, label: L('RUT', 'RUT / ID number'), placeholder: '12.345.678-9' },
          { id: 'repPhone', type: 'tel', required: true, label: L('Teléfono', 'Phone'), autoComplete: 'tel', placeholder: '+56 9 1234 5678' },
          { id: 'repEmail', type: 'email', required: true, label: L('Correo', 'Email'), autoComplete: 'email' },
        ],
      },
      {
        title: L('Integrantes y vínculo UACh', 'Members and UACh link'),
        fields: [
          {
            id: 'uach', type: 'radio', required: true, label: L('¿Algún integrante es estudiante, funcionario/a o docente UACh?', 'Is any member a UACh student, staff or faculty?'),
            options: [L('Sí, al menos uno', 'Yes, at least one'), L('No', 'No')],
          },
          {
            id: 'members', type: 'members', label: L('Demás integrantes', 'Other members'), hint: L('Sin contar a quien representa.', 'Not counting the contact person.'),
            columns: [
              { id: 'name', label: L('Nombre', 'Name') },
              { id: 'role', label: L('Rol o instrumento', 'Role or instrument') },
              { id: 'uach', label: L('Carrera o cargo UACh (si aplica)', 'UACh degree or role (if any)') },
            ],
          },
        ],
      },
      {
        title: L('Propuesta en vivo', 'Live proposal'),
        fields: [
          { id: 'video', type: 'url', required: true, label: L('Link a video en vivo o ensayo', 'Link to a live or rehearsal video'), hint: L('Ideal 90 segundos. Si es más largo, indica desde qué minuto verlo.', 'Ideally 90 seconds. If longer, tell us which minute to watch from.') },
          { id: 'duration', type: 'number', required: true, min: 10, max: 40, label: L('Tiempo efectivo del show (minutos)', 'Playing time (minutes)'), hint: L('Máximo 40.', 'Max. 40.') },
          { id: 'covers', type: 'text', label: L('Canciones no originales (si incluyen)', 'Covers (if any)'), hint: L('Máximo 2.', 'Max. 2.') },
          { id: 'showDetail', type: 'textarea', label: L('Detalle del show', 'Set details'), hint: L('Duración de cada canción, momentos para hablar con el público, etc.', 'Length of each song, moments to talk to the audience, etc.') },
          { id: 'special', type: 'textarea', label: L('¿Caso especial con pistas pregrabadas?', 'Special case with pre-recorded tracks?'), hint: L('Solo si aplica: explícanos qué y por qué.', 'Only if it applies: tell us what and why.') },
        ],
      },
      {
        title: L('Ficha técnica', 'Tech rider'),
        hint: L('Contamos con 2 amplificadores de guitarra, 1 de bajo y una batería.', 'We provide 2 guitar amps, 1 bass amp and a drum kit.'),
        fields: [
          { id: 'tech', type: 'textarea', required: true, label: L('Microfonía y backline que necesitan', 'Microphones and backline you need') },
          { id: 'monitors', type: 'number', required: true, min: 0, max: 12, label: L('Mezclas de retorno', 'Monitor mixes'), hint: L('En coherencia con el stage plot.', 'Matching your stage plot.') },
          { id: 'stagePlot', type: 'url', label: L('Link al stage plot o ficha técnica', 'Link to stage plot or rider'), hint: L('Imagen aérea con la disposición de instrumentos y retornos. También puedes adjuntarla al correo.', 'Top view of instruments and monitors on stage. You can also attach it to the email.') },
        ],
      },
    ],
    attachments: [
      L('**Dossier o EPK** de la banda en PDF (obligatorio).', 'Band **press kit / EPK** as a PDF (required).'),
      L('**Stage plot o ficha técnica**, si no dejaste el link.', '**Stage plot or tech rider**, if you didn’t add a link.'),
    ],
    commitments: ARTIST_COMMITMENTS,
  },

  {
    id: 'djs',
    label: L('DJs', 'DJs'),
    stage: 'Valdivia Stage',
    deadline: '2026-10-31T23:59:59-03:00',
    subject: 'Postulación DJ {artistName}',
    intro: L(
      '¿Te imaginas tu set sonando en el Valdivia Stage? Cuéntanos qué nos traes. 🌸',
      'Can you picture your set on the Valdivia Stage? Tell us what you’d bring. 🌸',
    ),
    time: L('unos 10 minutos', 'about 10 minutes'),
    facts: [
      { icon: '⏱️', title: L('Set', 'Set'), text: L('60 minutos efectivos (conversable)', '60 minutes of playing time (flexible)') },
      { icon: '🎓', title: L('Prioridad', 'Priority'), text: L('Estudiantes UACh — abierto a externos', 'UACh students — open to everyone') },
      { icon: '🎧', title: L('Portafolio', 'Portfolio'), text: L('Instagram, SoundCloud u otros', 'Instagram, SoundCloud or others') },
      { icon: '💬', title: L('Respuesta', 'Reply'), text: L('A más tardar el lunes 2 de noviembre', 'By Monday, November 2 at the latest') },
    ],
    rules: [
      {
        title: L('Tu propuesta', 'Your proposal'),
        items: [
          L('Cuéntanos **qué estilos trabajas** y **qué propones para el Valdivia Stage** (nuestro DJ stage).', 'Tell us **which styles you play** and **what you propose for the Valdivia Stage** (our DJ stage).'),
          L('Mientras más detalle y profesionalismo, mejor podremos evaluarte.', 'The more detail and professionalism, the better we can evaluate you.'),
          L('Sets de **60 minutos efectivos**; puede ajustarse según la cantidad de participantes.', '**60-minute** sets; this may change depending on the number of DJs.'),
        ],
      },
      {
        title: L('¿Quiénes pueden postular?', 'Who can apply?'),
        items: [
          L('Damos preferencia a **estudiantes UACh**, pero **no excluimos el talento externo**. ¡Postula! 🌸', 'We favor **UACh students**, but **outside talent is welcome too**. Apply! 🌸'),
        ],
      },
      {
        title: L('Técnica', 'Tech'),
        items: [
          L('Hay punto de corriente: **trae tu zapatilla eléctrica**.', 'There’s a power point: **bring your own power strip**.'),
          L('Consideramos salidas balanceadas **XLR, TRS o RCA**.', 'We support **XLR, TRS or RCA** outputs.'),
        ],
      },
      { title: L('Lo que ofrecemos', 'What we offer'), items: [ARTIST_BENEFITS] },
    ],
    sections: [
      {
        title: L('Tu proyecto', 'Your project'),
        fields: [
          { id: 'artistName', type: 'text', required: true, label: L('Nombre artístico', 'Artist name') },
          { id: 'styles', type: 'text', required: true, label: L('Géneros y estilos', 'Genres and styles'), placeholder: L('Ej.: house, techno, reggaetón, baile chileno', 'E.g. house, techno, reggaeton') },
          { id: 'proposal', type: 'textarea', required: true, maxLength: 900, label: L('Tu propuesta para el Valdivia Stage', 'Your proposal for the Valdivia Stage'), hint: L('¿Qué viaje musical nos propones? Ambiente, energía, momentos clave.', 'What musical journey do you propose? Mood, energy, key moments.') },
        ],
      },
      {
        title: L('Contacto', 'Contact'),
        fields: [
          { id: 'fullName', type: 'text', required: true, label: L('Nombre completo', 'Full name'), autoComplete: 'name' },
          { id: 'whatsapp', type: 'tel', required: true, label: L('WhatsApp', 'WhatsApp'), autoComplete: 'tel', placeholder: '+56 9 1234 5678' },
          { id: 'email', type: 'email', required: true, label: L('Correo', 'Email'), autoComplete: 'email' },
        ],
      },
      {
        title: L('Vínculo UACh', 'UACh link'),
        hint: L('Nos interesa conocerte como artista y también como parte de la comunidad.', 'We want to know you as an artist and as part of the community.'),
        fields: [
          { id: 'career', type: 'text', label: L('Carrera en curso o cursada (si aplica)', 'Current or past degree (if any)') },
          { id: 'year', type: 'text', label: L('Año que cursas (si aplica)', 'Year of study (if any)') },
          {
            id: 'team', type: 'members', label: L('Equipo de trabajo (si tienes)', 'Your team (if any)'),
            columns: [
              { id: 'name', label: L('Nombre', 'Name') },
              { id: 'role', label: L('Rol', 'Role') },
              { id: 'career', label: L('Carrera (si aplica)', 'Degree (if any)') },
            ],
          },
        ],
      },
      {
        title: L('Portafolio', 'Portfolio'),
        hint: L('Queremos conocer tu experiencia en el rubro.', 'We want to see your experience.'),
        fields: [
          { id: 'instagram', type: 'url', required: true, label: L('Instagram', 'Instagram'), placeholder: 'instagram.com/tunombre' },
          { id: 'soundcloud', type: 'url', label: L('SoundCloud', 'SoundCloud'), placeholder: 'soundcloud.com/tunombre' },
          { id: 'otherLinks', type: 'textarea', label: L('Otros enlaces (mixes, videos, prensa)', 'Other links (mixes, videos, press)') },
        ],
      },
      {
        title: L('Ficha técnica', 'Tech rider'),
        hint: L('Hay punto de corriente; trae tu zapatilla eléctrica.', 'There’s a power point; bring your power strip.'),
        fields: [
          { id: 'gear', type: 'textarea', required: true, label: L('Equipos con los que cuentas o que necesitas', 'Gear you have or need') },
          {
            id: 'output', type: 'select', required: true, label: L('Salida de tu mesa', 'Your mixer output'),
            options: [L('XLR (balanceada)', 'XLR (balanced)'), L('TRS (balanceada)', 'TRS (balanced)'), L('RCA', 'RCA'), L('Otra / no sé', 'Other / not sure')],
          },
          { id: 'otherNeeds', type: 'textarea', label: L('Otros requerimientos', 'Other requirements') },
        ],
      },
    ],
    attachments: [
      L('Si quieres, tu **press kit** en PDF (opcional).', 'Your **press kit** as a PDF, if you have one (optional).'),
    ],
    commitments: ARTIST_COMMITMENTS,
  },

  {
    id: 'emprendimientos',
    label: L('Emprendimientos', 'Vendors'),
    stage: L('Feria', 'Market'),
    deadline: '2026-10-29T23:59:59-03:00',
    subject: 'Postulación EMPRENDIMIENTO {businessName}',
    intro: L(
      '¿Creas, diseñas o rescatas cosas lindas? Súmate a la feria del festival. 🌸',
      'Do you make, design or rescue beautiful things? Join the festival market. 🌸',
    ),
    time: L('unos 5 minutos', 'about 5 minutes'),
    facts: [
      { icon: '💸', title: L('Costo', 'Cost'), text: L('Gratis: sin inscripción ni cobro por espacio', 'Free: no fee and no charge for your spot') },
      { icon: '🛍️', title: L('Rubros', 'Categories'), text: L('Vestuario, accesorios, artesanía, arte… sin alimentos', 'Clothing, accessories, crafts, art… no food') },
      { icon: '🎓', title: L('Prioridad', 'Priority'), text: L('Estudiantes UACh — abierto a externos', 'UACh students — open to everyone') },
      { icon: '📬', title: L('Confirmación', 'Confirmation'), text: L('Por correo, a más tardar el 1 de noviembre', 'By email, by November 1 at the latest') },
    ],
    rules: [
      {
        title: L('Rubros', 'Categories'),
        items: [
          L('Vestuario, accesorios, artesanía, ilustración, arte, productos hechos a mano, segunda mano y otras propuestas afines al festival.', 'Clothing, accessories, crafts, illustration, art, handmade goods, second-hand items and other festival-friendly proposals.'),
          L('**No se permite vender alimentos** ni productos para consumo.', '**Selling food** or consumables **is not allowed**.'),
        ],
      },
      {
        title: L('Tu puesto', 'Your stall'),
        items: [
          L('Trae lo necesario: **mesa, alargador o zapatilla, iluminación propia** y decoración.', 'Bring what you need: **a table, an extension cord or power strip, your own lighting** and decoration.'),
          L('Ambientación armónica con el festival: **rosado, verde, flores y naturaleza**. 🌷', 'Match the festival’s look: **pink, green, flowers and nature**. 🌷'),
          L('Instalaciones seguras y estables, sin bloquear el paso. Coordina antes cualquier conexión eléctrica.', 'Keep your setup safe and stable, without blocking the way. Coordinate any power use in advance.'),
        ],
      },
      {
        title: L('Selección', 'Selection'),
        items: [
          L('Priorizamos a **estudiantes UACh**, pero el llamado es abierto. ¡Postula! 🌸', 'We prioritize **UACh students**, but the call is open. Apply! 🌸'),
          L('También consideramos la variedad de propuestas y los espacios disponibles.', 'We also consider variety and available space.'),
          L('**Postular no garantiza un cupo.** Confirmamos por correo a más tardar el **1 de noviembre**.', '**Applying doesn’t guarantee a spot.** We confirm by email by **November 1**.'),
        ],
      },
    ],
    sections: [
      {
        title: L('Tu emprendimiento', 'Your business'),
        fields: [
          { id: 'businessName', type: 'text', required: true, label: L('Nombre del emprendimiento', 'Business name') },
          {
            id: 'category', type: 'select', required: true, label: L('Rubro principal', 'Main category'),
            options: [
              L('Vestuario', 'Clothing'), L('Accesorios', 'Accessories'), L('Artesanía', 'Crafts'),
              L('Ilustración y arte', 'Illustration and art'), L('Hecho a mano', 'Handmade'),
              L('Segunda mano', 'Second-hand'), L('Otro', 'Other'),
            ],
          },
          { id: 'description', type: 'textarea', required: true, maxLength: 700, label: L('¿Qué vendes?', 'What do you sell?'), hint: L('Cuéntanos tus productos y qué hace especial a tu emprendimiento.', 'Tell us about your products and what makes them special.') },
          { id: 'social', type: 'url', required: true, label: L('Instagram o red social', 'Instagram or social link'), placeholder: 'instagram.com/tuemprendimiento' },
        ],
      },
      {
        title: L('Contacto', 'Contact'),
        fields: [
          { id: 'ownerName', type: 'text', required: true, label: L('Nombre de quien emprende', 'Owner’s name'), autoComplete: 'name' },
          { id: 'email', type: 'email', required: true, label: L('Correo', 'Email'), autoComplete: 'email' },
          { id: 'phone', type: 'tel', required: true, label: L('Teléfono o WhatsApp', 'Phone or WhatsApp'), autoComplete: 'tel', placeholder: '+56 9 1234 5678' },
        ],
      },
      {
        title: L('Vínculo UACh', 'UACh link'),
        fields: [
          {
            id: 'uach', type: 'radio', required: true, label: L('¿Cuál es tu vínculo con la UACh?', 'What is your link to UACh?'),
            options: [L('Estudiante', 'Student'), L('Funcionario/a o docente', 'Staff or faculty'), L('Sin vínculo', 'No link')],
          },
          { id: 'career', type: 'text', label: L('Carrera (si aplica)', 'Degree (if any)') },
        ],
      },
      {
        title: L('Montaje', 'Setup'),
        fields: [
          { id: 'power', type: 'radio', required: true, label: L('¿Necesitas conexión eléctrica?', 'Do you need power?'), options: [L('Sí', 'Yes'), L('No', 'No')] },
          { id: 'setupNotes', type: 'textarea', label: L('Comentarios sobre tu puesto', 'Notes about your stall'), hint: L('Tamaño aproximado, montaje especial, etc.', 'Approximate size, special setup, etc.') },
        ],
      },
    ],
    attachments: [],
    commitments: [
      L('Cumplir las bases y las indicaciones de la organización.', 'Follow these rules and the organizers’ instructions.'),
      L('Respetar los horarios de montaje, funcionamiento y desmontaje.', 'Respect setup, opening and teardown times.'),
      L('Mantener tu espacio limpio y ordenado durante toda la jornada.', 'Keep your space clean and tidy all day.'),
      L('Llevar tus propios materiales de montaje y ambientación.', 'Bring your own setup and decoration materials.'),
      L('Convivir con respeto con participantes, organización y público.', 'Treat other vendors, organizers and visitors with respect.'),
      L('Usar el espacio y el recinto de forma responsable.', 'Use your space and the venue responsibly.'),
      L('Avisar con tiempo si no puedes asistir.', 'Let us know in advance if you can’t make it.'),
    ],
  },
]

/** URL de la página de postulaciones (respeta la `base` de Vite). */
export const applyUrl = (id) => `${import.meta.env.BASE_URL}postulaciones.html${id ? `#${id}` : ''}`
